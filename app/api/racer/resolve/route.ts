import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { BETTING_CONTRACT_ADDRESS, BETTING_ABI } from '../../../../src/lib/constants';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { fid, isWin, raceId, winnerName } = await req.json();

    if (!fid) {
      return NextResponse.json({ error: 'Missing FID' }, { status: 400 });
    }

    // 1. Fetch current EXP and Wins data from Supabase
    const { data: racer, error: fetchError } = await supabaseAdmin
      .from('racers')
      .select('exp, wins')
      .eq('fid', fid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch player data: ${fetchError.message}`);
    }

    const currentExp = racer?.exp || 0;
    const currentWins = racer?.wins || 0;

    // 2. Calculate EXP addition (50 for Win, 10 for Loss)
    const expGain = isWin ? 50 : 10;
    const newExp = currentExp + expGain;
    const newWins = isWin ? currentWins + 1 : currentWins;

    // 3. Save new EXP and Wins to the Database
    const { error: updateError } = await supabaseAdmin
      .from('racers')
      .update({ exp: newExp, wins: newWins })
      .eq('fid', fid);

    if (updateError) {
      throw new Error(`Failed to save EXP: ${updateError.message}`);
    }

    let txHash = null;

    // 4. Connect Backend Oracle to Smart Contract (Only if Legitimate Win)
    if (isWin && raceId && winnerName) {
        try {
            const privateKey = process.env.ADMIN_PRIVATE_KEY as `0x${string}`;
            if (!privateKey) {
                console.warn("ADMIN_PRIVATE_KEY is not set in .env. Smart Contract Payout skipped.");
            } else {
                const account = privateKeyToAccount(privateKey);
                const client = createWalletClient({
                    account,
                    chain: base, // Use baseSepolia if testing on Testnet
                    transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org")
                }).extend(publicActions);

                // Pull the trigger on resolveRace() with Server Admin authority
                const hash = await client.writeContract({
                    address: BETTING_CONTRACT_ADDRESS,
                    abi: BETTING_ABI,
                    functionName: 'resolveRace',
                    args: [BigInt(raceId), winnerName]
                });
                txHash = hash;
                console.log(`[ORACLE] Web3 Payout Transaction Sent! Hash: ${hash}`);
            }
        } catch(oracleError: any) {
             console.error(`[ORACLE ERROR] Web3 Payout failed:`, oracleError.message || oracleError);
             // We continue without failing the whole request so EXP is still returned
        }
    }

    return NextResponse.json({ 
        success: true, 
        exp: newExp, 
        wins: newWins, 
        expGained: expGain,
        payoutTx: txHash
    });

  } catch (error: any) {
    console.error('Error in /api/racer/resolve:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
