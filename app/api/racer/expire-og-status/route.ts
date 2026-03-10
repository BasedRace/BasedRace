import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  console.log('API route /api/racer/expire-og-status hit. Processing request...');

  // For security, you might want to add an authentication/authorization check here
  // to ensure only authorized entities (e.g., an admin tool or a scheduled job)
  // can trigger this function.
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Updating status for unminted OG Racers...');

    const { data, error } = await supabaseAdmin.from('racers')
      .update({ status: 'Racer' })
      .eq('is_minted', false)
      .eq('status', 'OG Racer'); // Only update those who are currently 'OG Racer'

    if (error) {
      console.error('Supabase update OG status error:', error);
      throw new Error(`Failed to update OG status: ${error.message}`);
    }

    console.log(`Updated status for ${data?.length || 0} unminted OG Racers.`);
    return NextResponse.json({ success: true, updatedCount: data?.length || 0 });

  } catch (error) {
    console.error('Error in /api/racer/expire-og-status:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
