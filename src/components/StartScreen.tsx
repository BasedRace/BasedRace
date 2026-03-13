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

export const StartScreen = ({ onSelectTournament, onSelectRaceBetting }: {
  onSelectTournament: () => void;
  onSelectRaceBetting: (track: any) => void;
}) => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);

  const handleSelectTrack = (index: number) => {
    setSelectedTrackIndex(index);
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
                    onClick={() => onSelectRaceBetting(selectedTrack)}
                    disabled={selectedTrack.preview === '?'}
                    className="pixel-font pixel-border w-[300px] h-[50px] text-center pixel-btn transition-all duration-300 bg-[#e7f2eb] text-black text-base active:translate-y-1 active:shadow-none shadow-lg shadow-[#8a6d00] flex items-center justify-center disabled:bg-gray-400 disabled:text-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {selectedTrack.preview === '?' ? 'LOCKED' : 'CONFIRM'}
                </button>

                <button onClick={() => setCurrentView('main')} className="pixel-font text-sm text-black pixel-border bg-[#e7f2eb] mt-[15px]">Back to Menu</button>
            </div>
        </div>
      )}
    </div>
  );
};
