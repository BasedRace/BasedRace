import { NextApiRequest, NextApiResponse } from 'next';
import { privateKeyToAccount } from 'viem/accounts';
import { parseUnits, createPublicClient, http } from 'viem';
import { createClient } from '@supabase/supabase-js';
import { base } from 'viem/chains';
import DAILY_REWARDS_ABI from '../../src/lib/claim.json';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Public Client for Blockchain reads
const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

// --- CONFIGURATION ---
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const DAILY_REWARDS_ADDRESS = process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS;
const REWARD_STANDARD = 50000;
const REWARD_OG = 250000;
const MINIMUM_NEYNAR_SCORE = 0.6;

// --- "HEALER" FUNCTION ---
// Checks for pending claims and updates their status from the blockchain.
async function healPendingClaims(fid: number) {
  console.log(`Healing pending claims for FID: ${fid}`);

  const { data: pendingClaims, error } = await supabaseAdmin
    .from('claims')
    .select('id, nonce')
    .eq('fid', fid)
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching pending claims:', error);
    return; // Don't block the flow, just log the error
  }

  if (!pendingClaims || pendingClaims.length === 0) {
    console.log('No pending claims found.');
    return;
  }

  for (const claim of pendingClaims) {
    console.log(`Checking status of pending nonce: ${claim.nonce}`);
    const isNonceUsed = await publicClient.readContract({
      address: DAILY_REWARDS_ADDRESS as `0x${string}`,
      abi: DAILY_REWARDS_ABI,
      functionName: 'usedNonces',
      args: [BigInt(claim.nonce)],
    }) as boolean;

    if (isNonceUsed) {
      console.log(`Nonce ${claim.nonce} was used. Confirming claim.`);
      await supabaseAdmin
        .from('claims')
        .update({ status: 'confirmed', claimed_at: new Date().toISOString() })
        .eq('id', claim.id);
    } else {
      console.log(`Nonce ${claim.nonce} was NOT used. Deleting pending claim.`);
      await supabaseAdmin.from('claims').delete().eq('id', claim.id);
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { fid, address } = req.body;

  if (!fid || !address || !ADMIN_PRIVATE_KEY || !DAILY_REWARDS_ADDRESS) {
    return res.status(400).json({ error: 'Missing required configuration or parameters.' });
  }

  try {
    // 0. Heal any pending claims from previous sessions
    await healPendingClaims(Number(fid));

    // 1. Neynar Score Check
    const neynarResult = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}&viewer_fid=1`, {
      headers: { accept: 'application/json', api_key: NEYNAR_API_KEY! }
    });
    const user = (await neynarResult.json()).users?.[0];
    const userScore = user?.score ?? 0;

    if (userScore < MINIMUM_NEYNAR_SCORE) {
      return res.status(403).json({ 
        error: `Neynar score ${userScore.toFixed(2)} is too low. Minimum ${MINIMUM_NEYNAR_SCORE} required.` 
      });
    }

    // 2. Daily Cooldown Check (against CONFIRMED claims)
    const { data: lastConfirmedClaim } = await supabaseAdmin
      .from('claims')
      .select('claimed_at')
      .eq('fid', fid)
      .eq('status', 'confirmed') // IMPORTANT: Only check against confirmed claims
      .order('claimed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastConfirmedClaim) {
      const lastDate = new Date(lastConfirmedClaim.claimed_at).getTime();
      if (Date.now() - lastDate < 24 * 60 * 60 * 1000) {
        return res.status(429).json({ error: 'You can only claim once every 24 hours.' });
      }
    }

    // 3. OG Racer Bonus Check
    const { data: racerData } = await supabaseAdmin.from('racers').select('is_minted').eq('fid', fid).maybeSingle();
    const claimAmount = (racerData?.is_minted ?? false) ? REWARD_OG : REWARD_STANDARD;
    const amount = parseUnits(claimAmount.toString(), 18);
    const nonce = BigInt(Date.now());

    // 4. Insert PENDING claim into database BEFORE generating signature
    const { data: newClaim, error: insertError } = await supabaseAdmin
      .from('claims')
      .insert({
        fid: Number(fid),
        address: address.toLowerCase(),
        amount: claimAmount, 
        nonce: nonce.toString(),
        status: 'pending', // Start as pending
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase Insert Error:', insertError);
      throw insertError;
    }

    // 5. Signature Generation (EIP-712)
    const adminAccount = privateKeyToAccount(ADMIN_PRIVATE_KEY as `0x${string}`);
    const signature = await adminAccount.signTypedData({
      domain: {
        name: 'BasedRaceRewards',
        version: '1',
        chainId: 8453,
        verifyingContract: DAILY_REWARDS_ADDRESS as `0x${string}`,
      },
      types: {
        ClaimRequest: [
          { name: 'user', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
        ],
      },
      primaryType: 'ClaimRequest',
      message: { user: address as `0x${string}`, amount, nonce },
    });

    // 6. Final Response with signature
    return res.status(200).json({
      signature,
      amount: amount.toString(),
      nonce: nonce.toString(),
    });

  } catch (error: any) {
    console.error('Claim API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
