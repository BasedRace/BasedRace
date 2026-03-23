import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function decodeBase64Json(base64Str: string) {
  try {
    const jsonStr = Buffer.from(base64Str, 'base64url').toString('utf8');
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    console.log("🔔 [Webhook Received] Raw Payload:", rawBody);

    let header, payload;

    // Farcaster servers wrap payloads in JSON Farcaster Signatures (JFS)
    if (rawBody.header && rawBody.payload && typeof rawBody.payload === 'string') {
      header = decodeBase64Json(rawBody.header);
      payload = decodeBase64Json(rawBody.payload);
    } else {
      // Fallback for direct API testing 
      header = { fid: rawBody.fid };
      payload = rawBody;
    }

    if (!header || !payload || typeof header.fid === 'undefined') {
       console.error("❌ Invalid Webhook Payload or missing FID.");
       return NextResponse.json({ success: false, error: 'Invalid JFS or missing FID' }, { status: 400 });
    }

    const fid = header.fid;
    const eventType = payload.event;
    
    console.log(`🔔 [Webhook Action] Event: ${eventType} for FID: ${fid}`);

    if (eventType === 'miniapp_added' || eventType === 'notifications_enabled') {
      const token = payload.notificationDetails?.token;
      const url = payload.notificationDetails?.url;
      
      if (token && url) {
        // Save the token routing info to Supabase!
        const { error } = await supabaseAdmin.from('racers').update({
          notification_token: token,
          notification_url: url,
          notifications_enabled: true
        }).eq('fid', fid);
        
        if (error) {
            console.error(`❌ DB Error updating token for FID ${fid}:`, error);
        } else {
            console.log(`✅ Successfully saved token for FID: ${fid}`);
        }
      } else {
          console.warn("⚠️ Event triggered without notificationDetails. (Warpcast settings mismatch?)");
      }
    } else if (eventType === 'miniapp_removed' || eventType === 'notifications_disabled') {
       // Obliterate the token securely
       await supabaseAdmin.from('racers').update({
          notifications_enabled: false,
          notification_token: null
       }).eq('fid', fid);
       
       console.log(`✅ Successfully disabled notifications for FID: ${fid}`);
    }

    // Must return 200 OK so Farcaster knows the payload was absorbed
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Critical Error in /api/webhook:', error);
    // Suppress 500 error slightly so Farcaster doesn't angrily retry if it's corrupted payload
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 200 });
  }
}
