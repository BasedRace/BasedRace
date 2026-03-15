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

// Initialize Viem public client
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const DAILY_REWARDS_ADDRESS = process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { fid, address, nonce, amount } = req.body;

  if (!fid || !address || !nonce || !amount || !DAILY_REWARDS_ADDRESS) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    // Check if the nonce has been used on-chain
    const isNonceUsed = await publicClient.readContract({
      address: DAILY_REWARDS_ADDRESS as `0x${string}`,
      abi: DAILY_REWARDS_ABI,
      functionName: 'usedNonces',
      args: [BigInt(nonce)],
    });

    if (!isNonceUsed) {
      return res.status(400).json({ error: 'Nonce not used on-chain. Claim not verified.' });
    }

    // Record the claim in the database
    const { error: dbError } = await supabaseAdmin.from('claims').insert({
      fid,
      address,
      amount,
      nonce,
      claimed_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Supabase Error:', dbError);
      return res.status(500).json({ error: 'Failed to record claim in the database.' });
    }

    return res.status(200).json({ success: true, message: 'Claim verified and recorded.' });

  } catch (error: any) {
    console.error('Verify Claim API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
