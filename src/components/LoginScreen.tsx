'use client';

import Image from 'next/image';

export const LoginScreen = ({ onLogin }: { onLogin: () => void }) => (
  <div className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-black">
    <Image src="/ui/login.webp" alt="Login Background" fill className="object-cover" unoptimized />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
      <div className="w-52 relative">
        <Image src="/ui/mascot.webp" alt="Mascot" width={200} height={200} className="object-contain w-full h-auto" unoptimized />
      </div>
      <button
        onClick={onLogin}
        className="pixel-font pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl px-10 py-4"
      >
        LOGIN
      </button>
    </div>
  </div>
);
