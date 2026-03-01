// js/entities.js - Track class dengan Auto-Center Logic

// Global race distance
const TOTAL_RACE_DISTANCE = 7500;
const FINISH_DISTANCE = 10;

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
    
    // Progress tracking - distance traveled
    this.progress = 0;
    
    // Dynamic AI - competitive organic movement
    this.baseSpeed = 0.3 + Math.random() * 0.7;
    this.targetSpeed = this.baseSpeed;
    this.currentSpeed = this.baseSpeed;
    this.lastSpeedChange = 0;
    
    // Oscillation for natural movement
    this.sinOffset = Math.random() * Math.PI * 2;
    this.oscillationFrequency = 0.5 + Math.random();
    
    this.finished = false;
    this.finishTime = 0;
  }
  
  // Update racer - progress-based movement
  update(trackSpeed, dt, allRacers) {
    if (this.finished) return;
    
    // Add oscillation bonus
    const bonus = Math.sin(Date.now() * 0.002 * this.oscillationFrequency + this.sinOffset) * 10;
    
    // Target speed with bonus
    this.targetSpeed = this.baseSpeed + bonus;
    
    // LERP for smooth acceleration
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.05;
    
    // Increase progress based on speed
    this.progress += this.currentSpeed * dt / 100;
    
    // Calculate Y position based on progress (moving forward)
    this.yPosOnScreen = this.startY + this.progress;
    
    // Calculate X based on diagonal ratio
    this.x = this.startX + (this.progress * this.diagonalRatio);
    
    // Calculate actual distance traveled from start position
    const distanceTraveled = Math.abs(this.yPosOnScreen - this.startY);
    
    // Check if racer crossed finish line
    if (distanceTraveled >= FINISH_DISTANCE && !this.finished) {
      this.finished = true;
      this.finishTime = Date.now();
    }
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
    
    // Reset dynamic AI
    this.baseSpeed = 0.3 + Math.random() * 0.7;
    this.targetSpeed = this.baseSpeed;
    this.currentSpeed = this.baseSpeed;
    this.sinOffset = Math.random() * Math.PI * 2;
    this.oscillationFrequency = 0.5 + Math.random();
    
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
    this.WIDTH = 1200 * this.ZOOM_FACTOR;
    this.HEIGHT = 1800 * this.ZOOM_FACTOR;
    
    // 2. Konfigurasi diagonal
    this.OFFSET_X_RATIO = 1.67; 
    
    // 3. Jarak antar tile
    this.CHAIN_HEIGHT = 800; 
    
    // 4. Initial X
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
      
      currentY = currentY + this.CHAIN_HEIGHT;
      currentX = currentX - (this.CHAIN_HEIGHT * this.OFFSET_X_RATIO);
    }
    
    this.tiles.sort((a, b) => a.y - b.y);
    return this.tiles;
  }

  generateWithPreScroll(preScrollOffset) {
    this.generate();
    this.updateMovement(preScrollOffset);
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
