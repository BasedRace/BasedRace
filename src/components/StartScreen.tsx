'use client';

import Image from 'next/image';

export const StartScreen = ({ onSelectTournament, onSelectRaceBetting }: {
  onSelectTournament: () => void;
  onSelectRaceBetting: () => void;
}) => (
  <div className="w-full h-full relative overflow-y-auto custom-scrollbar">
    <div 
      className="min-h-full w-full flex flex-col items-center justify-center gap-16 p-10"
    >
      <button 
        onClick={onSelectRaceBetting} 
        className="pixel-font pixel-border w-[98%] max-w-4xl text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-7xl py-48 sm:text-9xl sm:py-64 shrink-0"
      >
        RACE BETTING
      </button>
      <button 
        onClick={onSelectTournament} 
        className="pixel-font pixel-border w-[98%] max-w-4xl text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-7xl py-48 sm:text-9xl sm:py-64 shrink-0"
      >
        TOURNAMENT
      </button>
    </div>
  </div>
);
