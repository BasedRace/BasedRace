'use client';

import Image from 'next/image';

export const StartScreen = ({ onSelectTournament, onSelectRaceBetting }: {
  onSelectTournament: () => void;
  onSelectRaceBetting: () => void;
}) => (
  <div className="w-full h-full relative">
    <Image src="/ui/mainmenu.webp" alt="Main Menu Background" fill priority className="object-cover" unoptimized />
    <div 
      className="pixel-border absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#e7f2eb] w-2/3 h-2/5 flex flex-col"
    >
      <button onClick={onSelectRaceBetting} className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">RACE BETTING</button>
      <button onClick={onSelectTournament} className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">TOURNAMENT</button>
    </div>
  </div>
);
