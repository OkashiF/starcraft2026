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

    UNITS: {
        marine: {
            name: '陆战队', texture: 'tex_marine', portrait: '🪖',
            cost: { minerals: 50, gas: 0 }, supply: 1,
            stats: { maxHp: 60, speed: 130, range: 200, damage: 10, atkCooldown: 400 },
            projectile: { texture: 'tex_bullet', speed: 450, tint: 0xffdd00, scale: 1, lifespan: 800, muzzle: 0xffdd00 },
            hpPerUpgrade: 15,
        },
        firebat: {
            name: '火蝠', texture: 'tex_firebat', portrait: '🔥',
            cost: { minerals: 100, gas: 25 }, supply: 2,
            stats: { maxHp: 140, speed: 100, range: 100, damage: 22, atkCooldown: 900 },
            projectile: { texture: 'tex_flame', speed: 300, tint: 0xff5500, scale: 0.5, endScale: 1.5, lifespan: 400, muzzle: 0xff5500, flame: true },
            hpPerUpgrade: 30,
        },
        ghost: {
            name: '幽灵', texture: 'tex_ghost', portrait: '👻',
            cost: { minerals: 120, gas: 75 }, supply: 2,
            stats: { maxHp: 80, speed: 120, range: 260, damage: 25, atkCooldown: 1100 },
            projectile: { texture: 'tex_bullet', speed: 450, tint: 0xffdd00, scale: 1, lifespan: 800, muzzle: 0xffdd00 },
            hpPerUpgrade: 20,
        },
        tank: {
            name: '攻城坦克', texture: 'tex_tank', portrait: '🛡️',
            cost: { minerals: 150, gas: 100 }, supply: 3,
            stats: { maxHp: 200, speed: 80, range: 280, damage: 45, atkCooldown: 1600 },
            projectile: { texture: 'tex_bullet', speed: 600, tint: 0x00f0ff, scale: 1.5, lifespan: 800, muzzle: 0x00f0ff },
            hpPerUpgrade: 0,
            damagePerUpgrade: 10,
            siege: { speed: 0, range: 450, damage: 100, atkCooldown: 2500, tint: 0xff7700, damagePerUpgrade: 25 },
        },
    },

    ENEMIES: {
        zergling:  { texture: 'tex_zergling',  hp: 40,  speed: 120, damage: 12, atkCooldown: 1000, xp: 10, coreChance: 0.1 },
        hydralisk: { texture: 'tex_hydralisk', hp: 70,  speed: 80,  damage: 12, atkCooldown: 1000, xp: 10, coreChance: 0.2 },
        ultralisk: { texture: 'tex_ultralisk', hp: 350, speed: 80,  damage: 30, atkCooldown: 1000, xp: 30, coreChance: 0.3 },
    },

    BUILDINGS: {
        base:   { texture: 'tex_base',   hp: 1500, w: 120, h: 120 },
        depot:  { texture: 'tex_depot',  hp: 500,  cost: { minerals: 100, gas: 0 }, supplyBonus: 10, w: 50, h: 50 },
        turret: { texture: 'tex_turret', hp: 400,  cost: { minerals: 120, gas: 25 }, range: 220, damage: 18, atkCooldown: 500, w: 40, h: 40 },
        // 保护类目标建筑（中立/友方）
        shield_gen:  { texture: 'tex_shield_gen',  hp: 900, w: 70, h: 70, neutral: true },
        convoy:      { texture: 'tex_convoy',      hp: 400, w: 50, h: 50, neutral: true, speed: 60 },
        beacon:      { texture: 'tex_beacon',      hp: 1200, w: 70, h: 70, neutral: true },
	fortress_core: { texture: 'tex_shield_gen', hp: 1800, w: 90, h: 90 },
    },

    SKILLS: {
        orbital: { cost: 100, damage: 150 },
        repair:  { cost: 50, unitHeal: 100, buildingHeal: 200 },
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

    // ===== 任务系统默认参数 =====
    OBJECTIVE_DEFAULT: {
        optional: false,
        hidden: false,
    },
    FAIL_DEFAULT: {
        soft: false,
    },

    // ===== 保护目标标签 =====
    PROTECT_TARGETS: {
        beacon:  { label: '方舟信标',     color: '#00f0ff' },
        convoy:  { label: '难民运输车',   color: '#ffb703' },
        gen:     { label: '护盾发生器',   color: '#00f0ff' },
    },
};