'use client';

import Image from 'next/image';

interface LandingPageProps {
  onSelectMint: () => void;
  isMinted: boolean;
  nftImageUrl?: string | null;
}

export const LandingPage = ({ onSelectMint, isMinted, nftImageUrl }: LandingPageProps) => (
  /* Menggunakan justify-center dengan sedikit offset negatif 
     untuk menaikkan posisi konten agar tidak terlalu mepet ke bawah.
  */
  <div className="w-full h-full relative flex flex-col items-center justify-center p-6 pb-20">
    
    <div className="flex flex-col items-center gap-10 w-full max-w-md z-20 -mt-20">
      
      {/* NFT Image Container:
          Menambahkan z-30 dan relative agar gambar dipaksa muncul di atas background page.tsx
      */}
      <div className="w-64 h-64 relative pixel-border overflow-hidden bg-black/60 shadow-2xl z-30">
        {isMinted && nftImageUrl ? (
          <Image 
            src={nftImageUrl} 
            alt="Your Unique Based Racer NFT" 
            fill 
            className="object-contain p-2 z-40" 
            unoptimized 
            priority
          />
        ) : (
          <Image 
            src="/ui/dummy.png" 
            alt="Personal Racer NFT Placeholder" 
            fill 
            className="object-contain p-4 z-40" 
            unoptimized 
            priority
          />
        )}
      </div>

      {/* Dynamic Action Button */}
      <button 
        onClick={onSelectMint}
        className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-xl py-8 shadow-[6px_6px_0px_#99b1c5] active:scale-95 active:translate-y-1 z-30"
      >
        {isMinted ? "VIEW YOUR RACER" : "MINT PERSONAL RACER"}
      </button>

    </div>
  </div>
);
