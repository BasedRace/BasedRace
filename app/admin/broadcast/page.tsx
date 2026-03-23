'use client';

import { useState } from 'react';

export default function AdminBroadcastPage() {
  const [secret, setSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetUrl, setTargetUrl] = useState('https://basedrace.vercel.app');
  const [notificationId, setNotificationId] = useState('');
  
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret.trim().length > 0) {
      setIsAuthenticated(true);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body || !targetUrl) {
      setStatus({ type: 'error', message: 'Please provide Title, Body, and Target URL.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Processing broadcast...' });

    try {
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
        body: JSON.stringify({
          title,
          textBody: body,
          targetUrl,
          notificationId: notificationId || `broadcast-${Date.now()}`
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({ type: 'success', message: data.message || 'Broadcast deployed successfully! ✅' });
        setTitle('');
        setBody('');
        setNotificationId('');
      } else {
        setStatus({ type: 'error', message: data.error || 'An error occurred during broadcast ❌' });
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to connect to the server API ❌' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative z-50">
        <form onSubmit={handleLogin} className="bg-[#233e63] p-8 pb-10 border-4 border-yellow-500 shadow-[6px_6px_0_0_#99b1c5] max-w-sm w-full flex flex-col gap-6">
          <h1 className="pixel-font text-xl text-yellow-500 text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">ADMIN RADAR 📡</h1>
          <p className="text-white text-xs text-center pb-2">Farcaster Broadcast Server Authentication</p>
          <input 
            type="password" 
            value={secret} 
            onChange={(e) => setSecret(e.target.value)} 
            placeholder="Enter Admin Secret Key..." 
            className="p-3 bg-gray-900 text-yellow-500 border-2 border-white focus:border-yellow-500 focus:outline-none pixel-font text-[10px]"
          />
          <button type="submit" className="bg-yellow-500 text-black border-4 border-black hover:border-white pixel-font py-3 hover:bg-yellow-400 active:translate-y-1 transition-all">CONNECT</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-8 overflow-y-auto pb-20 custom-scrollbar relative z-50">
      <div className="w-full max-w-2xl flex flex-col gap-6 bg-[#e7f2eb] p-8 border-4 border-[#233e63] relative shadow-lg shadow-[#99b1c5]">
        <button onClick={() => setIsAuthenticated(false)} className="absolute top-4 right-4 text-xs text-red-600 font-bold hover:underline pixel-font active:translate-y-1">TERMINATE</button>
        
        <h1 className="pixel-font text-2xl text-center text-[#233e63] mb-4 drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]">BROADCAST CENTER 📡</h1>
        <p className="text-gray-700 text-sm mb-2 text-center border-b-2 border-[#233e63] pb-4">Draft your mass message here. Click Broadcast and the message will be sent to all users who have enabled Farcaster notifications for the mini app (*Warpcast allows a maximum of 100 notifications/day per user*).</p>

        {status.message && (
          <div className={`p-4 border-2 text-sm font-bold pixel-font leading-relaxed ${
            status.type === 'error' ? 'bg-red-200 text-red-800 border-red-600 shadow-[4px_4px_0_0_#991b1b]' : 
            status.type === 'success' ? 'bg-green-200 text-green-800 border-green-600 shadow-[4px_4px_0_0_#166534]' : 
            'bg-yellow-200 text-yellow-800 border-yellow-600'
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleBroadcast} className="flex flex-col gap-5 mt-4">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-black pixel-font text-[10px]">TITLE (Max 32 Characters)</label>
            <input 
              maxLength={32}
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. 🏎️ NEW TRACK UNLOCKED!" 
              className="p-3 bg-white text-black border-2 border-gray-400 focus:border-[#233e63] focus:outline-none focus:ring-2 focus:ring-[#99b1c5]"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-black pixel-font text-[10px]">PUSH NOTIFICATION BODY (Max 128 Characters)</label>
            <textarea 
              maxLength={128}
              value={body} 
              onChange={(e) => setBody(e.target.value)} 
              placeholder="e.g. Come and play our first Tournament mode. Hundreds of thousands of $RACE in prizes await you tonight!" 
              className="p-3 bg-white text-black border-2 border-gray-400 focus:border-[#233e63] focus:outline-none focus:ring-2 focus:ring-[#99b1c5] min-h-[100px] resize-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-black pixel-font text-[10px]">TARGET URL (Link destination)</label>
            <input 
              type="url" 
              value={targetUrl} 
              onChange={(e) => setTargetUrl(e.target.value)} 
              placeholder="https://basedrace.vercel.app" 
              className="p-3 bg-white text-black border-2 border-gray-400 focus:border-[#233e63] focus:outline-none focus:ring-2 focus:ring-[#99b1c5]"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-500 pixel-font text-[8px] sm:text-[10px]">DELIVERY ID (Optional, leave empty for instant)</label>
            <input 
              type="text" 
              value={notificationId} 
              onChange={(e) => setNotificationId(e.target.value)} 
              placeholder="e.g. promo-tuesday" 
              className="p-3 bg-gray-100 text-gray-600 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          <button 
            type="submit" 
            disabled={status.type === 'loading'}
            className="mt-8 bg-[#0f10f4] text-white pixel-font py-4 text-xs sm:text-sm border-4 border-black hover:border-yellow-400 hover:text-yellow-400 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0_0_#99b1c5]"
          >
            {status.type === 'loading' ? 'TRANSMITTING...' : 'BLAST NOTIFICATION 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
