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
      {/* Full-screen background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/ui/mainmenu.webp)' }}
      />
      
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Menu Box - Centered */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black text-center text-white mb-8 tracking-wider drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(147, 51, 234, 0.8)' }}>
            BASED RACE
          </h1>
          
          {/* Menu Box */}
          <div className="bg-black/70 border-2 border-purple-500 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
            {/* Start Button - Primary */}
            <button
              onClick={handleStart}
              className="w-full py-4 md:py-5 mb-4 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold text-xl md:text-2xl rounded-xl transition-all duration-150 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/50 active:translate-y-1 active:shadow-none"
              style={{ 
                boxShadow: '0 6px 0 #581c87, 0 0 20px rgba(147, 51, 234, 0.5)' 
              }}
            >
              START
            </button>

            {/* Secondary Buttons */}
            <div className="space-y-3">
              <button className="w-full py-3 md:py-4 bg-transparent border-2 border-purple-400 hover:bg-purple-600/30 hover:border-purple-300 text-white font-semibold text-lg md:text-xl rounded-xl transition-all duration-150 active:scale-95">
                Profile
              </button>
              
              <button className="w-full py-3 md:py-4 bg-transparent border-2 border-purple-400 hover:bg-purple-600/30 hover:border-purple-300 text-white font-semibold text-lg md:text-xl rounded-xl transition-all duration-150 active:scale-95">
                Mint
              </button>
              
              <button className="w-full py-3 md:py-4 bg-transparent border-2 border-purple-400 hover:bg-purple-600/30 hover:border-purple-300 text-white font-semibold text-lg md:text-xl rounded-xl transition-all duration-150 active:scale-95">
                Leaderboard
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white/50 text-sm mt-6">
            Tap to Race • Win Rewards
          </p>
        </div>
      </div>
    </div>
  );
}
