'use client';

import Image from 'next/image';

type UserProfile = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  walletAddress?: `0x${string}`;
} | null;

export const ProfileScreen = ({ user, onBack }: { user: UserProfile, onBack: () => void }) => (
  <div className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-black">
    <Image src="/ui/mainmenu.webp" alt="Profile Background" fill className="object-cover" unoptimized />
    <div 
      className="pixel-border absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#e7f2eb] w-2/3 h-1/2 flex flex-col items-center p-5"
    >
      <div className="pixel-font text-xl text-[#233e63] mb-5">PROFILE</div>
      {user ? (
        <div className="flex flex-col items-center gap-4 flex-grow justify-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#233e63]">
            <img src={user.pfpUrl} alt={user.displayName} className="w-full h-full object-cover" />
          </div>
          <div className="pixel-font text-sm text-[#0f10f4] text-center">{user.displayName || user.username}</div>
          <div className="pixel-font text-xs text-[#233e63]">@{user.username}</div>
          <div className="pixel-font text-xs text-[#99b1c5]">FID: {user.fid}</div>
        </div>
      ) : (
        <div className="pixel-font text-sm text-[#233e63] flex-grow flex items-center justify-center">Loading...</div>
      )}
      <button
        onClick={onBack}
        className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-sm p-2.5 mt-auto"
      >
        BACK TO MENU
      </button>
    </div>
  </div>
);
