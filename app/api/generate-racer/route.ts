import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  console.log('API route hit. Processing request...');

  try {
    const { fid, username, pfpUrl } = await req.json();
    console.log(`Received data for FID: ${fid}, Username: ${username}`);

    if (!fid || !username || !pfpUrl) {
      console.error('Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check if a racer already exists for this user in the database
    console.log(`Checking database for existing racer with FID: ${fid}`);
    const { data: existingRacer, error: dbError } = await supabaseAdmin
      .from('racers')
      .select('image_url')
      .eq('fid', fid)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = 'No rows found'
        console.error('Supabase check error:', dbError);
        throw new Error('Failed to query database.');
    }
    
    if (existingRacer) {
      console.log(`Racer found in cache. Returning URL: ${existingRacer.image_url}`);
      return NextResponse.json({ imageUrl: existingRacer.image_url });
    }

    // 2. If no racer exists, generate a new one (simulation)
    console.log('No existing racer found. Generating placeholder image...');
    const placeholderResponse = await fetch('https://via.placeholder.com/256/0000FF/FFFFFF?text=Racer-Preview');
    if (!placeholderResponse.ok) {
        throw new Error('Failed to fetch placeholder image.');
    }
    const imageBuffer = await placeholderResponse.arrayBuffer();
    const storageFileName = `racer-${fid}-${Date.now()}.png`;
    console.log(`Placeholder fetched. Filename will be: ${storageFileName}`);

    // 3. Upload the generated image to Supabase Storage
    console.log('Uploading image to Supabase Storage...');
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('racer-images')
      .upload(storageFileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false, // Use false to avoid overwriting existing files unexpectedly
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error('Failed to upload image to storage.');
    }
    console.log('Upload successful.');

    // 4. Get the public URL of the uploaded image
    console.log('Getting public URL for the image...');
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('racer-images')
      .getPublicUrl(storageFileName);

    if (!publicUrl) {
        throw new Error('Failed to get public URL for the image.');
    }
    console.log(`Public URL obtained: ${publicUrl}`);

    // 5. Save the record to the Supabase database
    console.log('Saving racer record to the database...');
    const { error: insertError } = await supabaseAdmin.from('racers').insert({
      fid,
      username,
      image_url: publicUrl,
    });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      // Attempt to clean up the uploaded image if the db insert fails
      await supabaseAdmin.storage.from('racer-images').remove([storageFileName]);
      throw new Error('Failed to save racer to database.');
    }
    console.log('Database record saved successfully.');

    // 6. Return the new image URL to the frontend
    return NextResponse.json({ imageUrl: publicUrl });

  } catch (error) {
    console.error('Full generation error in API route:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
