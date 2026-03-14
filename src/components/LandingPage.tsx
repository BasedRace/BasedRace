'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAccount, useWriteContract } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';
import DAILY_REWARDS_ABI from '../lib/claim.json';

// Get the contract address from environment variables
const DAILY_REWARDS_ADDRESS = process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS;

interface LandingPageProps {
  onAction: () => void;
  isMinted: boolean;
  nftImageUrl?: string | null;
}

export const LandingPage = ({ onAction, isMinted, nftImageUrl }: LandingPageProps) => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, isSuccess, error } = useWriteContract();

  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!DAILY_REWARDS_ADDRESS) {
        setClaimError('Daily rewards address is not configured.');
        return;
    }

    const fid = sdk.identity?.fid;
    
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

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(data.error || 'Failed to get claim signature from the server.');
      }

      const { signature, amount, nonce } = data;

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
    if (isSuccess) {
      setClaimSuccess(`Claim successful! Tx: ${hash?.slice(0, 10)}...`);
    }
    if (error) {
      // The wagmi error object has a shortMessage property
      const shortMessage = (error as any).shortMessage || error.message;
      setClaimError(`Claim failed: ${shortMessage}`);
    }
  }, [isSuccess, error, hash]);

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-end p-6 pb-24">
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
              disabled={isPending || !isConnected}
              className="pixel-font w-full max-w-[150px] text-center pixel-btn transition-all duration-150 bg-[#e7f2eb] text-[#0f10f4] 
                         text-[10px] py-3 px-2 shadow-[4px_4px_0px_#99b1c5] 
                         active:scale-95 active:translate-y-1 flex items-center justify-center min-h-[60px] 
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="block uppercase tracking-tighter">
                {isPending ? 'CLAIMING...' : 'CLAIM $RACE'}
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

        {/* UI Feedback Messages */}
        <div className="h-6 text-center pixel-font text-xs">
          {!isConnected && <p className='text-yellow-400'>Connect wallet to claim</p>}
          {claimError && <p className="text-red-500">{claimError}</p>}
          {claimSuccess && <p className="text-green-500">{claimSuccess}</p>}
        </div>
      </div>
    </div>
  );
};