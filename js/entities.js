// js/entities.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.UnitFactory = class {
    constructor(scene) {
        this.scene = scene;
    }

    spawnFriendly(type, x = null, y = null, isFree = false) {
        const scene = this.scene;
        const S = StarAbyss.State;
        const def = StarAbyss.Config.UNITS[type];
        if (!def) return null;

        if (!isFree) {
            if (S.minerals < def.cost.minerals || S.gas < def.cost.gas || S.usedSupply + def.supply > S.maxSupply) {
                StarAbyss.UI.showToast('❌ 资源或人口不足！');
                return null;
            }
            S.minerals -= def.cost.minerals;
            S.gas -= def.cost.gas;
        }

        S.usedSupply += def.supply;
        StarAbyss.UI.updateUI();

        const spawnX = x !== null ? x : (scene.commandCenter.x + (Math.random() - 0.5) * 100);
        const spawnY = y !== null ? y : (scene.commandCenter.y + 80 + Math.random() * 40);

        const unit = scene.physics.add.sprite(spawnX, spawnY, def.texture);
        scene.friendlyUnits.add(unit);

        unit.uType = type;
        unit.xp = 0;
        unit.rank = 0;

        const hpBonus = (def.hpPerUpgrade || 0) * S.upgrades.infantryHp;
        const dmgBonus = (def.damagePerUpgrade || 0) * S.upgrades.mechAtk;

        unit.maxHp = def.stats.maxHp + hpBonus;
        unit.hp = unit.maxHp;
        unit.speed = def.stats.speed;
        unit.range = def.stats.range;
        unit.damage = def.stats.damage + dmgBonus;
        unit.atkCooldown = def.stats.atkCooldown;
        unit.baseStats = {
            maxHp: def.stats.maxHp,
            speed: def.stats.speed,
            range: def.stats.range,
            damage: def.stats.damage + dmgBonus,
            atkCooldown: def.stats.atkCooldown,
        };

        if (type === 'tank') unit.isSiegeMode = false;

        unit.lastAtkTime = 0;
        unit.targetPos = null;
        unit.setCollideWorldBounds(true);

        unit.starText = scene.add.text(unit.x, unit.y - 20, '', { font: '10px Segoe UI', fill: '#ffb703' }).setOrigin(0.5);

        StarAbyss.UI.showToast(`已部署: [${def.name}]`);
        return unit;
    }

    // priority: 'default' | 'protect' | 'base'，控制该敌人的索敌策略
    spawnEnemy(type, x, y, tags = null, priority = 'default') {
        const scene = this.scene;
        const def = StarAbyss.Config.ENEMIES[type];
        if (!def) return null;

        const enemy = scene.physics.add.sprite(x, y, def.texture);
        scene.enemyUnits.add(enemy);

        enemy.eType = type;
        enemy.hp = def.hp;
        enemy.maxHp = def.hp;
        enemy.speed = def.speed;
        enemy.damage = def.damage;
        enemy.atkCooldown = def.atkCooldown;
        enemy.lastAtkTime = 0;
        enemy.setCollideWorldBounds(true);

        // tags 用于 destroy_target 目标统计
        enemy.tags = tags ? tags.slice() : (def.tags ? def.tags.slice() : []);

        // 攻击优先级（按波次写入）
        enemy.attackPriority = priority || 'default';

        return enemy;
    }
};

StarAbyss.BuildingFactory = class {
    constructor(scene) { this.scene = scene; }

    placeBuildingAt(bType, x, y) {
        const S = StarAbyss.State;
        const def = StarAbyss.Config.BUILDINGS[bType];
        if (!def) return;
        if (S.minerals < def.cost.minerals || S.gas < def.cost.gas) {
            StarAbyss.UI.showToast('❌ 建造资源不足！');
            return;
        }
        S.minerals -= def.cost.minerals;
        S.gas -= def.cost.gas;
        if (def.supplyBonus) S.maxSupply += def.supplyBonus;
        StarAbyss.UI.updateUI();

        const b = this.scene.physics.add.staticSprite(x, y, def.texture);
        b.bType = bType;
        b.hp = def.hp;
        b.maxHp = def.hp;
        b.lastAtkTime = 0;
        this.scene.friendlyBuildings.add(b);

        StarAbyss.audio.playClick();
        StarAbyss.UI.showToast(`建造完成: [${bType === 'depot' ? '补给电站' : '自动炮塔'}]`);
    }

    // 生成保护目标（信标、护盾发生器、要塞核心等）
    spawnProtectTarget(cfg) {
        const scene = this.scene;
        const def = StarAbyss.Config.BUILDINGS[cfg.type];
        if (!def) return null;

        const b = scene.physics.add.staticSprite(cfg.x, cfg.y, def.texture);
        b.bType = cfg.type;
        b.hp = def.hp;
        b.maxHp = def.hp;
        b.targetId = cfg.id;
        b.tags = cfg.tags || [cfg.id, cfg.type];
        b.isProtectTarget = true;
        scene.friendlyBuildings.add(b);

        // 标签
        if (cfg.label) {
            b.label = scene.add.text(cfg.x, cfg.y - (def.h / 2 + 18), `🛡️ ${cfg.label}`, {
                font: '13px Segoe UI', fill: '#00f0ff', fontStyle: 'bold',
            }).setOrigin(0.5);
        }
        return b;
    }

    // 生成敌人关键建筑（要塞核心）
    spawnEnemyBuilding(cfg) {
        const scene = this.scene;
        const tex = cfg.texture || 'tex_shield_gen';
        // 用 dynamic sprite 而不是 staticSprite，避免加入 dynamic physics group 时报错
        const b = scene.physics.add.sprite(cfg.x, cfg.y, tex);
        b.bType = cfg.type || 'enemy_building';
        b.hp = cfg.hp || 800;
        b.maxHp = b.hp;
        b.targetId = cfg.id;
        b.tags = cfg.tags || [cfg.id, cfg.type];
        b.isEnemyBuilding = true;

        // 让它不移动、不被推动，表现上等同于静态建筑
        if (b.body) {
            b.body.setImmovable(true);
            b.body.moves = false;
        }

        scene.enemyUnits.add(b);

        if (cfg.label) {
            b.label = scene.add.text(cfg.x, cfg.y - 50, `☠️ ${cfg.label}`, {
                font: '13px Segoe UI', fill: '#ff6b6b', fontStyle: 'bold',
            }).setOrigin(0.5);
        }
        return b;
    }
};