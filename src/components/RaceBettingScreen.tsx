'use client';
import Image from 'next/image';

export const RaceBettingScreen = () => (
  <div className="w-full h-full flex items-center justify-center relative">
    <Image src="/ui/mainmenu.webp" alt="Background" fill priority className="object-cover" unoptimized />
    <div className="pixel-font text-white text-3xl z-10">RACE BETTING </div>
  </div>
);
