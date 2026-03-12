'use client';

import Image from 'next/image';

export const StartScreen = ({ onSelectTournament, onSelectRaceBetting }: {
  onSelectTournament: () => void;
  onSelectRaceBetting: () => void;
}) => (
  <div className="w-full h-full relative overflow-y-auto custom-scrollbar">
    {/* Container dengan gap-10 untuk memberikan space antar tombol */}
    <div 
      className="min-h-full w-full flex flex-col items-center justify-center gap-10 p-10"
    >
      <button 
        onClick={onSelectRaceBetting} 
        
        className="pixel-font pixel-border w-[300px] h-[50px] text-center pixel-btn transition-all duration-300 bg-[#e7f2eb] text-[#0f10f4] text-base animate-bounce hover:animate-none active:translate-y-1 active:shadow-none shadow-lg shadow-[#8a6d00] flex items-center justify-center"
      >
        RACE BETTING
      </button>

      <button 
        onClick={onSelectTournament} 
        className="pixel-font pixel-border w-[300px] h-[50px] text-center pixel-btn transition-all duration-300 bg-[#e7f2eb] text-[#0f10f4] text-base animate-bounce hover:animate-none active:translate-y-1 active:shadow-none shadow-lg shadow-[#8a6d00] flex items-center justify-center"
      >
        TOURNAMENT
      </button>
    </div>
  </div>
);
