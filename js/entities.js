// js/entities.js - Track class dengan Auto-Center Logic

// Racer class for autonomous 4-racer system
export class Racer {
  constructor(id, name, asset, laneIndex, track) {
    this.id = id;
    this.name = name;
    this.asset = asset;
    this.laneIndex = laneIndex;
    this.track = track;
    this.w = 80; // Racer width
    this.h = 120; // Racer height
    
    // Calculate lane position - 4 lanes, ~160px spacing, centered on track
    const laneSpacing = 160;
    const totalLaneWidth = (4 - 1) * laneSpacing;
    const trackCenterX = 600; // Center of 1200px canvas
    this.laneOffsetX = trackCenterX - (totalLaneWidth / 2) + (laneIndex * laneSpacing) - (this.w / 2);
    
    // Initial position (at start line)
    this.x = this.laneOffsetX;
    this.y = -200; // Slightly above start line
    
    // Random speed boost for variety
    this.speedBoost = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    this.finished = false;
    this.finishTime = 0;
  }
  
  // Update racer position - synced with diagonal track ratio
  update(speed, deltaTime) {
    if (this.finished) return;
    
    const movement = speed * deltaTime / 1000 * this.speedBoost;
    
    // Diagonal movement: y decreases, x increases by ratio
    this.y -= movement;
    this.x += movement * this.track.OFFSET_X_RATIO;
  }
  
  // Apply pre-scroll offset
  applyOffset(offset) {
    this.y -= offset;
    this.x += offset * this.track.OFFSET_X_RATIO;
  }
  
  // Reset to start position
  reset() {
    this.x = this.laneOffsetX;
    this.y = -200;
    this.speedBoost = 0.9 + Math.random() * 0.2;
    this.finished = false;
    this.finishTime = 0;
  }
}
export class Track {
  constructor(assets) {
    this.assets = assets;
    this.tiles = [];
    
    // 1. Zoom Factor
    this.ZOOM_FACTOR = 1.61; 
    this.WIDTH = 1200 * this.ZOOM_FACTOR; // 1932px
    this.HEIGHT = 1800 * this.ZOOM_FACTOR; // 2898px
    
    // 2. Konfigurasi diagonal
    this.OFFSET_X_RATIO = 1.67; 
    
    // 3. Jarak antar tile
    this.CHAIN_HEIGHT = 800; 
    
    // 4. Initial X - Dihitung agar aspal tile pertama ada di tengah
    this.initialX = -(this.WIDTH / 2) + 600;

    this.sequence = ['env2', 'start', 'env1', 'env2', 'env1', 'env2', 'env1', 'env2', 'env1', 'env2', 'finish', 'env2', 'env2', 'env2'];
  }

  generate() {
    this.tiles = [];
    let currentX = this.initialX;
    let currentY = -550;
    
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
    
    // Sort once during generation for depth ordering
    this.tiles.sort((a, b) => a.y - b.y);
    return this.tiles;
  }

  // Generate and apply pre-scroll atomically
  generateWithPreScroll(preScrollOffset) {
    this.generate();
    this.updateMovement(preScrollOffset);
    // Re-sort after movement to maintain depth order
    this.tiles.sort((a, b) => a.y - b.y);
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
