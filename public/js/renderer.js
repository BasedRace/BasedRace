// js/renderer.js - Sistem Rendering dengan dukungan Zoom-In dan Seamless Stitching

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.ctx.imageSmoothingEnabled = false;
  }

  clear() {
    this.ctx.fillStyle = '#0f0f23';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawTile(tile, fallbackWidth, fallbackHeight) {
    if (!tile.asset) return;
    
    const w = tile.w || fallbackWidth;
    const h = tile.h || fallbackHeight;
    
    const x = tile.renderX !== undefined ? tile.renderX : tile.x;
    const y = tile.renderY !== undefined ? tile.renderY : tile.y;
    
    if (y > this.canvas.height + 500 || y + h < -500) return;
    if (x > this.canvas.width + 1000 || x + w < -1000) return;
    
    const drawX = Math.floor(x);
    const drawY = Math.floor(y);
    
    this.ctx.drawImage(
      tile.asset,
      drawX,
      drawY,
      Math.ceil(w) + 2,
      Math.ceil(h) + 2
    );
  }

  drawRacers(racers) {
    const sortedRacers = [...racers].sort((a, b) => a.yPosOnScreen - b.yPosOnScreen);

    for (const racer of sortedRacers) {
      if (!racer.asset) continue;
      
      const drawX = Math.floor(racer.x);
      const drawY = Math.floor(racer.yPosOnScreen);
      
      this.ctx.drawImage(
        racer.asset,
        drawX,
        drawY,
        racer.w,
        racer.h
      );
    }
    
    if (this.confettiActive) {
      this.drawConfetti();
    }
  }
  
  confetti = [];
  confettiActive = false;
  
  startConfetti() {
    this.confettiActive = true;
    this.confetti = [];
    const colors = ['#FFD700', '#FF6B00', '#FF1493', '#00FF7F', '#00BFFF', '#FF4500', '#7CFC00', '#DA70D6'];
    for (let i = 0; i < 150; i++) {
      this.confetti.push({
        x: Math.random() * 1200 - 100,
        y: Math.random() * -2000 - 500,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 12 + 6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20
      });
    }
  }
  
  drawConfetti() {
    if (!this.confettiActive) return;
    
    for (const p of this.confetti) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;
      
      this.ctx.save();
      this.ctx.translate(p.x + p.size/2, p.y + p.size/2);
      this.ctx.rotate(p.rotation * Math.PI / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      this.ctx.restore();
    }
    
    if (this.confetti.length < 100 && Math.random() > 0.9) {
      const colors = ['#FFD700', '#FF6B00', '#FF1493', '#00FF7F', '#00BFFF'];
      this.confetti.push({
        x: Math.random() * 1200,
        y: -50,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 15
      });
    }
    
    this.confetti = this.confetti.filter(p => p.y < 1900);
    
    if (this.confetti.length === 0) {
      this.confettiActive = false;
    }
  }

  drawStartLights(currentImage, text) {
    const ctx = this.ctx;
    const canvasWidth = this.canvas.width;
    const yPos = 110; // Y-coordinate from the top

    if (currentImage) {
        // Calculate aspect ratio
        const aspectRatio = currentImage.height / currentImage.width;
        const imgWidth = canvasWidth;
        const imgHeight = imgWidth * aspectRatio;

        // Draw a dark, semi-transparent banner behind the lights
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, yPos - 30, canvasWidth, imgHeight + 60); 

        // Draw the light image across the full width
        ctx.drawImage(currentImage, 0, yPos, imgWidth, imgHeight);
    }

    if (text) {
        ctx.font = "bold 72px 'Press Start 2P', monospace";
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textX = canvasWidth / 2;
        const textY = yPos + 180; // Position text below the lights banner
        
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 15;
        ctx.fillText(text, textX, textY);
        
        ctx.shadowBlur = 0;
    }
  }

  drawLoading() {
    this.clear();
    const ctx = this.ctx;
    ctx.font = "bold 48px 'Press Start 2P', monospace";
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2);
  }

  render(track, racers = []) {
    if (!track || !track.tiles) return;

    this.ctx.imageSmoothingEnabled = false;
    
    this.clear();
    
    for (const tile of track.tiles) {
      this.drawTile(tile, track.WIDTH, track.HEIGHT);
    }
    
    this.drawRacers(racers);
  }
}
