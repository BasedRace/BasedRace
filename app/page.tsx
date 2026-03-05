'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { sdk } from '@farcaster/miniapp-sdk';

type GameState = 'login' | 'menu' | 'profile' | 'playing' | 'minting';
type UserProfile = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
} | null;

// Minting Preview Component
const MintingPreview = ({ user, onBack, onMint }: { user: UserProfile, onBack: () => void, onMint: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateRacer = async () => {
      if (!canvasRef.current || !user?.pfpUrl) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.imageSmoothingEnabled = false;

      // Load PFP
      const pfpImg = new (window as any).Image();
      pfpImg.crossOrigin = 'Anonymous';
      pfpImg.src = user.pfpUrl;

      await new Promise(resolve => pfpImg.onload = resolve);

      // --- Color Extraction from PFP ---
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      if (!tempCtx) return;
      tempCanvas.width = pfpImg.width;
      tempCanvas.height = pfpImg.height;
      tempCtx.drawImage(pfpImg, 0, 0);
      const imageData = tempCtx.getImageData(0, 0, pfpImg.width, pfpImg.height).data;
      
      // Simple algorithm to find a dominant, non-grayscale color
      let dominantHue = 360; // Default blue
      const hues: { [key: string]: number } = {};
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i+1];
        const b = imageData[i+2];
        const sat = Math.max(r,g,b) - Math.min(r,g,b);
        if (sat > 50) { // filter out grays
          const hue = Math.round(rgbToHsl(r,g,b)[0] * 360);
          hues[hue] = (hues[hue] || 0) + 1;
        }
      }
      if(Object.keys(hues).length > 0){
        dominantHue = parseInt(Object.keys(hues).reduce((a, b) => hues[a] > hues[b] ? a : b));
      }

      // Load car frame
      const carFrameImg = new (window as any).Image();
      // IMPORTANT: Replace this with your actual car frame asset
      carFrameImg.src = '/car-frame-placeholder.png'; 
      await new Promise(resolve => carFrameImg.onload = resolve);
      
      // --- Composite Image ---
      canvas.width = carFrameImg.width;
      canvas.height = carFrameImg.height;
      
      // 1. Draw PFP (sized and positioned for the car's "window")
      // These values are placeholders; adjust x,y,w,h to fit your car frame asset
      ctx.drawImage(pfpImg, 50, 20, 80, 80); 

      // 2. Draw car with color accents
      const carCanvas = document.createElement('canvas');
      const carCtx = carCanvas.getContext('2d');
      if(!carCtx) return;
      carCanvas.width = carFrameImg.width;
      carCanvas.height = carFrameImg.height;
      carCtx.drawImage(carFrameImg, 0, 0);

      const carImageData = carCtx.getImageData(0,0, carCanvas.width, carCanvas.height);
      const data = carImageData.data;
      for(let i=0; i < data.length; i+=4) {
        // This targets specific magenta pixels (#ff00ff) in the placeholder to be replaced by the hue.
        if(data[i] === 255 && data[i+1] === 0 && data[i+2] === 255) {
          const [r,g,b] = hslToRgb(dominantHue/360, 0.8, 0.6);
          data[i] = r;
          data[i+1] = g;
          data[i+2] = b;
        }
      }
      carCtx.putImageData(carImageData, 0, 0);
      
      // 3. Draw the colorized car frame over the PFP
      ctx.drawImage(carCanvas, 0, 0);
    };

    generateRacer();
  }, [user]);

  return (
    <div 
      className="pixel-border flex flex-col items-center justify-between p-5"
      style={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#e7f2eb',
      }}
    >
      {/* Responsive container */}
      <div className="w-[90%] max-w-[400px] flex flex-col items-center justify-between h-full">
        <div className="pixel-font text-[#233e63] text-xl mb-4 text-center">YOUR RACER</div>
        
        <div className="flex-grow flex items-center justify-center w-full">
          {/* Canvas for the composite image */}
          <canvas ref={canvasRef} style={{ imageRendering: 'pixelated', width: '80%', maxWidth: '256px' }} />
        </div>

        {/* Metadata */}
        <div className="text-center mt-4">
          <div className="pixel-font text-[#0f10f4] text-lg">@{user?.username}</div>
          <div className="pixel-font text-[#233e63] text-sm mt-1">FID: {user?.fid}</div>
        </div>

        {/* Mint Button */}
        <button
          onClick={onMint}
          className="pixel-font w-full text-center pixel-btn transition-all duration-150 mt-6 py-3"
          style={{ 
            backgroundColor: '#e7f2eb',
            color: '#0f10f4',
            fontSize: 'clamp(14px, 4vw, 18px)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          MINT PERSONAL RACER
        </button>
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="pixel-font w-full text-center mt-12"
          style={{ 
            backgroundColor: 'transparent',
            color: '#99b1c5',
            fontSize: 'clamp(15px, 4vw, 18px)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          BACK
        </button>
      </div>
    </div>
  );
};


export default function Home() {
  const [gameState, setGameState] = useState<GameState>('login');
  const [user, setUser] = useState<UserProfile>(null);

  useEffect(() => {
    const initSDK = async () => {
      try {
        await sdk.actions.ready();
        const context = await sdk.context;
        if (context && context.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username || '',
            displayName: context.user.displayName || '',
            pfpUrl: context.user.pfpUrl || '',
          });
        }
      } catch (error) {
        console.error('Failed to initialize SDK:', error);
      }
    };
    initSDK();
  }, []);

  const handleLogin = () => setGameState('menu');
  const handleProfile = () => setGameState('profile');
  const handleBackToMenu = () => setGameState('menu');
  const handleStart = () => setGameState('playing');
  const handleMint = () => setGameState('minting');
  const handleOnChainMint = () => {
    // Placeholder for actual on-chain transaction logic
    console.log("Preparing on-chain transaction for user:", user);
    alert("Minting functionality coming soon!");
  };

  const renderGameState = () => {
    switch(gameState) {
      case 'playing':
        return (
          <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
            <iframe 
              key={gameState}
              src="/index.html" 
              style={{ width: '100%', height: '100%', border: 0 }}
              title="Based Race Game"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        );
      case 'profile':
        return (
            <div className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-black">
              <Image src="/ui/mainmenu.webp" alt="Profile Background" fill className="object-cover" unoptimized />
              <div 
                className="pixel-border absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#e7f2eb] w-2/3 h-1/2 flex flex-col items-center p-5"
              >
                <div className="pixel-font text-xl text-[#233e63] mb-5">PROFILE</div>
                {user ? (
                  <div className="flex flex-col items-center gap-4 flex-grow justify-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#233e63]">
                      <img src={user.pfpUrl} alt={user.displayName} className="w-full h-full object-cover" />
                    </div>
                    <div className="pixel-font text-sm text-[#0f10f4] text-center">{user.displayName || user.username}</div>
                    <div className="pixel-font text-xs text-[#233e63]">@{user.username}</div>
                    <div className="pixel-font text-xs text-[#99b1c5]">FID: {user.fid}</div>
                  </div>
                ) : (
                  <div className="pixel-font text-sm text-[#233e63] flex-grow flex items-center justify-center">Loading...</div>
                )}
                <button
                  onClick={handleBackToMenu}
                  className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-sm p-2.5 mt-auto"
                >
                  BACK TO MENU
                </button>
              </div>
            </div>
        );
      case 'login':
        return (
            <div className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-black">
              <Image src="/ui/login.webp" alt="Login Background" fill className="object-cover" unoptimized />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-52 relative">
                  <Image src="/ui/mascot.webp" alt="Mascot" width={200} height={200} className="object-contain w-full h-auto" unoptimized />
                </div>
                <button
                  onClick={handleLogin}
                  className="pixel-font pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl px-10 py-4"
                >
                  LOGIN
                </button>
              </div>
            </div>
        );
      case 'minting':
        return (
          <div className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-black">
            <Image src="/ui/mainmenu.webp" alt="Minting Background" fill className="object-cover" unoptimized />
            <MintingPreview user={user} onBack={handleBackToMenu} onMint={handleOnChainMint} />
          </div>
        );
      case 'menu':
      default:
        return (
            <div className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-black">
              <Image src="/ui/mainmenu.webp" alt="Main Menu Background" fill priority className="object-cover" unoptimized />
              <div 
                className="pixel-border absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#e7f2eb] w-2/3 h-2/5 flex flex-col"
              >
                <button onClick={handleStart} className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">START</button>
                <button onClick={handleProfile} className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">PROFILE</button>
                <button onClick={handleMint} className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">MINT</button>
                <button className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">LEADERBOARD</button>
              </div>
            </div>
        );
    }
  };

  return (
    <main>
       <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          .pixel-font {
            font-family: 'Press Start 2P', cursive;
            image-rendering: pixelated;
          }
          .pixel-border {
            box-shadow: 
              4px 0 0 0 #233e63, -4px 0 0 0 #233e63,
              0 4px 0 0 #233e63, 0 -4px 0 0 #233e63,
              6px 0 0 0 #99b1c5, -6px 0 0 0 #99b1c5,
              0 6px 0 0 #99b1c5, 0 -6px 0 0 #99b1c5;
          }
          .pixel-btn {
            box-shadow: 4px 4px 0 0 #233e63, 6px 6px 0 0 #99b1c5;
          }
          .pixel-btn:active {
            transform: translate(4px, 4px);
            box-shadow: 0 0 0 0 #233e63, 2px 2px 0 0 #99b1c5;
          }
        `}</style>
      {renderGameState()}
    </main>
  );
}

// Helper functions for color conversion
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
