import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  console.log('API route /api/racer/minted hit. Processing request...');

  try {
    const { fid, isMinted } = await req.json();

    if (!fid || typeof isMinted !== 'boolean') {
      console.error('Missing or invalid fields for /api/racer/minted');
      return NextResponse.json({ error: 'Missing or invalid fields (fid, isMinted)' }, { status: 400 });
    }

    console.log(`Updating is_minted status for FID: ${fid} to ${isMinted}`);

    const { error } = await supabaseAdmin.from('racers')
      .update({ is_minted: isMinted })
      .eq('fid', fid);

    if (error) {
      console.error('Supabase update is_minted error:', error);
      throw new Error(`Failed to update is_minted status: ${error.message}`);
    }

    console.log(`is_minted status for FID: ${fid} updated successfully.`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in /api/racer/minted:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
