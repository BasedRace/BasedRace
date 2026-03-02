'use client';

import { useState } from 'react';

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
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full-screen background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/ui/mainmenu.webp)' }}
      />
      
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

      {/* Menu Box - Centered 800x1000 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="pixel-border p-8"
          style={{ 
            backgroundColor: '#e7f2eb',
            width: '800px',
            height: '1000px',
          }}
        >
          {/* Start Button - Primary */}
          <button
            onClick={handleStart}
            className="pixel-font w-full py-5 mb-6 text-center pixel-btn transition-all duration-150"
            style={{ 
              backgroundColor: '#e7f2eb',
              color: '#0f10f4',
              fontSize: '24px',
            }}
          >
            START
          </button>

          {/* Secondary Buttons */}
          <div className="space-y-4">
            <button className="pixel-font w-full py-4 pixel-btn transition-all duration-150" style={{ backgroundColor: '#e7f2eb', color: '#0f10f4', fontSize: '20px' }}>
              PROFILE
            </button>
            
            <button className="pixel-font w-full py-4 pixel-btn transition-all duration-150" style={{ backgroundColor: '#e7f2eb', color: '#0f10f4', fontSize: '20px' }}>
              MINT
            </button>
            
            <button className="pixel-font w-full py-4 pixel-btn transition-all duration-150" style={{ backgroundColor: '#e7f2eb', color: '#0f10f4', fontSize: '20px' }}>
              LEADERBOARD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
