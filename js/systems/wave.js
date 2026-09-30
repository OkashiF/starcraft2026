// js/systems/wave.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.WaveSystem = class {
    constructor(scene) {
        this.scene = scene;
        this._waveTriggered = 0;
    }

    start() {
        this.scene.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                const S = StarAbyss.State;
                if (S.isGameOver || S.inMenu || !S.gameStarted) return;

                S.battleElapsed += 1;

                const E = StarAbyss.Config.ECON;
                const arkB = (StarAbyss.Ark && StarAbyss.Ark.getBonuses)
                    ? StarAbyss.Ark.getBonuses()
                    : {};

                S.minerals += E.MINERALS_PER_SEC
                    + S.upgrades.economy * E.ECO_MINERALS_BONUS
                    + (arkB.econMineralsPerSec || 0);

                S.gas += E.GAS_PER_SEC
                    + S.upgrades.economy * E.ECO_GAS_BONUS
                    + (arkB.econGasPerSec || 0);

                const CAP = StarAbyss.Config.CAPTURE;
                this.scene.captureNodes.getChildren().forEach(node => {
                    if (node.owner !== 'player') return;
                    if (node.nodeType === 'radar' && Math.random() < CAP.RADAR_CORE_CHANCE) S.techCores++;
                    if (node.nodeType === 'thermal') S.gas += CAP.THERMAL_GAS_BONUS;
                });

                if (S.waveTimer > 0) S.waveTimer--;
                else this.triggerNextWave();

                this.scene.scriptSystem.fire({ type: 'onTimer', elapsed: S.battleElapsed });

                StarAbyss.UI.updateUI();
            }
        });
    }

    triggerNextWave() {
        const scene = this.scene;
        const S = StarAbyss.State;
        if (S.isGameOver) return;

        const campaign = S.getCurrentCampaign();
        if (!campaign) return;

        const waveIdx = S.wave - 1;
        const waveCfg = campaign.waves && campaign.waves[waveIdx];

        if (!waveCfg) {
            S.waveTimer = 9999;
            return;
        }

        StarAbyss.audio.playAlarm();
        StarAbyss.UI.showToast(`⚠️ 警告: 敌袭第 ${S.wave} 波蜂拥而至！`);

        scene.scriptSystem.fire({ type: 'onWave', wave: S.wave });

        const defaultPriority = waveCfg.priority || 'default';
        const spawns = waveCfg.spawns || [];

        spawns.forEach(spec => {
            const count = spec.count || 1;
            const spawnInterval = spec.spawnInterval != null ? spec.spawnInterval : 0.5;
            const delay = spec.delay || 0;
            const priority = spec.priority || defaultPriority;
            const isBoss = !!spec.boss;
            const tags = spec.tags || (isBoss ? ['boss'] : null);

            for (let i = 0; i < count; i++) {
                const spawnDelay = (delay + i * spawnInterval) * 1000;
                scene.time.delayedCall(spawnDelay, () => {
                    if (S.isGameOver) return;

                    const pos = this._resolveSpawnPosition(spec, campaign);
                    const enemy = scene.unitFactory.spawnEnemy(
                        spec.type,
                        pos.x,
                        pos.y,
                        tags,
                        priority
                    );

                    if (enemy && isBoss) {
                        enemy.isBoss = true;
                        enemy.setScale(1.6);
                        enemy.hp *= 3;
                        enemy.maxHp = enemy.hp;
                        enemy.damage *= 1.5;
                    }
                });
            }
        });

        S.waveTimer = waveCfg.interval;
        S.wave++;
        this._waveTriggered++;
    }

    _resolveSpawnPosition(spec, campaign) {
        const map = campaign.map;

        // 精确出生点：at: 'north' 或 at: { x, y }
        if (spec.at) {
            if (typeof spec.at === 'string') {
                const pt = map.spawnPoints && map.spawnPoints[spec.at];
                if (pt) return { x: pt.x, y: pt.y };
                console.warn(`[WaveSystem] 未找到出生点: ${spec.at}`);
            } else if (typeof spec.at === 'object' && spec.at.x != null && spec.at.y != null) {
                return { x: spec.at.x, y: spec.at.y };
            }
        }

        // 出生区域：zone: 'north_area' 或 zone: { shape, x, y, r/w/h }
        if (spec.zone) {
            const zoneDef = typeof spec.zone === 'string'
                ? (map.spawnZones && map.spawnZones[spec.zone])
                : spec.zone;

            if (zoneDef) {
                if (zoneDef.shape === 'circle') {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * zoneDef.r;
                    return {
                        x: zoneDef.x + Math.cos(angle) * r,
                        y: zoneDef.y + Math.sin(angle) * r,
                    };
                }
                if (zoneDef.shape === 'rect') {
                    return {
                        x: zoneDef.x + Math.random() * zoneDef.w,
                        y: zoneDef.y + Math.random() * zoneDef.h,
                    };
                }
            }
        }

        // 兜底：随机边缘（正常情况下新数据不会走到这里）
        const WS = StarAbyss.Config.WAVE_SPAWN;
        const edge = Math.floor(Math.random() * 4);
        let ex = WS.EDGE_MARGIN;
        let ey = WS.EDGE_MARGIN;
        if (edge === 1) ex = map.width - WS.EDGE_MARGIN;
        if (edge === 2) ey = map.height - WS.EDGE_MARGIN;
        return {
            x: ex + Math.random() * WS.JITTER,
            y: ey + Math.random() * WS.JITTER,
        };
    }

    update(_time, _delta) {
        const scene = this.scene;
        const S = StarAbyss.State;
        if (!S.gameStarted || S.isGameOver) return;

        const CAP = StarAbyss.Config.CAPTURE;
        scene.captureNodes.getChildren().forEach(node => {
            if (node.owner === 'player') return;

            let near = 0;
            scene.friendlyUnits.getChildren().forEach(u => {
                if (Phaser.Math.Distance.Between(u.x, u.y, node.x, node.y) < CAP.RADIUS) near++;
            });

            if (near > 0) {
                node.captureProgress += CAP.RATE_PER_UNIT * near;
                if (node.captureProgress >= 100) {
                    node.captureProgress = 100;
                    node.owner = 'player';
                    node.setTint(0x00ff88);
                    StarAbyss.UI.showToast(`✅ 成功占领 [${node.nodeType === 'radar' ? '战术雷达' : '热能泉'}] 据点！`);

                    if (node.label) {
                        node.label.setText(node.nodeType === 'radar'
                            ? '📡 战术雷达 (已占领: 科技核心搜寻)'
                            : '♨️ 热能泉 (已占领: 瓦斯持续增产)');
                        node.label.setColor('#00ff88');
                    }

                    scene.scriptSystem.fire({ type: 'onNodeCaptured', nodeType: node.nodeType });
                }
            } else if (node.captureProgress > 0) {
                node.captureProgress -= CAP.DECAY;
            }
        });

        // 血条 + 进度条绘制
        const g = scene.hpGraphics;
        g.clear();

        const drawHp = (entity, yOffset, width) => {
            if (!entity.active || entity.hp === entity.maxHp) return;
            const x = entity.x - width / 2;
            const y = entity.y - yOffset;
            const pct = Math.max(0, entity.hp / entity.maxHp);
            g.fillStyle(0x000000, 0.7); g.fillRect(x - 1, y - 1, width + 2, 6);
            g.fillStyle(0xcc0000, 0.9); g.fillRect(x, y, width, 4);
            let hpColor = 0x00ff88;
            if (pct < 0.3) hpColor = 0xff2a6d;
            else if (pct < 0.6) hpColor = 0xffb703;
            g.fillStyle(hpColor, 0.9); g.fillRect(x, y, width * pct, 4);
        };

        scene.friendlyUnits.getChildren().forEach(u => drawHp(u, 26, 30));
        scene.enemyUnits.getChildren().forEach(e => {
            if (e.isEnemyBuilding) return;
            const isBig = e.eType === 'ultralisk' || e.isBoss;
            drawHp(e, isBig ? 45 : 26, isBig ? 50 : 30);
        });
        scene.friendlyBuildings.getChildren().forEach(b => {
            const w = b.bType === 'base' ? 90 : 50;
            const off = b.bType === 'base' ? 70 : 40;
            drawHp(b, off, w);
        });
        if (scene.convoyUnits) {
            scene.convoyUnits.getChildren().forEach(c => drawHp(c, 32, 40));
        }
        // 敌方建筑血条
        scene.enemyUnits.getChildren().forEach(eb => {
            if (!eb.isEnemyBuilding) return;
            drawHp(eb, 55, 70);
        });

        scene.captureNodes.getChildren().forEach(node => {
            if (node.captureProgress > 0 && node.owner !== 'player') {
                const pct = node.captureProgress / 100;
                const x = node.x - 30;
                const y = node.y + 50;
                g.fillStyle(0x333333, 0.8); g.fillRect(x, y, 60, 6);
                g.fillStyle(0x00f0ff, 0.8); g.fillRect(x, y, 60 * pct, 6);
            }
        });
    }
};