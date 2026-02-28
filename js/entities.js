// js/entities.js - Track class dengan Auto-Center Logic

// Racer class for autonomous 4-racer system
export class Racer {
  constructor(id, name, asset, laneIndex, track) {
    this.id = id;
    this.name = name;
    this.asset = asset;
    this.laneIndex = laneIndex;
    this.track = track;
    this.w = 600;
    this.h = 600;
    
    // Starting positions from user
    const startPositions = {
      'Jesse': { x: -90, y: -30 },
      'Barmstrong': { x: 190, y: 150 },
      'Deployer': { x: 470, y: 270 },
      'Dish': { x: 820, y: 550 }
    };
    
    const pos = startPositions[name] || { x: 0, y: 0 };
    this.startX = pos.x;
    this.startY = pos.y;
    this.x = pos.x;
    this.yPosOnScreen = pos.y;
    
    // Progress tracking
    this.progress = 0;
    
    // Unique racing speed for random winner
    this.racingSpeed = 80 + Math.random() * 80;
    this.finished = false;
    this.finishTime = 0;
  }
  
  // Update racer - progress-based with 1.67 diagonal lock
  update(trackSpeed, dt) {
    if (this.finished) return;
    
    // Progress = track movement + racing speed
    this.progress += trackSpeed + (this.racingSpeed * dt / 1000);
    
    // Calculate positions from progress
    this.yPosOnScreen = this.startY - this.progress;
    this.x = this.startX + (this.progress * 1.67);
    
    // Boundary clamp
    if (this.yPosOnScreen < -500) this.yPosOnScreen = -500;
    if (this.yPosOnScreen > 2000) this.yPosOnScreen = 2000;
  }
  
  // Reset to start
  reset() {
    const startPositions = {
      'Jesse': { x: -90, y: -30 },
      'Barmstrong': { x: 190, y: 150 },
      'Deployer': { x: 470, y: 270 },
      'Dish': { x: 820, y: 550 }
    };
    const pos = startPositions[this.name] || { x: 0, y: 0 };
    this.startX = pos.x;
    this.startY = pos.y;
    this.x = pos.x;
    this.yPosOnScreen = pos.y;
    this.progress = 0;
    this.racingSpeed = 80 + Math.random() * 80;
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
