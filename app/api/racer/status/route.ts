import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  console.log('API route /api/racer/status hit. Processing request...');

  try {
    const { searchParams } = new URL(req.url);
    const fid = parseInt(searchParams.get('fid') || '', 10);

    if (isNaN(fid)) {
      console.error('Missing or invalid FID for /api/racer/status');
      return NextResponse.json({ error: 'Missing or invalid FID' }, { status: 400 });
    }

    console.log(`Fetching is_minted status for FID: ${fid}`);

    const { data, error } = await supabaseAdmin.from('racers')
      .select('is_minted')
      .eq('fid', fid)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = 'No rows found'
      console.error('Supabase fetch is_minted error:', error);
      throw new Error(`Failed to fetch is_minted status: ${error.message}`);
    }

    const isMinted = data ? data.is_minted : false;

    console.log(`is_minted status for FID: ${fid} is ${isMinted}`);
    return NextResponse.json({ isMinted });

  } catch (error) {
    console.error('Error in /api/racer/status:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
