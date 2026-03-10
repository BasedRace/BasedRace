'use client';

import React from 'react';

interface StartScreenProps {
  onSelectTournament: () => void;
  onSelectRaceBetting: () => void;
}

export const StartScreen = ({ onSelectTournament, onSelectRaceBetting }: StartScreenProps) => {
  return (
    /**
     * MAIN CONTAINER
     * h-[100dvh]: Fits the dynamic height of mobile/Farcaster frames.
     * overflow-y-auto: Allows scrolling if buttons exceed screen height.
     */
    <div className="w-full h-[100dvh] relative overflow-y-auto bg-black flex flex-col custom-scrollbar">
      <div 
        className="w-full flex-1 flex flex-col items-center justify-start gap-12 p-6 pt-16 pb-44"
      >
        {/* HEADER SECTION */}
        <div className="mb-8 text-center">
          <h2 className="pixel-font text-[#99b1c5] text-3xl tracking-[0.2em] animate-pulse">
            SELECT MODE
          </h2>
        </div>

        {/* BUTTON: RACE BETTING
            !py-48: Forces massive vertical padding for huge button height.
            !text-7xl: Forces giant font size for mobile.
            sm:!text-9xl: Even larger font size for bigger screens.
            shadow: Pixelated box-shadow effect using your custom color.
        */}
        <button 
          onClick={onSelectRaceBetting} 
          className="pixel-font pixel-border w-full max-w-5xl transition-all duration-150 active:scale-95 bg-[#e7f2eb] text-[#0f10f4] 
                     flex items-center justify-center shrink-0 
                     shadow-[12px_12px_0px_#99b1c5]
                     !text-6xl !py-40
                     sm:!text-9xl sm:!py-60"
        >
          RACE BETTING
        </button>

        {/* BUTTON: TOURNAMENT */}
        <button 
          onClick={onSelectTournament} 
          className="pixel-font pixel-border w-full max-w-5xl transition-all duration-150 active:scale-95 bg-[#e7f2eb] text-[#0f10f4] 
                     flex items-center justify-center shrink-0 
                     shadow-[12px_12px_0px_#99b1c5]
                     !text-6xl !py-40 
                     sm:!text-9xl sm:!py-60"
        >
          TOURNAMENT
        </button>

        {/* DECORATIVE FOOTER */}
        <div className="mt-12 text-center opacity-30">
          <p className="pixel-font text-white text-[14px] tracking-widest">
            BASED RACE v0.1.0 // OPEN BETA
          </p>
        </div>
      </div>
    </div>
  );
};
