
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Helper function to fetch an image and convert it to Base64
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
  try {
    const { fid, username, pfpUrl } = await req.json();

    if (!fid || !username || !pfpUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check if a racer already exists for this user in the database
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
      // If a racer exists, return the cached image URL immediately
      return NextResponse.json({ imageUrl: existingRacer.image_url });
    }

    // 2. If no racer exists, generate a new one (simulation)
    // NOTE: This part is a conceptual placeholder. A proper implementation 
    // would use a dedicated Image Generation model API like Imagen.
    
    // --- SIMULATED IMAGE GENERATION ---
    const placeholderResponse = await fetch('https://via.placeholder.com/256/0000FF/FFFFFF?text=Racer-Preview');
    const imageBuffer = await placeholderResponse.arrayBuffer();
    const storageFileName = `racer-${fid}-${Date.now()}.png`;
    // --- END SIMULATION ---


    // 3. Upload the generated image to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('racer-images')
      .upload(storageFileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error('Failed to upload image to storage.');
    }

    // 4. Get the public URL of the uploaded image
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('racer-images')
      .getPublicUrl(storageFileName);

    if (!publicUrl) {
        throw new Error('Failed to get public URL for the image.');
    }

    // 5. Save the record to the Supabase database
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

    // 6. Return the new image URL to the frontend
    return NextResponse.json({ imageUrl: publicUrl });

  } catch (error) {
    console.error('Full generation error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
