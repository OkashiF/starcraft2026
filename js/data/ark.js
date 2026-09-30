// js/data/ark.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.ArkData = {
    DEPARTMENTS: {
        bridge: {
            id: 'bridge',
            name: '舰桥指挥中心',
            icon: '🛰️',
            desc: '解锁战役、空投、指挥官技能槽，提供开局资源与技能冷却。',
            maxLevel: 5,
            upgradeCost: [5, 15, 30, 60, 120],
            bonusPerLevel: { startMinerals: 20 },
            upgrades: [
                {
                    id: 'unlock_orbital',
                    name: '指挥协议：轨道打击',
                    desc: '解锁指挥官技能【轨道打击】。解锁后仍需在战前装载中携带。',
                    maxLevel: 1,
                    cost: [20],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['skill_orbital'] }
                },
                {
                    id: 'bridge_slot_1',
                    name: '指挥席位扩容',
                    desc: '战前装载卡槽 +1。',
                    maxLevel: 1,
                    cost: [30],
                    requires: { deptLevel: 2 },
                    effects: [{ key: 'loadoutSlot', value: 1 }]
                },
                {
                    id: 'unlock_shield_field',
                    name: '指挥协议：护盾场',
                    desc: '解锁指挥官技能【护盾场】。',
                    maxLevel: 1,
                    cost: [25],
                    requires: { deptLevel: 2 },
                    unlocks: { cards: ['skill_shield_field'] }
                },
                {
                    id: 'unlock_scan',
                    name: '指挥协议：侦察扫描',
                    desc: '解锁指挥官技能【侦察扫描】。',
                    maxLevel: 1,
                    cost: [25],
                    requires: { deptLevel: 2 },
                    unlocks: { cards: ['skill_scan'] }
                }
            ]
        },

        research: {
            id: 'research',
            name: '科研实验室',
            icon: '🔬',
            desc: '解锁兵种卡、卡槽扩容、全局科技。',
            maxLevel: 5,
            upgradeCost: [5, 15, 30, 60, 120],
            bonusPerLevel: {},
            upgrades: [
                {
                    id: 'unlock_ghost',
                    name: '兵种档案：幽灵特工',
                    desc: '解锁【幽灵】兵种卡。',
                    maxLevel: 1,
                    cost: [15],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['unit_ghost'] }
                },
                {
                    id: 'node_infantryHp',
                    name: '单兵复合装甲',
                    desc: '步兵单位生命值提升。每级 +15 HP。',
                    maxLevel: 3,
                    cost: [2, 5, 10],
                    requires: { deptLevel: 1 },
                    legacyKey: 'infantryHp'
                },
                {
                    id: 'node_mechAtk',
                    name: '机甲火控系统',
                    desc: '机甲单位攻击力提升。每级 +10 伤害。',
                    maxLevel: 3,
                    cost: [2, 5, 10],
                    requires: { deptLevel: 1 },
                    legacyKey: 'mechAtk'
                },
                {
                    id: 'node_economy',
                    name: '自动化精炼厂',
                    desc: '资源采集效率提升。每级 +4 晶矿 / +2 瓦斯每秒。',
                    maxLevel: 3,
                    cost: [2, 5, 10],
                    requires: { deptLevel: 1 },
                    legacyKey: 'economy'
                },
                {
                    id: 'unlock_tank',
                    name: '兵种档案：攻城坦克',
                    desc: '解锁【坦克】兵种卡。',
                    maxLevel: 1,
                    cost: [25],
                    requires: { deptLevel: 2 },
                    unlocks: { cards: ['unit_tank'] }
                },
                {
                    id: 'unlock_rocketeer',
                    name: '兵种档案：火箭兵',
                    desc: '解锁【火箭兵】兵种卡。',
                    maxLevel: 1,
                    cost: [15],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['unit_rocketeer'] }
                },
                {
                    id: 'unlock_sniper',
                    name: '兵种档案：狙击手',
                    desc: '解锁【狙击手】兵种卡。',
                    maxLevel: 1,
                    cost: [25],
                    requires: { deptLevel: 2 },
                    unlocks: { cards: ['unit_sniper'] }
                },
                {
                    id: 'unlock_shieldman',
                    name: '兵种档案：盾卫',
                    desc: '解锁【盾卫】兵种卡。',
                    maxLevel: 1,
                    cost: [20],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['unit_shieldman'] }
                },
                {
                    id: 'unlock_flame_turret',
                    name: '建筑档案：火焰塔',
                    desc: '解锁【火焰塔】建筑卡。',
                    maxLevel: 1,
                    cost: [15],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['building_flame_turret'] }
                },
                {
                    id: 'unlock_sniper_turret',
                    name: '建筑档案：狙击塔',
                    desc: '解锁【狙击塔】建筑卡。',
                    maxLevel: 1,
                    cost: [25],
                    requires: { deptLevel: 2 },
                    unlocks: { cards: ['building_sniper_turret'] }
                },
                // ===== 卡槽扩容链：I–VI，共 +6 =====
                {
                    id: 'loadout_slot_1',
                    name: '卡槽扩容 I',
                    desc: '战前装载卡槽 +1。',
                    maxLevel: 1,
                    cost: [20],
                    requires: { deptLevel: 2 },
                    effects: [{ key: 'loadoutSlot', value: 1 }]
                },
                {
                    id: 'loadout_slot_2',
                    name: '卡槽扩容 II',
                    desc: '战前装载卡槽 +1。',
                    maxLevel: 1,
                    cost: [50],
                    requires: { deptLevel: 3, nodes: ['loadout_slot_1'] },
                    effects: [{ key: 'loadoutSlot', value: 1 }]
                },
                {
                    id: 'loadout_slot_3',
                    name: '卡槽扩容 III',
                    desc: '战前装载卡槽 +1。',
                    maxLevel: 1,
                    cost: [100],
                    requires: { deptLevel: 4, nodes: ['loadout_slot_2'] },
                    effects: [{ key: 'loadoutSlot', value: 1 }]
                },
                {
                    id: 'loadout_slot_4',
                    name: '卡槽扩容 IV',
                    desc: '战前装载卡槽 +1。',
                    maxLevel: 1,
                    cost: [150],
                    requires: { deptLevel: 5, nodes: ['loadout_slot_3'] },
                    effects: [{ key: 'loadoutSlot', value: 1 }]
                },
                {
                    id: 'loadout_slot_5',
                    name: '卡槽扩容 V',
                    desc: '战前装载卡槽 +1。',
                    maxLevel: 1,
                    cost: [220],
                    requires: { deptLevel: 5, nodes: ['loadout_slot_4'] },
                    effects: [{ key: 'loadoutSlot', value: 1 }]
                },
                {
                    id: 'loadout_slot_6',
                    name: '卡槽扩容 VI',
                    desc: '战前装载卡槽 +1。',
                    maxLevel: 1,
                    cost: [300],
                    requires: { deptLevel: 5, nodes: ['loadout_slot_5'] },
                    effects: [{ key: 'loadoutSlot', value: 1 }]
                }
            ]
        },

        barracks: {
            id: 'barracks',
            name: '兵营训练舱',
            icon: '🎖️',
            desc: '老兵训练、晋升、单位经验。',
            maxLevel: 5,
            upgradeCost: [5, 15, 30, 60, 120],
            bonusPerLevel: { unitXpBonus: 5 },
            upgrades: [
                {
                    id: 'unlock_medic',
                    name: '支援档案：医疗兵',
                    desc: '解锁【医疗兵】兵种卡。',
                    maxLevel: 1,
                    cost: [15],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['unit_medic'] }
                },
                {
                    id: 'unlock_engineer',
                    name: '支援档案：工程师',
                    desc: '解锁【工程师】兵种卡。',
                    maxLevel: 1,
                    cost: [15],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['unit_engineer'] }
                }
            ]
        },

        hangar: {
            id: 'hangar',
            name: '机库军械库',
            icon: '✈️',
            desc: '空投、装备改装、载具维护。',
            maxLevel: 5,
            upgradeCost: [5, 15, 30, 60, 120],
            bonusPerLevel: {},
            upgrades: [
                {
                    id: 'unlock_airdrop',
                    name: '指挥协议：空投增援',
                    desc: '解锁指挥官技能【空投增援】。',
                    maxLevel: 1,
                    cost: [20],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['skill_airdrop'] }
                },
                {
                    id: 'unlock_drone',
                    name: '支援档案：侦察无人机',
                    desc: '解锁【侦察无人机】兵种卡。',
                    maxLevel: 1,
                    cost: [15],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['unit_drone'] }
                }
            ]
        },

        engineering: {
            id: 'engineering',
            name: '工程制造局',
            icon: '⚙️',
            desc: '制造家具/设备/建筑预制、维修。',
            maxLevel: 5,
            upgradeCost: [5, 15, 30, 60, 120],
            bonusPerLevel: {},
            upgrades: [
                {
                    id: 'unlock_repair',
                    name: '指挥协议：战场维修',
                    desc: '解锁指挥官技能【战场维修】。',
                    maxLevel: 1,
                    cost: [15],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['skill_repair'] }
                },
                {
                    id: 'unlock_repair_station',
                    name: '建筑档案：维修站',
                    desc: '解锁【维修站】建筑卡。',
                    maxLevel: 1,
                    cost: [20],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['building_repair_station'] }
                },
                {
                    id: 'unlock_wall',
                    name: '建筑档案：障碍墙',
                    desc: '解锁【障碍墙】建筑卡。',
                    maxLevel: 1,
                    cost: [10],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['building_wall'] }
                },
                {
                    id: 'unlock_nano_repair',
                    name: '指挥协议：纳米修复',
                    desc: '解锁指挥官技能【纳米修复】。',
                    maxLevel: 1,
                    cost: [30],
                    requires: { deptLevel: 2 },
                    unlocks: { cards: ['skill_nano_repair'] }
                },
                {
                    id: 'unlock_minefield',
                    name: '指挥协议：地雷阵',
                    desc: '解锁指挥官技能【地雷阵】。',
                    maxLevel: 1,
                    cost: [25],
                    requires: { deptLevel: 2 },
                    unlocks: { cards: ['skill_minefield'] }
                }
            ]
        },

        power: {
            id: 'power',
            name: '动力核心',
            icon: '⚡',
            desc: '电力上限、应急供电、安全。',
            maxLevel: 5,
            upgradeCost: [5, 15, 30, 60, 120],
            bonusPerLevel: {},
            upgrades: [
                {
                    id: 'unlock_emp',
                    name: '指挥协议：电磁脉冲',
                    desc: '解锁指挥官技能【电磁脉冲】。',
                    maxLevel: 1,
                    cost: [30],
                    requires: { deptLevel: 2 },
                    unlocks: { cards: ['skill_emp'] }
                }
            ]
        },

        intel: {
            id: 'intel',
            name: '情报通讯',
            icon: '📡',
            desc: '地图情报、波次预览、雷达。',
            maxLevel: 5,
            upgradeCost: [5, 15, 30, 60, 120],
            bonusPerLevel: {},
            upgrades: [
                {
                    id: 'unlock_radar_station',
                    name: '建筑档案：雷达站',
                    desc: '解锁【雷达站】建筑卡。',
                    maxLevel: 1,
                    cost: [25],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['building_radar_station'] }
                }
            ]
        },

        medical: {
            id: 'medical',
            name: '医疗冻眠舱',
            icon: '🧬',
            desc: '治疗、复活、保存老兵。',
            maxLevel: 5,
            upgradeCost: [5, 15, 30, 60, 120],
            bonusPerLevel: {},
            upgrades: []
        },

        life: {
            id: 'life',
            name: '生活娱乐',
            icon: '☕',
            desc: '士气、舒适、招募、事件。',
            maxLevel: 5,
            upgradeCost: [5, 15, 30, 60, 120],
            bonusPerLevel: {},
            upgrades: []
        },

        storage: {
            id: 'storage',
            name: '后勤仓储',
            icon: '📦',
            desc: '扩充方舟仓储容量，增加每次战役开始时的初始晶矿与瓦斯补给。',
            maxLevel: 3,
            upgradeCost: [2, 4, 8],
            bonusPerLevel: {
                startMinerals: 30,
                startGas: 15
            },
            upgrades: []
        }
    },

    CARDS: {
        // 默认解锁
        unit_marine: {
            id: 'unit_marine', type: 'unit', name: '陆战队员',
            slotCost: 1, buildKey: 'marine', defaultUnlocked: true,
            desc: '基础步兵，便宜、通用。'
        },
        unit_firebat: {
            id: 'unit_firebat', type: 'unit', name: '火蝠',
            slotCost: 1, buildKey: 'firebat', defaultUnlocked: true,
            desc: '近距离范围伤害，适合清理虫群。'
        },
        building_turret: {
            id: 'building_turret', type: 'building', name: '自动炮塔',
            slotCost: 1, buildKey: 'turret', defaultUnlocked: true,
            desc: '固定防御建筑，前期守点核心。'
        },

        // 通过方舟解锁
        unit_ghost: {
            id: 'unit_ghost', type: 'unit', name: '幽灵特工',
            slotCost: 1, buildKey: 'ghost', unlockBy: 'research.unlock_ghost',
            desc: '高机动远程单位。'
        },
        unit_tank: {
            id: 'unit_tank', type: 'unit', name: '攻城坦克',
            slotCost: 2, buildKey: 'tank', unlockBy: 'research.unlock_tank',
            desc: '重装甲攻城单位，可架设。占 2 格。'
        },
        unit_rocketeer: {
            id: 'unit_rocketeer', type: 'unit', name: '火箭兵',
            slotCost: 1, buildKey: 'rocketeer', unlockBy: 'research.unlock_rocketeer',
            desc: '反轻甲群 / 反建筑，小范围爆炸。'
        },
        unit_medic: {
            id: 'unit_medic', type: 'unit', name: '医疗兵',
            slotCost: 1, buildKey: 'medic', unlockBy: 'barracks.unlock_medic',
            desc: '治疗附近最低血量友军。无攻击。'
        },
        unit_engineer: {
            id: 'unit_engineer', type: 'unit', name: '工程师',
            slotCost: 1, buildKey: 'engineer', unlockBy: 'barracks.unlock_engineer',
            desc: '修理附近建筑与保护目标。'
        },
        unit_drone: {
            id: 'unit_drone', type: 'unit', name: '侦察无人机',
            slotCost: 1, buildKey: 'drone', unlockBy: 'hangar.unlock_drone',
            desc: '高速，标记敌人使其受伤 +15%。'
        },
        unit_shieldman: {
            id: 'unit_shieldman', type: 'unit', name: '盾卫',
            slotCost: 1, buildKey: 'shieldman', unlockBy: 'research.unlock_shieldman',
            desc: '高 HP 前排，吸引敌人火力。'
        },
        unit_sniper: {
            id: 'unit_sniper', type: 'unit', name: '狙击手',
            slotCost: 2, buildKey: 'sniper', unlockBy: 'research.unlock_sniper',
            desc: '超远单体，优先重甲。占 2 格。'
        },

        building_flame_turret: {
            id: 'building_flame_turret', type: 'building', name: '火焰塔',
            slotCost: 1, buildKey: 'flame_turret', unlockBy: 'research.unlock_flame_turret',
            desc: '短程 AOE，对轻甲 / 生物高伤。'
        },
        building_sniper_turret: {
            id: 'building_sniper_turret', type: 'building', name: '狙击塔',
            slotCost: 1, buildKey: 'sniper_turret', unlockBy: 'research.unlock_sniper_turret',
            desc: '远程单体，对重甲高伤。'
        },
        building_repair_station: {
            id: 'building_repair_station', type: 'building', name: '维修站',
            slotCost: 1, buildKey: 'repair_station', unlockBy: 'engineering.unlock_repair_station',
            desc: '修理附近建筑。'
        },
        building_radar_station: {
            id: 'building_radar_station', type: 'building', name: '雷达站',
            slotCost: 1, buildKey: 'radar_station', unlockBy: 'intel.unlock_radar_station',
            desc: '提供大范围视野与标记。'
        },
        building_wall: {
            id: 'building_wall', type: 'building', name: '障碍墙',
            slotCost: 1, buildKey: 'wall', unlockBy: 'engineering.unlock_wall',
            desc: '高 HP 吸引火力，不阻挡。'
        },

        skill_orbital: {
            id: 'skill_orbital', type: 'skill', name: '轨道打击',
            slotCost: 2, skillKey: 'orbital', unlockBy: 'bridge.unlock_orbital',
            desc: '指挥官技能：全局轨道轰炸。占 2 格。'
        },
        skill_repair: {
            id: 'skill_repair', type: 'skill', name: '战场维修',
            slotCost: 1, skillKey: 'repair', unlockBy: 'engineering.unlock_repair',
            desc: '指挥官技能：治疗单位、修复建筑。'
        },
        skill_airdrop: {
            id: 'skill_airdrop', type: 'skill', name: '空投增援',
            slotCost: 2, skillKey: 'airdrop', unlockBy: 'hangar.unlock_airdrop',
            desc: '召唤 3 个临时陆战队员（45 秒）。占 2 格。'
        },
        skill_shield_field: {
            id: 'skill_shield_field', type: 'skill', name: '护盾场',
            slotCost: 1, skillKey: 'shield_field', unlockBy: 'bridge.unlock_shield_field',
            desc: '范围内友军获得护盾。'
        },
        skill_scan: {
            id: 'skill_scan', type: 'skill', name: '侦察扫描',
            slotCost: 1, skillKey: 'scan', unlockBy: 'bridge.unlock_scan',
            desc: '标记所有敌人，受伤 +15%。'
        },
        skill_nano_repair: {
            id: 'skill_nano_repair', type: 'skill', name: '纳米修复',
            slotCost: 1, skillKey: 'nano_repair', unlockBy: 'engineering.unlock_nano_repair',
            desc: '持续回复范围内友军生命。'
        },
        skill_minefield: {
            id: 'skill_minefield', type: 'skill', name: '地雷阵',
            slotCost: 1, skillKey: 'minefield', unlockBy: 'engineering.unlock_minefield',
            desc: '在指挥中心周围布设 5 颗地雷。'
        },
        skill_emp: {
            id: 'skill_emp', type: 'skill', name: '电磁脉冲',
            slotCost: 2, skillKey: 'emp', unlockBy: 'power.unlock_emp',
            desc: '全局眩晕敌人 3 秒。占 2 格。'
        }
    },

    LOADOUT: {
        baseSlots: 5,
        maxSlots: 12,
        allowDuplicate: false,
        defaultEquipped: ['unit_marine', 'unit_firebat', 'building_turret']
    },

    DEFAULT_LOOT: {
        victory: { alloy: 20, data: 15, supply: 10 },
        defeat:  { alloy: 5,  data: 3,  supply: 0  }
    }
};