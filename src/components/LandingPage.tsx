'use client';

import Image from 'next/image';

interface LandingPageProps {
  onSelectMint: () => void;
  isMinted: boolean;
  nftImageUrl?: string | null;
}

export const LandingPage = ({ onSelectMint, isMinted, nftImageUrl }: LandingPageProps) => (
  /* - justify-end: Memastikan konten berada di bagian bawah container.
     - pb-24: Memberikan jarak yang pas agar tidak tertutup NavBar.
  */
  <div className="w-full h-full relative flex flex-col items-center justify-end p-6 pb-24">
    
    <div className="flex flex-col items-center gap-6 w-full max-w-md relative z-30">
      
      {/* Container Gambar: 
          - Ukuran diperkecil lagi ke w-40 (160px) agar lebih mungil.
          - Ditambahkan shadow dan border yang lebih halus.
      */}
      <div className={`${isMinted ? 'w-56 h-56' : 'w-40 h-40'} relative pixel-border bg-black/60 shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-300`}>
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
            className="w-full h-full object-contain p-6"
            onError={(e) => {
              e.currentTarget.style.display = 'none'; // Sembunyikan jika file benar-benar tidak ada
            }}
          />
        )}
      </div>

      {/* Button: Mengurangi padding (py-6) agar tidak terlalu memakan ruang */}
      <button 
        onClick={onSelectMint}
        className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-xl py-6 shadow-[6px_6px_0px_#99b1c5] active:scale-95 active:translate-y-1"
      >
        {isMinted ? "VIEW YOUR RACER" : "MINT PERSONAL RACER"}
      </button>

    </div>
  </div>
);
