import { NextApiRequest, NextApiResponse } from 'next';
import { privateKeyToAccount } from 'viem/accounts';
import { parseUnits } from 'viem';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- CONFIGURATION ---
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const REWARD_STANDARD = 50000; 
const REWARD_OG = 250000;      
const MINIMUM_NEYNAR_SCORE = 0.6;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { fid, address } = req.body;

  if (!fid || !address || !ADMIN_PRIVATE_KEY) {
    return res.status(400).json({ error: 'Missing required configuration or parameters.' });
  }

  try {
    // 1. Neynar Score Check (Using Experimental Headers for accurate scoring)
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY!,
        'x-neynar-experimental': 'true'
      }
    };

    const neynarResult = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}&viewer_fid=1`, 
      options
    );
    
    const neynarData = await neynarResult.json();
    const user = neynarData.users?.[0];
    
    // Using user_score as the standard for Farcaster reputation
    const userScore = user?.user_score ?? 0; 

    if (userScore < MINIMUM_NEYNAR_SCORE) {
      return res.status(403).json({ 
        error: `Neynar score ${userScore.toFixed(2)} too low. Minimum ${MINIMUM_NEYNAR_SCORE} required.` 
      });
    }

    // 2. Daily Claim Check (Supabase Persistence)
    const { data: lastClaim, error: claimError } = await supabaseAdmin
      .from('claims')
      .select('claimed_at')
      .eq('fid', fid)
      .order('claimed_at', { ascending: false })
      .limit(1)
      .single();

    // Ignore "no rows found" error (PGRST116), but throw others
    if (claimError && claimError.code !== 'PGRST116') {
      throw new Error(claimError.message);
    }

    if (lastClaim) {
      const lastDate = new Date(lastClaim.claimed_at).getTime();
      const now = Date.now();
      if (now - lastDate < 24 * 60 * 60 * 1000) {
        return res.status(429).json({ error: 'You can only claim once every 24 hours.' });
      }
    }

    // 3. OG Racer Bonus Check
    const { data: racerData } = await supabaseAdmin
      .from('racers')
      .select('is_minted')
      .eq('fid', fid)
      .single();

    const isOgRacer = racerData?.is_minted ?? false;
    const claimAmount = isOgRacer ? REWARD_OG : REWARD_STANDARD;
    
    // 4. Signature Generation (EIP-712)
    const privateKey = ADMIN_PRIVATE_KEY.startsWith('0x') ? ADMIN_PRIVATE_KEY : `0x${ADMIN_PRIVATE_KEY}`;
    const adminAccount = privateKeyToAccount(privateKey as `0x${string}`);
    
    const amount = parseUnits(claimAmount.toString(), 18);
    const nonce = BigInt(Date.now());

    const signature = await adminAccount.signTypedData({
      domain: {
        name: 'BasedRaceRewards',
        version: '1',
        chainId: 8453, // Base Mainnet
        verifyingContract: process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS as `0x${string}`,
      },
      types: {
        ClaimRequest: [
          { name: 'user', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
        ],
      },
      primaryType: 'ClaimRequest',
      message: {
        user: address as `0x${string}`,
        amount: amount,
        nonce: nonce,
      },
    });

    // 5. Record the Claim in Database
    await supabaseAdmin.from('claims').insert({
      fid,
      address,
      amount: claimAmount,
      nonce: nonce.toString(),
      claimed_at: new Date().toISOString(),
    });

    return res.status(200).json({
      signature,
      amount: amount.toString(),
      nonce: nonce.toString(),
    });

  } catch (error: any) {
    console.error('Claim API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
}
