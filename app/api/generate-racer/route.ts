import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Helper function to fetch an image and convert it to a format the model understands
async function urlToGenerativePart(url: string, mimeType: string) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return {
        inlineData: {
            data: Buffer.from(buffer).toString('base64'),
            mimeType,
        },
    };
}

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
      .select('image_url, status, tier')
      .eq('fid', fid)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = 'No rows found'
        console.error('Supabase check error:', dbError);
        throw new Error('Failed to query database.');
    }
    
    let currentRacer = existingRacer;

    if (currentRacer) {
      console.log(`Racer found in cache. Returning URL: ${currentRacer.image_url}`);
      // Also return metadata_url if it exists
      if (currentRacer.metadata_url) {
        return NextResponse.json({ imageUrl: currentRacer.image_url, metadataUrl: currentRacer.metadata_url });
      } else {
        // If metadata_url is missing for an existing racer, generate it now
        console.log('Existing racer found without metadata_url. Generating metadata...');
        const { imageUrl, metadataUrl } = await generateAndStoreMetadata(fid, username, currentRacer.status, currentRacer.tier, currentRacer.image_url);
        return NextResponse.json({ imageUrl, metadataUrl });
      }
    }

    // ... (rest of the existing code)
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

    // Retrieve the newly inserted racer to get default status and tier
    const { data: newRacerData, error: fetchError } = await supabaseAdmin
      .from('racers')
      .select('status, tier, image_url')
      .eq('fid', fid)
      .single();

    if (fetchError || !newRacerData) {
        console.error('Failed to fetch newly inserted racer data:', fetchError);
        throw new Error('Failed to retrieve full racer data after insertion.');
    }
    
    // 6. Generate and store NFT metadata
    const { metadataUrl } = await generateAndStoreMetadata(fid, username, newRacerData.status, newRacerData.tier, publicUrl);

    // 7. Update the racer record with the metadata_url
    console.log('Updating racer record with metadata_url...');
    const { error: updateMetadataError } = await supabaseAdmin.from('racers')
      .update({ metadata_url: metadataUrl })
      .eq('fid', fid);

    if (updateMetadataError) {
      console.error('Supabase update metadata_url error:', updateMetadataError);
      throw new Error('Failed to save metadata_url to database.');
    }
    console.log('Metadata URL saved successfully.');

    // 8. Return the new image URL and metadata URL to the frontend
    return NextResponse.json({ imageUrl: publicUrl, metadataUrl });

  } catch (error) {
    console.error('Full generation error in API route:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// Helper function to generate and store NFT metadata
async function generateAndStoreMetadata(fid: number, username: string, status: string, tier: string, imageUrl: string) {
  const metadata = {
    name: `Based Racer #${fid}`,
    description: "A unique AI-generated racer for the Based Race tournament.",
    image: imageUrl,
    attributes: [
      { trait_type: "Racer", value: `Based Racer (${fid})` },
      { trait_type: "Status", value: status },
      { trait_type: "Tier", value: tier },
    ],
  };

  const metadataFileName = `${fid}.json`;
  const metadataContent = JSON.stringify(metadata, null, 2); // Pretty print JSON

  console.log(`Uploading metadata for FID ${fid} to Storage...`);
  const { data: metadataUploadData, error: metadataUploadError } = await supabaseAdmin.storage
    .from('racer-metadata')
    .upload(metadataFileName, metadataContent, {
      contentType: 'application/json',
      upsert: true, // Overwrite if exists
    });

  if (metadataUploadError) {
    console.error('Supabase metadata upload error:', metadataUploadError);
    throw new Error('Failed to upload NFT metadata to storage.');
  }
  console.log('Metadata upload successful.');

  const { data: { publicUrl: metadataPublicUrl } } = supabaseAdmin.storage
    .from('racer-metadata')
    .getPublicUrl(metadataFileName);

  if (!metadataPublicUrl) {
    throw new Error('Failed to get public URL for metadata.');
  }
  console.log(`Metadata Public URL obtained: ${metadataPublicUrl}`);

  return { imageUrl, metadataUrl: metadataPublicUrl };
}
