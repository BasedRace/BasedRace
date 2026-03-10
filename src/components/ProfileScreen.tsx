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
    <div 
      className="pixel-border bg-[#e7f2eb] w-2/3 h-1/2 flex flex-col items-center p-5 relative"
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
    </div>
  </div>
);
