'use client';

// Note: This component now renders its content on a transparent background
// to overlay on top of the main application background.

type UserProfile = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  walletAddress?: `0x${string}`;
} | null;

export const ProfileScreen = ({ user }: { user: UserProfile; onBack?: () => void }) => (
  <div className="w-full h-full flex items-center justify-center relative">
    <div className="pixel-border bg-[#e7f2eb] w-11/12 max-w-sm h-3/4 flex flex-col p-5 relative">
      <div className="pixel-font text-xl text-[#233e63] text-center w-full">PROFILE</div>
      <div className="w-full h-px bg-[#99b1c5] my-4"></div>
      {user ? (
        <>
          <div className="flex flex-row items-center gap-4 w-full">
            {/* PFP container with precise styling */}
            <div className="relative w-[68px] h-[68px] border-4 border-[#233e63] flex-shrink-0 overflow-hidden">
              <img src={user.pfpUrl} alt={user.displayName} className="absolute top-0 left-0 w-full h-full object-cover" />
            </div>
            {/* Details container with smaller text */}
            <div className="flex flex-col items-start gap-0.5 overflow-hidden">
              <div className="pixel-font text-xs leading-tight text-[#0f10f4] truncate w-full">{user.displayName || user.username}</div>
              <div className="pixel-font text-[10px] leading-tight text-[#233e63]">@{user.username}</div>
              <div className="pixel-font text-[10px] leading-tight text-[#99b1c5]">FID: {user.fid}</div>
              {user.walletAddress && <div className="pixel-font text-[10px] leading-tight text-[#99b1c5] truncate w-full">Wallet: {user.walletAddress}</div>}
            </div>
          </div>
          <div className="w-full h-px bg-[#99b1c5] my-4"></div>
        </>
      ) : (
        <div className="pixel-font text-sm text-[#233e63] flex-grow flex items-center justify-center">Loading...</div>
      )}
    </div>
  </div>
);
