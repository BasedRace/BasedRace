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
    const pfpUrl = searchParams.get('pfpUrl');

    if (isNaN(fid)) {
      console.error('Missing or invalid FID for /api/racer/status');
      return NextResponse.json({ error: 'Missing or invalid FID' }, { status: 400 });
    }

    console.log(`Fetching data for FID: ${fid}`);

    const { data, error } = await supabaseAdmin.from('racers')
      .select('is_minted, image_url, tier, exp, pfp_url, wins') 
      .eq('fid', fid)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase fetch error:', error);
      throw new Error(`Failed to fetch status: ${error.message}`);
    }

    // Auto-update PFP for old users on login
    if (data && pfpUrl && data.pfp_url !== pfpUrl) {
      supabaseAdmin.from('racers').update({ pfp_url: pfpUrl }).eq('fid', fid)
        .then(() => console.log(`Auto-updated missing PFP for FID ${fid}`));
    }

    const isMinted = data ? data.is_minted : false;
    const imageUrl = data ? data.image_url : null; // Ambil image_url jika data ada
    const tier = data ? data.tier : 'N/A';
    const exp = data ? data.exp : 0;
    const wins = data ? data.wins : 0;

    console.log(`Status for FID ${fid}: isMinted=${isMinted}, imageUrl=${imageUrl}, tier=${tier}, exp=${exp}, wins=${wins}`);

    // Kembalikan data lengkap agar bisa dipakai frontend
    return NextResponse.json({ isMinted, imageUrl, tier, exp, wins });

  } catch (error) {
    console.error('Error in /api/racer/status:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
