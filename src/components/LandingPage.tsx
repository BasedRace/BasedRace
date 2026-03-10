'use client';

import Image from 'next/image';

interface LandingPageProps {
  onSelectMint: () => void;
  isMinted: boolean;
  nftImageUrl?: string | null;
}

export const LandingPage = ({ onSelectMint, isMinted, nftImageUrl }: LandingPageProps) => (
  /* - justify-center: Menempatkan di tengah.
     - -translate-y-12: Menaikkan posisi sedikit ke atas (sekitar 48px).
  */
  <div className="w-full h-full relative flex flex-col items-center justify-center p-6 -translate-y-12">
    
    <div className="flex flex-col items-center gap-10 w-full max-w-md relative z-30">
      
      {/* NFT Image Container 
          Ditambahkan border solid untuk memastikan box terlihat. 
      */}
      <div className="w-64 h-64 relative pixel-border bg-black/60 shadow-2xl overflow-hidden flex items-center justify-center">
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
          /* Menggunakan tag img standar sebagai fallback jika Next Image fill bermasalah */
          <img 
            src="/ui/dummy.png" 
            alt="Personal Racer NFT Placeholder" 
            className="w-full h-full object-contain p-4 transition-opacity duration-500"
            onError={(e) => {
              console.error("Image failed to load");
              e.currentTarget.src = "https://via.placeholder.com/256?text=NO+IMAGE"; // Fallback visual jika file hilang
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
