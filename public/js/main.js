// js/main.js - Entry point game Based Race

import { Track, Racer } from './entities.js';
import { Renderer } from './renderer.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.canvas.width = 1200;
    this.canvas.height = 1800;
    
    this.renderer = new Renderer(this.canvas);
    
    this.scrollSpeed = 400;
    this.state = 'loading';
    this.raceTime = 0;
    this.lastTime = 0;
    
    this.track = null;
    this.assets = {};
    
    window.gameInstance = this;
    
    this.init();
  }

  async init() {
    await this.loadAssets();
    
    this.track = new Track(this.assets);
    
    this.racers = [
      new Racer(0, 'Jesse', this.assets['jesse'], 0, this.track),
      new Racer(1, 'Barmstrong', this.assets['barmstrong'], 1, this.track),
      new Racer(2, 'Deployer', this.assets['deployer'], 2, this.track),
      new Racer(3, 'Dish', this.assets['dish'], 3, this.track)
    ];
    
    const preScrollOffset = this.scrollSpeed * 1.25;
    this.track.generateWithPreScroll(preScrollOffset);
    
    this.renderer.render(this.track, this.racers);
    
    this.startRace();
    
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  async loadAssets() {
    const assetNames = ['env2', 'start', 'env1', 'finish'];
    const racerNames = ['jesse', 'barmstrong', 'deployer', 'dish'];
    const version = 'v1.0.0';

    const trackPromises = assetNames.map(name => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = `/assets/tracks/base-forest/${name}.png?v=${version}`;
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

    const racerPromises = racerNames.map(name => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = `/assets/character/${name.toLowerCase()}.png?v=${version}`;
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

    await Promise.all([...trackPromises, ...racerPromises]);
  }

  startRace() {
    if (this.state === 'racing') return;
    this.state = 'racing';
    window.parent.postMessage({ type: 'raceState', state: 'started' }, '*');
    this.raceTime = 0;
    this.winner = null;
    this.lastTime = performance.now();
    
    const preScrollOffset = this.scrollSpeed * 1.25;
    this.track.generateWithPreScroll(preScrollOffset);
    
    for (const racer of this.racers) {
      racer.reset();
    }
    
    this.renderer.render(this.track, this.racers);
  }

  update(deltaTime) {
    if (this.state !== 'racing') return;
    
    this.raceTime += deltaTime / 1000;
    
    const movement = this.scrollSpeed * deltaTime / 1000;
    this.track.updateMovement(movement);
    
    for (const racer of this.racers) {
      racer.update(movement, deltaTime, this.track);
      if (racer.finished && !this.winner) {
        this.winner = racer;
        this.showWinnerUI(racer.name);
      }
    }
    
    const lastTile = this.track.tiles[this.track.tiles.length - 1];
    if (lastTile && lastTile.y < 600) {
      this.finishRace();
    }
  }

  finishRace() {
    this.state = 'finished';
    window.parent.postMessage({ type: 'raceState', state: 'finished' }, '*');
    document.getElementById('back-btn').style.display = 'block';
    document.getElementById('winner-text').style.display = 'none';
  }

  showWinnerUI(winnerName) {
    const winnerEl = document.getElementById('winner-text');
    winnerEl.textContent = `🏆 ${winnerName} WINS! 🏆`;
    winnerEl.style.display = 'block';
    this.renderer.startConfetti();
  }

  render() {
    this.renderer.render(this.track, this.racers);
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    if (deltaTime < 1000) {
      this.update(deltaTime);
      if (this.state === 'racing') {
        this.render();
      }
    }
    
    requestAnimationFrame((t) => this.loop(t));
  }
}

document.addEventListener('DOMContentLoaded', () => new Game());
