// js/data/ark.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.ArkData = {
    // ===== 方舟部门定义 =====
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
                }
            ]
        },

        research: {
            id: 'research',
            name: '科研实验室',
            icon: '🔬',
            desc: '解锁兵种卡、卡槽扩容、全局科技。原主菜单科技实验室已并入此处。',
            maxLevel: 5,
            upgradeCost: [5, 15, 30, 60, 120],
            bonusPerLevel: {},
            upgrades: [
                {
                    id: 'unlock_ghost',
                    name: '兵种档案：幽灵特工',
                    desc: '解锁【幽灵】兵种卡。解锁后需在战前装载中携带才能建造。',
                    maxLevel: 1,
                    cost: [15],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['unit_ghost'] }
                },
                // ===== 旧科技迁入 =====
                // legacyKey: 升级时同步写入 State.upgrades[key]
                // 效果由 entities.js / wave.js 直接读取 State.upgrades 应用
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
                // ===== 旧科技迁入结束 =====
                {
                    id: 'unlock_tank',
                    name: '兵种档案：攻城坦克',
                    desc: '解锁【坦克】兵种卡。解锁后需在战前装载中携带才能建造。',
                    maxLevel: 1,
                    cost: [25],
                    requires: { deptLevel: 2 },
                    unlocks: { cards: ['unit_tank'] }
                },
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
            upgrades: []
        },

        hangar: {
            id: 'hangar',
            name: '机库军械库',
            icon: '✈️',
            desc: '空投、装备改装、载具维护。',
            maxLevel: 5,
            upgradeCost: [5, 15, 30, 60, 120],
            bonusPerLevel: {},
            upgrades: []
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
                    desc: '解锁指挥官技能【战场维修】。解锁后仍需在战前装载中携带。',
                    maxLevel: 1,
                    cost: [15],
                    requires: { deptLevel: 1 },
                    unlocks: { cards: ['skill_repair'] }
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
            upgrades: []
        },

        intel: {
            id: 'intel',
            name: '情报通讯',
            icon: '📡',
            desc: '地图情报、波次预览、雷达。',
            maxLevel: 5,
            upgradeCost: [5, 15, 30, 60, 120],
            bonusPerLevel: {},
            upgrades: []
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

    // ===== 卡牌定义 =====
    CARDS: {
        unit_marine: {
            id: 'unit_marine',
            type: 'unit',
            name: '陆战队员',
            slotCost: 1,
            buildKey: 'marine',
            defaultUnlocked: true,
            desc: '基础步兵，便宜、通用。'
        },
        unit_firebat: {
            id: 'unit_firebat',
            type: 'unit',
            name: '火蝠',
            slotCost: 1,
            buildKey: 'firebat',
            defaultUnlocked: true,
            desc: '近距离范围伤害，适合清理虫群。'
        },
        building_turret: {
            id: 'building_turret',
            type: 'building',
            name: '自动炮塔',
            slotCost: 1,
            buildKey: 'turret',
            defaultUnlocked: true,
            desc: '固定防御建筑，前期守点核心。'
        },
        unit_ghost: {
            id: 'unit_ghost',
            type: 'unit',
            name: '幽灵特工',
            slotCost: 1,
            buildKey: 'ghost',
            unlockBy: 'research.unlock_ghost',
            desc: '高机动远程单位，需科研实验室解锁。'
        },
        unit_tank: {
            id: 'unit_tank',
            type: 'unit',
            name: '攻城坦克',
            slotCost: 2,
            buildKey: 'tank',
            unlockBy: 'research.unlock_tank',
            desc: '重装甲攻城单位，可架设。占 2 格。'
        },
        skill_orbital: {
            id: 'skill_orbital',
            type: 'skill',
            name: '轨道打击',
            slotCost: 2,
            skillKey: 'orbital',
            unlockBy: 'bridge.unlock_orbital',
            desc: '指挥官技能：全局轨道轰炸。占 2 格。'
        },
        skill_repair: {
            id: 'skill_repair',
            type: 'skill',
            name: '战场维修',
            slotCost: 1,
            skillKey: 'repair',
            unlockBy: 'engineering.unlock_repair',
            desc: '指挥官技能：治疗单位、修复建筑。'
        }
    },

    // ===== 装载规则 =====
    LOADOUT: {
        baseSlots: 3,
        maxSlots: 8,
        allowDuplicate: false,
        defaultEquipped: ['unit_marine', 'unit_firebat', 'building_turret']
    },

    // ===== 战役结算默认战利品 =====
    DEFAULT_LOOT: {
        victory: { alloy: 20, data: 15, supply: 10 },
        defeat:  { alloy: 5,  data: 3,  supply: 0  }
    }
};