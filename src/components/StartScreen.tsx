'use client';

import Image from 'next/image';
import { useState } from 'react';

const TRACKS_CONFIG = [
  {
    id: 'base-forest',
    name: 'Base Forest',
    preview: '/assets/tracks/base-forest/start.png',
    segments: ['start.png', 'env1.png', 'env2.png', 'finish.png'],
    basePath: '/assets/tracks/base-forest/'
  },
  {
    id: 'coming-soon-1',
    name: 'Locked Track',
    preview: '?',
  },
  {
    id: 'coming-soon-2',
    name: 'Locked Track',
    preview: '?',
  }
];

const CHARACTERS_CONFIG = [
  { name: 'Barmstrong', path: '/assets/character/barmstrong.png' },
  { name: 'Deployer', path: '/assets/character/deployer.png' },
  { name: 'Dish', path: '/assets/character/dish.png' },
  { name: 'Jesse', path: '/assets/character/jesse.png' },
];

const BET_OPTIONS = [0.1, 0.3, 0.5];

// Function to shuffle an array
const shuffle = (array: any[]) => {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

   
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
};


export const StartScreen = ({ onSelectTournament, onSelectRaceBetting, isMinted, nftImageUrl }: {
  onSelectTournament: () => void;
  onSelectRaceBetting: (data: { track: any; finalRaceGrid: any[], betAmount: number | null }) => void;
  isMinted?: boolean;
  nftImageUrl?: string | null;
}) => {
  const [currentView, setCurrentView] = useState('main'); // main, track-select, betting
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [isBetOnSelf, setIsBetOnSelf] = useState(false);
  const [betAmount, setBetAmount] = useState<number | null>(null);

  const handleSelectTrack = (index: number) => {
    setSelectedTrackIndex(index);
  };

  const selectedTrack = TRACKS_CONFIG[selectedTrackIndex];

  const handleCharacterSelect = (characterName: string) => {
    setSelectedCharacter(characterName);
    setIsBetOnSelf(false);
  };

  const handleBetOnSelfSelect = () => {
    if (isMinted) {
      setIsBetOnSelf(true);
      setSelectedCharacter(null);
    }
  };

  const handleFinalStart = () => {
    if ((!selectedCharacter && !isBetOnSelf) || !betAmount) {
        alert('Please select a character and a bet amount.');
        return;
    }
    let finalRaceGrid;
    let racers = CHARACTERS_CONFIG.map(c => ({ name: c.name, image: c.path, isPlayer: false }));

    if (isBetOnSelf && nftImageUrl) {
        // Randomly remove one default character
        const removalIndex = Math.floor(Math.random() * racers.length);
        racers.splice(removalIndex, 1);
        // Add the user's NFT character
        racers.push({ name: 'USER', image: nftImageUrl, isPlayer: true });
    } else {
        const player = racers.find(r => r.name === selectedCharacter);
        if (player) {
            player.isPlayer = true;
        }
    }

    finalRaceGrid = shuffle(racers);

    onSelectRaceBetting({
        track: selectedTrack,
        finalRaceGrid,
        betAmount
    });
  };

  return (
    <div className="w-full h-full relative overflow-y-auto custom-scrollbar">
      {currentView === 'main' ? (
        <div className="min-h-full w-full flex flex-col items-center justify-center gap-10 p-10">
          <button 
            onClick={() => setCurrentView('track-select')} 
            className="pixel-font pixel-border w-[300px] h-[50px] text-center pixel-btn transition-all duration-300 bg-[#e7f2eb] text-[#0f10f4] text-base animate-bounce hover:animate-none active:translate-y-1 active:shadow-none shadow-lg shadow-[#8a6d00] flex items-center justify-center"
          >
            RACE BETTING
          </button>
          <button 
            onClick={onSelectTournament} 
            className="pixel-font pixel-border w-[300px] h-[50px] text-center pixel-btn transition-all duration-300 bg-[#e7f2eb] text-[#0f10f4] text-base animate-bounce hover:animate-none active:translate-y-1 active:shadow-none shadow-lg shadow-[#8a6d00] flex items-center justify-center"
          >
            TOURNAMENT
          </button>
        </div>
      ) : currentView === 'track-select' ? (
        <div className="min-h-full w-full flex flex-col items-center justify-center p-4">
            <h1 className="text-[20px] pixel-font text-center text-black" style={{ height: '50px' }}>SELECT TRACK</h1>

            <div className="flex items-center justify-center">
                <button onClick={() => handleSelectTrack((selectedTrackIndex - 1 + TRACKS_CONFIG.length) % TRACKS_CONFIG.length)} className="pixel-font text-4xl text-black border-4 border-[#233e63] mr-[15px] w-[34px] h-[34px]">{'<'}</button>
                
                <div className="relative w-[280px] h-[160px] border-4 border-[#233e63] bg-gray-900 flex items-center justify-center pixel-font">
                    {selectedTrack.preview === '?' ? (
                        <span className="text-white text-6xl">?</span>
                    ) : (
                        <Image src={selectedTrack.preview} alt={selectedTrack.name} layout='fill' objectFit='cover' />
                    )}
                </div>
                
                <button onClick={() => handleSelectTrack((selectedTrackIndex + 1) % TRACKS_CONFIG.length)} className="pixel-font text-4xl text-black border-4 border-[#233e63] ml-[15px] w-[34px] h-[34px]">{ '>'}</button>
            </div>

            <p className="pixel-font text-lg text-white uppercase mt-[5px] mb-[20px] border-4 border-[#233e63] bg-[#233e63] px-2">{selectedTrack.name}</p>

            <div className="flex flex-col items-center gap-6 mt-8">
                <button
                    onClick={() => setCurrentView('betting')}
                    disabled={selectedTrack.preview === '?'}
                    className="pixel-font pixel-border w-[300px] h-[50px] text-center pixel-btn transition-all duration-300 bg-[#e7f2eb] text-black text-base active:translate-y-1 active:shadow-none shadow-lg shadow-[#8a6d00] flex items-center justify-center disabled:bg-gray-400 disabled:text-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {selectedTrack.preview === '?' ? 'LOCKED' : 'CONFIRM'}
                </button>

                <button onClick={() => setCurrentView('main')} className="pixel-font text-sm text-black pixel-border bg-[#e7f2eb] mt-[15px]">Back to Menu</button>
            </div>
        </div>
      ) : ( // betting view
        <div className="min-h-full w-full flex flex-col items-center justify-center p-4">
            <h2 className="pixel-font text-lg text-white mb-2">SELECT CHARACTER</h2>
            <div className="flex flex-row gap-4 mb-4">
                {CHARACTERS_CONFIG.map(char => (
                    <div 
                        key={char.name}
                        onClick={() => handleCharacterSelect(char.name)}
                        className={`pixel-border bg-[#1a1b23] flex items-center justify-center cursor-pointer w-[70px] h-[70px] ${selectedCharacter === char.name ? 'ring-4 ring-yellow-400' : ''}`}
                    >
                        <Image src={char.path} alt={char.name} width={60} height={60} className="object-contain" />
                    </div>
                ))}
            </div>

            <h2 className="pixel-font text-lg text-white mb-2">YOUR RACER</h2>
            <div 
                onClick={handleBetOnSelfSelect}
                className={`pixel-border bg-[#1a1b23] flex items-center justify-center w-[70px] h-[70px] mb-4 ${isBetOnSelf ? 'ring-4 ring-yellow-400' : ''} ${!isMinted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                {isMinted && nftImageUrl ? (
                    <Image src={nftImageUrl} alt="Your NFT" width={60} height={60} className="object-contain" />
                ) : (
                    <p className="text-white pixel-font text-center text-sm p-2">No NFT Found</p>
                )}
            </div>

            <h2 className="pixel-font text-lg text-white mb-2">PLACE A BET</h2>
            <div className="flex flex-row gap-4 mb-6">
                {BET_OPTIONS.map(amount => (
                    <div 
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        className={`pixel-border w-24 h-16 bg-[#1a1b23] text-white flex items-center justify-center cursor-pointer text-lg pixel-font ${betAmount === amount ? 'bg-blue-600' : ''}`}
                    >
                        🪙 {amount}
                    </div>
                ))}
            </div>

            <div className="flex flex-col items-center gap-2">
                 <button
                    onClick={handleFinalStart}
                    disabled={(!selectedCharacter && !isBetOnSelf) || !betAmount}
                    className="pixel-font pixel-border w-[300px] h-[50px] text-center pixel-btn transition-all duration-300 bg-[#e7f2eb] text-[#0f10f4] text-base active:translate-y-1 active:shadow-none shadow-lg shadow-[#8a6d00] flex items-center justify-center disabled:bg-gray-400 disabled:text-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    START RACE!
                </button>
                <button onClick={() => setCurrentView('track-select')} className="pixel-font text-sm text-black pixel-border bg-[#e7f2eb] mt-2">Back</button>
            </div>
        </div>
      )}
    </div>
  );
};
