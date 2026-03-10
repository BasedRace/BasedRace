'use client';

import Image from 'next/image';

interface LandingPageProps {
  onSelectMint: () => void;
  isMinted: boolean;
  nftImageUrl?: string | null;
}

export const LandingPage = ({ onSelectMint, isMinted, nftImageUrl }: LandingPageProps) => (
  /* Changed h-full to ensure it occupies the available space in page.tsx 
     and added pb-20 to push the button/image up so they aren't behind a navbar.
  */
  <div className="w-full h-full relative flex flex-col items-center justify-end p-6 pb-24 sm:pb-32">
    
    <div className="flex flex-col items-center gap-10 w-full max-w-md z-20">
      
      {/* NFT Image Container 
          Ensuring explicit height/width with relative positioning so 'fill' images 
          actually render in the correct spot.
      */}
      <div className="w-64 h-64 sm:w-80 sm:h-80 relative pixel-border overflow-hidden bg-black/40 shadow-2xl">
        {isMinted && nftImageUrl ? (
          /* SHOW THE ACTUAL MINTED NFT IMAGE */
          <Image 
            src={nftImageUrl} 
            alt="Your Unique Based Racer NFT" 
            fill 
            className="object-contain p-2" 
            unoptimized 
            priority
          />
        ) : (
          /* SHOW DUMMY PLACEHOLDER */
          <Image 
            src="/ui/dummy.png" 
            alt="Personal Racer NFT Placeholder" 
            fill 
            className="object-contain p-4" 
            unoptimized 
            priority
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
