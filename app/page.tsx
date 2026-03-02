'use client';

import { useState } from 'react';
import Image from 'next/image';

type GameState = 'menu' | 'playing';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('menu');

  const handleStart = () => {
    setGameState('playing');
  };

  if (gameState === 'playing') {
    return (
      <div className="w-full h-screen">
        <iframe 
          key={gameState}
          src="/index.html" 
          className="w-full h-full border-0"
          title="Based Race Game"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      {/* Full-screen background image */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Image
          src="/ui/mainmenu.webp"
          alt="Main Menu Background"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: 'center' }}
          unoptimized
        />
      </div>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font {
          font-family: 'Press Start 2P', cursive;
          image-rendering: pixelated;
        }
        .pixel-border {
          box-shadow: 
            4px 0 0 0 #233e63,
            -4px 0 0 0 #233e63,
            0 4px 0 0 #233e63,
            0 -4px 0 0 #233e63,
            6px 0 0 0 #99b1c5,
            -6px 0 0 0 #99b1c5,
            0 6px 0 0 #99b1c5,
            0 -6px 0 0 #99b1c5;
        }
        .pixel-btn {
          box-shadow: 
            4px 4px 0 0 #233e63,
            6px 6px 0 0 #99b1c5;
        }
        .pixel-btn:active {
          transform: translate(4px, 4px);
          box-shadow: 
            0 0 0 0 #233e63,
            2px 2px 0 0 #99b1c5;
        }
      `}</style>

      {/* Menu Box - Centered */}
      <div 
        className="pixel-border"
        style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#e7f2eb',
          width: '66%',
          height: '40%',
          display: 'flex',
          flexDirection: 'column',
          padding: '4%',
        }}
      >
        {/* Start Button - Primary */}
        <button
          onClick={handleStart}
          className="pixel-font w-full text-center pixel-btn transition-all duration-150"
          style={{ 
            backgroundColor: '#e7f2eb',
            color: '#0f10f4',
            fontSize: 'clamp(16px, 5vw, 28px)',
            flex: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          START
        </button>

        {/* Secondary Buttons */}
        <button className="pixel-font w-full text-center pixel-btn transition-all duration-150" style={{ backgroundColor: '#e7f2eb', color: '#0f10f4', fontSize: 'clamp(16px, 5vw, 28px)', flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          PROFILE
        </button>
        
        <button className="pixel-font w-full text-center pixel-btn transition-all duration-150" style={{ backgroundColor: '#e7f2eb', color: '#0f10f4', fontSize: 'clamp(16px, 5vw, 28px)', flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          MINT
        </button>
        
        <button className="pixel-font w-full text-center pixel-btn transition-all duration-150" style={{ backgroundColor: '#e7f2eb', color: '#0f10f4', fontSize: 'clamp(16px, 5vw, 28px)', flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          LEADERBOARD
        </button>
      </div>
    </div>
  );
}
