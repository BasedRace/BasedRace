'use client';

import Image from 'next/image';

interface LandingPageProps {
  onSelectMint: () => void;
  isMinted: boolean;
  nftImageUrl?: string | null;
}

export const LandingPage = ({ onSelectMint, isMinted, nftImageUrl }: LandingPageProps) => (
  <div className="w-full h-full relative flex flex-col items-center justify-end p-6 pb-28">
    
    <div className="flex flex-col items-center gap-10 w-full max-w-[280px] relative z-30">
      
      {/* TOMBOL: 
          - max-w-[280px]: Membatasi lebar agar tombol tidak "molor" ke samping.
          - aspect-square atau py-16: Memberikan tinggi yang masif agar bentuknya kotak/tebal.
          - text-[12px]: Mengecilkan sedikit ukuran font agar teks bisa membungkus (wrap) jika perlu.
      */}
      <button 
        onClick={onSelectMint}
        className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] 
                   text-[12px] py-14 px-4 leading-normal shadow-[8px_8px_0px_#99b1c5] 
                   active:scale-95 active:translate-y-1 flex items-center justify-center min-h-[120px]"
      >
        <span className="block break-words">
          {isMinted ? "VIEW YOUR RACER" : "MINT PERSONAL RACER"}
        </span>
      </button>

      {/* IMAGE CONTAINER: 
          Tetap berukuran w-32 (128px) untuk NFT maupun Dummy.
      */}
      <div className="w-32 h-32 relative pixel-border bg-black/60 shadow-2xl overflow-hidden flex items-center justify-center">
        {isMinted && nftImageUrl ? (
          <Image 
            src={nftImageUrl} 
            alt="Your Unique Based Racer NFT" 
            fill 
            className="object-contain p-2" 
            unoptimized 
            priority
          />
        ) : (
          <img 
            src="/ui/dummy.png" 
            alt="Personal Racer NFT Placeholder" 
            className="w-full h-full object-contain p-4"
          />
        )}
      </div>

    </div>
  </div>
);
