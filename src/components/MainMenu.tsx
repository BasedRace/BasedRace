'use client';

import Image from 'next/image';

export const MainMenu = ({ onStart, onProfile, onMint }: {
  onStart: () => void;
  onProfile: () => void;
  onMint: () => void;
}) => (
  <div className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-black">
    <Image src="/ui/mainmenu.webp" alt="Main Menu Background" fill priority className="object-cover" unoptimized />
    <div 
      className="pixel-border absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#e7f2eb] w-2/3 h-2/5 flex flex-col"
    >
      <button onClick={onStart} className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">START</button>
      <button onClick={onProfile} className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">PROFILE</button>
      <button onClick={onMint} className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">MINT</button>
      <button className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">LEADERBOARD</button>
    </div>
  </div>
);
