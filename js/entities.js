// js/entities.js - Track class dengan Auto-Center Logic
export class Track {
  constructor(assets) {
    this.assets = assets;
    this.tiles = [];
    
    // 1. Zoom Factor - 1.5x agar rumput di samping aspal cukup lebar
    this.ZOOM_FACTOR = 1.5; 
    this.WIDTH = 1200 * this.ZOOM_FACTOR; // 1800px
    this.HEIGHT = 1800 * this.ZOOM_FACTOR; // 2700px
    
    // 2. Konfigurasi diagonal
    this.OFFSET_X_RATIO = 1.67; 
    
    // 3. Jarak antar tile - Gunakan nilai besar (1700-1900) untuk aset 2000px
    // Jika masih ada celah, kurangi angka ini sedikit demi sedikit
    this.CHAIN_HEIGHT = 1850; 
    
    // 4. Initial X - Dihitung agar aspal tile pertama ada di tengah
    this.initialX = -(this.WIDTH / 2) + 600;

    this.sequence = ['env2', 'start', 'env1', 'env2', 'env1', 'env2', 'env1', 'env2', 'env1', 'env2', 'finish', 'env2'];
  }

  generate() {
    this.tiles = [];
    let currentX = this.initialX;
    let currentY = 0;
    
    for (let i = 0; i < this.sequence.length; i++) {
      const assetName = this.sequence[i];
      this.tiles.push({
        asset: this.assets[assetName],
        name: assetName,
        x: currentX,
        y: currentY,
        w: this.WIDTH,
        h: this.HEIGHT
      });
      
      // Update koordinat untuk tile berikutnya (berantai)
      currentY = currentY + this.CHAIN_HEIGHT;
      currentX = currentX - (this.CHAIN_HEIGHT * this.OFFSET_X_RATIO);
    }
    return this.tiles;
  }

  updateMovement(speed) {
    for (const tile of this.tiles) {
      tile.y -= speed; 
      tile.x += speed * this.OFFSET_X_RATIO;
    }
  }

  reset() { this.generate(); }
  getFinishTile() { return this.tiles.find(t => t.name === 'finish'); }
}
