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
  const is_minted = nftImageUrl !== null;

  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="pixel-font text-sm text-gray-400">Loading Profile...</div>
      </div>
    );
  }

  const expPercentage = Math.min(((user?.exp || 0) / 1000) * 100, 100);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="flex flex-col gap-4 p-4 bg-[#0a0d10] pixel-border w-full max-w-[350px]"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* 1. TOP ROW (Identity) */}
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

        {/* 2. SECOND ROW (Stats) */}
        <div className="flex flex-row items-center justify-start gap-4 w-full">
            <span className="pixel-font text-[10px] text-gray-400">Tier: <span className="text-white text-base">{user.tier || 'N/A'}</span></span>
            <span className="pixel-font text-base text-white">|</span>
            <span className="pixel-font text-[10px] text-gray-400">Wins: <span className="text-white text-base">0</span></span>
        </div>

        {/* 3. THIRD ROW (EXP Bar) */}
        <div className="w-full h-[10px] bg-gray-900 border border-[#233e63] relative">
          <div
            className="bg-yellow-500 h-full"
            style={{ width: `${expPercentage}%` }}
          ></div>
        </div>

        {/* 4. BOTTOM ROW (NFT / Mint Action) */}
        <div className="w-full flex flex-col items-center pt-2">
          {is_minted ? (
            <div className="w-full max-w-xs h-48 bg-black/20 pixel-border flex items-center justify-center">
              <img src={nftImageUrl} alt="Racer NFT" className="w-full h-full object-contain" />
            </div>
          ) : (
            <button
              onClick={onMint}
              className="w-full pixel-font text-lg text-black bg-yellow-500 hover:bg-yellow-600 pixel-border border-yellow-700 px-6 py-3"
              style={{ boxShadow: '0 4px 0 0 #a16207' }}
            >
              MINT PERSONAL RACER
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
