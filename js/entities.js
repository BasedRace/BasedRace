// js/entities.js - Track class dengan Auto-Center Logic

// Racer class for autonomous 4-racer system
export class Racer {
  constructor(id, name, asset, laneIndex, track) {
    this.id = id;
    this.name = name;
    this.asset = asset;
    this.laneIndex = laneIndex;
    this.track = track;
    this.w = 600; // Racer width
    this.h = 600; // Racer height
    
    // Lane offset for 4 parallel lanes
    this.laneOffsetX = laneIndex * 200;
    
    // Random racing speed (60-120) for balanced racing
    this.racingSpeed = 60 + Math.random() * 60;
    this.finished = false;
    this.finishTime = 0;
    
    // Set initial position from debugger
    this.setInitialPosition();
  }
  
  setInitialPosition() {
    // Positions from debugger
    const positions = {
      'Jesse': { x: -45, y: -45 },
      'Barmstrong': { x: 195, y: 135 },
      'Deployer': { x: 475, y: 265 },
      'Dish': { x: 795, y: 535 }
    };
    
    const pos = positions[this.name] || { x: 0, y: 0 };
    this.x = pos.x;
    this.y = pos.y;
  }
  
  // Update racer position - locked to 1.67 diagonal slope
  update(trackSpeed, dt) {
    if (this.finished) return;
    
    // Total movement = track scroll + racing speed
    const totalDelta = (trackSpeed + this.racingSpeed) * (dt / 1000);
    
    // Move Y
    this.y -= totalDelta;
    
    // Lock X to same delta - mathematically locked to 1.67 slope
    this.x += totalDelta * 1.67;
    
    // Boundary clamp
    if (this.y < -500) this.y = -500;
    if (this.y > 2000) this.y = 2000;
  }
  
  // Reset to start position
  reset() {
    this.setInitialPosition();
    this.racingSpeed = 60 + Math.random() * 60;
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
