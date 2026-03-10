'use client';

import Image from 'next/image';

interface LandingPageProps {
  onSelectMint: () => void;
  isMinted: boolean;
  nftImageUrl?: string | null;
}

export const LandingPage = ({ onSelectMint, isMinted, nftImageUrl }: LandingPageProps) => (
  <div className="flex-1 w-full relative flex flex-col items-center justify-center p-4">
    <div className="flex flex-col items-center gap-8 w-full max-w-md">
      
      {/* NFT Image Container */}
      <div className="w-64 h-64 relative pixel-border overflow-hidden bg-black/40">
        {isMinted && nftImageUrl ? (
          /* SHOW THE ACTUAL MINTED NFT IMAGE */
          <Image 
            src={nftImageUrl} 
            alt="Your Unique Based Racer NFT" 
            fill 
            className="object-contain p-2" 
            unoptimized 
          />
        ) : (
          /* SHOW DUMMY PLACEHOLDER */
          <Image 
            src="/ui/dummy.png" 
            alt="Personal Racer NFT Placeholder" 
            fill 
            className="object-contain p-4" 
            unoptimized 
          />
        )}
      </div>

      {/* Dynamic Action Button */}
      <button 
        onClick={onSelectMint}
        className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl py-8 shadow-[6px_6px_0px_#99b1c5] active:scale-95"
      >
        {isMinted ? "VIEW YOUR RACER" : "MINT PERSONAL RACER"}
      </button>

    </div>
  </div>
);
