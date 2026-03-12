'use client';

import Image from 'next/image';

export const StartScreen = ({ onSelectTournament, onSelectRaceBetting }: {
  onSelectTournament: () => void;
  onSelectRaceBetting: () => void;
}) => (
  <div className="w-full h-full relative overflow-y-auto custom-scrollbar">
    <div 
      className="min-h-full w-full flex flex-col items-center justify-center gap-8 p-10"
    >
      <button 
        onClick={onSelectRaceBetting} 
        className="pixel-font pixel-border w-full max-w-sm text-center pixel-btn transition-all duration-300 bg-[#e7f2eb] text-[#0f10f4] text-2xl py-12 animate-bounce hover:animate-none active:translate-y-1 active:shadow-none shadow-lg shadow-[#8a6d00]"
      >
        RACE BETTING
      </button>
      <button 
        onClick={onSelectTournament} 
        className="pixel-font pixel-border w-full max-w-sm text-center pixel-btn transition-all duration-300 bg-[#e7f2eb] text-[#0f10f4] text-2xl py-12 animate-bounce hover:animate-none active:translate-y-1 active:shadow-none shadow-lg shadow-[#8a6d00]"
      >
        TOURNAMENT
      </button>
    </div>
  </div>
);
