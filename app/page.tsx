'use client';

import { useState } from 'react';
import Image from 'next/image';

type GameState = 'login' | 'menu' | 'playing';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('login');

  const handleLogin = () => {
    setGameState('menu');
  };

  const handleStart = () => {
    setGameState('playing');
  };

  // Playing state - shows game iframe
  if (gameState === 'playing') {
    return (
      <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
        <iframe 
          key={gameState}
          src="/index.html" 
          style={{ width: '100%', height: '100%', border: 0 }}
          title="Based Race Game"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  }

  // Login state
  if (gameState === 'login') {
    return (
      <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative', background: '#000' }}>
        {/* Login background */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Image
            src="/ui/login.webp"
            alt="Login Background"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          .pixel-font {
            font-family: 'Press Start 2P', cursive;
            image-rendering: pixelated;
          }
          .pixel-btn {
            box-shadow: 
              4px 4px 0 0 #233e63,
              6px 6px 0 0 #99b1c5;
          }
          .pixel-btn:active {
            transform: translate(4px, 4px);
            box-shadow: 
              0 0 0 0 #233e63,
              2px 2px 0 0 #99b1c5;
          }
        `}</style>

        {/* Mascot and Login Button - centered */}
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0'
        }}>
          {/* Mascot */}
          <div style={{ width: '200px', position: 'relative', marginBottom: '0' }}>
            <Image
              src="/ui/mascot.webp"
              alt="Mascot"
              width={200}
              height={200}
              className="object-contain"
              unoptimized
            />
          </div>
          
          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="pixel-font pixel-btn transition-all duration-150"
            style={{ 
              backgroundColor: '#e7f2eb',
              color: '#0f10f4',
              fontSize: 'clamp(16px, 5vw, 28px)',
              padding: '15px 40px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0',
            }}
          >
            LOGIN
          </button>
        </div>
      </div>
    );
  }

  // Menu state (existing menu)
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative', background: '#000' }}>
      {/* Full-screen background image */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Image
          src="/ui/mainmenu.webp"
          alt="Main Menu Background"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: 'center' }}
          unoptimized
        />
      </div>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font {
          font-family: 'Press Start 2P', cursive;
          image-rendering: pixelated;
        }
        .pixel-border {
          box-shadow: 
            4px 0 0 0 #233e63,
            -4px 0 0 0 #233e63,
            0 4px 0 0 #233e63,
            0 -4px 0 0 #233e63,
            6px 0 0 0 #99b1c5,
            -6px 0 0 0 #99b1c5,
            0 6px 0 0 #99b1c5,
            0 -6px 0 0 #99b1c5;
        }
        .pixel-btn {
          box-shadow: 
            4px 4px 0 0 #233e63,
            6px 6px 0 0 #99b1c5;
        }
        .pixel-btn:active {
          transform: translate(4px, 4px);
          box-shadow: 
            0 0 0 0 #233e63,
            2px 2px 0 0 #99b1c5;
        }
      `}</style>

      {/* Menu Box - Centered */}
      <div 
        className="pixel-border"
        style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#e7f2eb',
          width: '66%',
          height: '40%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Start Button - Primary */}
        <button
          onClick={handleStart}
          className="pixel-font w-full text-center pixel-btn transition-all duration-150"
          style={{ 
            backgroundColor: '#e7f2eb',
            color: '#0f10f4',
            fontSize: 'clamp(16px, 5vw, 28px)',
            flex: '1',
            margin: '0',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          START
        </button>

        {/* Secondary Buttons */}
        <button className="pixel-font w-full text-center pixel-btn transition-all duration-150" style={{ backgroundColor: '#e7f2eb', color: '#0f10f4', fontSize: 'clamp(16px, 5vw, 28px)', flex: '1', margin: '0', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          PROFILE
        </button>
        
        <button className="pixel-font w-full text-center pixel-btn transition-all duration-150" style={{ backgroundColor: '#e7f2eb', color: '#0f10f4', fontSize: 'clamp(16px, 5vw, 28px)', flex: '1', margin: '0', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          MINT
        </button>
        
        <button className="pixel-font w-full text-center pixel-btn transition-all duration-150" style={{ backgroundColor: '#e7f2eb', color: '#0f10f4', fontSize: 'clamp(16px, 5vw, 28px)', flex: '1', margin: '0', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          LEADERBOARD
        </button>
      </div>
    </div>
  );
}
