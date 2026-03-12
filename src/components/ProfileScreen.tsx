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
  onMint: () => void;
};

export const ProfileScreen = ({ user, nftImageUrl, onMint }: ProfileScreenProps) => {
  const maxExp = 1000;
  const currentExp = user?.exp ?? 0;
  const percentage = user?.exp ? (currentExp / maxExp) * 100 : 0;
  const is_minted = nftImageUrl !== null;

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
        className="flex flex-col p-4 bg-black/60 pixel-border w-full h-auto max-h-[90%] overflow-y-auto"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Identity Row */}
        <div className="flex flex-row items-center gap-3 w-full">
          <div 
            className="flex-shrink-0 relative border-2 border-[#233e63] overflow-hidden"
            style={{ width: '50px', height: '50px' }}
          >
            <img src={user.pfpUrl} alt={user.displayName} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col items-start gap-1 overflow-hidden">
            <div className="pixel-font text-base leading-tight text-white truncate w-full">{user.displayName}</div>
            <div className="pixel-font text-xs leading-tight text-gray-400">FID: {user.fid}</div>
          </div>
        </div>

        {/* EXP Bar */}
        <div className="h-5 bg-gray-900 border-2 border-[#233e63] mt-3 relative w-full">
          <div 
            className="bg-yellow-500 h-full"
            style={{ width: `${percentage}%`, boxShadow: '0 0 10px #f59e0b' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="pixel-font text-white text-[8px]">{currentExp} / {maxExp}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="w-full py-4 border-t-2 border-[#233e63] mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <span className="pixel-font text-[10px] text-gray-400">Tier</span>
              <span className="pixel-font text-base text-white">{user.tier || 'N/A'}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="pixel-font text-[10px] text-gray-400">Wins</span>
              <span className="pixel-font text-base text-white">0</span>
            </div>
          </div>
        </div>

        {/* NFT Showcase */}
        <div className="w-full flex flex-col items-center pt-4">
          {is_minted ? (
            <div className="w-full max-w-xs h-48 bg-black/20 pixel-border flex items-center justify-center">
              <img src={nftImageUrl} alt="Racer NFT" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
                <button 
                    onClick={onMint}
                    className="pixel-font text-lg text-white bg-yellow-500 hover:bg-yellow-600 pixel-border px-6 py-3"
                >
                    MINT PERSONAL RACER
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
