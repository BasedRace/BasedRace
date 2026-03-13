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
    this.state = 'waiting';
    this.raceTime = 0;
    this.lastTime = 0;
    
    this.track = null;
    this.assets = {};
    this.uiAssets = {};
    this.racers = [];
    this.countdownValue = 3;

    window.gameInstance = this;

    window.addEventListener('message', (event) => {
      if (event.data.type === 'startRace') {
        this.prepareRace(event.data.data);
      }
    });
    
    // Initial render even when waiting
    this.loop(performance.now());
  }

  async prepareRace(data) {
    await this.loadTrackAssets(data.track);
    await this.loadUIAssets();
    await this.startRaceWithData(data.finalRaceGrid);
  }

  async loadUIAssets() {
    const uiAssetNames = ['lights_off.webp', 'lights_red.webp', 'lights_yellow.webp', 'lights_green.webp'];
    const uiPromises = uiAssetNames.map(fileName => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = `/assets/lights/${fileName}`;
            img.onload = () => {
                this.uiAssets[fileName.split('.')[0]] = img;
                resolve();
            };
            img.onerror = () => {
                console.error(`Failed to load: ${fileName}`);
                resolve();
            };
        });
    });
    await Promise.all(uiPromises);
  }

  async loadTrackAssets(trackConfig) {
    const trackPromises = trackConfig.segments.map(segment => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = `${trackConfig.basePath}${segment}`;
        img.onload = () => {
          this.assets[segment.split('.')[0]] = img;
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load: ${segment}`);
          resolve();
        };
      });
    });

    await Promise.all(trackPromises);
    this.track = new Track(this.assets);
    this.track.generate(); // Generate a default track view
  }

  async startRaceWithData(finalRaceGrid) {
    this.racers = [];
    
    const racerPromises = finalRaceGrid.map((racerData, index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = racerData.image;
        img.onload = () => {
          const racer = new Racer(index, racerData.name, img, index, this.track, racerData.isPlayer);
          this.racers.push(racer);
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load image for racer: ${racerData.name}`);
          const racer = new Racer(index, racerData.name, null, index, this.track, racerData.isPlayer)
          this.racers.push(racer);
          resolve();
        };
      });
    });

    await Promise.all(racerPromises);
    this.startRace();
  }

  startRace() {
    document.getElementById('winner-text').style.display = 'none';
    document.getElementById('back-btn').style.display = 'none';

    if (this.state === 'racing' || this.state === 'countdown') return;
    
    this.raceTime = 0;
    this.winner = null;
    this.lastTime = performance.now();
    this.countdownValue = 3;
    
    const preScrollOffset = this.scrollSpeed * 1.25;
    this.track.generateWithPreScroll(preScrollOffset);
    
    for (const racer of this.racers) {
      racer.reset();
    }

    this.state = 'countdown';
    this.countdownInterval = setInterval(() => {
        this.countdownValue--;
        if (this.countdownValue === 0) {
            this.state = 'racing';
            clearInterval(this.countdownInterval);
        }
    }, 1000);
  }

  update(deltaTime) {
    if (this.state === 'countdown') {
        // Subtle vibration for racers
        if (this.countdownValue <= 2) {
            for (const racer of this.racers) {
                racer.x += (Math.random() - 0.5) * 2;
            }
        }
        return;
    }
    if (this.state !== 'racing') return;
    
    this.raceTime += deltaTime / 1000;
    
    const movement = this.scrollSpeed * deltaTime / 1000;
    this.track.updateMovement(movement);
    
    for (const racer of this.racers) {
      racer.update(movement, deltaTime, this.track);
      if (racer.finished && !this.winner) {
        this.winner = racer;
        this.showWinnerUI(racer);
        window.parent.postMessage({ type: 'raceResult', winner: racer.name, isUserWinner: racer.isPlayer }, '*');
      }
    }
    
    const lastTile = this.track.tiles[this.track.tiles.length - 1];
    if (lastTile && lastTile.y < 600) {
      this.finishRace();
    }
  }

  finishRace() {
    this.state = 'finished';
    if (!this.winner) {
        document.getElementById('back-btn').style.display = 'block';
    }
  }

  showWinnerUI(winner) {
    const winnerEl = document.getElementById('winner-text');
    winnerEl.textContent = `🏆 ${winner.name} WINS! 🏆`;
    winnerEl.style.display = 'block';
    this.renderer.startConfetti();
    setTimeout(() => {
        winnerEl.style.display = 'none';
        document.getElementById('back-btn').style.display = 'block';
    }, 4000);
  }

  render() {
    this.renderer.render(this.track, this.racers);
    if (this.state === 'countdown') {
        let text = '';
        let image = this.uiAssets.lights_off;
        if (this.countdownValue === 3) {
            text = 'READY';
            image = this.uiAssets.lights_red;
        } else if (this.countdownValue === 2) {
            text = 'SET';
            image = this.uiAssets.lights_yellow;
        } else if (this.countdownValue === 1) {
            text = 'GO!';
            image = this.uiAssets.lights_green;
        }
        this.renderer.drawStartLights(image, text);
    }
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    // Always render, even if waiting
    if (this.track) {
        this.render();
    }

    if ((this.state === 'racing' || this.state === 'countdown') && deltaTime < 1000) {
      this.update(deltaTime);
    }
    
    requestAnimationFrame((t) => this.loop(t));
  }
}

document.addEventListener('DOMContentLoaded', () => new Game());