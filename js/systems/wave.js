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
        let waveCfg = campaign.waves && campaign.waves[waveIdx];

        // ★ 新增：无尽波分支
        // 静态 waves[] 用完后，如果战役声明了 endless: true，则动态生成
        if (!waveCfg && campaign.endless) {
            waveCfg = this._buildEndlessWave(campaign, S.wave);
        }

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

                    // ★ 新增：从存活敌方建筑刷怪；无建筑则跳过该个体
                    let pos;
                    if (spec.fromBuildings) {
                        pos = this._resolveSpawnFromBuilding(spec.fromBuildings, i);
                        if (!pos) return;
                    } else {
                        pos = this._resolveSpawnPosition(spec, campaign);
                    }

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

    // ============================================================
    // ★ 新增：无尽波生成器（通用，任何战役加 endless: true 即可用）
    // 只改种类与数量；HP / 伤害完全不动。
    // 每项 count 是「每个存活建筑生成的数量」，全图总数 = count × 存活建筑数。
    // ============================================================
    _buildEndlessWave(campaign, wave) {
        const spawns = [];
        const push = (type, count, extra) => {
            if (count > 0) spawns.push(Object.assign({
                type,
                count,
                fromBuildings: true,
            }, extra || {}));
        };

        // 打底：每建筑 1 只迅猛虫，全程都有
        push('zergling', 1);

        // 第 2 波起：刺蛇（远程）
        if (wave >= 2) push('hydralisk', Math.min(3, Math.floor(wave / 3)));

        // 第 5 波起：裂解虫（自杀式）
        if (wave >= 5) push('reaper', Math.min(2, Math.floor((wave - 3) / 4)));

        // 第 6 波起：飞刺（高速）
        if (wave >= 6) push('flier', Math.min(2, Math.floor((wave - 4) / 4)));

        // 第 7 波起：噬星巨兽（精英重型）
        if (wave >= 7) push('ultralisk', Math.min(2, Math.floor((wave - 5) / 3)));

        // 第 9 波起：酸蚀者（远程酸液）
        if (wave >= 9) push('acidspitter', Math.min(1, Math.floor((wave - 7) / 4)));

        // 第 12 波起：晶刺兽（精英重甲）
        if (wave >= 12) push('crystalspike', Math.min(1, Math.floor((wave - 10) / 4)));

        // 第 10 波起：Boss（每 5 波 +1）
        if (wave >= 10) {
            push('ultralisk', 1 + Math.floor((wave - 10) / 5), { boss: true });
        }

        return { interval: 15, spawns };
    }

    // ============================================================
    // ★ 新增：从存活敌方建筑位置解析出生点（通用）
    // tagFilter: true / null 表示任意敌方建筑；字符串表示只取带该 tag 的
    // index: 用于在存活建筑之间轮询，实现「均匀分布」
    // ============================================================
    _resolveSpawnFromBuilding(tagFilter, index) {
        const buildings = this._getAliveEnemyBuildings(tagFilter);
        if (buildings.length === 0) return null;

        // 轮询：i=0 → 第 0 座，i=1 → 第 1 座 … i=N → 回到第 0 座
        const b = buildings[index % buildings.length];

        // 建筑附近圆形随机偏移，避免所有敌人重叠在同一点
        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 40;

        return {
            x: b.x + Math.cos(angle) * dist,
            y: b.y + Math.sin(angle) * dist,
        };
    }

    // ============================================================
    // ★ 新增：实时查询存活的敌方建筑（通用）
    // 每次调用都重新过滤，所以建筑中途被摧毁后，后续个体自动跳过该点
    // ============================================================
    _getAliveEnemyBuildings(tagFilter) {
        return this.scene.enemyUnits.getChildren().filter(e => {
            if (!e.isEnemyBuilding) return false;
            if (!e.active) return false;
            if (e.hp <= 0) return false;
            if (!tagFilter || tagFilter === true) return true;

            // entities.js 中 spawnEnemyBuilding 把 cfg.tags 存入 e.tags
            const t = e.tags;
            return Array.isArray(t) && t.includes(tagFilter);
        });
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