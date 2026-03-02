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
          src="/index.html" 
          className="w-full h-full border-0"
          title="Based Race Game"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      {/* Full-screen background image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/ui/mainmenu.webp"
          alt="Main Menu Background"
          fill
          priority
          className="object-cover"
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

      {/* Menu Box - Centered with flexbox */}
      <div 
        className="pixel-border p-6 relative z-10"
        style={{ 
          backgroundColor: '#e7f2eb',
          width: '66%',
          height: '80%',
        }}
      >
        {/* Start Button - Primary */}
        <button
          onClick={handleStart}
          className="pixel-font w-full py-4 mb-4 text-center pixel-btn transition-all duration-150"
          style={{ 
            backgroundColor: '#e7f2eb',
            color: '#0f10f4',
            fontSize: '16px',
          }}
        >
          START
        </button>

        {/* Secondary Buttons */}
        <div className="space-y-3">
          <button className="pixel-font w-full py-3 pixel-btn transition-all duration-150" style={{ backgroundColor: '#e7f2eb', color: '#0f10f4', fontSize: '12px' }}>
            PROFILE
          </button>
          
          <button className="pixel-font w-full py-3 pixel-btn transition-all duration-150" style={{ backgroundColor: '#e7f2eb', color: '#0f10f4', fontSize: '12px' }}>
            MINT
          </button>
          
          <button className="pixel-font w-full py-3 pixel-btn transition-all duration-150" style={{ backgroundColor: '#e7f2eb', color: '#0f10f4', fontSize: '12px' }}>
            LEADERBOARD
          </button>
        </div>
      </div>
    </div>
  );
}
