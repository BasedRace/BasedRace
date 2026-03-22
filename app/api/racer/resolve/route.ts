import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { fid, isWin } = await req.json();

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

    // [TODO] This is the Oracle location to call Smart Contract resolveRace()
    // Due to Private Key security requirements, the server prioritizes the database first for now.

    return NextResponse.json({ 
        success: true, 
        exp: newExp, 
        wins: newWins, 
        expGained: expGain 
    });

  } catch (error: any) {
    console.error('Error in /api/racer/resolve:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
