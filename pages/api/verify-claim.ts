import { NextApiRequest, NextApiResponse } from 'next';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { createClient } from '@supabase/supabase-js';
import DAILY_REWARDS_ABI from '../../src/lib/claim.json';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const DAILY_REWARDS_ADDRESS = process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { fid, address, nonce, amount } = req.body;

  if (!fid || !address || !nonce || !amount || !DAILY_REWARDS_ADDRESS) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    // 1. SECURITY CHECK: Check if this nonce is already in our DB
    const { data: existingClaim } = await supabaseAdmin
      .from('claims')
      .select('id')
      .eq('nonce', nonce.toString())
      .single();

    if (existingClaim) {
      return res.status(400).json({ error: 'This claim has already been recorded in the database.' });
    }

    // 2. BLOCKCHAIN CHECK: Check if the nonce has been used on-chain
    const isNonceUsed = await publicClient.readContract({
      address: DAILY_REWARDS_ADDRESS as `0x${string}`,
      abi: DAILY_REWARDS_ABI,
      functionName: 'usedNonces',
      args: [BigInt(nonce)],
    });

    if (!isNonceUsed) {
      return res.status(400).json({ error: 'Transaction not found or nonce not used on-chain.' });
    }

    // 3. DATA INTEGRITY: Convert amount to human-readable (optional)
    // If you store raw string in DB, keep it as is. 
    // If you store as number, ensure you divide by 1e18.
    const numericAmount = Number(amount) / 1e18;

    // 4. RECORD: Record the claim
    const { error: dbError } = await supabaseAdmin.from('claims').insert({
      fid: Number(fid),
      address,
      amount: numericAmount, 
      nonce: nonce.toString(),
      claimed_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Supabase Error:', dbError);
      return res.status(500).json({ error: 'Failed to record claim.' });
    }

    return res.status(200).json({ success: true, message: 'Claim verified and recorded.' });

  } catch (error: any) {
    console.error('Verify Claim API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
