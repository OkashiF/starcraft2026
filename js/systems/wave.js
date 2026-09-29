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

                // 据点持续收益
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

        const WS = StarAbyss.Config.WAVE_SPAWN;
        const count = waveCfg.count;
        const types = waveCfg.types;
        // 本波敌人的攻击优先级：'default' / 'protect' / 'base'
        const priority = waveCfg.priority || 'default';

        for (let i = 0; i < count; i++) {
            const edge = Math.floor(Math.random() * 4);
            let ex = WS.EDGE_MARGIN, ey = WS.EDGE_MARGIN;
            if (edge === 1) ex = campaign.map.width - WS.EDGE_MARGIN;
            if (edge === 2) ey = campaign.map.height - WS.EDGE_MARGIN;

            const type = types[Math.floor(Math.random() * types.length)];
            scene.unitFactory.spawnEnemy(
                type,
                ex + Math.random() * WS.JITTER,
                ey + Math.random() * WS.JITTER,
                null,          // tags
                priority       // 攻击优先级
            );
        }

        S.waveTimer = waveCfg.interval;
        S.wave++;
        this._waveTriggered++;
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
        scene.enemyUnits.getChildren().forEach(e => drawHp(e, e.eType === 'ultralisk' ? 45 : 26, e.eType === 'ultralisk' ? 50 : 30));
        scene.friendlyBuildings.getChildren().forEach(b => {
            const w = b.bType === 'base' ? 90 : 50;
            const off = b.bType === 'base' ? 70 : 40;
            drawHp(b, off, w);
        });
        if (scene.convoyUnits) {
            scene.convoyUnits.getChildren().forEach(c => drawHp(c, 32, 40));
        }

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