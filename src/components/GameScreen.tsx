'use client';

export const GameScreen = () => (
  <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
    <iframe 
      src="/index.html" 
      style={{ width: '100%', height: '100%', border: 0 }}
      title="Based Race Game"
      sandbox="allow-scripts allow-same-origin"
    />
  </div>
);
