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
    
    // Dynamic AI - competitive organic movement
    this.baseSpeed = 100 + Math.random() * 1500;
    this.targetSpeed = this.baseSpeed;
    this.currentSpeed = this.baseSpeed;
    this.lastSpeedChange = 0;
    
    // Oscillation for natural movement
    this.sinOffset = Math.random() * Math.PI * 2;
    this.oscillationFrequency = 0.5 + Math.random(); // 0.5 to 1.5
    
    this.finished = false;
    this.finishTime = 0;
  }
  
  // Update racer - competitive organic movement
  update(trackSpeed, dt, allRacers) {
    if (this.finished) return;
    
    // Stronger oscillating bonus for more competition
    const bonus = Math.sin(Date.now() * 0.002 * this.oscillationFrequency + this.sinOffset) * 40;
    
    // Competitive zone - middle 70% of screen
    const screenHeight = 1800;
    const topZone = screenHeight * 0.15;
    const bottomZone = screenHeight * 0.85;
    const midZone = screenHeight * 0.5;
    
    if (this.yPosOnScreen > bottomZone) {
      // Behind - strong catchup boost
      this.targetSpeed = this.baseSpeed * 1.4;
    } else if (this.yPosOnScreen < topZone) {
      // Leading - slight slowdown
      this.targetSpeed = this.baseSpeed * 0.8;
    } else if (this.yPosOnScreen < midZone) {
      // Top half - moderate speed
      this.targetSpeed = this.baseSpeed + bonus * 0.5;
    } else {
      // Bottom half - push forward
      this.targetSpeed = this.baseSpeed * 1.2 + bonus * 0.3;
    }
    
    // Add competition bonus - random bursts
    if (Math.random() < 0.02) {
      this.targetSpeed *= 1.3;
    }
    
    // LERP for smooth acceleration
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.08;
    
    // Y moves forward (toward finish line at Y=7450)
    this.yPosOnScreen += this.currentSpeed * dt / 20000;
   
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
    
    // Reset dynamic AI - competitive
    this.baseSpeed = 100 + Math.random() * 1500;
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
