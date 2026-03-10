'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { sdk } from '@farcaster/miniapp-sdk';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import BasedRaceNFTABI from '../src/lib/BasedRaceNFTABI.json';

const CONTRACT_ADDRESS: `0x${string}` = '0x18B2Ae4A7eDB05ECf19b5a9f07a814e150b8c6a0';
const MINT_FEE = parseEther('0.001');

type GameState = 'login' | 'menu' | 'profile' | 'playing' | 'minting';
type UserProfile = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  walletAddress?: `0x${string}`;
} | null;

// Minting Preview Component
const MintingPreview = ({ user, onBack, onMint, setGeneratedMetadataUrl, generatedMetadataUrl, isMinted }: {
  user: UserProfile,
  onBack: () => void,
  onMint: (metadataUrl: string, fid: number) => void,
  setGeneratedMetadataUrl: (url: string | null) => void,
  generatedMetadataUrl: string | null,
  isMinted: boolean,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const generateAndSetRacer = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/generate-racer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fid: user!.fid,
            username: user!.username,
            pfpUrl: user!.pfpUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate racer image.');
        }

        const data = await response.json();
        setGeneratedImageUrl(data.imageUrl);
        setGeneratedMetadataUrl(data.metadataUrl); // Set metadata URL from API response
      } catch (err) {
        setError((err as Error).message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      generateAndSetRacer();
    }
  }, [user, setGeneratedMetadataUrl]); // Added setGeneratedMetadataUrl to dependencies

  const renderContent = () => {
    if (!user) {
      return <div className="pixel-font text-lg text-[#233e63]">Loading User...</div>;
    }
    if (isLoading) {
      return <div className="pixel-font text-lg text-[#233e63]">Generating...</div>;
    }
    if (error) {
      return <div className="pixel-font text-sm text-red-500 text-center">Error: {error}</div>;
    }
    if (generatedImageUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center p-2" style={{ borderRadius: '8px' }}>
          <img 
            src={generatedImageUrl} 
            alt="Your generated racer" 
            className="object-contain"
            style={{ imageRendering: 'pixelated', width: '100%', height: '100%' }} 
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="pixel-border flex flex-col items-center justify-between p-5"
      style={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#e7f2eb',
        width: '66%',
        height: '55%',
      }}
    >
      {/* Responsive container */}
      <div className="w-[90%] max-w-[500px] flex flex-col items-center justify-between h-full">
        <div className="pixel-font text-[#233e63] text-xl mb-4 text-center">YOUR RACER</div>
        
        <div className="flex-grow flex items-center justify-center w-full">
          {renderContent()}
        </div>

        {/* Metadata */}
        <div className="text-center mt-4 mb-6">
          <div className="pixel-font text-[#0f10f4] text-lg">@{user?.username || '...'}</div>
          <div className="pixel-font text-[#233e63] text-sm mt-1">FID: {user?.fid || '...'}</div>
        </div>

        {/* Button Group */}
        <div className="w-full mt-auto pt-4">
          <button
            onClick={() => onMint(generatedMetadataUrl!, user!.fid)} // Pass metadataUrl and fid to onMint
            disabled={isLoading || !!error || !generatedImageUrl || !generatedMetadataUrl}
            className="pixel-font w-full text-center pixel-btn transition-all duration-150 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#e7f2eb',
              color: '#0f10f4',
              fontSize: 'clamp(14px, 4vw, 18px)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            MINT PERSONAL RACER
          </button>

          <button
            onClick={onBack}
            className="pixel-font w-full text-center pixel-btn transition-all duration-150 py-3 mt-4"
            style={{
              backgroundColor: '#e7f2eb',
              color: '#0f10f4',
              fontSize: 'clamp(15px, 4vw, 18px)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            BACK
          </button>
        </div>
      </div>
    </div>
  );
};


export default function Home() {
  const [gameState, setGameState] = useState<GameState>('login');
  const [user, setUser] = useState<UserProfile>(null);
  const [generatedMetadataUrl, setGeneratedMetadataUrl] = useState<string | null>(null);
  const [isMinted, setIsMinted] = useState<boolean>(false); // New state for minting status

  const { address: connectedWalletAddress, isConnected } = useAccount(); // Get connected wallet address

  useEffect(() => {
    const initSDKAndFetchMintStatus = async () => {
      try {
        await sdk.actions.ready();
        const context = await sdk.context;

        if (context && context.user) {
          const currentUserProfile: UserProfile = {
            fid: context.user.fid,
            username: context.user.username || '',
            displayName: context.user.displayName || '',
            pfpUrl: context.user.pfpUrl || '',
            walletAddress: connectedWalletAddress, // Use connectedWalletAddress from useAccount()
          };
          setUser(currentUserProfile);
          
          // Fetch minting status from backend
          if (currentUserProfile.fid) {
            const response = await fetch(`/api/racer/status?fid=${currentUserProfile.fid}`);
            if (response.ok) {
              const data = await response.json();
              setIsMinted(data.isMinted);
            } else {
              console.error('Failed to fetch mint status');
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize SDK or fetch mint status:', error);
      }
    };
    initSDKAndFetchMintStatus();
  }, [connectedWalletAddress]); // Added connectedWalletAddress to dependencies

  const handleLogin = () => setGameState('menu');
  const handleProfile = () => setGameState('profile');
  const handleBackToMenu = () => setGameState('menu');
  const handleStart = () => setGameState('playing');
  const handleMint = () => setGameState('minting');
  const handleOnChainMint = async (metadataUrl: string, fid: number) => {
    if (!user?.walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }
    if (isMinted) {
      alert("You have already minted your Based Racer!");
      return;
    }
    if (!metadataUrl) {
      alert("Metadata URL not available. Please generate your racer first.");
      return;
    }

    // Wagmi hooks for writing to contract
    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

    // Wagmi hook for waiting for transaction confirmation
    const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = 
      useWaitForTransactionReceipt({ hash });

    const mintButtonText = () => {
      if (!isConnected) return "Connect Wallet to Mint";
      if (isMinted) return "Minted!";
      if (isPending) return "Confirming...";
      if (isConfirming) return "Processing...";
      if (isConfirmed) return "Mint Successful!";
      return "MINT PERSONAL RACER";
    };

    const isMintDisabled = 
      !isConnected || 
      isMinted || 
      !generatedMetadataUrl || 
      isPending || 
      isConfirming;

    // Actual on-chain transaction logic
    console.log("Preparing on-chain transaction for user:", user, "with metadata URL:", metadataUrl);
    
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: BasedRaceNFTABI,
        functionName: 'safeMint',
        args: [user.walletAddress, metadataUrl],
        value: MINT_FEE,
      });

      if (writeError) {
        console.error("Write contract error:", writeError);
        alert(`Minting transaction failed: ${writeError.message}`);
        return;
      }

      if (isConfirmed) {
        console.log("Mint transaction confirmed successfully. Updating database...");
        try {
          const response = await fetch('/api/racer/minted', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fid, isMinted: true }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update mint status in DB.');
          }
          console.log("Database updated: is_minted set to true for FID:", fid);
          alert(`Your Based Racer NFT has been minted! Transaction Hash: ${hash}`);
          setIsMinted(true); // Update local state
          handleBackToMenu(); // Go back to menu after mint
        } catch (error) {
          console.error("Error updating mint status in DB:", error);
          alert(`Mint successful on-chain, but failed to update status: ${(error as Error).message}`);
        }
      }
    } catch (error) {
      console.error("Full minting process error:", error);
      alert(`Minting process failed: ${(error as Error).message}`);
    }
  };

  const renderGameState = () => {
    switch(gameState) {
      case 'playing':
        return (
          <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
            <iframe 
              key={gameState}
              src="/index.html" 
              style={{ width: '100%', height: '100%', border: 0 }}
              title="Based Race Game"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        );
      case 'profile':
        return (
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
                  onClick={handleBackToMenu}
                  className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-sm p-2.5 mt-auto"
                >
                  BACK TO MENU
                </button>
              </div>
            </div>
        );
      case 'login':
        return (
            <div className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-black">
              <Image src="/ui/login.webp" alt="Login Background" fill className="object-cover" unoptimized />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-52 relative">
                  <Image src="/ui/mascot.webp" alt="Mascot" width={200} height={200} className="object-contain w-full h-auto" unoptimized />
                </div>
                <button
                  onClick={handleLogin}
                  className="pixel-font pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl px-10 py-4"
                >
                  LOGIN
                </button>
              </div>
            </div>
        );
      case 'minting':
        return (
          <div className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-black">
            <Image src="/ui/mainmenu.webp" alt="Minting Background" fill className="object-cover" unoptimized />
            <MintingPreview 
              user={user} 
              onBack={handleBackToMenu} 
              onMint={handleOnChainMint} 
              setGeneratedMetadataUrl={setGeneratedMetadataUrl} 
              generatedMetadataUrl={generatedMetadataUrl} // Pass the state value
              isMinted={isMinted} // Pass the isMinted state
            />
          </div>
        );
      case 'menu':
      default:
        return (
            <div className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-black">
              <Image src="/ui/mainmenu.webp" alt="Main Menu Background" fill priority className="object-cover" unoptimized />
              <div 
                className="pixel-border absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#e7f2eb] w-2/3 h-2/5 flex flex-col"
              >
                <button onClick={handleStart} className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">START</button>
                <button onClick={handleProfile} className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">PROFILE</button>
                <button onClick={handleMint} className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">MINT</button>
                <button className="pixel-font w-full text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] text-2xl flex-1">LEADERBOARD</button>
              </div>
            </div>
        );
    }
  };

  return (
    <main>
       <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          .pixel-font {
            font-family: 'Press Start 2P', cursive;
            image-rendering: pixelated;
          }
          .pixel-border {
            box-shadow: 
              4px 0 0 0 #233e63, -4px 0 0 0 #233e63,
              0 4px 0 0 #233e63, 0 -4px 0 0 #233e63,
              6px 0 0 0 #99b1c5, -6px 0 0 0 #99b1c5,
              0 6px 0 0 #99b1c5, 0 -6px 0 0 #99b1c5;
          }
          .pixel-btn {
            box-shadow: 6px 6px 0 0 #233e63, 8px 8px 0 0 #99b1c5;
          }
          .pixel-btn:active {
            transform: translate(4px, 4px);
            box-shadow: 0 0 0 0 #233e63, 2px 2px 0 0 #99b1c5;
          }
        `}</style>
      {renderGameState()}
    </main>
  );
}

// Helper functions for color conversion
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
