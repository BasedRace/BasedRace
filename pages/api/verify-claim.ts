import { NextApiRequest, NextApiResponse } from 'next';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { createClient } from '@supabase/supabase-js';
import DAILY_REWARDS_ABI from '../../src/lib/claim.json';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Viem public client for Base Mainnet
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const DAILY_REWARDS_ADDRESS = process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { fid, address, nonce, amount } = req.body;

  // Validate parameters
  if (!fid || !address || !nonce || !amount || !DAILY_REWARDS_ADDRESS) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    // 1. SECURITY CHECK: Ensure this nonce hasn't been recorded in our DB already
    // This prevents a user from triggering the DB update multiple times for one transaction
    const { data: existingClaim } = await supabaseAdmin
      .from('claims')
      .select('id')
      .eq('nonce', nonce.toString())
      .maybeSingle(); // maybeSingle handles "no rows found" without throwing a PGRST116 error

    if (existingClaim) {
      return res.status(400).json({ error: 'This claim has already been recorded in the database.' });
    }

    // 2. BLOCKCHAIN CHECK: Verify the nonce is marked as "used" in the Smart Contract
    const isNonceUsed = await publicClient.readContract({
      address: DAILY_REWARDS_ADDRESS as `0x${string}`,
      abi: DAILY_REWARDS_ABI,
      functionName: 'usedNonces',
      args: [BigInt(nonce)],
    });

    if (!isNonceUsed) {
      return res.status(400).json({ error: 'Transaction not found or nonce not yet used on-chain.' });
    }

    // 3. DATA INTEGRITY: Convert amount from Wei (string/BigInt) to a readable Number
    // (e.g., 50000000000000000000000 -> 50000)
    const numericAmount = Number(amount) / 1e18;

    // 4. RECORD: Save the successful claim to Supabase
    const { error: dbError } = await supabaseAdmin.from('claims').insert({
      fid: Number(fid),
      address: address.toLowerCase(), // Store lowercase for consistency
      amount: numericAmount, 
      nonce: nonce.toString(),
      claimed_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Supabase Error:', dbError);
      return res.status(500).json({ error: 'Failed to record claim in database.' });
    }

    return res.status(200).json({ success: true, message: 'Claim verified and recorded successfully.' });

  } catch (error: any) {
    console.error('Verify Claim API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
