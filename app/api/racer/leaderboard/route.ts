import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Ambil pembalap berdasarkan paginasi, diurutkan EXP tertinggi
    const { data, error, count } = await supabaseAdmin.from('racers')
      .select('fid, username, image_url, pfp_url, is_minted, exp, wins', { count: 'exact' }) 
      .order('exp', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Supabase fetch leaderboard error:', error);
      throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }

    const hasMore = count !== null && to < count - 1;
    return NextResponse.json({ leaderboard: data, hasMore, totalCount: count });

  } catch (error) {
    console.error('Error in /api/racer/leaderboard:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
