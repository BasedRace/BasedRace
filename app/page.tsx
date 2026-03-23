'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { sdk } from '@farcaster/miniapp-sdk';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConnect } from 'wagmi';
import { toast } from 'sonner';
import BasedRaceNFTABI from '../src/lib/BasedRaceNFTABI.json';
import { CONTRACT_ADDRESS, MINT_FEE } from '../src/lib/constants';
import { useAudio } from '../src/components/AudioProvider';

// Component Imports
import { LoginScreen } from '../src/components/LoginScreen';
import { ProfileScreen } from '../src/components/ProfileScreen';
import { MintingScreen } from '../src/components/MintingScreen';
import { GameScreen } from '../src/components/GameScreen';
import { GarageScreen } from '../src/components/GarageScreen';
import { RankScreen } from '../src/components/RankScreen';
import { NavBar, NavView as OriginalNavView } from '../src/components/NavBar';
import { StartScreen } from '../src/components/StartScreen';
import { LandingPage } from '../src/components/LandingPage';

// Type Definitions
type GameState = 'loading' | 'login'; // 'game' state is now handled by activeView
type NavView = OriginalNavView | 'game'; // Add 'game' to NavView
type StartSubView = 'menu' | 'tournament';
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

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [activeView, setActiveView] = useState<NavView | 'landing'>('landing');
  const [startSubView, setStartSubView] = useState<StartSubView>('menu');
  const [user, setUser] = useState<UserProfile>(null);
  const [generatedMetadataUrl, setGeneratedMetadataUrl] = useState<string | null>(null);
  const [isMinted, setIsMinted] = useState<boolean>(false);
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(null);
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [raceData, setRaceData] = useState<any>(null);
  const [showWinSharePopup, setShowWinSharePopup] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const { fadeOutMainMusic, fadeInMainMusic } = useAudio();

  const { address: connectedWalletAddress, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({ hash });

  // Initialize App & Context
  useEffect(() => {
    const initialize = async () => {
      try {
        await sdk.actions.ready();

        const context = await sdk.context;
        if (context?.user && isConnected && connectedWalletAddress) {
          let profile: UserProfile = {
            fid: context.user.fid,
            username: context.user.username || '',
            displayName: context.user.displayName || '',
            pfpUrl: context.user.pfpUrl || '',
            walletAddress: connectedWalletAddress,
          };

          const encodedPfp = encodeURIComponent(profile.pfpUrl || '');
          const response = await fetch(`/api/racer/status?fid=${profile.fid}&pfpUrl=${encodedPfp}`);
          if (response.ok) {
            const data = await response.json();
            setIsMinted(data.isMinted);
            setNftImageUrl(data.imageUrl);
            profile = {
              ...profile,
              tier: data.tier,
              exp: data.exp,
              wins: data.wins,
            };
          }
          setUser(profile);
        }
        setGameState('login');
      } catch (error) {
        console.error('Initialization failed:', error);
        toast.error('Could not connect to Farcaster.');
        setGameState('login');
      }
    };
    initialize();
  }, [isConnected, connectedWalletAddress]);

  // Handle Game Iframe Messages
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'raceState') {
        if (event.data.state === 'started') {
          setIsRacing(true);
        } else if (event.data.state === 'finished') {
          setIsRacing(false);
          setActiveView('start');
          setStartSubView('menu');
        }
      } else if (event.data.type === 'raceResult') {
        // Trigger API when race finished to handle EXP & Oracle
        if (user) {
          const isWin = event.data.isUserWinner;
          toast.info(isWin ? "🎉 You Won! Calculating EXP..." : "🏁 Race Finished! Calculating EXP...");
          
          try {
             const res = await fetch('/api/racer/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    fid: user.fid, 
                    isWin,
                    raceId: raceData?.raceId,
                    winnerName: raceData?.winnerName
                })
             });
             
             if (res.ok) {
                const data = await res.json();
                
                // Refresh memory status so ProfileScreen updates automatically
                setUser(prev => prev ? { ...prev, exp: data.exp, wins: data.wins } : prev);
                toast.success(`Successfully recorded +${data.expGained} EXP!`);

                if (isWin) {
                   const bet = raceData?.betAmount ? parseInt(raceData.betAmount.toString(), 10) : 0;
                   setWinAmount(bet * 2); // default 2x multiplier
                   setShowWinSharePopup(true);
                }
             }
          } catch(e) {
             console.error("Failed to resolve race:", e);
             toast.error("Failed to save race results to server.");
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, raceData]); // attached 'raceData' to avoid stale closure

  // Handle Transaction Results
  useEffect(() => {
    if (isConfirmed) {
      toast.success(`Mint successful! Tx: ${hash?.slice(0, 10)}...`);
      setIsMinted(true);
      setActiveView('profile');

      fetch('/api/racer/minted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid: user!.fid, isMinted: true }),
      }).then(async () => {
        const res = await fetch(`/api/racer/status?fid=${user!.fid}`);
        if (res.ok) {
          const data = await res.json();
          setNftImageUrl(data.imageUrl);
        }
      }).catch(() => toast.warning('Mint recorded on-chain, but DB update failed.'));
    }
    if (writeError) toast.error(`Transaction failed: ${writeError.message}`);
    if (confirmError) toast.error(`Confirmation failed: ${confirmError.message}`);
  }, [isConfirmed, writeError, confirmError, hash, user]);

  useEffect(() => {
    if (activeView === 'game') {
      fadeOutMainMusic();
    } else {
      fadeInMainMusic();
    }
  }, [activeView, fadeOutMainMusic, fadeInMainMusic]);

  const handleConnect = () => connect({ connector: connectors[0] });

  const handleNavigate = (view: NavView) => {
    if (view === 'start') setStartSubView('menu');
    setActiveView(view);
  };

  const handleAction = async () => {
    if (!isMinted) {
      setActiveView('mint');
    } else {
      if (user) {
        const finalNftUrl = nftImageUrl || `${window.location.origin}/api/racer/image?fid=${user.fid}`;
        const appUrl = "https://farcaster.xyz/miniapps/pwIRBx_gHP9e/based-race";
        const templateText = `I just minted my custom Based Racer! 🏎️💨\n\nCome and race with me in the Based Race Mini-app on Farcaster!`;

        try {
          await (sdk.actions as any).composeCast({
            text: templateText,
            embeds: [appUrl, finalNftUrl],
          });
        } catch (error) {
          console.error("Failed to open composer:", error);
          toast.error("Failed to open share composer.");
        }
      }
    }
  };

  const handleShareWin = async () => {
    const appUrl = "https://farcaster.xyz/miniapps/pwIRBx_gHP9e/based-race";
    const text = `I just won ${winAmount} $RACE at Based Racer! 🏎️💨\n\nCome and race with me in the Based Race miniapp !\n${appUrl}`;
    
    try {
      await (sdk.actions as any).composeCast({
        text: text,
      });
      setShowWinSharePopup(false);
    } catch (error) {
      console.error("Failed to compose cast:", error);
      toast.error("Failed to open share composer.");
    }
  };

  const handleOnChainMint = (metadataUrl: string) => {
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

  const handleRaceBetting = (data: any) => {
    setRaceData(data);
    setActiveView('game');
  }

  if (gameState === 'loading') {
    return <div className="w-screen h-screen bg-black" />;
  }

  if (!isConnected || !user) {
    return <LoginScreen onLogin={handleConnect} />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'landing':
        return (
          <LandingPage
            onAction={handleAction}
            isMinted={isMinted}
            nftImageUrl={isMinted ? nftImageUrl : null}
          />
        );
      case 'game':
        return <GameScreen raceData={raceData} />;
      case 'start':
        switch (startSubView) {
          case 'tournament': return <GameScreen />;
          case 'menu':
          default:
            return (
              <StartScreen
                onSelectTournament={() => setStartSubView('tournament')}
                onSelectRaceBetting={handleRaceBetting}
                isMinted={isMinted}
                nftImageUrl={nftImageUrl}
              />
            );
        }
      case 'profile': return <ProfileScreen user={user} nftImageUrl={nftImageUrl} onMint={() => setActiveView('mint')} is_minted={isMinted} onShare={handleAction} />;
      case 'mint':
        return (
          <MintingScreen
            user={user}
            onBack={() => setActiveView('profile')}
            onMint={handleOnChainMint}
            setGeneratedMetadataUrl={setGeneratedMetadataUrl}
            generatedMetadataUrl={generatedMetadataUrl}
          />
        );
      case 'garage': return <GarageScreen />;
      case 'rank': return <RankScreen />;
      default: return <ProfileScreen user={user} nftImageUrl={nftImageUrl} onMint={() => setActiveView('mint')} is_minted={isMinted} onShare={handleAction} />;
    }
  };

  return (
    <main className="w-full h-[100dvh] bg-black relative flex flex-col overflow-hidden">
      <Image src="/ui/mainmenu.webp" alt="Main Menu" fill priority className="object-cover -z-10" unoptimized />
      <div className="flex-1 w-full overflow-y-auto relative z-10">
        {renderActiveView()}
      </div>
      {activeView !== 'game' && <NavBar activeView={activeView as OriginalNavView} onNavigate={handleNavigate} />}

      {/* WIN SHARE MODAL */}
      {showWinSharePopup && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="bg-[#e7f2eb] border-4 border-[#233e63] p-6 w-[340px] flex flex-col items-center gap-6 pixel-border">
            <h2 className="pixel-font text-2xl text-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center w-full">VICTORY!</h2>
            <p className="pixel-font text-sm text-black text-center w-full leading-relaxed">You've won {winAmount} $RACE!</p>
            <button
              onClick={handleShareWin}
              className="pixel-font pixel-border w-full h-[50px] text-center pixel-btn transition-all duration-300 bg-[#e7f2eb] text-[#0f10f4] text-[10px] sm:text-xs animate-bounce hover:animate-none active:translate-y-1 active:shadow-none shadow-lg shadow-[#8a6d00] flex items-center justify-center leading-tight"
            >
              Share Winning Race
            </button>
            <button
              onClick={() => setShowWinSharePopup(false)}
              className="pixel-font text-xs text-gray-500 mt-2 hover:text-black transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

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
