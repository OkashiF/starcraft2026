// js/data/campaigns.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.Campaigns = {
    outpost_defense: {
        id: 'outpost_defense',
        name: '前哨站保卫战',
        subtitle: '3号矿坑行星',
        briefing:
            '<strong>目标：</strong> 在3号矿坑行星建立前哨，抵抗异虫蜂拥而至的攻击。<br><br>' +
            '占领并守住地图上的【战术雷达】和【热能泉】以获取珍贵的战备物资。<br><br>' +
            '<span style="color: var(--accent);">⚠️ 提示：即便防线崩溃，收集到的科技核心也会由逃生舱送回方舟。</span>',

        unlock: { type: 'default' },

        map: {
            width: 2400, height: 2400,
            base:  { x: 1200, y: 1200 },
            depot: { x: 1080, y: 1200 },
            nodes: [
                { type: 'radar',   x: 1200, y: 700  },
                { type: 'thermal', x: 600,  y: 1600 },
            ],
        },

        start: { minerals: 300, gas: 100, maxSupply: 20, waveTimer: 45 },

        initialUnits: [
            { type: 'marine',  dx: 0,   dy: 120 },
            { type: 'marine',  dx: 40,  dy: 120 },
            { type: 'firebat', dx: -40, dy: 120 },
        ],

        waves: [
            { count: 10,  types: ['zergling'],                            interval: 45 },
            { count: 16, types: ['zergling', 'hydralisk'],               interval: 45 },
            { count: 32, types: ['zergling', 'hydralisk'],               interval: 40 },
            { count: 36, types: ['hydralisk', 'ultralisk'],              interval: 40 },
            { count: 42, types: ['zergling', 'hydralisk', 'ultralisk'],  interval: 35 },
        ],

        objectives: [
            { type: 'survive_waves', value: 5 },
        ],

        failConditions: [
            { type: 'base_destroyed', reason: '指挥中心被摧毁' },
        ],

        rewards: { coresPerWin: 3 },

        victoryText: '人类的星火将在星渊中永不熄灭！',
        defeatText: '指挥官，休整后我们再夺回这片土地！',

        scripts: [
            { trigger: { type: 'onStart' },                              dialogue: 'outpost_intro'   },
            { trigger: { type: 'onWave', wave: 3 },                      dialogue: 'outpost_wave3'   },
            { trigger: { type: 'onNodeCaptured', nodeType: 'radar' },    dialogue: 'outpost_radar'   },
            { trigger: { type: 'onWave', wave: 5 },                      dialogue: 'outpost_final'   },
        ],
    },

    thermal_conquest: {
        id: 'thermal_conquest',
        name: '热能泉争夺战',
        subtitle: '熔岩裂谷',
        briefing:
            '<strong>目标：</strong> 侦查发现熔岩裂谷深处蕴藏着丰富的热能泉。<br><br>' +
            '建立前哨，占领三处热能泉，在异虫的疯狂反扑中坚守到底。<br><br>' +
            '<span style="color: var(--accent);">⚠️ 战术提示：热能泉将提供持续的瓦斯补给，但也会吸引更强的异虫。</span>',

        unlock: { type: 'campaign', requires: 'outpost_defense' },

        map: {
            width: 2400, height: 2400,
            base:  { x: 1200, y: 1800 },
            depot: { x: 1080, y: 1800 },
            nodes: [
                { type: 'thermal', x: 600,  y: 900 },
                { type: 'thermal', x: 1800, y: 900 },
                { type: 'thermal', x: 1200, y: 400 },
            ],
        },

        start: { minerals: 400, gas: 150, maxSupply: 25, waveTimer: 40 },

        initialUnits: [
            { type: 'marine', dx: 0,   dy: 120 },
            { type: 'marine', dx: 40,  dy: 120 },
            { type: 'marine', dx: -40, dy: 120 },
            { type: 'tank',   dx: 80,  dy: 140 },
        ],

        waves: [
            { count: 12,  types: ['zergling'],                           interval: 40 },
            { count: 20, types: ['zergling', 'hydralisk'],              interval: 40 },
            { count: 28, types: ['hydralisk'],                          interval: 38 },
            { count: 38, types: ['zergling', 'hydralisk', 'ultralisk'], interval: 35 },
            { count: 44, types: ['zergling', 'hydralisk', 'ultralisk'], interval: 32 },
            { count: 50, types: ['ultralisk', 'hydralisk'],             interval: 30 },
        ],

        objectives: [
            { type: 'survive_waves', value: 6 },
            { type: 'capture_all_nodes' },
        ],

        failConditions: [
            { type: 'base_destroyed', reason: '指挥中心被摧毁' },
        ],

        rewards: { coresPerWin: 5 },

        victoryText: '热能泉已被彻底控制！方舟的能源危机得以缓解。',
        defeatText: '热能泉丢失了……但我们已经带回了一批宝贵的样本。',

        scripts: [
            { trigger: { type: 'onStart' },                            dialogue: 'thermal_intro'     },
            { trigger: { type: 'onWave', wave: 3 },                    dialogue: 'thermal_wave3'     },
            { trigger: { type: 'onNodeCaptured', nodeType: 'thermal' },dialogue: 'thermal_captured'  },
            { trigger: { type: 'onWave', wave: 6 },                    dialogue: 'thermal_final'     },
        ],
    },

    // ===== 攻坚 =====
    fortress_assault: {
        id: 'fortress_assault',
        name: '铁壁前哨攻坚',
        subtitle: '敌方前哨要塞',
        briefing:
            '<strong>目标：</strong> 敌方在星区部署了带护盾发生器的前哨要塞。<br><br>' +
            '摧毁 2 座护盾发生器后，要塞将失去防护，随后摧毁要塞核心即可。<br><br>' +
            '<span style="color: var(--accent);">⚠️ 若 12 分钟内未攻下，敌方增援将抵达，任务失败。</span>',

        unlock: { type: 'campaign', requires: 'thermal_conquest' },

        map: {
            width: 2400, height: 2400,
            base:  { x: 400,  y: 2000 },
            depot: { x: 300,  y: 2000 },
            nodes: [],
        },

        start: { minerals: 500, gas: 200, maxSupply: 30, waveTimer: 60 },

        initialUnits: [
            { type: 'marine', dx: 0,   dy: 120 },
            { type: 'marine', dx: 40,  dy: 120 },
            { type: 'tank',   dx: -60, dy: 140 },
        ],

        // 刷怪较缓，主要靠要塞本身
        waves: [
            { count: 6, types: ['zergling'],  interval: 90 },
            { count: 8, types: ['hydralisk'], interval: 80 },
            { count: 10, types: ['zergling', 'hydralisk'], interval: 70 },
            { count: 12, types: ['ultralisk'], interval: 70 },
            { count: 16, types: ['zergling', 'hydralisk'], interval: 60 },
        ],

        enemyBuildings: [
            { id: 'shield_gen_1', type: 'shield_gen', x: 1600, y: 1000, hp: 900,  tags: ['shield_gen'],    label: '护盾发生器 1' },
            { id: 'shield_gen_2', type: 'shield_gen', x: 2000, y: 1400, hp: 900,  tags: ['shield_gen'],    label: '护盾发生器 2' },
            { id: 'fortress_core', type: 'fortress_core', x: 1800, y: 1200, hp: 1800, tags: ['fortress_core'], label: '要塞核心' },
        ],

        objectives: [
            { id: 'shield', type: 'destroy_target', tag: 'shield_gen', count: 2, label: '摧毁护盾发生器', required: true },
            { id: 'core',   type: 'destroy_target', tag: 'fortress_core', count: 1, label: '摧毁要塞核心', required: true },
        ],

        failConditions: [
            { type: 'base_destroyed', reason: '指挥中心被摧毁' },
            { type: 'timeout', params: { seconds: 720 }, reason: '敌方增援已抵达，攻坚失败' },
        ],

        rewards: { coresPerWin: 6 },

        victoryText: '要塞陷落，敌方前哨被彻底拔除！',
        defeatText: '敌方增援抵达……我们被迫撤退。',

        scripts: [
            { trigger: { type: 'onStart' }, dialogue: 'fortress_intro' },
            { trigger: { type: 'onObjectiveComplete', objectiveId: 'shield' }, dialogue: 'fortress_shield_down' },
        ],

    },

    // ===== 保护/护送 =====
    convoy_escort: {
        id: 'convoy_escort',
        name: '难民车队',
        subtitle: '峡谷撤离线',
        briefing:
            '<strong>目标：</strong> 3 辆难民运输车正穿过峡谷。<br><br>' +
            '护送它们抵达星门撤离区。至少 1 辆存活至终点即算成功，全部损失则任务失败。<br><br>' +
            '<span style="color: var(--accent);">⚠️ 若超时（10 分钟）未抵达，星门将关闭。</span>',

        unlock: { type: 'campaign', requires: 'fortress_assault' },

        map: {
            width: 2400, height: 2400,
            base:  { x: 300,  y: 1200 },
            depot: { x: 200,  y: 1200 },
            nodes: [],
        },

        start: { minerals: 400, gas: 120, maxSupply: 25, waveTimer: 50 },

        initialUnits: [
            { type: 'marine', dx: 0,   dy: 120 },
            { type: 'firebat', dx: 40, dy: 120 },
            { type: 'tank',   dx: -60, dy: 140 },
        ],

        // 车队自身在场景生成，作为中立建筑
        convoy: {
            count: 3,
            startX: 500,
            startY: 1200,
            dx: 80,
            speed: 10,
            waypoints: [
                { x: 900,  y: 1200 },
                { x: 1400, y: 900  },
                { x: 1800, y: 1000 },
                { x: 2100, y: 1200 }, // 终点 = zone
            ],
        },

        zones: [
            { id: 'exit_gate', shape: 'circle', x: 2100, y: 1200, r: 160, label: '星门撤离区', color: 0x00ff88 },
        ],

        waves: [
            { count: 6,  types: ['zergling'], interval: 10 },
            { count: 10, types: ['zergling', 'hydralisk'], interval: 15 },
            { count: 16, types: ['hydralisk'], interval: 15 },
            { count: 18, types: ['zergling', 'hydralisk'], interval: 15 },
            { count: 22, types: ['ultralisk'], interval: 20 },
            { count: 28, types: ['zergling', 'hydralisk', 'ultralisk'], interval: 25 },
        ],

        objectives: [
            { id: 'escort', type: 'reach_zone', zoneId: 'exit_gate', count: 1, unitTag: 'convoy', label: '护送至少 1 辆运输车抵达星门' },
        ],

        failConditions: [
            { type: 'base_destroyed', reason: '指挥中心被摧毁' },
            { type: 'target_destroyed', params: { targetId: 'convoy_all' }, reason: '所有运输车均被摧毁' },
            { type: 'timeout', params: { seconds: 600 }, reason: '星门关闭，撤离超时' },
        ],

        rewards: { coresPerWin: 5 },

        victoryText: '难民安全撤离，方舟又庇护了数千条生命。',
        defeatText: '运输车队……全灭了。',

        scripts: [
            { trigger: { type: 'onStart' }, dialogue: 'convoy_intro' },
            { trigger: { type: 'onUnitEnterZone', zoneId: 'exit_gate', faction: 'player' }, dialogue: 'convoy_arrive' },
        ],
    },

    // ===== 坚守 =====
    hold_the_line: {
        id: 'hold_the_line',
        name: '黎明前夜',
        subtitle: '方舟信标防卫圈',
        briefing:
            '<strong>目标：</strong> 保护【方舟信标】不被摧毁。<br><br>' +
            '坚守 8 波或 12 分钟，等待方舟援军抵达。<br><br>' +
            '<span style="color: var(--accent);">⚠️ 方舟信标是唯一联络手段，一旦被摧毁，全任务失败。</span>',

        unlock: { type: 'campaign', requires: 'convoy_escort' },

        map: {
            width: 2400, height: 2400,
            base:  { x: 1200, y: 1600 },
            depot: { x: 1080, y: 1600 },
            nodes: [
                { type: 'thermal', x: 600,  y: 1200 },
                { type: 'thermal', x: 1800, y: 1200 },
            ],
        },

        // 信标建筑由场景根据 protectTarget 生成
        protectTargets: [
            { id: 'beacon_main', type: 'beacon', x: 1200, y: 900, label: '方舟信标' },
        ],

        start: { minerals: 500, gas: 180, maxSupply: 30, waveTimer: 40 },

        initialUnits: [
            { type: 'marine', dx: 0,   dy: 120 },
            { type: 'marine', dx: 40,  dy: 120 },
            { type: 'firebat', dx: -40, dy: 120 },
            { type: 'tank',   dx: 80,  dy: 140 },
        ],

        waves: [
            { count: 16,  types: ['zergling'],                           interval: 45 },
            { count: 24, types: ['zergling', 'hydralisk'],              interval: 45 },
            { count: 34, types: ['hydralisk'],                          interval: 42 },
            { count: 48, types: ['zergling', 'hydralisk'],              interval: 40 },
            { count: 52, types: ['zergling', 'hydralisk', 'ultralisk'], interval: 38 },
            { count: 64, types: ['hydralisk', 'ultralisk'],             interval: 35 },
            { count: 76, types: ['zergling', 'hydralisk', 'ultralisk'], interval: 32 },
            { count: 80, types: ['ultralisk', 'hydralisk'],             interval: 30 },
        ],

        objectives: [
            { id: 'hold', type: 'survive_waves', value: 8, label: '守住 8 波进攻' },
        ],

        failConditions: [
            { type: 'base_destroyed', reason: '指挥中心被摧毁' },
            { type: 'target_destroyed', params: { targetId: 'beacon_main' }, reason: '方舟信标被摧毁' },
        ],

        rewards: { coresPerWin: 6 },

        victoryText: '方舟援军抵达！信标依然闪烁。',
        defeatText: '信标熄灭了……我们失去了联络。',

        scripts: [
            { trigger: { type: 'onStart' }, dialogue: 'hold_intro' },
            { trigger: { type: 'onWave', wave: 5 }, dialogue: 'hold_wave5' },
            { trigger: { type: 'onWave', wave: 8 }, dialogue: 'hold_final' },
        ],
    },
};