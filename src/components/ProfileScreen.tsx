'use client';

type UserProfile = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  walletAddress?: `0x${string}`;
  tier?: string;
  exp?: number;
} | null;

type ProfileScreenProps = {
  user: UserProfile;
  nftImageUrl: string | null;
  onBack?: () => void;
};

export const ProfileScreen = ({ user, nftImageUrl }: ProfileScreenProps) => {
  const maxExp = 1000;
  const currentExp = user?.exp ?? 0;
  const percentage = user?.exp ? (currentExp / maxExp) * 100 : 0;

  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="pixel-font text-sm text-gray-400">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div 
        className="pixel-border bg-[#e7f2eb] w-11/12 max-w-sm h-auto max-h-[90%] flex flex-col p-4 relative overflow-y-auto"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Header */}
        <div className="w-full flex flex-row items-center gap-4 pb-4 border-b-2 border-[#99b1c5]">
          <div className="relative w-16 h-16 border-4 border-[#233e63] flex-shrink-0 overflow-hidden">
            <img src={user.pfpUrl} alt={user.displayName} className="absolute top-0 left-0 w-full h-full object-cover" />
          </div>
          <div className="flex flex-col items-start gap-1 overflow-hidden w-full">
            <div className="pixel-font text-base leading-tight text-[#0f10f4] truncate w-full">{user.displayName}</div>
            <div className="pixel-font text-xs leading-tight text-gray-600">FID: {user.fid}</div>
            <div className="w-full bg-gray-900 pixel-border mt-2">
              <div className="bg-green-500 h-4" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="w-full py-4 border-b-2 border-[#99b1c5]">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <span className="pixel-font text-[10px] text-gray-500">Tier</span>
              <span className="pixel-font text-base text-[#233e63]">{user.tier || 'N/A'}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="pixel-font text-[10px] text-gray-500">Wins</span>
              <span className="pixel-font text-base text-[#233e63]">0</span>
            </div>
          </div>
        </div>

        {/* NFT Showcase */}
        <div className="w-full flex flex-col items-center pt-4">
          <div className="w-full max-w-xs h-48 bg-black/20 pixel-border flex items-center justify-center">
            {nftImageUrl ? (
              <img src={nftImageUrl} alt="Racer NFT" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center">
                <p className="pixel-font text-gray-600">No Racer Detected</p>
                <a href="#" className="pixel-font text-[#0f10f4] hover:underline mt-1 inline-block">
                  Mint Now
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
