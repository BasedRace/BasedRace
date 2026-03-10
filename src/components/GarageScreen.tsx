'use client';
import Image from 'next/image';

export const GarageScreen = () => (
  <div className="w-full h-full flex flex-col items-center justify-center relative p-4">
    <div className="w-64 mb-8 relative z-10">
      <Image src="/ui/mascot.webp" alt="Based Racer Mascot" width={256} height={256} className="object-contain" unoptimized />
    </div>
    <div className="pixel-font text-white text-3xl z-10">GARAGE</div>
    <div className="pixel-font text-[#99b1c5] text-sm mt-4 z-10 text-center">TUNE YOUR RACER HERE</div>
  </div>
);
