'use client';

import Image from 'next/image';

interface LandingPageProps {
  onSelectMint: () => void;
  isMinted: boolean;
  nftImageUrl?: string | null;
}

export const LandingPage = ({ onSelectMint, isMinted, nftImageUrl }: LandingPageProps) => (
  /* -translate-y-4 memberikan sedikit kenaikan dari tengah murni agar 
     posisinya lebih turun dibanding sebelumnya yang menggunakan translate-y-12
  */
  <div className="w-full h-full relative flex flex-col items-center justify-center p-6 -translate-y-4">
    
    <div className="flex flex-col items-center gap-8 w-full max-w-md relative z-30">
      
      {/* NFT Image Container 
          - Ukuran diperkecil menjadi w-48 h-48 (192px)
      */}
      <div className="w-48 h-48 relative pixel-border bg-black/60 shadow-2xl overflow-hidden flex items-center justify-center">
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
          /* Menggunakan img standar untuk memastikan render maksimal */
          <img 
            src="/ui/dummy.png" 
            alt="Personal Racer NFT Placeholder" 
            className="w-full h-full object-contain p-6"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/192?text=NO+IMAGE";
            }}
          />
        )}
      </div>

      {/* Dynamic Action Button */}
      <button 
        onClick={onSelectMint}
        className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-xl py-8 shadow-[6px_6px_0px_#99b1c5] active:scale-95 active:translate-y-1"
      >
        {isMinted ? "VIEW YOUR RACER" : "MINT PERSONAL RACER"}
      </button>

    </div>
  </div>
);
