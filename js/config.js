// js/config.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.Config = {
    MAP: {
        WIDTH: 2400,
        HEIGHT: 2400,
        TILE: 64,
        BG_COLOR: 0x070c18,
        LINE_COLOR: 0x112238,
    },

    ECON: {
        MINERALS_PER_SEC: 12,
        GAS_PER_SEC: 4,
        ECO_MINERALS_BONUS: 4,
        ECO_GAS_BONUS: 2,
    },

    UPGRADE_COSTS: [2, 5, 10],

    // ===== 状态效果参数 =====
    STATUS: {
        SLOW_FACTOR: 0.65,
        MARK_MULT: 1.15,
    },

    UNITS: {
        marine: {
            name: '陆战队', texture: 'tex_marine', portrait: '🪖',
            cost: { minerals: 50, gas: 0 }, supply: 1,
            stats: { maxHp: 60, speed: 130, range: 200, damage: 10, atkCooldown: 400 },
            projectile: { texture: 'tex_bullet', speed: 450, tint: 0xffdd00, scale: 1, lifespan: 800, muzzle: 0xffdd00 },
            hpPerUpgrade: 15,
            armorType: 'light',
            tags: ['infantry', 'light'],
        },
        firebat: {
            name: '火蝠', texture: 'tex_firebat', portrait: '🔥',
            cost: { minerals: 100, gas: 25 }, supply: 2,
            stats: { maxHp: 140, speed: 100, range: 100, damage: 22, atkCooldown: 900 },
            projectile: { texture: 'tex_flame', speed: 300, tint: 0xff5500, scale: 0.5, endScale: 1.5, lifespan: 400, muzzle: 0xff5500, flame: true },
            hpPerUpgrade: 30,
            armorType: 'light',
            tags: ['infantry', 'light'],
            bonusVs: { light: 1.4, bio: 1.3 },
        },
        ghost: {
            name: '幽灵', texture: 'tex_ghost', portrait: '👻',
            cost: { minerals: 120, gas: 75 }, supply: 2,
            stats: { maxHp: 80, speed: 120, range: 260, damage: 25, atkCooldown: 1100 },
            projectile: { texture: 'tex_bullet', speed: 450, tint: 0xffdd00, scale: 1, lifespan: 800, muzzle: 0xffdd00 },
            hpPerUpgrade: 20,
            armorType: 'light',
            tags: ['infantry', 'light'],
            bonusVs: { heavy: 1.4, mech: 1.25 },
        },
        tank: {
            name: '攻城坦克', texture: 'tex_tank', portrait: '🛡️',
            cost: { minerals: 150, gas: 100 }, supply: 3,
            stats: { maxHp: 200, speed: 80, range: 280, damage: 45, atkCooldown: 1600 },
            projectile: { texture: 'tex_bullet', speed: 600, tint: 0x00f0ff, scale: 1.5, lifespan: 800, muzzle: 0x00f0ff },
            hpPerUpgrade: 0,
            damagePerUpgrade: 10,
            armorType: 'heavy',
            tags: ['mech', 'heavy'],
            bonusVs: { building: 1.5 },
            siege: { speed: 0, range: 450, damage: 100, atkCooldown: 2500, tint: 0xff7700, damagePerUpgrade: 25 },
        },

        // ===== 新增兵种（第 1 批） =====
        rocketeer: {
            name: '火箭兵', texture: 'tex_rocketeer', portrait: '🚀',
            cost: { minerals: 75, gas: 25 }, supply: 1,
            stats: { maxHp: 90, speed: 100, range: 170, damage: 22, atkCooldown: 2200 },
            projectile: { texture: 'tex_rocket', speed: 380, tint: 0xffb703, scale: 1, lifespan: 1000, muzzle: 0xffb703 },
            splashRadius: 36,
            hpPerUpgrade: 20,
            armorType: 'light',
            tags: ['infantry', 'light'],
            bonusVs: { light: 1.5, bio: 1.25, building: 1.25 },
        },
        medic: {
            name: '医疗兵', texture: 'tex_medic', portrait: '💊',
            cost: { minerals: 60, gas: 20 }, supply: 1,
            stats: { maxHp: 70, speed: 110, range: 0, damage: 0, atkCooldown: 1200 },
            hpPerUpgrade: 15,
            armorType: 'light',
            tags: ['infantry', 'light', 'support'],
            isHealer: true,
            healAmount: 15,
            healRange: 130,
        },
        engineer: {
            name: '工程师', texture: 'tex_engineer', portrait: '🔧',
            cost: { minerals: 70, gas: 20 }, supply: 1,
            stats: { maxHp: 80, speed: 110, range: 0, damage: 0, atkCooldown: 1200 },
            hpPerUpgrade: 15,
            armorType: 'light',
            tags: ['infantry', 'light', 'support'],
            isRepairer: true,
            repairAmount: 20,
            repairRange: 120,
        },
        drone: {
            name: '侦察无人机', texture: 'tex_drone', portrait: '🛸',
            cost: { minerals: 40, gas: 10 }, supply: 1,
            stats: { maxHp: 40, speed: 200, range: 220, damage: 0, atkCooldown: 1500 },
            hpPerUpgrade: 10,
            armorType: 'light',
            tags: ['drone', 'light', 'support'],
            isMarker: true,
            markerRange: 220,
            markerDuration: 5000,
        },
        shieldman: {
            name: '盾卫', texture: 'tex_shieldman', portrait: '🛡️',
            cost: { minerals: 90, gas: 30 }, supply: 2,
            stats: { maxHp: 200, speed: 80, range: 80, damage: 8, atkCooldown: 800 },
            hpPerUpgrade: 30,
            armorType: 'heavy',
            tags: ['infantry', 'heavy'],
            isTaunt: true,
            tauntRange: 140,
        },
        sniper: {
            name: '狙击手', texture: 'tex_sniper', portrait: '🎯',
            cost: { minerals: 100, gas: 40 }, supply: 2,
            stats: { maxHp: 60, speed: 100, range: 320, damage: 40, atkCooldown: 2000 },
            projectile: { texture: 'tex_bullet', speed: 800, tint: 0xff2200, scale: 1.2, lifespan: 900, muzzle: 0xff2200 },
            hpPerUpgrade: 15,
            armorType: 'light',
            tags: ['infantry', 'light'],
            preferArmor: 'heavy',
            bonusVs: { heavy: 1.5 },
        },
    },

    ENEMIES: {
        zergling: {
            texture: 'tex_zergling', hp: 40, speed: 120, damage: 12, atkCooldown: 1000, xp: 10, coreChance: 0.1,
            armorType: 'light', tags: ['bio', 'light'],
        },
        hydralisk: {
            texture: 'tex_hydralisk', hp: 70, speed: 80, damage: 12, atkCooldown: 1000, xp: 10, coreChance: 0.2,
            armorType: 'bio', tags: ['bio', 'ranged'],
        },
        ultralisk: {
            texture: 'tex_ultralisk', hp: 350, speed: 80, damage: 30, atkCooldown: 1000, xp: 30, coreChance: 0.3,
            armorType: 'heavy', tags: ['bio', 'heavy'],
            bonusVs: { building: 1.5 },
        },

        // ===== 新增敌人（第 1 批） =====
        reaper: {
            texture: 'tex_reaper', hp: 60, speed: 140, damage: 8, atkCooldown: 1000, xp: 15, coreChance: 0.15,
            armorType: 'light', tags: ['bio', 'light', 'suicide'],
            deathExplosion: { radius: 70, damage: 40, buildingBonus: 1.5 },
        },
        acidspitter: {
            texture: 'tex_acidspitter', hp: 120, speed: 55, damage: 12, atkCooldown: 1600, xp: 20, coreChance: 0.2,
            armorType: 'bio', tags: ['bio', 'ranged'],
            attackRange: 150,
            projectile: { texture: 'tex_acid', speed: 200, tint: 0x88ff00, scale: 1, lifespan: 1200, muzzle: 0x88ff00 },
            onHitAcid: { radius: 40, dps: 8, duration: 4000 },
        },
        crystalspike: {
            texture: 'tex_crystalspike', hp: 250, speed: 60, damage: 25, atkCooldown: 1200, xp: 30, coreChance: 0.3,
            armorType: 'heavy', tags: ['bio', 'heavy'],
            bonusVs: { building: 1.5 },
        },
        flier: {
            texture: 'tex_flier', hp: 50, speed: 160, damage: 10, atkCooldown: 900, xp: 15, coreChance: 0.15,
            armorType: 'light', tags: ['bio', 'light', 'flying'],
        },
    },

    BUILDINGS: {
        base:   { texture: 'tex_base',   hp: 1500, w: 120, h: 120, armorType: 'building', tags: ['structure'] },
        depot:  { texture: 'tex_depot',  hp: 500,  cost: { minerals: 100, gas: 0 }, supplyBonus: 10, w: 50, h: 50, armorType: 'building', tags: ['structure'] },
        turret: { texture: 'tex_turret', hp: 400,  cost: { minerals: 120, gas: 25 }, range: 220, damage: 18, atkCooldown: 500, w: 40, h: 40, armorType: 'building', tags: ['structure', 'defense'] },

        shield_gen:  { texture: 'tex_shield_gen',  hp: 900, w: 70, h: 70, neutral: true, armorType: 'building', tags: ['structure', 'protect'] },
        convoy:      { texture: 'tex_convoy',      hp: 400, w: 50, h: 50, neutral: true, speed: 60, armorType: 'building', tags: ['structure', 'convoy'] },
        beacon:      { texture: 'tex_beacon',      hp: 1200, w: 70, h: 70, neutral: true, armorType: 'building', tags: ['structure', 'protect'] },
        fortress_core: { texture: 'tex_shield_gen', hp: 1800, w: 90, h: 90, armorType: 'building', tags: ['structure'] },

        // ===== 新增友方建筑（第 1 批） =====
        flame_turret: {
            name: '火焰塔', texture: 'tex_flame_turret', hp: 320,
            cost: { minerals: 100, gas: 0 }, w: 40, h: 40,
            range: 130, damage: 10, atkCooldown: 700,
            splash: true,
            armorType: 'building', tags: ['structure', 'defense'],
            bonusVs: { light: 1.5, bio: 1.4 },
        },
        sniper_turret: {
            name: '狙击塔', texture: 'tex_sniper_turret', hp: 300,
            cost: { minerals: 120, gas: 25 }, w: 40, h: 40,
            range: 320, damage: 30, atkCooldown: 1400,
            armorType: 'building', tags: ['structure', 'defense'],
            bonusVs: { heavy: 1.4 },
        },
        repair_station: {
            name: '维修站', texture: 'tex_repair_station', hp: 400,
            cost: { minerals: 100, gas: 25 }, w: 50, h: 50,
            isRepairStation: true, repairRange: 150, repairAmount: 25,
            armorType: 'building', tags: ['structure', 'support'],
        },
        radar_station: {
            name: '雷达站', texture: 'tex_radar_station', hp: 300,
            cost: { minerals: 80, gas: 40 }, w: 50, h: 50,
            isRadar: true, radarRange: 320,
            armorType: 'building', tags: ['structure', 'support'],
        },
        wall: {
            name: '障碍墙', texture: 'tex_wall', hp: 800,
            cost: { minerals: 50, gas: 0 }, w: 40, h: 40,
            highThreat: true,
            armorType: 'building', tags: ['structure'],
        },

        // ===== 新增敌方建筑（第 1 批） =====
        hive: {
            name: '虫巢', texture: 'tex_hive', hp: 600, w: 80, h: 80,
            spawner: { type: 'zergling', count: 2, interval: 8000 },
            armorType: 'building', tags: ['structure', 'hive'],
        },
        spike: {
            name: '地刺', texture: 'tex_spike', hp: 400, w: 40, h: 40,
            range: 120, damage: 15, atkCooldown: 800,
            armorType: 'building', tags: ['structure', 'defense'],
        },
        spore: {
            name: '孢子炮', texture: 'tex_spore', hp: 500, w: 50, h: 50,
            range: 200, damage: 20, atkCooldown: 1600, splash: true,
            armorType: 'building', tags: ['structure', 'defense'],
        },
    },

    SKILLS: {
        orbital: { name: '轨道打击', cost: 100, damage: 150 },
        repair:  { name: '战场维修', cost: 50, unitHeal: 100, buildingHeal: 200 },

        // ===== 新增指挥官技能（第 1 批） =====
        airdrop: {
            name: '空投增援', cost: 120, unitType: 'marine', count: 3, lifetime: 45000,
        },
        shield_field: {
            name: '护盾场', cost: 100, radius: 140, shield: 80, duration: 10000,
        },
        scan: {
            name: '侦察扫描', cost: 60, radius: 500, markDuration: 10000,
        },
        nano_repair: {
            name: '纳米修复', cost: 80, radius: 160, hpPerSec: 30, duration: 5000,
        },
        minefield: {
            name: '地雷阵', cost: 80, count: 5, damage: 60, triggerRadius: 45, lifetime: 60000,
        },
        emp: {
            name: '电磁脉冲', cost: 100, radius: 280, stunDuration: 3000,
        },
    },

    NODE_DEFAULT: {
        texture: 'tex_node_radar',
        tint: { radar: 0x00f0ff, thermal: 0xffb703 },
        label: { radar: '📡 战术雷达据点', thermal: '♨️ 热能泉据点' },
        labelColor: { radar: '#00f0ff', thermal: '#ffb703' },
    },

    CAPTURE: {
        RADIUS: 120,
        RATE_PER_UNIT: 0.15,
        DECAY: 0.1,
        RADAR_CORE_CHANCE: 0.08,
        THERMAL_GAS_BONUS: 12,
    },

    WAVE_SPAWN: { EDGE_MARGIN: 100, JITTER: 100 },

    PROMOTION: {
        XP_VET: 50, XP_ELITE: 150,
        VET_BONUS: { hp: 20, damage: 5 },
        ELITE_BONUS: { hp: 30, damage: 10 },
    },

    OBJECTIVE_DEFAULT: { optional: false, hidden: false },
    FAIL_DEFAULT: { soft: false },

    PROTECT_TARGETS: {
        beacon:  { label: '方舟信标',     color: '#00f0ff' },
        convoy:  { label: '难民运输车',   color: '#ffb703' },
        gen:     { label: '护盾发生器',   color: '#00f0ff' },
    },
};