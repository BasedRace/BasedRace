'use client';

import Image from 'next/image';

export const StartScreen = ({ onSelectTournament, onSelectRaceBetting }: {
  onSelectTournament: () => void;
  onSelectRaceBetting: () => void;
}) => (
  <div className="w-full h-full relative overflow-y-auto custom-scrollbar">
    <div 
      className="min-h-full w-full flex flex-col items-center justify-center gap-6 p-10"
    >
      <button 
        onClick={onSelectRaceBetting} 
        className="pixel-font pixel-border w-full max-w-[320px] text-center pixel-btn transition-all active:translate-y-1 bg-[#e7f2eb] text-[#0f10f4] text-2xl py-10"
      >
        RACE BETTING
      </button>
      <button 
        onClick={onSelectTournament} 
        className="pixel-font pixel-border w-full max-w-[320px] text-center pixel-btn transition-all active:translate-y-1 bg-[#e7f2eb] text-[#0f10f4] text-2xl py-10"
      >
        TOURNAMENT
      </button>
    </div>
  </div>
);
