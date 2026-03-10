'use client';

import Image from 'next/image';
import { MintingPreview } from './MintingPreview';

type UserProfile = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  walletAddress?: `0x${string}`;
} | null;

export const MintingScreen = ({ user, onBack, onMint, setGeneratedMetadataUrl, generatedMetadataUrl }: {
  user: UserProfile;
  onBack: () => void;
  onMint: (metadataUrl: string, fid: number) => void;
  setGeneratedMetadataUrl: (url: string | null) => void;
  generatedMetadataUrl: string | null;
}) => (
  <div className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-black">
    <Image src="/ui/mainmenu.webp" alt="Minting Background" fill className="object-cover" unoptimized />
    <MintingPreview 
      user={user} 
      onBack={onBack} 
      onMint={onMint} 
      setGeneratedMetadataUrl={setGeneratedMetadataUrl} 
      generatedMetadataUrl={generatedMetadataUrl}
    />
  </div>
);
