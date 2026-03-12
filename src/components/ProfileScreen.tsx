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
  const MAX_EXP = 1000;
  const currentExp = user?.exp ?? 0;
  const expPercentage = user?.exp ? (currentExp / MAX_EXP) * 100 : 0;

  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="pixel-font text-sm text-white">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center p-4 overflow-y-auto pb-32" style={{ imageRendering: 'pixelated' }}>
      {/* Header Section */}
      <div className="w-full flex flex-row items-center gap-4 mb-6">
        {/* Avatar */}
        <div className="relative w-20 h-20 border-4 border-[#99b1c5] flex-shrink-0 overflow-hidden pixel-border">
          <img src={user.pfpUrl} alt={user.displayName} className="absolute top-0 left-0 w-full h-full object-cover" />
        </div>
        {/* Info Stack */}
        <div className="flex flex-col items-start gap-1 overflow-hidden w-full">
          <div className="pixel-font text-lg leading-tight text-white truncate w-full">{user.displayName}</div>
          <div className="pixel-font text-xs leading-tight text-gray-400">FID: {user.fid}</div>
          {/* EXP Bar */}
          <div className="w-full h-6 bg-gray-800/80 border-2 border-[#233e63] mt-1 relative">
            <div className="bg-green-500 h-full" style={{ width: `${expPercentage}%` }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="pixel-font text-xs text-white font-bold">EXP: {currentExp}/{MAX_EXP}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="w-full grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#233e63]/80 p-3 flex flex-col items-center justify-center pixel-border">
          <span className="pixel-font text-xs text-gray-400 mb-1">Tier</span>
          <span className="pixel-font text-lg text-white">{user.tier || 'N/A'}</span>
        </div>
        <div className="bg-[#233e63]/80 p-3 flex flex-col items-center justify-center pixel-border">
          <span className="pixel-font text-xs text-gray-400 mb-1">Wins</span>
          <span className="pixel-font text-lg text-white">0</span>
        </div>
      </div>

      {/* Racer NFT Showcase */}
      <div className="w-full flex flex-col items-center">
        <h3 className="pixel-font text-lg text-white mb-2">Racer NFT</h3>
        <div className="w-full max-w-xs h-56 bg-black/50 pixel-border flex items-center justify-center">
          {nftImageUrl ? (
            <img src={nftImageUrl} alt="Racer NFT" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center">
              <p className="pixel-font text-gray-400">No Racer Detected</p>
              <a href="#" className="pixel-font text-green-500 hover:text-green-400 mt-2 inline-block">
                Mint Now
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
