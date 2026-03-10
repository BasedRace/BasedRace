'use client';

import Image from 'next/image';

interface LandingPageProps {
  onSelectMint: () => void;
  isMinted: boolean;
  nftImageUrl?: string | null;
}

export const LandingPage = ({ onSelectMint, isMinted, nftImageUrl }: LandingPageProps) => (
  <div className="w-full h-full relative flex flex-col items-center justify-end p-6 pb-24">
    
    <div className="flex flex-col items-center gap-6 w-full max-w-sm relative z-30">
      
      {/* BUTTON DI ATAS 
          - text-lg: Mengecilkan font sedikit agar muat dalam satu baris.
          - py-6: Padding yang lebih seimbang agar tidak gepeng.
          - leading-tight: Menjaga jarak antar baris jika teks terpaksa membungkus.
          - sm:text-xl: Ukuran teks kembali besar jika layar lebih lebar.
      */}
      <button 
        onClick={onSelectMint}
        className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] 
                   text-lg sm:text-xl py-6 px-4 leading-tight shadow-[6px_6px_0px_#99b1c5] 
                   active:scale-95 active:translate-y-1"
      >
        {isMinted ? "VIEW YOUR RACER" : "MINT PERSONAL RACER"}
      </button>

      {/* IMAGE DI BAWAH BUTTON */}
      <div className={`${isMinted ? 'w-56 h-56' : 'w-32 h-32'} relative pixel-border bg-black/60 shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-300`}>
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
