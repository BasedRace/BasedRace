'use client';

import Image from 'next/image';

interface LandingPageProps {
  onSelectMint: () => void;
  isMinted: boolean;
  nftImageUrl?: string | null;
}

export const LandingPage = ({ onSelectMint, isMinted, nftImageUrl }: LandingPageProps) => (
  <div className="w-full h-full relative flex flex-col items-center justify-end p-6 pb-28">
    
    <div className="flex flex-col items-center gap-8 w-full max-w-[240px] relative z-30">
      
      {/* 1. BUTTON: Sekarang lebih kecil dan proporsional 
          - py-4: Mengurangi tinggi tombol agar tidak terlalu besar.
          - text-[10px]: Mengecilkan font agar pas dengan tombol yang lebih kecil.
          - max-w-[200px]: Membatasi lebar tombol.
      */}
      <button 
        onClick={onSelectMint}
        className="pixel-font w-full max-w-[300px] text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] 
                   text-[10px] py-4 px-2 shadow-[4px记录_4px_0px_#99b1c5] 
                   active:scale-95 active:translate-y-1 flex items-center justify-center min-h-[50px]"
      >
        <span className="block uppercase tracking-tighter">
          {isMinted ? "VIEW YOUR RACER" : "MINT PERSONAL RACER"}
        </span>
      </button>

      {/* 2. IMAGE CONTAINER: 
          - w-48 h-48: Kembali ke ukuran sebelumnya (lebih besar).
          - Tanpa 'pixel-border' dan 'bg-black': Sekarang bersih tanpa kotak.
      */}
      <div className="w-70 h-70 relative overflow-hidden flex items-center justify-center">
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
            className="w-full h-full object-contain p-2"
          />
        )}
      </div>

    </div>
  </div>
);
