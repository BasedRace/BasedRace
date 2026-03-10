'use client';

import Image from 'next/image';

export const StartScreen = ({ onSelectTournament, onSelectRaceBetting }: {
  onSelectTournament: () => void;
  onSelectRaceBetting: () => void;
}) => (
  <div className="w-full h-full relative">
    <Image src="/ui/mainmenu.webp" alt="Main Menu Background" fill priority className="object-cover" unoptimized />
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 flex flex-col gap-12"
    >
      <button 
        onClick={onSelectRaceBetting} 
        className="pixel-font pixel-border w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-3xl py-12"
      >
        RACE BETTING
      </button>
      <button 
        onClick={onSelectTournament} 
        className="pixel-font pixel-border w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-3xl py-12"
      >
        TOURNAMENT
      </button>
    </div>
  </div>
);
