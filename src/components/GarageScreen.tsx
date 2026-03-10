'use client';
import Image from 'next/image';

export const GarageScreen = () => (
  <div className="w-full h-full flex flex-col items-center justify-center relative p-4">
    <div className="w-64 mb-8 relative z-10">
      <Image src="/ui/mascot.webp" alt="Based Racer Mascot" width={256} height={256} className="object-contain" unoptimized />
    </div>
    <div className="pixel-border bg-[#e7f2eb] p-4 z-10">
      <div className="pixel-font text-black text-sm text-center">TUNE YOUR RACER HERE (SOON)</div>
    </div>
  </div>
);
