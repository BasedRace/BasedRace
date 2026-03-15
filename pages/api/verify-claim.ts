import { NextApiRequest, NextApiResponse } from 'next';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { createClient } from '@supabase/supabase-js';
import DAILY_REWARDS_ABI from '../../src/lib/claim.json';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Gunakan RPC publik yang berbeda sebagai cadangan jika RPC standar lag
const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"), // RPC Resmi Base
});

const DAILY_REWARDS_ADDRESS = process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { fid, address, nonce, amount } = req.body;

  // LOG UNTUK DEBUGGING
  console.log("--- VERIFY CLAIM START ---");
  console.log("Target Contract:", DAILY_REWARDS_ADDRESS);
  console.log("Checking Nonce:", nonce);

  try {
    // 1. Cek duplikasi di DB
    const { data: existingClaim } = await supabaseAdmin
      .from('claims')
      .select('id')
      .eq('nonce', nonce.toString())
      .maybeSingle();

    if (existingClaim) {
      console.log("Result: Claim already in DB");
      return res.status(400).json({ error: 'Claim already recorded.' });
    }

    // 2. Cek Blockchain dengan Retry yang lebih agresif
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
      
      // Tunggu 2 detik sebelum coba lagi
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log("Final Blockchain Result:", isNonceUsed);

    if (!isNonceUsed) {
      return res.status(400).json({ 
        error: "Blockchain data not synced yet. Try again in a few seconds." 
      });
    }

    // 3. Simpan ke Database
    const numericAmount = Math.round(Number(amount) / 1e18);
    const { error: dbError } = await supabaseAdmin.from('claims').insert({
      fid: Number(fid),
      address: address.toLowerCase(),
      amount: numericAmount, 
      nonce: nonce.toString(),
      claimed_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Supabase Insert Error:", dbError);
      throw dbError;
    }

    console.log("--- VERIFY CLAIM SUCCESS ---");
    return res.status(200).json({ success: true, message: 'Verified!' });

  } catch (error: any) {
    console.error('Verify API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
