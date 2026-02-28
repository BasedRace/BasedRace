// js/main.js - Entry point game Based Race

import { Track } from './entities.js';
import { Renderer } from './renderer.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    // Resolusi layar tetap 1200x1800
    this.canvas.width = 1200;
    this.canvas.height = 1800;
    
    this.renderer = new Renderer(this.canvas);
    
    this.timerEl = document.getElementById('timer');
    this.statusEl = document.getElementById('status');
    this.startBtn = document.getElementById('start-btn');
    this.restartBtn = document.getElementById('restart-btn');
    
    this.scrollSpeed = 400; // Kecepatan disesuaikan untuk skala zoom 1.5x
    this.state = 'loading';
    this.raceTime = 0;
    this.lastTime = 0;
    
    this.track = null;
    this.assets = {};
    
    window.gameInstance = this;
    
    this.init();
  }

  async init() {
    this.statusEl.textContent = 'Loading...';
    await this.loadAssets();
    
    this.track = new Track(this.assets);
    
    this.startBtn.addEventListener('click', () => this.startRace());
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => this.reset());
    }
    
    this.setupDebugControls();
    
    // Pre-Scroll: Apply 1.25s offset so track is already positioned before menu shows
    const preScrollOffset = this.scrollSpeed * 1.25;
    this.track.generateWithPreScroll(preScrollOffset);
    this.renderer.render(this.track);
    
    this.state = 'ready';
    this.statusEl.textContent = '';
    this.startBtn.style.display = 'block';
    
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  async loadAssets() {
    const assetNames = ['env2', 'start', 'env1', 'finish'];
    const version = Date.now(); // Cache busting
    const promises = assetNames.map(name => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = `assets/${name}.png?v=${version}`;
        img.onload = () => {
          this.assets[name] = img;
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load: ${name}`);
          resolve();
        };
      });
    });
    await Promise.all(promises);
  }

  startRace() {
    if (this.state === 'racing') return;
    this.state = 'racing';
    this.raceTime = 0;
    this.lastTime = performance.now(); // Reset delta time to prevent time spike
    
    // Re-apply pre-scroll offset after reset
    const preScrollOffset = this.scrollSpeed * 1.25;
    this.track.generateWithPreScroll(preScrollOffset);
    this.renderer.render(this.track);
    
    this.startBtn.style.display = 'none';
  }

  update(deltaTime) {
    if (this.state !== 'racing') return;
    
    this.raceTime += deltaTime / 1000;
    const mins = Math.floor(this.raceTime / 60);
    const secs = (this.raceTime % 60).toFixed(2);
    this.timerEl.textContent = `${String(mins).padStart(2, '0')}:${secs.padStart(5, '0')}`;
    
    const movement = this.scrollSpeed * deltaTime / 1000;
    this.track.updateMovement(movement);
    
    // Cek Finish - End race when last tile passes screen
    const lastTile = this.track.tiles[this.track.tiles.length - 1];
    if (lastTile && lastTile.y < 600) {
      this.finishRace();
    }
  }

  finishRace() {
    this.state = 'finished';
    this.statusEl.textContent = 'FINISH!';
    this.startBtn.textContent = 'RESTART';
    this.startBtn.style.display = 'block';
  }

  render() {
    // Memproses interpolasi smooth sebelum menggambar
    if (this.track.smoothRender) {
        this.track.smoothRender();
    }
    this.renderer.render(this.track);
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    if (deltaTime < 1000) {
      this.update(deltaTime);
    }
    
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  setupDebugControls() {
    const chainInput = document.getElementById('chain-height');
    const offsetInput = document.getElementById('offset-x-ratio');
    const zoomInput = document.getElementById('zoom-factor');
    const track = this.track;
    
    if (!track) return;

    const refreshTrack = () => {
        // Recalculate Width & Height based on Zoom
        track.WIDTH = 1200 * track.ZOOM_FACTOR;
        track.HEIGHT = 1800 * track.ZOOM_FACTOR;
        // Recalculate InitialX to keep it centered: $-(WIDTH / 2) + 600$
        track.initialX = -(track.WIDTH / 2) + 600;
        track.generate();
    };
    
    if (chainInput) {
      chainInput.value = track.CHAIN_HEIGHT;
      chainInput.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
          track.CHAIN_HEIGHT = value;
          refreshTrack();
        }
      });
    }

    if (offsetInput) {
      offsetInput.value = track.OFFSET_X_RATIO;
      offsetInput.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
          track.OFFSET_X_RATIO = value;
          refreshTrack();
        }
      });
    }
    
    if (zoomInput) {
      zoomInput.value = track.ZOOM_FACTOR;
      zoomInput.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value > 0) {
          track.ZOOM_FACTOR = value;
          refreshTrack();
          console.log('ZOOM_FACTOR updated:', track.ZOOM_FACTOR);
        }
      });
    }
    
    document.addEventListener('keydown', (e) => {
      if (!this.track) return;
      let changed = false;
      if (e.key === 'ArrowUp') { this.track.CHAIN_HEIGHT += 2; changed = true; }
      if (e.key === 'ArrowDown') { this.track.CHAIN_HEIGHT -= 2; changed = true; }
      if (e.key === 'ArrowRight') { this.track.OFFSET_X_RATIO += 0.005; changed = true; }
      if (e.key === 'ArrowLeft') { this.track.OFFSET_X_RATIO -= 0.005; changed = true; }
      
      if (changed) refreshTrack();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new Game());
