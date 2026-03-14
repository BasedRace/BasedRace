'use client';

import Image from 'next/image';

interface LandingPageProps {
  onAction: () => void;
  isMinted: boolean;
  nftImageUrl?: string | null;
}

export const LandingPage = ({ onAction, isMinted, nftImageUrl }: LandingPageProps) => (
  <div className="w-full h-full relative flex flex-col items-center justify-end p-6 pb-24">
    <div className="flex flex-col items-center gap-8 w-full max-w-[400px] relative z-30">
      
      <div className="flex justify-between w-full max-w-[320px] items-end">
        <button 
          onClick={onAction}
          className="pixel-font w-full max-w-[150px] text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] 
                     text-[10px] py-3 px-2 shadow-[4px_4px_0px_#99b1c5] 
                     active:scale-95 active:translate-y-1 flex items-center justify-center min-h-[60px]"
        >
          <span className="block uppercase tracking-tighter">
            {isMinted ? "SHARE RACER" : "MINT PERSONAL RACER"}
          </span>
        </button>

        <div className="relative">
          <Image 
            src="/ui/mascot.webp" 
            alt="Mascot" 
            width={48} 
            height={48} 
            className="absolute -top-8 right-0 z-10"
          />
          <button 
            className="pixel-font w-full max-w-[150px] text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] 
                       text-[10px] py-3 px-2 shadow-[4px_4px_0px_#99b1c5] 
                       active:scale-95 active:translate-y-1 flex items-center justify-center min-h-[60px]"
          >
            <span className="block uppercase tracking-tighter">
              CLAIM $RACE
            </span>
          </button>
        </div>
      </div>

      {/* 2. IMAGE CONTAINER: 
          Menampilkan NFT user jika isMinted true, jika tidak tampilkan dummy.
      */}
      <div className="w-150 h-150 relative overflow-hidden flex items-center justify-center">
        {isMinted && nftImageUrl ? (
          <img 
            src={nftImageUrl} 
            alt="Your Unique Based Racer NFT" 
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              // Pengaman jika API gambar gagal memuat, tampilkan kembali dummy
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
