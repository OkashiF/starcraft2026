// js/entities.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.UnitFactory = class {
    constructor(scene) {
        this.scene = scene;
    }

    _initCommon(entity, def, isFriendly) {
        entity.armorType = def.armorType || (isFriendly ? 'light' : 'bio');
        entity.tags = def.tags ? def.tags.slice() : [];
        entity.bonusVs = def.bonusVs || {};
        entity.status = {
            stunUntil: 0,
            slowUntil: 0,
            slowFactor: 1,
            burnUntil: 0,
            burnDps: 0,
            markUntil: 0,
            shield: 0,
            shieldUntil: 0,
        };
    }

    spawnFriendly(type, x = null, y = null, isFree = false, opts = {}) {
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

        this._initCommon(unit, def, true);

        // 主动技能实例
        if (def.ability) {
            unit.ability = Object.assign({}, def.ability, { readyAt: 0 });
        }

        // 临时召唤物生命周期（空投增援等）
        if (opts.lifetime && opts.lifetime > 0) {
            unit.lifetime = opts.lifetime;
            unit.spawnedAt = scene.time.now;
        }

        unit.starText = scene.add.text(unit.x, unit.y - 20, '', { font: '10px Segoe UI', fill: '#ffb703' }).setOrigin(0.5);

        StarAbyss.UI.showToast(`已部署: [${def.name}]`);
        return unit;
    }

    // priority: 'default' | 'protect' | 'base'
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
        enemy.attackRange = def.attackRange || 40;

        // tags 用于 destroy_target 目标统计
        enemy.tags = tags ? tags.slice() : (def.tags ? def.tags.slice() : []);

        // 攻击优先级（按波次写入）
        enemy.attackPriority = priority || 'default';

        // ===== 技能/属性标记 =====
        enemy.canAttack = def.canAttack !== false;
        enemy.immobile  = !!def.immobile;

        if (def.healer) {
            enemy.healer = Object.assign({}, def.healer, { lastHeal: 0 });
        }
        if (def.aura) {
            enemy.aura = Object.assign({}, def.aura);
        }
        if (def.summoner) {
            enemy.summoner = Object.assign({}, def.summoner, {
                nextSummon: scene.time.now + def.summoner.interval,
            });
        }

        this._initCommon(enemy, def, false);

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
        b.armorType = def.armorType || 'building';
        b.tags = def.tags ? def.tags.slice() : ['structure'];
        b.bonusVs = def.bonusVs || {};
        this.scene.friendlyBuildings.add(b);

        StarAbyss.audio.playClick();
        StarAbyss.UI.showToast(`建造完成: [${bType}]`);
    }

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
        b.armorType = def.armorType || 'building';
        b.bonusVs = def.bonusVs || {};
        scene.friendlyBuildings.add(b);

        if (cfg.label) {
            b.label = scene.add.text(cfg.x, cfg.y - (def.h / 2 + 18), `🛡️ ${cfg.label}`, {
                font: '13px Segoe UI', fill: '#00f0ff', fontStyle: 'bold',
            }).setOrigin(0.5);
        }
        return b;
    }

    spawnEnemyBuilding(cfg) {
        const scene = this.scene;
        const def = StarAbyss.Config.BUILDINGS[cfg.type] || {};
        const tex = cfg.texture || def.texture || 'tex_shield_gen';

        const b = scene.physics.add.sprite(cfg.x, cfg.y, tex);
        b.bType = cfg.type || 'enemy_building';
        b.hp = cfg.hp || def.hp || 800;
        b.maxHp = b.hp;
        b.targetId = cfg.id;
        b.tags = cfg.tags || [cfg.id, cfg.type];
        b.isEnemyBuilding = true;
        b.armorType = def.armorType || 'building';
        b.bonusVs = def.bonusVs || {};
        b.defense = def;

        if (b.body) {
            b.body.setImmovable(true);
            b.body.moves = false;
        }

        scene.enemyUnits.add(b);

        if (def.range && def.damage) {
            b.isEnemyTurret = true;
            b.range = def.range;
            b.damage = def.damage;
            b.atkCooldown = def.atkCooldown;
            b.lastAtkTime = 0;
            b.splash = !!def.splash;
        }

        if (def.spawner) {
            b.spawner = Object.assign({}, def.spawner);
            b.nextSpawn = scene.time.now + b.spawner.interval;
        }

        if (cfg.label) {
            b.label = scene.add.text(cfg.x, cfg.y - 50, `☠️ ${cfg.label}`, {
                font: '13px Segoe UI', fill: '#ff6b6b', fontStyle: 'bold',
            }).setOrigin(0.5);
        }
        return b;
    }
};