// js/scene.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.MainScene = class extends Phaser.Scene {
    constructor() { super({ key: 'MainScene' }); }

    preload() {
        StarAbyss.Textures.generate(this);
    }

    create() {
        StarAbyss.App.scene = this;

        const campaign = StarAbyss.State.getCurrentCampaign();
        const MAP = StarAbyss.Config.MAP;
        const mapW = campaign ? campaign.map.width : MAP.WIDTH;
        const mapH = campaign ? campaign.map.height : MAP.HEIGHT;

        this.physics.world.setBounds(0, 0, mapW, mapH);

        this.add.grid(mapW / 2, mapH / 2, mapW, mapH, MAP.TILE, MAP.TILE, MAP.BG_COLOR, 1, MAP.LINE_COLOR, 0.6);

        this.vfx = new StarAbyss.VFXSystem(this);
        this.vfx.setupAmbient();

        // 菜单模式：只渲染背景
        if (StarAbyss.State.inMenu || !campaign) {
            this.cameras.main.centerOn(mapW / 2, mapH / 2);
            return;
        }

        this.hpGraphics = this.add.graphics().setDepth(10);

        this.friendlyUnits = this.physics.add.group();
        this.enemyUnits = this.physics.add.group();
        this.friendlyBuildings = this.physics.add.staticGroup();
        this.projectiles = this.physics.add.group();
        this.captureNodes = this.physics.add.staticGroup();
        // 车队（中立，可被敌方攻击）
        this.convoyUnits = this.physics.add.group();

        this.physics.add.collider(this.friendlyUnits, this.friendlyUnits);
        this.physics.add.collider(this.enemyUnits, this.enemyUnits);
        this.physics.add.overlap(this.projectiles, this.enemyUnits, (proj, enemy) => {
            this.combat.handleProjectileHitEnemy(proj, enemy);
        });

        this.unitFactory = new StarAbyss.UnitFactory(this);
        this.buildingFactory = new StarAbyss.BuildingFactory(this);

        this.combat = new StarAbyss.CombatSystem(this);
        this.enemyAI = new StarAbyss.EnemyAISystem(this);
        this.waveSystem = new StarAbyss.WaveSystem(this);
        this.zoneSystem = new StarAbyss.ZoneSystem(this);
        this.objectiveSystem = new StarAbyss.ObjectiveSystem(this);
        this.scriptSystem = new StarAbyss.ScriptSystem(this);
        this.cameraSystem = new StarAbyss.CameraSystem(this);
        this.minimap = new StarAbyss.MinimapSystem(this);

        this.selectedUnits = [];
        this.selectedBuilding = null;

        this._setupInitialMap(campaign);

        this.inputSystem = new StarAbyss.InputSystem(this);
        this.inputSystem.setup();

        this.waveSystem.start();
        this.minimap.setup();

        this.cameras.main.setBounds(0, 0, mapW, mapH);
        this.cameras.main.centerOn(this.commandCenter.x, this.commandCenter.y);
        this.cameras.main.setZoom(0.85);

        StarAbyss.UI.updateSelectionCard(this);

        // 场景开始事件：触发战役脚本
        this.scriptSystem.fire({ type: 'onStart' });
    }

    _setupInitialMap(campaign) {
        const C = StarAbyss.Config;
        const NODE_DEF = C.NODE_DEFAULT;

        // 指挥中心
        this.commandCenter = this.physics.add.staticSprite(campaign.map.base.x, campaign.map.base.y, 'tex_base');
        this.commandCenter.hp = C.BUILDINGS.base.hp;
        this.commandCenter.maxHp = C.BUILDINGS.base.hp;
        this.commandCenter.bType = 'base';
        this.friendlyBuildings.add(this.commandCenter);

        // 补给站
        if (campaign.map.depot) {
            const depot = this.physics.add.staticSprite(campaign.map.depot.x, campaign.map.depot.y, 'tex_depot');
            depot.hp = C.BUILDINGS.depot.hp;
            depot.maxHp = C.BUILDINGS.depot.hp;
            depot.bType = 'depot';
            this.friendlyBuildings.add(depot);
        }

        // 据点
        (campaign.map.nodes || []).forEach(nodeCfg => {
            const tint = (NODE_DEF.tint && NODE_DEF.tint[nodeCfg.type]) || 0xffffff;
            const labelText = (NODE_DEF.label && NODE_DEF.label[nodeCfg.type]) || '据点';
            const labelColor = (NODE_DEF.labelColor && NODE_DEF.labelColor[nodeCfg.type]) || '#ffffff';

            const node = this.physics.add.staticSprite(nodeCfg.x, nodeCfg.y, NODE_DEF.texture);
            node.setTint(tint);
            node.nodeType = nodeCfg.type;
            node.owner = 'neutral';
            node.captureProgress = 0;
            node.label = this.add.text(nodeCfg.x, nodeCfg.y - 50, labelText, {
                font: '14px Segoe UI', fill: labelColor, fontStyle: 'bold',
            }).setOrigin(0.5);
            this.captureNodes.add(node);
        });

        // 区域（zone）
        this.zoneSystem.init(campaign);

        // 保护目标（信标、护盾发生器）
        if (campaign.protectTargets && campaign.protectTargets.length) {
            campaign.protectTargets.forEach(pt => {
                this.buildingFactory.spawnProtectTarget(pt);
            });
        }

        // 敌方关键建筑（要塞核心、敌方护盾发生器）
        if (campaign.enemyBuildings && campaign.enemyBuildings.length) {
            campaign.enemyBuildings.forEach(cfg => {
                this.buildingFactory.spawnEnemyBuilding(cfg);
            });
        }

        // 车队
        if (campaign.convoy) {
            this._spawnConvoy(campaign.convoy);
        }

        // 初始单位
        campaign.initialUnits.forEach(u => {
            this.unitFactory.spawnFriendly(u.type, this.commandCenter.x + u.dx, this.commandCenter.y + u.dy, true);
        });
    }

    _spawnConvoy(cfg) {
        for (let i = 0; i < cfg.count; i++) {
            const c = this.physics.add.sprite(
                cfg.startX + i * (cfg.dx || 80),
                cfg.startY,
                'tex_convoy'
            );
            c.hp = cfg.hp || 400;
            c.maxHp = cfg.hp || 400;
            c.speed = cfg.speed || 60;
            c.targetId = 'convoy_' + i;
            c.tags = ['convoy'];
            c.waypoints = cfg.waypoints.slice();
            c.wpIndex = 0;
            // 途经点停留状态
            c.dwelling = false;
            c.dwellElapsed = 0;
            c.dwellDuration = 0;
            c.setCollideWorldBounds(true);
            this.convoyUnits.add(c);
        }
    }

    _updateConvoy(time, delta) {
        if (!this.convoyUnits) return;
        this.convoyUnits.getChildren().forEach(c => {
            if (!c.active || c.hp <= 0) return;

            // ===== 停留中：倒计时结束再前进 =====
            if (c.dwelling) {
                c.setVelocity(0, 0);
                c.dwellElapsed += delta / 1000;
                if (c.dwellElapsed >= c.dwellDuration) {
                    c.dwelling = false;
                    c.dwellElapsed = 0;
                    c.dwellDuration = 0;
                    c.wpIndex++;
                }
                return;
            }

            if (c.wpIndex >= c.waypoints.length) { c.setVelocity(0, 0); return; }
            const wp = c.waypoints[c.wpIndex];
            const d = Phaser.Math.Distance.Between(c.x, c.y, wp.x, wp.y);

            if (d < 24) {
                // 到达途经点：若配置了 dwell，则原地停留
                if (wp.dwell && wp.dwell > 0) {
                    c.dwelling = true;
                    c.dwellElapsed = 0;
                    c.dwellDuration = wp.dwell;
                    c.setVelocity(0, 0);
                    return;
                }
                c.wpIndex++;
                return;
            }

            this.physics.moveTo(c, wp.x, wp.y, c.speed);
            c.rotation = Phaser.Math.Angle.Between(c.x, c.y, wp.x, wp.y);
        });
    }

    update(time, delta) {
        const S = StarAbyss.State;
        if (!S.gameStarted || S.isGameOver) return;

        this.cameraSystem.update(time, delta);
        this.combat.update(time, delta);
        this.enemyAI.update(time, delta);
        this.waveSystem.update(time, delta);
        this.zoneSystem.update(time, delta);
        this._updateConvoy(time, delta);
        this.objectiveSystem.update(time, delta);
        this.minimap.update(time, delta);
    }
};