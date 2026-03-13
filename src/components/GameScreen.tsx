'use client';

import { useEffect, useRef, useState } from 'react';

export const GameScreen = ({ raceData }: { raceData?: any }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showBackButton, setShowBackButton] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;

    const handleLoad = () => {
      if (iframe && iframe.contentWindow && raceData) {
        iframe.contentWindow.postMessage({ type: 'startRace', data: raceData }, '*');
      }
    };

    const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'raceResult') {
            // Show back button after a delay, allowing winner text to be shown
            setTimeout(() => {
                setShowBackButton(true);
            }, 4000); // Same as the timeout in main.js
        }
    }

    window.addEventListener('message', handleMessage);

    if (iframe) {
      iframe.addEventListener('load', handleLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
      }
      window.removeEventListener('message', handleMessage);
    };
  }, [raceData]);

  const handleBackToMenu = () => {
    window.location.href = '/'; // Or your menu route
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        src="/index.html"
        style={{ width: '100%', height: '100%', border: 0 }}
        title="Based Race Game"
        sandbox="allow-scripts allow-same-origin"
      />
      {showBackButton && (
          <button 
            id="back-btn" 
            onClick={handleBackToMenu}
            style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '10px 20px',
                fontSize: '18px',
                cursor: 'pointer',
                backgroundColor: '#333',
                color: 'white',
                border: '2px solid white',
                borderRadius: '5px',
                fontFamily: '"Press Start 2P", monospace'
            }}
          >
            Back to Menu
          </button>
      )}
    </div>
  );
};
