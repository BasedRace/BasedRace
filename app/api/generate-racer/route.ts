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

    // 2. If no racer exists, generate a new one with the specified Gemini Image model
    console.log('No existing racer found. Generating image with "gemini-3.1-flash-image-preview" model...');
    
    const prompt = `Detailed pixel-art illustration, classic 16-bit go-kart game style, isometric 3/4 view, output resolution 550x550 pixels. The go-kart features a main chassis, a front nose section, small yellow headlights, side pods, black tires, and grey rims. Grey exhaust smoke comes from the rear-right. The color scheme of the go-kart is derived from the palette in this image (profile pic). The seated driver character has highly detailed, pixelated features, character appearance directly translated from the provided reference appearance from this image (profile pic). The driver\'s appearance is based on this image, holding the steering wheel. The background must be a solid, pure white color: #FFFFFF.`;
    
    let imageBuffer;
    let storageFileName;

    try {
        const pfpImagePart = await urlToGenerativePart(pfpUrl, 'image/png');
        
        const result = await genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" })
                                    .generateContent([prompt, pfpImagePart]);
        
        const firstPart = result.response.candidates?.[0].content.parts[0];

        if (!firstPart || !('inlineData' in firstPart) || !firstPart.inlineData) {
             throw new Error('Invalid response from AI model. Response did not contain image data.');
        }
        
        const imageBase64 = firstPart.inlineData.data;
        const rawImageBuffer = Buffer.from(imageBase64, 'base64');

        console.log('Processing image with sharp for custom transparency and resize...');

        const imageSharp = sharp(rawImageBuffer);
        const metadata = await imageSharp.metadata();

        if (!metadata.width || !metadata.height) {
            throw new Error('Could not get image metadata for processing.');
        }

        const { data, info } = await imageSharp.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

        // Iterate over pixel data (RGBA)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // const a = data[i + 3]; // Alpha channel

            // Check if pixel is close to white (R, G, B > 245)
            if (r > 245 && g > 245 && b > 245) {
                data[i + 3] = 0; // Set alpha to 0 (transparent)
            }
        }

        imageBuffer = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
            .resize(550, 550)
            .png()
            .toBuffer();
        
        storageFileName = `racer-${fid}-${Date.now()}.png`;
        console.log(`Image processed. Filename: ${storageFileName}`);

    } catch (aiError) {
        console.error("AI generation failed. Falling back to placeholder.", aiError);
        const placeholderResponse = await fetch('https://placehold.co/256x256/FF6347/FFFFFF.png?text=AI+Error');
        imageBuffer = await placeholderResponse.arrayBuffer();
        storageFileName = `racer-${fid}-${Date.now()}-fallback.png`;
    }

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
