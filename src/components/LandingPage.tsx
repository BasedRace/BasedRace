'use client';

import Image from 'next/image';

interface LandingPageProps {
  onSelectMint: () => void;
  isMinted: boolean;
  nftImageUrl?: string | null;
}

export const LandingPage = ({ onSelectMint, isMinted, nftImageUrl }: LandingPageProps) => (
  <div className="w-full h-full relative flex flex-col items-center justify-end p-6 pb-28">
    
    <div className="flex flex-col items-center gap-8 w-full max-w-[400px] relative z-30">
      
      {/* 1. BUTTON DINAMIS
          - text-[#0f10f4]: Warna biru ikonik dikembalikan untuk semua status.
      */}
      <button 
        onClick={onSelectMint}
        className={`pixel-font w-full max-w-[200px] text-center pixel-btn transition-all duration-150 
                   text-[#0f10f4] text-[10px] py-4 px-2 active:scale-95 active:translate-y-1 flex items-center justify-center min-h-[80px]
                   ${isMinted 
                     ? 'bg-[#8a63d2] shadow-[4px_4px_0px_#4b348b]' 
                     : 'bg-[#e7f2eb] shadow-[4px_4px_0px_#99b1c5]'
                   }`}
      >
        <span className="block uppercase tracking-tighter">
          {isMinted ? "🚀 SHARE RACER" : "MINT PERSONAL RACER"}
        </span>
      </button>

      {/* 2. IMAGE CONTAINER */}
      <div className="w-150 h-150 relative overflow-hidden flex items-center justify-center">
        {isMinted && nftImageUrl ? (
          <img 
            src={nftImageUrl} 
            alt="Your Unique Based Racer NFT" 
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              e.currentTarget.src = "/ui/dummy.png";
            }}
          />
        ) : (
          <img 
            src="/ui/dummy.png" 
            alt="Personal Racer NFT Placeholder" 
            className="w-full h-full object-contain p-2"
          />
        )}
      </div>

    </div>
  </div>
);
