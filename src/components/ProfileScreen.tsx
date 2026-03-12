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
      <div className="pixel-font text-xl text-[#233e63] mb-5 text-center w-full">PROFILE</div>
      {user ? (
        <div className="flex flex-row items-center gap-4 w-full">
          {/* PFP container with border, acting as a frame */}
          <div
            className="w-20 h-20 rounded-full border-4 border-[#233e63] flex-shrink-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${user.pfpUrl})` }}
            role="img"
            aria-label={`${user.displayName}'s profile picture`}
          ></div>
          {/* Details container */}
          <div className="flex flex-col items-start gap-1 overflow-hidden">
            <div className="pixel-font text-sm leading-tight text-[#0f10f4] truncate w-full">{user.displayName || user.username}</div>
            <div className="pixel-font text-xs leading-tight text-[#233e63]">@{user.username}</div>
            <div className="pixel-font text-xs leading-tight text-[#99b1c5]">FID: {user.fid}</div>
            {user.walletAddress && <div className="pixel-font text-xs leading-tight text-[#99b1c5] truncate w-full">Wallet: {user.walletAddress}</div>}
          </div>
        </div>
      ) : (
        <div className="pixel-font text-sm text-[#233e63] flex-grow flex items-center justify-center">Loading...</div>
      )}
    </div>
  </div>
);
