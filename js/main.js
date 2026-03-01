// js/main.js - Entry point game Based Race

import { Track, Racer } from './entities.js';
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
    
    // Create 4 racers
    this.racers = [
      new Racer(0, 'Jesse', this.assets['jesse'], 0, this.track),
      new Racer(1, 'Barmstrong', this.assets['barmstrong'], 1, this.track),
      new Racer(2, 'Deployer', this.assets['deployer'], 2, this.track),
      new Racer(3, 'Dish', this.assets['dish'], 3, this.track)
    ];
    
    this.startBtn.addEventListener('click', () => this.startRace());
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => this.reset());
    }
    
    
    // Expose moveRacer for debug buttons
    window.moveRacer = (racerIndex, direction) => {
      const game = window.gameInstance;
      if (!game || !game.racers || !game.racers[racerIndex]) return;
      const racer = game.racers[racerIndex];
      const step = 10;
      if (direction === 'up') racer.yPosOnScreen -= step;
      if (direction === 'down') racer.yPosOnScreen += step;
      if (direction === 'left') racer.x -= step;
      if (direction === 'right') racer.x += step;
      
      // Update coordinate display
      const coordEl = document.getElementById('racer' + racerIndex + '-coord');
      if (coordEl) {
        coordEl.textContent = '(' + Math.round(racer.x) + ', ' + Math.round(racer.yPosOnScreen) + ')';
      }
      
      game.renderer.render(game.track, game.racers);
    };
    
    // Pre-Scroll: Apply 1.25s offset so track is already positioned before menu shows
    const preScrollOffset = this.scrollSpeed * 1.25;
    this.track.generateWithPreScroll(preScrollOffset);
    
    this.renderer.render(this.track, this.racers);
    
    this.state = 'ready';
    this.statusEl.textContent = '';
    this.startBtn.style.display = 'block';
    
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  async loadAssets() {
    const assetNames = ['env2', 'start', 'env1', 'finish'];
    const racerNames = ['jesse', 'barmstrong', 'deployer', 'dish'];
    const allNames = [...assetNames, ...racerNames];
    const version = Date.now(); // Cache busting
    const promises = allNames.map(name => {
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
    this.winner = null; // Reset winner
    this.lastTime = performance.now(); // Reset delta time to prevent time spike
    
    // Re-apply pre-scroll offset after reset
    const preScrollOffset = this.scrollSpeed * 1.25;
    this.track.generateWithPreScroll(preScrollOffset);
    
    // Sync racers with pre-scroll offset
    for (const racer of this.racers) {
      racer.reset();
    }
    
    this.renderer.render(this.track, this.racers);
    
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
    
    // Update all racers and check for winner
    for (const racer of this.racers) {
      racer.update(movement, deltaTime, this.racers);
      
      // Check if any racer finished (progress >= TOTAL_RACE_DISTANCE)
      if (racer.finished && !this.winner) {
        this.winner = racer;
        this.showWinnerUI(racer.name);
      }
    }
    
    // Keep running until last tile passes screen
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

  // Show winner UI when a racer completes the race
  showWinnerUI(winnerName) {
    this.statusEl.textContent = `🏆 ${winnerName} WINS! 🏆`;
    this.statusEl.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:8vw;font-weight:bold;color:#FFD700;text-shadow:0 0 20px #FFD700,0 0 40px #FF6B00;white-space:nowrap;animation:pulse 0.3s ease-out;z-index:100;';
    this.renderer.startConfetti();
  }

  render() {
    // Memproses interpolasi smooth sebelum menggambar
    if (this.track.smoothRender) {
        this.track.smoothRender();
    }
    this.renderer.render(this.track, this.racers);
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

}

document.addEventListener('DOMContentLoaded', () => new Game());
