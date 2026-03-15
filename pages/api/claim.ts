import { NextApiRequest, NextApiResponse } from 'next';
import { privateKeyToAccount } from 'viem/accounts';
import { keccak256, parseEther, encodePacked } from 'viem';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/**
 * In-memory store for claim cooldowns. 
 * IMPORTANT: Not suitable for production. Replace with a persistent database like Redis or Vercel KV.
 * This map now stores the UTC date of the last claim.
 */
const userLastClaimDate = new Map<number, string>(); // Stores fid -> YYYY-MM-DD

// --- CONFIGURATION ---
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const BASE_CLAIM_AMOUNT = '100'; // Base amount of $RACE tokens
const OG_MULTIPLIER = 5; // 5x bonus for OG Racers
const MINIMUM_NEYNAR_SCORE = 0.6;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!ADMIN_PRIVATE_KEY || !NEYNAR_API_KEY) {
    console.error('CRITICAL: Server environment variables are not fully configured.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const { fid, address } = req.body;

  if (!fid || !address) {
    return res.status(400).json({ error: 'Farcaster ID (fid) and wallet address are required.' });
  }

  try {
    // --- 1. Neynar Score Check ---
    const neynarResult = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
        headers: { api_key: NEYNAR_API_KEY },
    });
    if (!neynarResult.ok) throw new Error('Failed to fetch user data from Neynar');
    const neynarData = await neynarResult.json();
    const user = neynarData.users[0];

    // NOTE: This implementation assumes a numeric 'score' field exists on the Neynar user object.
    const userScore = user.score; 

    if (!user || userScore === undefined || userScore < MINIMUM_NEYNAR_SCORE) {
        return res.status(403).json({ error: `Your Neynar score of ${userScore ?? 'N/A'} is below the required minimum of ${MINIMUM_NEYNAR_SCORE}.` });
    }

    // --- 2. Daily Claim Limit Check (UTC Day) ---
    const currentUTCDate = new Date().toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
    const lastClaimDateForUser = userLastClaimDate.get(fid);

    if (lastClaimDateForUser === currentUTCDate) {
        return res.status(429).json({ error: 'You have already claimed your tokens for today. Please try again tomorrow after 00:00 UTC.' });
    }

    // --- 3. OG Racer Bonus Check ---
    const { data: racerData, error: racerError } = await supabaseAdmin
        .from('racers')
        .select('is_minted')
        .eq('fid', fid)
        .single();

    if (racerError && racerError.code !== 'PGRST116') {
        throw new Error(`Supabase error: ${racerError.message}`);
    }

    const isOgRacer = racerData?.is_minted ?? false;
    const claimAmountString = isOgRacer 
        ? (BigInt(BASE_CLAIM_AMOUNT) * BigInt(OG_MULTIPLIER)).toString()
        : BASE_CLAIM_AMOUNT;
    
    // --- 4. Signature Generation ---
    const privateKey = ADMIN_PRIVATE_KEY.startsWith('0x') 
        ? ADMIN_PRIVATE_KEY 
        : (`0x${ADMIN_PRIVATE_KEY}`)

    const adminAccount = privateKeyToAccount(privateKey as `0x${string}`);
    const amount = parseEther(claimAmountString);
    const nonce = BigInt(Date.now());

    const messageHash = keccak256(
      encodePacked(['address', 'uint256', 'uint256'], [address as `0x${string}`, amount, nonce])
    );

    const signature = await adminAccount.signMessage({ message: { raw: messageHash } });

    // --- 5. Record the Claim ---
    userLastClaimDate.set(fid, currentUTCDate);

    return res.status(200).json({
      signature,
      amount: amount.toString(),
      nonce: nonce.toString(),
    });

  } catch (error: any) {
    console.error('Error in claim API:', error);
    return res.status(500).json({ error: 'An error occurred during the claim process.', details: error.message });
  }
}
