'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import BasedRaceNFTABI from '../src/lib/BasedRaceNFTABI.json';
import { CONTRACT_ADDRESS, MINT_FEE } from '../src/lib/constants';

// Component Imports
import { LoginScreen } from '../src/components/LoginScreen';
import { MainMenu } from '../src/components/MainMenu';
import { ProfileScreen } from '../src/components/ProfileScreen';
import { MintingScreen } from '../src/components/MintingScreen';
import { GameScreen } from '../src/components/GameScreen';

// Type Definitions
type GameState = 'login' | 'menu' | 'profile' | 'playing' | 'minting';
type UserProfile = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  walletAddress?: `0x${string}`;
} | null;

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('login');
  const [user, setUser] = useState<UserProfile>(null);
  const [generatedMetadataUrl, setGeneratedMetadataUrl] = useState<string | null>(null);
  const [isMinted, setIsMinted] = useState<boolean>(false);

  const { address: connectedWalletAddress, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({ hash });

  // Effect for initialization and fetching user data
  useEffect(() => {
    const initSDKAndFetchMintStatus = async () => {
      // Don't proceed until the wallet is connected and we have an address
      if (!isConnected || !connectedWalletAddress) {
        return;
      }

      try {
        await sdk.actions.ready();
        const context = await sdk.context;
        if (context?.user) {
          const profile: UserProfile = {
            fid: context.user.fid,
            username: context.user.username || '',
            displayName: context.user.displayName || '',
            pfpUrl: context.user.pfpUrl || '',
            walletAddress: connectedWalletAddress,
          };
          setUser(profile);
          
          const response = await fetch(`/api/racer/status?fid=${profile.fid}`);
          if (response.ok) {
            const data = await response.json();
            setIsMinted(data.isMinted);
          }
        }
      } catch (error) {
        console.error('SDK initialization failed:', error);
        toast.error('Could not connect to Farcaster.');
      }
    };
    initSDKAndFetchMintStatus();
  }, [isConnected, connectedWalletAddress]);

  // Effect for handling transaction state changes
  useEffect(() => {
    if (isConfirmed) {
      const handleConfirmation = async () => {
        try {
          const response = await fetch('/api/racer/minted', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fid: user!.fid, isMinted: true }),
          });
          if (!response.ok) throw new Error('Failed to update mint status in DB.');
          
          toast.success(`Mint successful! Tx: ${hash?.slice(0, 10)}...`);
          setIsMinted(true);
          setGameState('menu');
        } catch (error) {
          console.error("Error updating mint status:", error);
          toast.warning(`Mint confirmed on-chain, but failed to update status.`);
        }
      };
      handleConfirmation();
    }
    if (writeError) toast.error(`Transaction failed: ${writeError.message}`);
    if (confirmError) toast.error(`Confirmation failed: ${confirmError.message}`);
  }, [isConfirmed, writeError, confirmError, hash, user]);


  // Event Handlers
  const handleOnChainMint = async (metadataUrl: string, fid: number) => {
    if (!isConnected || !user?.walletAddress) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (isMinted) {
      toast.info("You have already minted your Based Racer!");
      return;
    }
    if (!metadataUrl) {
      toast.warning("Racer data not available. Please try again.");
      return;
    }
    if (isPending || isConfirming) {
      toast.info("A mint transaction is already in progress.");
      return;
    }
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: BasedRaceNFTABI,
      functionName: 'safeMint',
      args: [user.walletAddress, metadataUrl],
      value: MINT_FEE,
    });
  };

  const renderGameState = () => {
    switch(gameState) {
      case 'login':
        return <LoginScreen onLogin={() => setGameState('menu')} />;
      case 'menu':
        return <MainMenu onStart={() => setGameState('playing')} onProfile={() => setGameState('profile')} onMint={() => setGameState('minting')} />;
      case 'profile':
        return <ProfileScreen user={user} onBack={() => setGameState('menu')} />;
      case 'minting':
        return <MintingScreen 
                  user={user} 
                  onBack={() => setGameState('menu')} 
                  onMint={handleOnChainMint}
                  setGeneratedMetadataUrl={setGeneratedMetadataUrl}
                  generatedMetadataUrl={generatedMetadataUrl}
                />;
      case 'playing':
        return <GameScreen />;
      default:
        return <LoginScreen onLogin={() => setGameState('menu')} />;
    }
  };

  return (
    <main>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font { font-family: 'Press Start 2P', cursive; image-rendering: pixelated; }
        .pixel-border { box-shadow: 4px 0 0 0 #233e63, -4px 0 0 0 #233e63, 0 4px 0 0 #233e63, 0 -4px 0 0 #233e63, 6px 0 0 0 #99b1c5, -6px 0 0 0 #99b1c5, 0 6px 0 0 #99b1c5, 0 -6px 0 0 #99b1c5; }
        .pixel-btn { box-shadow: 6px 6px 0 0 #233e63, 8px 8px 0 0 #99b1c5; }
        .pixel-btn:active { transform: translate(4px, 4px); box-shadow: 0 0 0 0 #233e63, 2px 2px 0 0 #99b1c5; }
      `}</style>
      {renderGameState()}
    </main>
  );
}
