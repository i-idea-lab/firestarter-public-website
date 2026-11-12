/**
 * Firestarter Interactive Spark & Ignition System
 * Powered by HTML5 Canvas & GSAP
 */

class SparkEngine {
    constructor(canvasId = 'spark-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.burstParticles = [];
        this.shockwaves = [];
        this.maxAmbient = 45;
        // Reach multiplier: 1.15 = 15% higher vertical rise towards the top of the viewport
        this.sparkReachMultiplier = 1.15;
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.isHoveringHero = false;
        this.audioEnabled = false;
        this.audioCtx = null;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Ambient generation
        for (let i = 0; i < this.maxAmbient; i++) {
            this.particles.push(this.createAmbientParticle(true));
        }

        // Mouse interaction
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            // Generate slight trail if moving fast
            if (Math.random() < 0.25) {
                this.particles.push(this.createMouseParticle(e.clientX, e.clientY));
            }
        });

        // Loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    resize() {
        if (!this.canvas) return;
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    createAmbientParticle(randomY = false) {
        // Balanced calculation for reach extension (+15% vertical travel before fade-out)
        const speedBoost = 1 + (this.sparkReachMultiplier - 1) * 0.5;
        const decayReduction = 1 / (1 + (this.sparkReachMultiplier - 1) * 0.5);

        return {
            x: Math.random() * this.width,
            y: randomY ? Math.random() * this.height : this.height + 10 + Math.random() * 20,
            size: Math.random() * 2.2 + 0.8,
            speedY: -(Math.random() * 1.2 + 0.5) * speedBoost,
            speedX: (Math.random() - 0.5) * 0.8,
            alpha: Math.random() * 0.7 + 0.2,
            decay: (Math.random() * 0.003 + 0.0015) * decayReduction,
            color: this.getRandomSparkColor(),
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.04 + 0.01
        };
    }

    createMouseParticle(x, y) {
        return {
            x: x + (Math.random() - 0.5) * 16,
            y: y + (Math.random() - 0.5) * 16,
            size: Math.random() * 2.5 + 1,
            speedY: -(Math.random() * 2.5 + 1),
            speedX: (Math.random() - 0.5) * 2,
            alpha: 1,
            decay: Math.random() * 0.025 + 0.015,
            color: '#FF9100',
            wobble: 0,
            wobbleSpeed: 0.05
        };
    }

    getRandomSparkColor() {
        const colors = [
            '#FF4500', // OrangeRed
            '#FF6B35', // Firestarter primary
            '#FFA000', // Amber
            '#FFD54F', // Warm light spark
            '#FF3D00'  // Fiery deep orange
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Trigger explosive ignition shockwave & spark shower
    triggerIgnition(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
        const sparkCount = 90;
        
        // Add shockwave
        this.shockwaves.push({
            x: originX,
            y: originY,
            radius: 5,
            maxRadius: 180,
            alpha: 0.9,
            color: '#FF6B35'
        });

        // Radial sparks
        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 9 + 3;
            this.burstParticles.push({
                x: originX,
                y: originY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - (Math.random() * 2.5),
                size: Math.random() * 3 + 1.2,
                alpha: 1,
                decay: Math.random() * 0.02 + 0.01,
                color: Math.random() > 0.4 ? '#FFD54F' : '#FF5722',
                trail: []
            });
        }

        // Play authentic recorded V8 / V12 startup audio
        this.playEngineSound();
    }

    // Authentic Recorded V8 Engine Startup & Throttle Rev
    playEngineSound() {
        try {
            if (!this.engineAudio) {
                this.engineAudio = new Audio('assets/audio/v8_engine_start.mp3');
                this.engineAudio.volume = 0.95;
                this.isPlayingEngine = false;

                this.engineAudio.addEventListener('ended', () => {
                    this.isPlayingEngine = false;
                    window.dispatchEvent(new CustomEvent('engine-state-change', { detail: { running: false } }));
                });
            }

            // If already playing, pressing the START/STOP button toggles it off!
            if (this.isPlayingEngine && !this.engineAudio.paused) {
                this.stopEngine();
                return;
            }

            this.engineAudio.currentTime = 0;
            this.engineAudio.volume = 0.95;
            this.isPlayingEngine = true;
            window.dispatchEvent(new CustomEvent('engine-state-change', { detail: { running: true } }));

            const playPromise = this.engineAudio.play();

            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    this.playSynthesizedIgnition();
                    window.dispatchEvent(new CustomEvent('engine-state-change', { detail: { running: true } }));
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('engine-state-change', { detail: { running: false } }));
                    }, 3200);
                });
            }

            // Leave first 4.0 seconds 100% untouched, then smoothly fade out to conclude at exactly 5.0 seconds
            if (this.fadeTimeout) clearTimeout(this.fadeTimeout);
            this.fadeTimeout = setTimeout(() => {
                this.stopEngine(1000); // 1.0s natural fadeout -> exactly 5.0s total duration
            }, 4000);

        } catch (e) {
            this.playSynthesizedIgnition();
        }
    }

    // Engine shutdown with custom fadeout duration (default 1000ms for natural 5s curve, 300ms for manual button press)
    stopEngine(fadeDurationMs = 300) {
        if (!this.engineAudio) return;
        if (this.fadeTimeout) clearTimeout(this.fadeTimeout);

        const stepTime = 40; // update every 40ms
        const totalSteps = Math.max(1, Math.floor(fadeDurationMs / stepTime));
        const initialVol = this.engineAudio.volume;
        const volStep = initialVol / totalSteps;

        let currentVol = initialVol;
        const stopFade = setInterval(() => {
            currentVol -= volStep;
            if (currentVol <= 0.03) {
                clearInterval(stopFade);
                this.engineAudio.pause();
                this.engineAudio.currentTime = 0;
                this.engineAudio.volume = 0.95;
                this.isPlayingEngine = false;
                window.dispatchEvent(new CustomEvent('engine-state-change', { detail: { running: false } }));
            } else {
                this.engineAudio.volume = Math.max(0, currentVol);
            }
        }, stepTime);
    }

    // Rich V12 Engine Cold-Start & Throttle Rev via Web Audio API (Zero external audio files needed)
    playSynthesizedIgnition() {
        try {
            if (!this.audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.audioCtx = new AudioContext();
                }
            }

            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }

            if (!this.audioCtx) return;

            const ctx = this.audioCtx;
            const now = ctx.currentTime;

            // Master Compressor for big automotive presence without clipping
            const compressor = ctx.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(-16, now);
            compressor.knee.setValueAtTime(10, now);
            compressor.ratio.setValueAtTime(7, now);
            compressor.attack.setValueAtTime(0.003, now);
            compressor.release.setValueAtTime(0.25, now);

            // Master Volume
            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.85, now);
            compressor.connect(masterGain);
            masterGain.connect(ctx.destination);

            // 1. STARTER MOTOR COMPRESSION CRANKS (2 heavy starter chugs before catching)
            const crankTimes = [0.03, 0.22];
            crankTimes.forEach((startTime, idx) => {
                const t = now + startTime;
                const crankOsc = ctx.createOscillator();
                const crankGain = ctx.createGain();
                const crankFilter = ctx.createBiquadFilter();

                crankOsc.type = 'sawtooth';
                crankOsc.frequency.setValueAtTime(115 - idx * 15, t);
                crankOsc.frequency.exponentialRampToValueAtTime(32, t + 0.15);

                crankFilter.type = 'lowpass';
                crankFilter.frequency.setValueAtTime(280, t);

                crankGain.gain.setValueAtTime(0.001, t);
                crankGain.gain.linearRampToValueAtTime(0.42, t + 0.03);
                crankGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

                crankOsc.connect(crankFilter);
                crankFilter.connect(crankGain);
                crankGain.connect(compressor);

                crankOsc.start(t);
                crankOsc.stop(t + 0.17);
            });

            // 2. MECHANICAL SPARK DETONATION CRACKLE (Noise burst)
            const bufferSize = Math.floor(ctx.sampleRate * 0.18);
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
            }
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(1100, now + 0.38);
            noiseFilter.Q.setValueAtTime(1.8, now + 0.38);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.001, now + 0.38);
            noiseGain.gain.linearRampToValueAtTime(0.28, now + 0.40);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.54);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(compressor);
            noise.start(now + 0.38);

            // 3. V12 ENGINE ROAR (Dual Cross-Detuned 6-Cylinder Banks + Sub Displacement)
            const fireStart = now + 0.42;

            // Bank A (Left 6 Cylinders)
            const bankA = ctx.createOscillator();
            bankA.type = 'sawtooth';
            bankA.frequency.setValueAtTime(46, fireStart);
            bankA.frequency.exponentialRampToValueAtTime(235, fireStart + 0.55); // Throttle flare rev!
            bankA.frequency.exponentialRampToValueAtTime(82, fireStart + 1.8);  // Settle to idle
            bankA.frequency.linearRampToValueAtTime(46, fireStart + 3.1);

            // Bank B (Right 6 Cylinders - detuned for signature V12 harmonic resonance)
            const bankB = ctx.createOscillator();
            bankB.type = 'sawtooth';
            bankB.frequency.setValueAtTime(47.4, fireStart);
            bankB.frequency.exponentialRampToValueAtTime(241.0, fireStart + 0.55);
            bankB.frequency.exponentialRampToValueAtTime(84.6, fireStart + 1.8);
            bankB.frequency.linearRampToValueAtTime(47.2, fireStart + 3.1);

            // Sub-Bass Displacement (The 6.0L V12 Thrum)
            const subBass = ctx.createOscillator();
            subBass.type = 'triangle';
            subBass.frequency.setValueAtTime(34, fireStart);
            subBass.frequency.exponentialRampToValueAtTime(118, fireStart + 0.5);
            subBass.frequency.exponentialRampToValueAtTime(42, fireStart + 1.8);
            subBass.frequency.linearRampToValueAtTime(32, fireStart + 3.0);

            // Exhaust Valve Resonance Filter
            const exhaustFilter = ctx.createBiquadFilter();
            exhaustFilter.type = 'lowpass';
            exhaustFilter.frequency.setValueAtTime(190, fireStart);
            exhaustFilter.frequency.exponentialRampToValueAtTime(880, fireStart + 0.45); // Open exhaust bark
            exhaustFilter.frequency.exponentialRampToValueAtTime(250, fireStart + 1.8);
            exhaustFilter.Q.setValueAtTime(2.4, fireStart);

            // Engine Gain Envelope
            const engineGain = ctx.createGain();
            engineGain.gain.setValueAtTime(0.001, fireStart);
            engineGain.gain.linearRampToValueAtTime(0.70, fireStart + 0.2); // Explosive catch
            engineGain.gain.linearRampToValueAtTime(0.78, fireStart + 0.6); // Peak V12 howl
            engineGain.gain.exponentialRampToValueAtTime(0.32, fireStart + 1.8); // Throaty idle burble
            engineGain.gain.exponentialRampToValueAtTime(0.001, fireStart + 3.25); // Fade out

            // Sub-Bass Gain Envelope
            const subGain = ctx.createGain();
            subGain.gain.setValueAtTime(0.001, fireStart);
            subGain.gain.linearRampToValueAtTime(0.60, fireStart + 0.25);
            subGain.gain.exponentialRampToValueAtTime(0.30, fireStart + 1.8);
            subGain.gain.exponentialRampToValueAtTime(0.001, fireStart + 3.1);

            // Wiring
            bankA.connect(exhaustFilter);
            bankB.connect(exhaustFilter);
            exhaustFilter.connect(engineGain);
            engineGain.connect(compressor);

            subBass.connect(subGain);
            subGain.connect(compressor);

            // Ignition Fire
            bankA.start(fireStart);
            bankB.start(fireStart);
            subBass.start(fireStart);

            bankA.stop(fireStart + 3.3);
            bankB.stop(fireStart + 3.3);
            subBass.stop(fireStart + 3.15);

        } catch (e) {
            // Audio context policy safe catch
        }
    }

    animate() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw Shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += 7;
            sw.alpha -= 0.035;

            if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
                this.shockwaves.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255, 107, 53, ${sw.alpha})`;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            this.ctx.restore();
        }

        // 2. Draw Burst Particles (Radial Ignition)
        for (let i = this.burstParticles.length - 1; i >= 0; i--) {
            const bp = this.burstParticles[i];
            bp.x += bp.vx;
            bp.y += bp.vy;
            bp.vy += 0.14; // gravity
            bp.vx *= 0.96; // drag
            bp.alpha -= bp.decay;

            if (bp.alpha <= 0) {
                this.burstParticles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, bp.alpha);
            this.ctx.fillStyle = bp.color;
            this.ctx.shadowColor = bp.color;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(bp.x, bp.y, bp.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // 3. Draw Ambient Embers
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.wobble += p.wobbleSpeed;
            p.x += p.speedX + Math.sin(p.wobble) * 0.6;
            p.y += p.speedY;
            p.alpha -= p.decay;

            if (p.alpha <= 0 || p.y < -10) {
                this.particles.splice(i, 1);
                // Maintain ambient density
                if (this.particles.length < this.maxAmbient) {
                    this.particles.push(this.createAmbientParticle());
                }
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillStyle = p.color;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        requestAnimationFrame(this.animate);
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.sparkEngine = new SparkEngine('spark-canvas');
});
