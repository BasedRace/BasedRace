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
    const totalLaneWidth = (4 - 1) * laneSpacing;
    const trackCenterX = 600; // Center of 1200px canvas
    // Center each racer in its lane
    this.laneOffsetX = trackCenterX - (totalLaneWidth / 2) + (laneIndex * laneSpacing) - (this.w / 2);
    
    // Initial positions (from debugger) - adjusted for track's initial Y offset (-550)
    // Track offset: Y = -550, X offset = 550 * 1.67 = 918.5
    const trackOffsetY = 550;
    const trackOffsetX = 550 * 1.67;
    
    if (name === 'Jesse') { this.initialX = -45 + trackOffsetX; this.x = -45 + trackOffsetX; this.y = -45 + trackOffsetY; }
    if (name === 'Barmstrong') { this.initialX = 195 + trackOffsetX; this.x = 195 + trackOffsetX; this.y = 135 + trackOffsetY; }
    if (name === 'Deployer') { this.initialX = 475 + trackOffsetX; this.x = 475 + trackOffsetX; this.y = 265 + trackOffsetY; }
    if (name === 'Dish') { this.initialX = 795 + trackOffsetX; this.x = 795 + trackOffsetX; this.y = 535 + trackOffsetY; }
    
    // Random speed for variety (50 to 150)
    const speedOptions = [50, 75, 100, 125];
    this.racingSpeed = speedOptions[laneIndex] || 100;
    this.finished = false;
    this.finishTime = 0;
  }
  
  // Update racer position - strictly locked to 1.67 diagonal ratio (rails system)
  update(trackSpeed, trackRatio, dt) {
    if (this.finished) return;
    
    // Small random variance each frame for natural overtaking
    const speedVariance = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    
    // Total vertical delta = track scroll + racer driving speed
    const totalYDelta = (trackSpeed + (this.racingSpeed * speedVariance)) * (dt / 1000);
    
    // Move vertically
    this.y -= totalYDelta;
    
    // Rail equation: X moves proportionally to Y with 1.67 ratio
    // Start from initial X and add delta-movement × ratio + lane offset
    this.x = this.initialX + (totalYDelta * 1.67) + this.laneOffsetX;
    
    // Boundary safety: clamp Y to stay on screen
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
    // Set initial positions per racer - adjusted for track's initial offset
    const trackOffsetY = 550;
    const trackOffsetX = 550 * 1.67;
    
    if (this.name === 'Jesse') { this.initialX = -45 + trackOffsetX; this.x = -45 + trackOffsetX; this.y = -45 + trackOffsetY; }
    if (this.name === 'Barmstrong') { this.initialX = 195 + trackOffsetX; this.x = 195 + trackOffsetX; this.y = 135 + trackOffsetY; }
    if (this.name === 'Deployer') { this.initialX = 475 + trackOffsetX; this.x = 475 + trackOffsetX; this.y = 265 + trackOffsetY; }
    if (this.name === 'Dish') { this.initialX = 795 + trackOffsetX; this.x = 795 + trackOffsetX; this.y = 535 + trackOffsetY; }
    
    // Reset racing speed
    const speedOptions = [50, 75, 100, 125];
    this.racingSpeed = speedOptions[this.laneIndex] || 100;
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
