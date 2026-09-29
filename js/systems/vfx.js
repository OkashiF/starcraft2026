// js/systems/vfx.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.VFXSystem = class {
    constructor(scene) {
        this.scene = scene;
    }

    setupAmbient() {
        const { WIDTH, HEIGHT } = StarAbyss.Config.MAP;
        this.scene.add.particles(0, 0, 'tex_particle', {
            x: { min: 0, max: WIDTH },
            y: { min: 0, max: HEIGHT },
            lifespan: { min: 4000, max: 8000 },
            speedY: { min: -5, max: -15 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.15, end: 0 },
            alpha: { start: 0.1, end: 0 },
            quantity: 3,
            blendMode: 'ADD',
        });
    }

    muzzleFlash(x, y, angleDeg, color) {
        const emitter = this.scene.add.particles(x, y, 'tex_particle', {
            speed: { min: 100, max: 250 },
            angle: { min: angleDeg - 15, max: angleDeg + 15 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 150,
            tint: color,
            blendMode: 'ADD',
            emitting: false,
        });
        emitter.explode(5);
        this.scene.time.delayedCall(200, () => emitter.destroy());
    }

    hitBurst(x, y, color = 0xff2a6d, count = 3) {
        const emitter = this.scene.add.particles(x, y, 'tex_particle', {
            speed: { min: 30, max: 80 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 300,
            tint: color,
            emitting: false,
        });
        emitter.explode(count);
        this.scene.time.delayedCall(400, () => emitter.destroy());
    }

    deathBurst(x, y, color, count) {
        const emitter = this.scene.add.particles(x, y, 'tex_particle', {
            speed: { min: 50, max: 200 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 600,
            tint: color,
            blendMode: 'ADD',
            emitting: false,
        });
        emitter.explode(count);
        this.scene.time.delayedCall(1000, () => emitter.destroy());
    }
};