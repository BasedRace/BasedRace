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
  transport: http("https://mainnet.base.org"),
});

const DAILY_REWARDS_ADDRESS = process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { nonce } = req.body;

  if (!nonce) {
    return res.status(400).json({ error: 'Nonce is required.' });
  }

  console.log("--- VERIFY AND CONFIRM CLAIM START ---");
  console.log("Target Contract:", DAILY_REWARDS_ADDRESS);
  console.log("Checking Nonce:", nonce);

  try {
    let isNonceUsed = false;
    for (let i = 0; i < 5; i++) {
      console.log(`Checking Blockchain Attempt ${i + 1}...`);
      
      isNonceUsed = await publicClient.readContract({
        address: DAILY_REWARDS_ADDRESS as `0x${string}`,
        abi: DAILY_REWARDS_ABI,
        functionName: 'usedNonces',
        args: [BigInt(nonce)],
      }) as boolean;

      if (isNonceUsed) break;
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log("Final Blockchain Result for Nonce:", isNonceUsed);

    if (!isNonceUsed) {
      return res.status(400).json({ 
        error: "Blockchain transaction not found or not confirmed yet." 
      });
    }

    const { error: dbError } = await supabaseAdmin
      .from('claims')
      .update({
        status: 'confirmed',
        claimed_at: new Date().toISOString(),
      })
      .eq('nonce', nonce.toString());

    if (dbError) {
      console.error("Supabase Update Error:", dbError);
      throw dbError;
    }

    console.log(`--- VERIFY AND CONFIRM SUCCESS for Nonce: ${nonce} ---`);
    return res.status(200).json({ success: true, message: 'Claim successfully confirmed.' });

  } catch (error: any) {
    console.error('Verify API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
