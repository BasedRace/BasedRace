'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';
import DAILY_REWARDS_ABI from '../lib/claim.json';
import { formatUnits } from 'viem';

const DAILY_REWARDS_ADDRESS = process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS;

interface LandingPageProps {
  onAction: () => void;
  isMinted: boolean;
  nftImageUrl?: string | null;
}

export const LandingPage = ({ onAction, isMinted, nftImageUrl }: LandingPageProps) => {
  const { address, isConnected } = useAccount();
  const { data: hash, writeContract, isPending, error: writeContractError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claimedAmount, setClaimedAmount] = useState<string | null>(null);
  const [showAlreadyClaimedModal, setShowAlreadyClaimedModal] = useState(false);

  // New states to track data for the verify-claim API
  const [lastNonce, setLastNonce] = useState<string | null>(null);
  const [rawAmount, setRawAmount] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleShare = (amount: string) => {
    const text = `I just claimed ${amount} $RACE on Based Racer! 🏎️💨`;
    const appUrl = "https://farcaster.xyz/miniapps/pwIRBx_gHP9e/based-race";

    (sdk.actions as any).composeCast({
      text: `${text}\n\nCome and race with me in the Based Race!`,
      embeds: [{ url: appUrl }],
    });
  };

  const handleClaim = async () => {
    if (!DAILY_REWARDS_ADDRESS) {
      setClaimError('Daily rewards address is not configured.');
      return;
    }

    const context = await sdk.context;
    const fid = context?.user?.fid;

    if (!fid || !address) {
      setClaimError('Please ensure your wallet is connected and Farcaster account is synced.');
      return;
    }

    setClaimError(null);
    setClaimSuccess(null);

    try {
      const apiResponse = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid, address }),
      });

      if (!apiResponse.ok) {
        if (apiResponse.status === 429) {
          setShowAlreadyClaimedModal(true);
          return;
        }
        const data = await apiResponse.json();
        throw new Error(data.error || 'Failed to get claim signature from the server.');
      }

      const data = await apiResponse.json();
      const { signature, amount, nonce } = data;
      
      // Store raw data for the second step (verify-claim)
      setLastNonce(nonce);
      setRawAmount(amount);
      
      const formattedAmount = formatUnits(BigInt(amount), 18);
      setClaimedAmount(formattedAmount);

      writeContract({
        address: DAILY_REWARDS_ADDRESS as `0x${string}`,
        abi: DAILY_REWARDS_ABI,
        functionName: 'claim',
        args: [BigInt(amount), BigInt(nonce), signature],
      });

    } catch (apiError: any) {
      console.error('API Error:', apiError);
      setClaimError(apiError.message);
    }
  };

  useEffect(() => {
    const verifyAndSync = async () => {
      // Triggered when blockchain transaction is successful
      if (isConfirmed && claimedAmount && lastNonce && rawAmount && !isVerifying) {
        setIsVerifying(true);
        try {
          const context = await sdk.context;
          const fid = context?.user?.fid;

          const verifyResponse = await fetch('/api/verify-claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fid,
              address,
              nonce: lastNonce,
              amount: rawAmount
            }),
          });

          if (verifyResponse.ok) {
            setClaimSuccess('Tokens claimed and verified! 🏎️');
            handleShare(claimedAmount);
          } else {
            const errorData = await verifyResponse.json();
            setClaimError(`Sync Error: ${errorData.error || 'Please contact support.'}`);
          }
        } catch (err) {
          console.error('Final Verification Error:', err);
          setClaimError('Transaction success, but database sync failed.');
        } finally {
          setIsVerifying(false);
        }
      }
    };

    verifyAndSync();

    if (writeContractError) {
      const shortMessage = (writeContractError as any).shortMessage || writeContractError.message;
      setClaimError(`Claim failed: ${shortMessage}`);
    }
  }, [isConfirmed, writeContractError, claimedAmount, lastNonce, rawAmount, address]);

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-end p-6 pb-24">
      {/* Already Claimed Modal */}
      {showAlreadyClaimedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center pixel-font">
            <p className="mb-6 text-xl">YOU ALREADY CLAIMED $RACE TODAY</p>
            <button onClick={() => setShowAlreadyClaimedModal(false)} className="pixel-btn bg-gray-300 text-black py-2 px-4">Close</button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-8 w-full max-w-[400px] relative z-30">
        <div className="flex justify-between w-full max-w-[320px] items-end">
          <button 
            onClick={onAction}
            className="pixel-font w-full max-w-[150px] text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] 
                       text-[10px] py-3 px-2 shadow-[4px_4px_0px_#99b1c5] 
                       active:scale-95 active:translate-y-1 flex items-center justify-center min-h-[60px]"
          >
            <span className="block uppercase tracking-tighter">
              {isMinted ? "SHARE RACER" : "MINT PERSONAL RACER"}
            </span>
          </button>

          <div className="relative">
            <Image 
              src="/ui/mascot.webp" 
              alt="Mascot" 
              width={100} 
              height={80} 
              className="absolute -top-20 right-0 z-10"
              style={{ bottom: '60px', left: '10px' }}
            />
            <button 
              onClick={handleClaim}
              disabled={isPending || isConfirming || isVerifying || !isConnected}
              className="pixel-font w-full max-w-[150px] text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] 
                         text-[10px] py-3 px-2 shadow-[4px_4px_0px_#99b1c5] 
                         active:scale-95 active:translate-y-1 flex items-center justify-center min-h-[60px] 
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="block uppercase tracking-tighter">
                {isPending ? 'SIGNING...' : isConfirming ? 'CONFIRMING...' : isVerifying ? 'SYNCING...' : 'CLAIM $RACE'}
              </span>
            </button>
          </div>
        </div>

        <div className="w-150 h-150 relative overflow-hidden flex items-center justify-center">
          {isMinted && nftImageUrl ? (
            <img 
              src={nftImageUrl} 
              alt="Your Unique Based Racer NFT" 
              className="w-full h-full object-contain p-2"
              onError={(e) => { e.currentTarget.src = "/ui/dummy.png"; }}
            />
          ) : (
            <img 
              src="/ui/dummy.png" 
              alt="Personal Racer NFT Placeholder" 
              className="w-full h-full object-contain p-2"
            />
          )}
        </div>

        <div className="h-6 text-center pixel-font text-xs">
          {!isConnected && <p className='text-yellow-400'>Connect wallet to claim</p>}
          {isVerifying && <p className="text-blue-400 italic animate-pulse">Confirming with database...</p>}
          {claimError && <p className="text-red-500">{claimError}</p>}
          {claimSuccess && <p className="text-green-500">{claimSuccess}</p>}
        </div>
      </div>
    </div>
  );
};
