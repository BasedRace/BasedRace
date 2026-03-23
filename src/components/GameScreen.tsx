'use client';

import { useEffect, useRef } from 'react';

export const GameScreen = ({ raceData }: { raceData?: any }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    const handleLoad = () => {
      if (iframe && iframe.contentWindow && raceData) {
        iframe.contentWindow.postMessage({ type: 'startRace', data: raceData }, '*');
      }
    };

    if (iframe) {
      iframe.addEventListener('load', handleLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
      }
    };
  }, [raceData]);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        src="/index.html"
        style={{ width: '100%', height: '100%', border: 0 }}
        title="Based Race Game"
        allow="autoplay"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};
