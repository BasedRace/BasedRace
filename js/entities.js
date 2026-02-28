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
    
    // Calculate lane position - 4 lanes centered on track
    const laneSpacing = 200;
    const trackCenterX = 600; // Center of 1200px canvas
    this.laneOffsetX = (laneIndex * laneSpacing);
    
    // Random racing speed for each racer (50-150)
    this.racingSpeed = 50 + Math.random() * 100;
    this.finished = false;
    this.finishTime = 0;
    
    // Initialize position
    this.initializePosition(1000); // Start at y=1000 (visible on screen)
  }
  
  initializePosition(startY) {
    // Track is offset by -550
    const trackOffsetY = 550;
    const trackOffsetX = 550 * 1.67;
    
    // Calculate Y relative to track offset
    const relativeY = startY - trackOffsetY;
    
    // Base X = center of canvas - half racer width + lane offset
    const baseX = 600 - (this.w / 2) + this.laneOffsetX;
    
    // Add diagonal shift based on Y position
    const diagonalShift = relativeY * 1.67;
    
    this.y = startY;
    this.x = baseX + diagonalShift + trackOffsetX;
    this.initialX = this.x;
    this.initialY = startY;
  }
  
  // Update racer position - strictly locked to 1.67 diagonal ratio
  update(trackSpeed, trackRatio, dt) {
    if (this.finished) return;
    
    // Small random variance each frame for natural overtaking
    const speedVariance = 0.9 + Math.random() * 0.2;
    
    // Total movement = track scroll + racing speed
    const totalMoveY = (trackSpeed + (this.racingSpeed * speedVariance)) * (dt / 1000);
    
    // Move vertically
    this.y -= totalMoveY;
    
    // Lock X to diagonal slope: X changes proportionally to Y movement
    const relativeY = this.y - 550; // Relative to track offset
    const baseX = 600 - (this.w / 2) + this.laneOffsetX;
    this.x = baseX + (relativeY * 1.67) + 550 * 1.67;
    
    // Boundary safety: clamp Y to stay visible
    if (this.y < -500) this.y = -500;
    if (this.y > 2000) this.y = 2000;
  }
  
  // Apply pre-scroll offset (disable for now - use debugger positions directly)
  applyOffset(offset) {
    // Disabled - use debugger positions directly
    // this.y -= offset;
    // this.x += offset * this.track.OFFSET_X_RATIO;
  }
  
  // Reset to start position
  reset() {
    // Re-initialize position at y=1000 (visible on screen)
    this.initializePosition(1000);
    
    // Randomize racing speed for unpredictable winner
    this.racingSpeed = 50 + Math.random() * 100;
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
