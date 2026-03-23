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
    this.sounds = {};
    this.music = {};
    this.soundSources = {};
    this.musicSources = {};
    this.racers = [];
    this.countdownValue = 3;
    this.isAssetsLoaded = false;

    window.gameInstance = this;

    window.addEventListener('message', (event) => {
      if (event.data.type === 'startRace') {
        this.initGameSequence(event.data.data);
      }
    });
    
    // Initial render even when waiting
    this.loop(performance.now());
  }

  async initGameSequence(data) {
    if (this.state !== 'waiting') return;

    this.state = 'loading';
    this.stopAllSounds();
    
    // Show a loading message while assets are being fetched
    this.renderer.drawLoading();

    const loadPromises = [
        this.loadTrackAssets(data.track),
        this.loadUIAssets(),
        this.loadSounds(),
    ];

    await Promise.all(loadPromises);
    
    // Racer assets need the track to be loaded first
    await this.loadRacerAssets(data);

    this.isAssetsLoaded = true;
    this.startRace();
  }

  async loadSounds() {
    const audioAssetNames = ['beep.mp3', 'start_go.mp3', 'engine_loop.mp3', 'victory.mp3', 'ingamemusic.mp3'];
    audioAssetNames.forEach(fileName => {
        const name = fileName.split('.')[0];
        const audio = new Audio(`/assets/sounds/${fileName}`);
        audio.preload = 'auto'; // HTML5 Audio Preload
        if (name.includes('music')) {
            this.music[name] = audio;
        } else {
            this.sounds[name] = audio;
        }
    });
  }

  playSound(bufferName, loop = false, volume = 1.0) {
    if (this.sounds[bufferName]) {
        // Clone node for overlapping SFX (like multiple beeps)
        const audio = this.sounds[bufferName].cloneNode();
        audio.loop = loop;
        audio.volume = volume;
        audio.play().catch(e => console.log('SFX block:', e));
        
        // Track the actively loopable sounds so we can stop them (like engine_loop)
        if (loop || bufferName === 'engine_loop') {
            this.soundSources[bufferName] = audio;
        }
    }
  }

  playMusic(bufferName, loop = true, volume = 0.5) {
    if (this.music[bufferName]) {
        this.fadeOutMusic(0); // Stop old music instantly
        const audio = this.music[bufferName];
        audio.loop = loop;
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Music block:', e));
        this.musicSources[bufferName] = audio;
    }
  }

  stopSound(bufferName) {
    if (this.soundSources[bufferName]) {
      try {
        this.soundSources[bufferName].pause();
      } catch(e) {}
      delete this.soundSources[bufferName];
    }
  }

  stopAllSounds() {
    for (const soundName in this.soundSources) {
      if (this.soundSources.hasOwnProperty(soundName)) {
        this.stopSound(soundName);
      }
    }
    for (const musicName in this.musicSources) {
      if (this.musicSources.hasOwnProperty(musicName)) {
        try { 
            this.musicSources[musicName].pause(); 
        } catch(e) {}
      }
    }
    this.musicSources = {};
  }

  fadeOutMusic(duration = 2) {
    for (const musicName in this.musicSources) {
      if (this.musicSources.hasOwnProperty(musicName)) {
        try { 
            this.musicSources[musicName].pause(); 
        } catch(e) {}
      }
    }
    this.musicSources = {};
  }

  async loadUIAssets() {
    const uiAssetNames = ['lights_off.webp', 'relights_red.webp', 'lights_yellow.webp', 'lights_green.webp'];
    const uiPromises = uiAssetNames.map(fileName => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = `/assets/lights/${fileName}`;
            img.onload = () => {
                this.uiAssets[fileName.split('.')[0]] = img;
                resolve();
            };
            img.onerror = () => {
                console.error(`Failed to load: ${fileName}`);
                reject(`Failed to load: ${fileName}`);
            };
        });
    });
    await Promise.all(uiPromises);
  }

  async loadTrackAssets(trackConfig) {
    const trackPromises = trackConfig.segments.map(segment => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = `${trackConfig.basePath}${segment}`;
        img.onload = () => {
          this.assets[segment.split('.')[0]] = img;
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load: ${segment}`);
          reject(`Failed to load: ${segment}`);
        };
      });
    });

    await Promise.all(trackPromises);
    this.track = new Track(this.assets);
    this.track.generate(); // Generate a default track view
  }
  
  async loadRacerAssets(data) {
    const finalRaceGrid = data.finalRaceGrid;
    const winnerName = data.winnerName;
    console.log("🏁 [Game Engine] Received predetermined winner:", winnerName);

    this.racers = [];
    const racerPromises = finalRaceGrid.map((racerData, index) => {
      return new Promise((resolve) => {
        const isWinner = (racerData.name === winnerName);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = racerData.image;
        img.onload = () => {
          const racer = new Racer(index, racerData.name, img, index, this.track, racerData.isPlayer, isWinner);
          this.racers.push(racer);
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load image for racer: ${racerData.name}`);
          const racer = new Racer(index, racerData.name, null, index, this.track, racerData.isPlayer, isWinner);
          this.racers.push(racer);
          resolve(); // Resolve even on error to not block the game
        };
      });
    });

    await Promise.all(racerPromises);
  }

  startRace() {
    if (!this.isAssetsLoaded) {
        this.renderer.drawLoading(); // Keep showing loading if a start is attempted early
        return;
    }
    document.getElementById('winner-text').style.display = 'none';
    document.getElementById('back-btn').style.display = 'none';

    if (this.state === 'racing' || this.state === 'countdown') return;

    this.raceTime = 0;
    this.winner = null;
    this.lastTime = performance.now();
    
    const preScrollOffset = this.scrollSpeed * 1.25;
    this.track.generateWithPreScroll(preScrollOffset);
    
    for (const racer of this.racers) {
      racer.reset();
    }

    this.countdownValue = 3;
    this.state = 'countdown';

    // Play sound for Stage 3 (Red)
    this.playSound('beep', false, 0.6);

    this.countdownInterval = setInterval(() => {
        this.countdownValue--;
        if (this.countdownValue === 2) { // Stage 2 (Yellow)
            this.playSound('beep', false, 0.6);
        } else if (this.countdownValue === 1) { // Stage 1 (Green)
            this.playSound('start_go', false, 0.9);
            // Delay engine loop slightly using standard JS timeout, fallback to 1s if duration NaN
            const delayMs = (this.sounds.start_go.duration ? (this.sounds.start_go.duration - 0.3) : 0.7) * 1000;
            setTimeout(() => {
                if (this.state === 'countdown' || this.state === 'racing') {
                   this.playSound('engine_loop', true, 0.6);
                }
            }, delayMs);
        } else if (this.countdownValue < 0) {
            this.state = 'racing';
            this.playMusic('ingamemusic', true, 0.4);
            clearInterval(this.countdownInterval);
        }
    }, 1500); // Slower 1.5s countdown
  }

  update(deltaTime) {
    if (this.state === 'countdown') {
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
    this.stopSound('engine_loop');
    this.fadeOutMusic(2);
  }

  resetForNewRace() {
    this.state = 'waiting';
    document.getElementById('winner-text').style.display = 'none';
    document.getElementById('back-btn').style.display = 'none';

    if (this.renderer.stopConfetti) {
        this.renderer.stopConfetti();
    }

    this.stopAllSounds();

    window.parent.postMessage({ type: 'backToMenu' }, '*');
  }

  showWinnerUI(winner) {
    this.stopSound('engine_loop');
    this.playSound('victory', false, 0.7);
    this.fadeOutMusic(2);

    const winnerEl = document.getElementById('winner-text');
    winnerEl.textContent = `🏆 ${winner.name} WINS! 🏆`;
    winnerEl.style.display = 'block';
    this.renderer.startConfetti();
    
    setTimeout(() => {
        winnerEl.style.display = 'none';
        document.getElementById('back-btn').style.display = 'block';
        document.getElementById('back-btn').onclick = () => this.resetForNewRace();
    }, 4000);
  }

  render() {
    if (this.track) {
        this.renderer.render(this.track, this.racers);
    } else {
        this.renderer.clear();
    }
    
    if (this.state === 'loading') {
        this.renderer.drawLoading();
        return;
    }

    if (this.state === 'countdown') {
        let text = '';
        let image;
        if (this.countdownValue === 3) {
            text = 'READY';
            image = this.uiAssets.relights_red;
        } else if (this.countdownValue === 2) {
            text = 'SET';
            image = this.uiAssets.lights_yellow;
        } else if (this.countdownValue >= 0) { 
            text = 'GO!';
            image = this.uiAssets.lights_green;
        } else {
            image = this.uiAssets.lights_off;
        }
        this.renderer.drawStartLights(image, text);
    }
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (this.state !== 'waiting') {
        this.update(deltaTime > 1000 ? 16 : deltaTime);
    }
    
    this.render();
    
    requestAnimationFrame((t) => this.loop(t));
  }
}

document.addEventListener('DOMContentLoaded', () => new Game());
