'use client';

type UserProfile = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  walletAddress?: `0x${string}`;
  tier?: string;
  exp?: number;
  wins?: number;
} | null;

type ProfileScreenProps = {
  user: UserProfile;
  nftImageUrl: string | null;
  is_minted: boolean;
  onBack?: () => void;
  onMint: () => void;
  onShare: () => void;
};

export const ProfileScreen = ({ user, nftImageUrl, is_minted, onMint, onShare }: ProfileScreenProps) => {
  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="pixel-font text-sm text-gray-400">Loading Profile...</div>
      </div>
    );
  }

  const currentExp = user?.exp || 0;
  const expPercentage = Math.min((currentExp / 1000) * 100, 100);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="flex flex-col gap-4 p-4 bg-[#e7f2eb] border-4 border-[#233e63] w-full max-w-[350px]"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Row 1: PFP + Username & FID */}
        <div className="flex flex-row items-center gap-3 w-full pb-4 border-b-2 border-[#233e63]">
          <div
            className="flex-shrink-0 relative border-2 border-[#233e63] overflow-hidden"
            style={{ width: '50px', height: '50px' }}
          >
            <img src={user.pfpUrl} alt={user.displayName} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col items-start gap-1 overflow-hidden">
            <div className="pixel-font text-base leading-tight text-black truncate w-full">{user.displayName}</div>
            <div className="pixel-font text-xs leading-tight text-gray-600">FID: {user.fid}</div>
          </div>
        </div>

        {/* Row 2: Tier & Wins */}
        <div className="flex flex-row items-center justify-start gap-4 w-full">
          <span className="pixel-font text-sm text-gray-600">Tier: <span className="text-black text-base">{user.tier || 'N/A'}</span></span>
          <span className="pixel-font text-base text-black">|</span>
          <span className="pixel-font text-sm text-gray-600">Wins: <span className="text-black text-base">{user.wins || 0}</span></span>
        </div>

        {/* Row 3: Full-width EXP Bar + EXP text label underneath */}
        <div>
            <div className="w-full h-[10px] bg-gray-200 border border-[#233e63] relative">
            <div
                className="bg-yellow-500 h-full"
                style={{ 
                    width: `${expPercentage}%`,
                    boxShadow: 'inset rgb(245, 158, 11) 0px 0px 20px 20px'
                }}
            ></div>
            </div>
            <div className="pixel-font text-sm text-gray-600 pt-1">EXP: {currentExp} / 1000 XP</div>
        </div>

        {/* Row 4: The NFT Image (if minted) OR the Mint Button (if not minted) */}
        <div className="w-full flex flex-col items-center pt-2">
          {is_minted ? (
            <>
              <div className="w-full max-w-xs h-auto bg-white/20 border-2 border-[#233e63] flex items-center justify-center" style={{ height: '300px' }}>
                {nftImageUrl ? (
                  <img src={nftImageUrl} alt="Racer NFT" className="w-full h-full object-contain" />
                ) : (
                  <div className="pixel-font text-sm text-gray-600">Loading NFT...</div>
                )}
              </div>
              <button
                onClick={onShare}
                className="w-full pixel-font bg-[#233e63] text-white text-[20px] shadow-[0_4px_0_0_#233e63] active:translate-y-1 mt-4 py-2 hover:scale-105 transition-transform"
              >
                SHARE RACER
              </button>
            </>
          ) : (
            <button
              onClick={onMint}
              className="w-full pixel-font text-lg text-black bg-yellow-500 active:translate-y-1 px-6 py-3"
              style={{ boxShadow: '0 4px 0 0 #8a6d00' }}
            >
              MINT PERSONAL RACER
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
