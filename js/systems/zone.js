// js/systems/zone.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.ZoneSystem = class {
    constructor(scene) {
        this.scene = scene;
        this.zones = [];
        this._inside = new Map();
        this._gfx = null;
    }

    init(campaign) {
        this.zones = [];
        this._inside.clear();

        if (this._gfx) { this._gfx.destroy(); this._gfx = null; }
        this._gfx = this.scene.add.graphics().setDepth(1);

        if (!campaign || !campaign.zones) return;

        campaign.zones.forEach(z => {
            this.zones.push({
                id: z.id,
                shape: z.shape || 'circle',
                x: z.x, y: z.y,
                r: z.r || 140,
                w: z.w || 200,
                h: z.h || 200,
                color: z.color || 0x00f0ff,
                label: z.label || '',
                holdTime: 0,
                progress: 0,           // -100 ~ 100
                requiredHoldTime: z.holdTime || 0,
                owner: 'neutral',
            });
        });
    }

    update(_time, delta) {
        const S = StarAbyss.State;
        if (!S.gameStarted || S.isGameOver) return;
        const dt = delta / 1000;

        this.zones.forEach(zone => {
            let playerIn = 0, enemyIn = 0;

            this.scene.friendlyUnits.getChildren().forEach(u => {
                if (this._insideZone(zone, u.x, u.y)) playerIn++;
            });
            this.scene.enemyUnits.getChildren().forEach(e => {
                if (this._insideZone(zone, e.x, e.y)) enemyIn++;
            });

            const prev = this._inside.get(zone.id) || { player: 0, enemy: 0 };
            if (prev.player === 0 && playerIn > 0) {
                this.scene.scriptSystem.fire({ type: 'onUnitEnterZone', zoneId: zone.id, faction: 'player' });
            }
            if (prev.enemy === 0 && enemyIn > 0) {
                this.scene.scriptSystem.fire({ type: 'onUnitEnterZone', zoneId: zone.id, faction: 'enemy' });
            }
            this._inside.set(zone.id, { player: playerIn, enemy: enemyIn });

            const CAP = StarAbyss.Config.CAPTURE;
            if (playerIn > 0 && enemyIn === 0) {
                zone.progress = Math.min(100, zone.progress + CAP.RATE_PER_UNIT * 100 * playerIn * dt);
            } else if (enemyIn > 0 && playerIn === 0) {
                zone.progress = Math.max(-100, zone.progress - CAP.RATE_PER_UNIT * 100 * enemyIn * dt);
            } else if (playerIn === 0 && enemyIn === 0 && zone.progress !== 0) {
                const decay = CAP.DECAY * 100 * dt * Math.sign(zone.progress);
                if (Math.abs(zone.progress) <= Math.abs(decay)) zone.progress = 0;
                else zone.progress -= decay;
            }

            // 更新归属
            let newOwner = 'neutral';
            if (zone.progress >= 100) newOwner = 'player';
            else if (zone.progress <= -100) newOwner = 'enemy';

            if (newOwner !== zone.owner) {
                zone.owner = newOwner;
                if (newOwner === 'player') {
                    StarAbyss.UI.showToast(`✅ 已控制区域：${zone.label || zone.id}`);
                    this.scene.scriptSystem.fire({ type: 'onZoneCaptured', zoneId: zone.id, owner: 'player' });
                } else if (newOwner === 'enemy') {
                    StarAbyss.UI.showToast(`⚠️ 区域失守：${zone.label || zone.id}`);
                    this.scene.scriptSystem.fire({ type: 'onZoneCaptured', zoneId: zone.id, owner: 'enemy' });
                }
            }

            // 驻留计时
            if (zone.owner === 'player') zone.holdTime += dt;
            else zone.holdTime = 0;
        });

        this._draw();
    }

    _insideZone(zone, x, y) {
        if (zone.shape === 'rect') {
            return x >= zone.x - zone.w / 2 && x <= zone.x + zone.w / 2 &&
                   y >= zone.y - zone.h / 2 && y <= zone.y + zone.h / 2;
        }
        return Phaser.Math.Distance.Between(x, y, zone.x, zone.y) <= zone.r;
    }

    getZone(id) {
        return this.zones.find(z => z.id === id) || null;
    }

    getZoneOwner(id) {
        const z = this.getZone(id);
        return z ? z.owner : 'neutral';
    }

    _draw() {
        if (!this._gfx) return;
        const g = this._gfx;
        g.clear();

        this.zones.forEach(z => {
            let color = 0x00f0ff;
            if (z.owner === 'player') color = 0x00ff88;
            else if (z.owner === 'enemy') color = 0xff2a6d;
            else color = z.color;

            g.lineStyle(2, color, 0.7);
            if (z.shape === 'rect') {
                g.strokeRect(z.x - z.w / 2, z.y - z.h / 2, z.w, z.h);
            } else {
                g.strokeCircle(z.x, z.y, z.r);
            }

            if (z.progress > 0 && z.owner !== 'player') {
                const pct = z.progress / 100;
                const y = z.y + (z.shape === 'rect' ? z.h / 2 : z.r) + 10;
                g.fillStyle(0x222222, 0.8);
                g.fillRect(z.x - 30, y, 60, 6);
                g.fillStyle(0x00f0ff, 0.9);
                g.fillRect(z.x - 30, y, 60 * pct, 6);
            }
        });
    }

    reset() {
        this.zones.forEach(z => {
            z.holdTime = 0;
            z.progress = 0;
            z.owner = 'neutral';
        });
        this._inside.clear();
    }
};