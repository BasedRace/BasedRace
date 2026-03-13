"use client";

import { createContext, useContext, useRef, useEffect, useState, ReactNode } from 'react';

interface AudioContextType {
  fadeOutMainMusic: () => void;
  fadeInMainMusic: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const unlockAudio = () => {
      if (window.AudioContext && !audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        
        audioRef.current = new Audio('/assets/sounds/mainmusic.mp3');
        audioRef.current.loop = true;
        audioRef.current.crossOrigin = "anonymous";

        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        source.connect(gainNodeRef.current);

        audioContextRef.current.resume().then(() => {
          setIsUnlocked(true);
          console.log("AudioContext resumed and unlocked.");
          playMainMusic();
        }).catch(e => console.error("Could not resume AudioContext:", e));

        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      }
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const fade = (targetVolume: number, duration: number) => {
    if (!gainNodeRef.current || !audioContextRef.current) return;
    gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, audioContextRef.current.currentTime);
    gainNodeRef.current.gain.linearRampToValueAtTime(targetVolume, audioContextRef.current.currentTime + duration);
  };

  const playMainMusic = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(e => console.error("Error playing main music:", e));
      fade(0.5, 0.5);
    }
  };

  const fadeOutMainMusic = () => {
    fade(0, 0.5);
    setTimeout(() => {
      if(audioRef.current) {
        audioRef.current.pause();
      }
    }, 500);
  };
  
  const fadeInMainMusic = () => {
    playMainMusic();
  };

  const value = {
    fadeOutMainMusic,
    fadeInMainMusic,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
