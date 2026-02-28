// js/renderer.js - Sistem Rendering dengan dukungan Zoom-In dan Seamless Stitching

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Mematikan smoothing agar aset tetap tajam (crisp) meski di-zoom
    this.ctx.imageSmoothingEnabled = false;
  }

  // Membersihkan canvas dengan warna latar belakang gelap
  clear() {
    this.ctx.fillStyle = '#0f0f23';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Menggambar satu tile track.
   * @param {Object} tile - Objek tile dari entities.js
   * @param {number} fallbackWidth - Lebar cadangan jika tile.w tidak ada
   * @param {number} fallbackHeight - Tinggi cadangan jika tile.h tidak ada
   */
  drawTile(tile, fallbackWidth, fallbackHeight) {
    if (!tile.asset) return;
    
    const w = tile.w || fallbackWidth;
    const h = tile.h || fallbackHeight;
    
    // Menggunakan posisi render smooth jika tersedia dari smoothRender()
    const x = tile.renderX !== undefined ? tile.renderX : tile.x;
    const y = tile.renderY !== undefined ? tile.renderY : tile.y;
    
    // 1. Frustum Culling (Disesuaikan untuk Zoom 1.5x)
    // Diberi buffer 1000px pada sisi horizontal karena drift diagonal 1.67
    // Ini mencegah tile "pop-out" (hilang mendadak) di pinggir layar iPad
    if (y > this.canvas.height + 500 || y + h < -500) return;
    if (x > this.canvas.width + 1000 || x + w < -1000) return;
    
    // 2. Pixel Perfect Position
    // Menggunakan Math.floor untuk koordinat agar tidak terjadi blur pada layar Retina
    const drawX = Math.floor(x);
    const drawY = Math.floor(y);
    
    // 3. Seamless Stitching
    // Menambahkan +2 pada lebar dan tinggi untuk memastikan overlap visual yang sempurna
    this.ctx.drawImage(
      tile.asset,
      drawX,
      drawY,
      Math.ceil(w) + 2,
      Math.ceil(h) + 2
    );
  }

  // Draw all racers
  drawRacers(racers) {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00']; // Red, Green, Blue, Yellow
    
    for (let i = 0; i < racers.length; i++) {
      const racer = racers[i];
      if (!racer.asset || racer.finished) continue;
      
      // Use Math.floor for crisp rendering
      const drawX = Math.floor(racer.x);
      const drawY = Math.floor(racer.y);
      
      this.ctx.drawImage(
        racer.asset,
        drawX,
        drawY,
        racer.w,
        racer.h
      );
      
      // Draw colored indicator border
      this.ctx.strokeStyle = colors[i] || '#ffffff';
      this.ctx.lineWidth = 8;
      this.ctx.strokeRect(drawX, drawY, racer.w, racer.h);
      
      // Draw racer index
      this.ctx.fillStyle = colors[i] || '#ffffff';
      this.ctx.font = 'bold 32px Arial';
      this.ctx.fillText(i.toString(), drawX + 10, drawY + 40);
    }
  }

  // Merender semua tile track dengan urutan kedalaman (back to front)
  render(track, racers = []) {
    if (!track || !track.tiles) return;

    // Pastikan pixel tetap tajam setiap frame (penting untuk iPad browser)
    this.ctx.imageSmoothingEnabled = false;
    
    this.clear();
    
    // Tiles are already sorted during generate() - no need to sort every frame
    for (const tile of track.tiles) {
      // Mengirimkan dimensi zoomed (WIDTH/HEIGHT) ke fungsi drawTile
      this.drawTile(tile, track.WIDTH, track.HEIGHT);
    }
    
    // Draw racers on top of track
    this.drawRacers(racers);
  }
}
