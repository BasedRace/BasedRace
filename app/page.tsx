'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { sdk } from '@farcaster/miniapp-sdk';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConnect } from 'wagmi';
import { toast } from 'sonner';
import BasedRaceNFTABI from '../src/lib/BasedRaceNFTABI.json';
import { CONTRACT_ADDRESS, MINT_FEE } from '../src/lib/constants';

// Component Imports
import { LoginScreen } from '../src/components/LoginScreen';
import { ProfileScreen } from '../src/components/ProfileScreen';
import { MintingScreen } from '../src/components/MintingScreen';
import { GameScreen } from '../src/components/GameScreen';
import { GarageScreen } from '../src/components/GarageScreen';
import { LeaderboardScreen } from '../src/components/LeaderboardScreen';
import { NavBar, NavView } from '../src/components/NavBar';

// Type Definitions
type GameState = 'loading' | 'login'; // Simplified initial states
type UserProfile = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  walletAddress?: `0x${string}`;
} | null;

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [activeView, setActiveView] = useState<NavView>('start');
  const [user, setUser] = useState<UserProfile>(null);
  const [generatedMetadataUrl, setGeneratedMetadataUrl] = useState<string | null>(null);
  const [isMinted, setIsMinted] = useState<boolean>(false);

  const { address: connectedWalletAddress, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({ hash });

  // Effect for initialization and data synchronization
  useEffect(() => {
    const initialize = async () => {
      try {
        const context = await sdk.context;
        if (context?.user && isConnected && connectedWalletAddress) {
          const profile: UserProfile = {
            fid: context.user.fid,
            username: context.user.username || '',
            displayName: context.user.displayName || '',
            pfpUrl: context.user.pfpUrl || '',
            walletAddress: connectedWalletAddress,
          };
          setUser(profile);
          const response = await fetch(`/api/racer/status?fid=${profile.fid}`);
          if (response.ok) setIsMinted((await response.json()).isMinted);
          setGameState('login'); // Mark loading as complete
        } else if (!isConnected) {
          setGameState('login'); // Show connect screen
        }
      } catch (error) {
        console.error('Initialization failed:', error);
        toast.error('Could not connect to Farcaster.');
        setGameState('login');
      }
    };
    initialize();
  }, [isConnected, connectedWalletAddress]);

  // Transaction state change effect
  useEffect(() => {
    if (isConfirmed) {
      toast.success(`Mint successful! Tx: ${hash?.slice(0, 10)}...`);
      setIsMinted(true);
      setActiveView('profile'); // Navigate to profile after mint
      fetch('/api/racer/minted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid: user!.fid, isMinted: true }),
      }).catch(err => toast.warning('Mint recorded on-chain, but DB update failed.'));
    }
    if (writeError) toast.error(`Transaction failed: ${writeError.message}`);
    if (confirmError) toast.error(`Confirmation failed: ${confirmError.message}`);
  }, [isConfirmed, writeError, confirmError, hash, user]);

  const handleConnect = () => connect({ connector: connectors[0] });

  const handleOnChainMint = (metadataUrl: string, fid: number) => {
    if (!isConnected || !user?.walletAddress) return toast.error("Please connect your wallet first.");
    if (isMinted) return toast.info("You have already minted your Based Racer!");
    if (!metadataUrl) return toast.warning("Racer data not available. Please try again.");
    if (isPending || isConfirming) return toast.info("A mint transaction is already in progress.");
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: BasedRaceNFTABI,
      functionName: 'safeMint',
      args: [user.walletAddress, metadataUrl],
      value: MINT_FEE,
    });
  };

  if (gameState === 'loading') {
    return <div className="w-screen h-screen bg-black" />;
  }

  if (!isConnected || !user) {
    return <LoginScreen onLogin={handleConnect} />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'start': return <GameScreen />;
      case 'profile': return <ProfileScreen user={user} onBack={() => {}} />; // onBack is unused now
      case 'mint': return <MintingScreen user={user} onBack={() => setActiveView('profile')} onMint={handleOnChainMint} setGeneratedMetadataUrl={setGeneratedMetadataUrl} generatedMetadataUrl={generatedMetadataUrl} />;
      case 'garage': return <GarageScreen />;
      case 'leaderboard': return <LeaderboardScreen />;
      default: return <GameScreen />;
    }
  };

  return (
    <main className="w-screen h-screen bg-black">
      {/* Preload Image */}
      <div className="absolute w-px h-px -z-10 overflow-hidden opacity-0">
        <Image src="/ui/mainmenu.webp" alt="" priority unoptimized aria-hidden="true" width={10} height={10}/>
      </div>
      
      {/* Main Content Area */}
      <div className="w-full h-full pb-20">{renderActiveView()}</div>

      {/* Navigation */}
      <NavBar activeView={activeView} onNavigate={setActiveView} />
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font { font-family: 'Press Start 2P', cursive; image-rendering: pixelated; }
        .pixel-border { box-shadow: 4px 0 0 0 #233e63, -4px 0 0 0 #233e63, 0 4px 0 0 #233e63, 0 -4px 0 0 #233e63, 6px 0 0 0 #99b1c5, -6px 0 0 0 #99b1c5, 0 6px 0 0 #99b1c5, 0 -6px 0 0 #99b1c5; }
        .pixel-btn { box-shadow: 6px 6px 0 0 #233e63, 8px 8px 0 0 #99b1c5; }
        .pixel-btn:active { transform: translate(4px, 4px); box-shadow: 0 0 0 0 #233e63, 2px 2px 0 0 #99b1c5; }
      `}</style>
    </main>
  );
}
