import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // 1. Keamanan Sederhana: Wajibkan kata sandi admin
    const adminSecret = req.headers.get('x-admin-secret');
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Akses Ditolak (Unauthorized)' }, { status: 401 });
    }

    const payloadBody = await req.json();
    const { title, textBody, targetUrl, notificationId } = payloadBody;

    if (!title || !textBody || !targetUrl) {
      return NextResponse.json({ error: 'Parameter title, textBody, atau targetUrl hilang!' }, { status: 400 });
    }

    // 2. Tarik semua token dari Supabase yang mengizinkan notifikasi
    const { data: users, error } = await supabaseAdmin
      .from('racers')
      .select('notification_token, notification_url')
      .eq('notifications_enabled', true)
      .not('notification_token', 'is', null);

    if (error || !users) {
      throw new Error(error?.message || 'Gagal menarik data token dari Supabase');
    }

    // 3. Kelompokkan token berdasarkan URL tujuannya (Warpcast dsb.)
    const urlGroups: Record<string, string[]> = {};
    for (const user of users) {
      const { notification_token, notification_url } = user;
      if (!notification_token || !notification_url) continue;

      if (!urlGroups[notification_url]) {
        urlGroups[notification_url] = [];
      }
      urlGroups[notification_url].push(notification_token);
    }

    let totalSent = 0;
    let failedBatches = 0;
    
    // Pastikan satu ID notifikasi stabil agar Farcaster tidak menduplikasi jika dikirim ulang
    const stableNotificationId = notificationId || `broadcast-${Date.now()}`;

    // 4. Kirim notifikasi dengan metode pecahan maksimal 100 token per tembakan (Sesuai Aturan Farcaster)
    for (const [url, tokens] of Object.entries(urlGroups)) {
      for (let i = 0; i < tokens.length; i += 100) {
        const batchTokens = tokens.slice(i, i + 100);

        const farcasterPayload = {
          notificationId: stableNotificationId,
          title: title,
          body: textBody,
          targetUrl: targetUrl,
          tokens: batchTokens
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(farcasterPayload)
        });

        const result = await response.json().catch(() => null);
        
        if (response.ok) {
           totalSent += batchTokens.length;
           console.log(`✅ Broadcast batch sukses ke ${url}:`, result);
        } else {
           failedBatches++;
           console.error(`❌ Broadcast batch gagal ke ${url}:`, result);
        }
      }
    }

    return NextResponse.json({ 
        success: true, 
        message: `Siaran Selesai. Sukses menjangkau ${totalSent} token. Kegagalan API: ${failedBatches}`, 
        notificationId: stableNotificationId 
    });

  } catch (error) {
    console.error('Broadcast Error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
