'use client';

import Image from 'next/image';

export const MainMenu = ({ onEnter }: { onEnter: () => void }) => (
  <div className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-black flex flex-col items-center justify-center">
    <Image src="/ui/mainmenu.webp" alt="Main Menu Background" fill priority className="object-cover" unoptimized />
    
    <div className="relative z-10 flex flex-col items-center">
      <div className="w-64 mb-8">
        <Image src="/ui/mascot.webp" alt="Based Racer Mascot" width={256} height={256} className="object-contain" unoptimized />
      </div>
      
      <button 
        onClick={onEnter} 
        className="pixel-font pixel-btn bg-[#e7f2eb] text-[#0f10f4] text-3xl px-12 py-6 animate-pulse"
      >
        PRESS START
      </button>
    </div>

    <div className="absolute bottom-10 w-full text-center z-10">
      <p className="pixel-font text-white text-xs opacity-70">© 2026 BASED RACE</p>
    </div>
  </div>
);
