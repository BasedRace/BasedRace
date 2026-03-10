'use client';

import { useState, useEffect } from 'react';

type UserProfile = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  walletAddress?: `0x${string}`;
} | null;

export const MintingPreview = ({ user, onBack, onMint, setGeneratedMetadataUrl, generatedMetadataUrl }: {
  user: UserProfile,
  onBack: () => void,
  onMint: (metadataUrl: string, fid: number) => void,
  setGeneratedMetadataUrl: (url: string | null) => void,
  generatedMetadataUrl: string | null,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const generateAndSetRacer = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/generate-racer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fid: user.fid,
            username: user.username,
            pfpUrl: user.pfpUrl,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate racer image.');
        }
        const data = await response.json();
        setGeneratedImageUrl(data.imageUrl);
        setGeneratedMetadataUrl(data.metadataUrl);
      } catch (err) {
        setError((err as Error).message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    generateAndSetRacer();
  }, [user, setGeneratedMetadataUrl]);

  const renderContent = () => {
    if (!user) return <div className="pixel-font text-lg text-[#233e63]">Loading User...</div>;
    if (isLoading) return <div className="pixel-font text-lg text-[#233e63]">Generating...</div>;
    if (error) return <div className="pixel-font text-sm text-red-500 text-center">Error: {error}</div>;
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
      <div className="w-[90%] max-w-[500px] flex flex-col items-center justify-between h-full">
        <div className="pixel-font text-[#233e63] text-xl mb-4 text-center">YOUR RACER</div>
        <div className="flex-grow flex items-center justify-center w-full">
          {renderContent()}
        </div>
        <div className="text-center mt-4 mb-6">
          <div className="pixel-font text-[#0f10f4] text-lg">@{user?.username || '...'}</div>
          <div className="pixel-font text-[#233e63] text-sm mt-1">FID: {user?.fid || '...'}</div>
        </div>
        <div className="w-full mt-auto pt-4">
          <button
            onClick={() => onMint(generatedMetadataUrl!, user!.fid)}
            disabled={isLoading || !!error || !generatedImageUrl || !generatedMetadataUrl}
            className="pixel-font w-full text-center pixel-btn transition-all duration-150 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            MINT PERSONAL RACER
          </button>
          <button
            onClick={onBack}
            className="pixel-font w-full text-center pixel-btn transition-all duration-150 py-3 mt-4"
          >
            BACK
          </button>
        </div>
      </div>
    </div>
  );
};
