// js/entities.js - Track class dengan Auto-Center Logic

// Global race distance
const TOTAL_RACE_DISTANCE = 7500;
const FINISH_DISTANCE = 15500;

// Racer class for autonomous 4-racer system
export class Racer {
  constructor(id, name, asset, laneIndex, track, isPlayer, isWinner = false) {
    this.id = id;
    this.name = name;
    this.asset = asset;
    this.laneIndex = laneIndex;
    this.track = track;
    this.isPlayer = isPlayer;
    this.isWinner = isWinner;
    this.w = 600;
    this.h = 600;
    
    // Starting positions from user
    const startPositions = [
        { x: -70, y: -10 },
        { x: 200, y: 170 },
        { x: 500, y: 360 },
        { x: 800, y: 550 }
    ];
    
    const pos = startPositions[laneIndex] || { x: 0, y: 0 };
    this.startX = pos.x;
    this.startY = pos.y;
    this.x = pos.x;
    this.yPosOnScreen = pos.y;
    
    // Diagonal ratio
    this.diagonalRatio = -1.67;
    
    // Progress tracking - distance traveled
    this.progress = 0;
    
    // Dynamic AI - competitive organic movement
    if (this.isWinner) {
      this.baseSpeed = 0.85 + Math.random() * 0.2; // 0.85 to 1.05
    } else {
      this.baseSpeed = 0.3 + Math.random() * 0.3; // 0.3 to 0.6
    }
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
  update(trackSpeed, dt, track) {
    if (this.finished) return;
    
    // Check current provisional distance
    const currentDistance = (track.totalScroll + (this.yPosOnScreen - this.startY)) * 1.95;
    const distanceLeft = FINISH_DISTANCE - currentDistance;
    
    // Add oscillation bonus
    let bonus = Math.sin(Date.now() * 0.002 * this.oscillationFrequency + this.sinOffset) * 10;
    
    // --- RIGGING LOGIC (HALUS & NATURAL) ---
    if (this.isWinner) {
        if (distanceLeft < 6000) {
            // Winner gets a smooth "Second Wind" momentum for the final stretch
            this.baseSpeed = Math.max(this.baseSpeed, 1.5); 
        }
    } else {
        if (distanceLeft < 4000) {
            // Losers experience "Engine Fatigue" (lose top speed naturally)
            this.baseSpeed = Math.min(this.baseSpeed, 0.2);
            // Cap positive random leaps so they don't accidentally cross first
            bonus = Math.min(bonus, 0); 
        }
    }
    
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
    
    // Calculate total distance using track scroll as master odometer
    const finalDistance = (track.totalScroll + (this.yPosOnScreen - this.startY)) * 1.95;
    
    // Check if racer crossed finish line using track odometer
    if (finalDistance >= FINISH_DISTANCE && !this.finished) {
      this.finished = true;
      this.finishTime = Date.now();
    }
  }
  
  // Reset to start
  reset() {
    const startPositions = [
        { x: -70, y: -10 },
        { x: 200, y: 170 },
        { x: 500, y: 360 },
        { x: 800, y: 550 }
    ];
    const pos = startPositions[this.laneIndex] || { x: 0, y: 0 };
    this.startX = pos.x;
    this.startY = pos.y;
    this.x = pos.x;
    this.yPosOnScreen = pos.y;
    this.progress = 0;
    
    // Reset dynamic AI
    if (this.isWinner) {
      this.baseSpeed = 0.85 + Math.random() * 0.2;
    } else {
      this.baseSpeed = 0.3 + Math.random() * 0.3;
    }
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
    
    // Total scroll accumulator (master odometer)
    this.totalScroll = 0;
  }

  generate() {
    this.tiles = [];
    this.totalScroll = 0; // Reset odometer
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
    // Accumulate total scroll
    this.totalScroll += speed;
    
    for (const tile of this.tiles) {
      tile.y -= speed; 
      tile.x += speed * this.OFFSET_X_RATIO;
    }
  }

  reset() { this.generate(); }
  getFinishTile() { return this.tiles.find(t => t.name === 'finish'); }
}
