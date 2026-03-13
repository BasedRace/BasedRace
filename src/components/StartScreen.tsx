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
  }
];

const CHARACTERS_CONFIG = [
  { name: 'Barmstrong', path: '/assets/character/barmstrong.png' },
  { name: 'Deployer', path: '/assets/character/deployer.png' },
  { name: 'Dish', path: '/assets/character/dish.png' },
  { name: 'Jesse', path: '/assets/character/jesse.png' },
];

export const StartScreen = ({ onSelectTournament, onSelectRaceBetting }: {
  onSelectTournament: () => void;
  onSelectRaceBetting: (track: any) => void;
}) => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);

  const handleSelectTrack = (index: number) => {
    if (index >= 0 && index < TRACKS_CONFIG.length) {
      setSelectedTrackIndex(index);
    }
  };

  const selectedTrack = TRACKS_CONFIG[selectedTrackIndex];

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
      ) : (
        <div className="min-h-full w-full flex flex-col items-center justify-center gap-4 p-4">
          <div className="flex items-center justify-center gap-6">
            <button onClick={() => handleSelectTrack(selectedTrackIndex - 1)} className="pixel-font text-4xl text-[#0f10f4]">{'<'}</button>
            <div className="relative w-[150px] h-[100px] border-4 border-[#0f10f4] bg-black flex items-center justify-center pixel-font">
                <span className="text-white text-4xl">?</span>
            </div>
            <div className="relative w-[250px] h-[150px] border-4 border-[#0f10f4] bg-gray-900">
                <Image src={selectedTrack.preview} alt={selectedTrack.name} layout='fill' objectFit='cover' />
            </div>
            <div className="relative w-[150px] h-[100px] border-4 border-[#0f10f4] bg-black flex items-center justify-center pixel-font">
                <span className="text-white text-4xl">?</span>
            </div>
            <button onClick={() => handleSelectTrack(selectedTrackIndex + 1)} className="pixel-font text-4xl text-[#0f10f4]">{'>'}</button>
          </div>
          <p className="pixel-font text-lg mt-4">{selectedTrack.name}</p>
          <button 
            onClick={() => onSelectRaceBetting(selectedTrack)} 
            className="pixel-font pixel-border w-[300px] h-[50px] text-center pixel-btn transition-all duration-300 bg-[#e7f2eb] text-[#0f10f4] text-base active:translate-y-1 active:shadow-none shadow-lg shadow-[#8a6d00] flex items-center justify-center mt-4"
          >
            Confirm
          </button>
          <button onClick={() => setCurrentView('main')} className="pixel-font text-sm mt-6 text-[#0f10f4]">Back</button>
        </div>
      )}
    </div>
  );
};
