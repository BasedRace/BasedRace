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
      'Deployer': { x: 460, y: 300 },
      'Dish': { x: 790, y: 530 }
    };
    
    const pos = startPositions[name] || { x: 0, y: 0 };
    this.startX = pos.x;
    this.startY = pos.y;
    this.x = pos.x;
    this.yPosOnScreen = pos.y;
    
    // Diagonal ratio
    this.diagonalRatio = -1.67;
    
    // Progress tracking
    this.progress = 0;
    
    // Dynamic AI - base and target speed
    this.baseSpeed = 80 + Math.random() * 40;
    this.targetSpeed = this.baseSpeed;
    this.currentSpeed = this.baseSpeed;
    this.lastSpeedChange = 0;
    
    this.finished = false;
    this.finishTime = 0;
  }
  
  // Update racer - dynamic AI with rubber banding
  update(trackSpeed, dt, allRacers) {
    if (this.finished) return;
    
    // Change target speed every 2 seconds
    this.lastSpeedChange += dt;
    if (this.lastSpeedChange > 2000) {
      this.lastSpeedChange = 0;
      this.targetSpeed = this.baseSpeed + (Math.random() - 0.5) * 60;
    }
    
    // Rubber banding - adjust speed based on position
    if (allRacers && allRacers.length > 1) {
      const positions = allRacers.map(r => r.yPosOnScreen);
      const avgY = positions.reduce((a, b) => a + b, 0) / positions.length;
      
      // If ahead (lower Y), slow down; if behind, speed up
      if (this.yPosOnScreen < avgY - 100) {
        this.targetSpeed *= 0.95; // Slow down
      } else if (this.yPosOnScreen > avgY + 100) {
        this.targetSpeed *= 1.1; // Catch-up boost
      }
    }
    
    // Smooth speed transition
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.1;
    
    // Y moves based on current speed
    this.yPosOnScreen -= this.currentSpeed * dt / 25000;
   
    // X calculated from Y using diagonal ratio from start points
    this.x = this.startX + ((this.yPosOnScreen - this.startY) * this.diagonalRatio);
    
    // Boundary clamp
    if (this.yPosOnScreen < -500) this.yPosOnScreen = -500;
    if (this.yPosOnScreen > 2000) this.yPosOnScreen = 2000;
  }
  
  // Reset to start
  reset() {
    const startPositions = {
      'Jesse': { x: -90, y: -30 },
      'Barmstrong': { x: 190, y: 150 },
      'Deployer': { x: 460, y: 300 },
      'Dish': { x: 790, y: 530 }
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
