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
            spawnPoints: {
                north:     { x: 1200, y: 100  },
                south:     { x: 1200, y: 2300 },
                west:      { x: 100,  y: 1200 },
                east:      { x: 2300, y: 1200 },
                northwest: { x: 300,  y: 300  },
                northeast: { x: 2100, y: 300  },
                southwest: { x: 300,  y: 2100 },
                southeast: { x: 2100, y: 2100 },
            },
        },

        start: { minerals: 300, gas: 100, maxSupply: 20, waveTimer: 45 },

        initialUnits: [
            { type: 'marine',  dx: 0,   dy: 120 },
            { type: 'marine',  dx: 40,  dy: 120 },
            { type: 'firebat', dx: -40, dy: 120 },
        ],

        waves: [
            {
                interval: 45,
                spawns: [
                    { type: 'zergling', count: 10, at: 'north', spawnInterval: 0.6 },
                ],
            },
            {
                interval: 45,
                spawns: [
                    { type: 'zergling',  count: 10, at: 'north', spawnInterval: 0.5 },
                    { type: 'hydralisk', count: 6,  at: 'east',  spawnInterval: 1.0, delay: 2 },
                ],
            },
            {
                interval: 40,
                spawns: [
                    { type: 'zergling',  count: 20, at: 'north', spawnInterval: 0.4 },
                    { type: 'hydralisk', count: 12, at: 'west',  spawnInterval: 0.8, delay: 1 },
                ],
            },
            {
                interval: 40,
                spawns: [
                    { type: 'hydralisk', count: 20, at: 'east',  spawnInterval: 0.7 },
                    { type: 'ultralisk', count: 16, at: 'south', spawnInterval: 1.2, delay: 3 },
                ],
            },
            {
                interval: 35,
                spawns: [
                    { type: 'zergling',  count: 20, at: 'north', spawnInterval: 0.3 },
                    { type: 'hydralisk', count: 12, at: 'west',  spawnInterval: 0.6, delay: 1 },
                    { type: 'ultralisk', count: 10, at: 'south', spawnInterval: 1.0, delay: 2 },
                ],
            },
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
            spawnPoints: {
                north:     { x: 1200, y: 100  },
                south:     { x: 1200, y: 2300 },
                west:      { x: 100,  y: 1200 },
                east:      { x: 2300, y: 1200 },
                northwest: { x: 300,  y: 300  },
                northeast: { x: 2100, y: 300  },
            },
        },

        start: { minerals: 400, gas: 150, maxSupply: 25, waveTimer: 40 },

        initialUnits: [
            { type: 'marine', dx: 0,   dy: 120 },
            { type: 'marine', dx: 40,  dy: 120 },
            { type: 'marine', dx: -40, dy: 120 },
            { type: 'tank',   dx: 80,  dy: 140 },
        ],

        waves: [
            {
                interval: 40,
                spawns: [
                    { type: 'zergling', count: 12, at: 'north', spawnInterval: 0.5 },
                ],
            },
            {
                interval: 40,
                spawns: [
                    { type: 'zergling',  count: 12, at: 'northwest', spawnInterval: 0.5 },
                    { type: 'hydralisk', count: 8,  at: 'northeast', spawnInterval: 0.9, delay: 2 },
                ],
            },
            {
                interval: 38,
                spawns: [
                    { type: 'hydralisk', count: 28, at: 'north', spawnInterval: 0.6 },
                ],
            },
            {
                interval: 35,
                spawns: [
                    { type: 'zergling',  count: 18, at: 'west',  spawnInterval: 0.4 },
                    { type: 'hydralisk', count: 12, at: 'east',  spawnInterval: 0.7, delay: 1 },
                    { type: 'ultralisk', count: 8,  at: 'north', spawnInterval: 1.0, delay: 3 },
                ],
            },
            {
                interval: 32,
                spawns: [
                    { type: 'zergling',  count: 20, at: 'northwest', spawnInterval: 0.3 },
                    { type: 'hydralisk', count: 14, at: 'northeast', spawnInterval: 0.6, delay: 1 },
                    { type: 'ultralisk', count: 10, at: 'north',     spawnInterval: 0.9, delay: 2 },
                ],
            },
            {
                interval: 30,
                spawns: [
                    { type: 'ultralisk', count: 30, at: 'north', spawnInterval: 0.8 },
                    { type: 'hydralisk', count: 20, at: 'east',  spawnInterval: 0.5, delay: 2 },
                ],
            },
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
            spawnPoints: {
                north:     { x: 1200, y: 100  },
                northeast: { x: 2100, y: 300  },
                east:      { x: 2300, y: 1200 },
                southeast: { x: 2100, y: 2100 },
                northwest: { x: 300,  y: 300  },
            },
        },

        start: { minerals: 500, gas: 200, maxSupply: 30, waveTimer: 60 },

        initialUnits: [
            { type: 'marine', dx: 0,   dy: 120 },
            { type: 'marine', dx: 40,  dy: 120 },
            { type: 'tank',   dx: -60, dy: 140 },
        ],

        waves: [
            {
                interval: 90,
                spawns: [
                    { type: 'zergling', count: 6, at: 'northeast', spawnInterval: 1.0 },
                ],
            },
            {
                interval: 80,
                spawns: [
                    { type: 'hydralisk', count: 8, at: 'east', spawnInterval: 1.2 },
                ],
            },
            {
                interval: 70,
                spawns: [
                    { type: 'zergling',  count: 6, at: 'north', spawnInterval: 0.8 },
                    { type: 'hydralisk', count: 4, at: 'east',  spawnInterval: 1.0, delay: 2 },
                ],
            },
            {
                interval: 70,
                spawns: [
                    { type: 'ultralisk', count: 12, at: 'northeast', spawnInterval: 1.5 },
                ],
            },
            {
                interval: 60,
                spawns: [
                    { type: 'zergling',  count: 8, at: 'north', spawnInterval: 0.6 },
                    { type: 'hydralisk', count: 8, at: 'east',  spawnInterval: 0.9, delay: 1 },
                ],
            },
        ],

        enemyBuildings: [
            { id: 'shield_gen_1', type: 'shield_gen', x: 1600, y: 1000, hp: 1600,  tags: ['shield_gen'],    label: '护盾发生器 A' },
            { id: 'shield_gen_2', type: 'shield_gen', x: 2000, y: 1400, hp: 1600,  tags: ['shield_gen'],    label: '护盾发生器 B' },
            { id: 'fortress_core', type: 'fortress_core', x: 1800, y: 1200, hp: 3800, tags: ['fortress_core'], label: '要塞核心' },
        ],

        objectives: [
            { id: 'shield', type: 'destroy_target', tag: 'shield_gen', count: 2, label: '摧毁护盾发生器', required: true },
            { id: 'core',   type: 'destroy_target', tag: 'fortress_core', count: 1, label: '摧毁要塞核心', required: true },
        ],

        failConditions: [
            { type: 'base_destroyed', reason: '指挥中心被摧毁' },
            { type: 'timeout', params: { seconds: 720 }, reason: '敌方增援已抵达，任务失败' },
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
            '<strong>目标：</strong> 3 辆难民运输车正穿过峡谷，沿途接应三处难民营的幸存者。<br><br>' +
            '护送它们抵达星门撤离区。至少 1 辆存活至终点即算成功，全部损失则任务失败。<br><br>' +
            '<span style="color: var(--accent);">⚠️ 若超时（10 分钟）未抵达，星门将关闭。</span>',

        unlock: { type: 'campaign', requires: 'fortress_assault' },

        map: {
            width: 2400, height: 2400,
            base:  { x: 300,  y: 1200 },
            depot: { x: 200,  y: 1200 },
            nodes: [],
            spawnPoints: {
                north:     { x: 1200, y: 100  },
                south:     { x: 1200, y: 2300 },
                east:      { x: 2300, y: 1200 },
                northeast: { x: 2100, y: 300  },
                southeast: { x: 2100, y: 2100 },
                northwest: { x: 300,  y: 300  },
            },
        },

        start: { minerals: 400, gas: 120, maxSupply: 25, waveTimer: 50 },

        initialUnits: [
            { type: 'marine', dx: 0,   dy: 120 },
            { type: 'firebat', dx: 40, dy: 120 },
            { type: 'tank',   dx: -60, dy: 140 },
        ],

        convoy: {
            count: 3,
            startX: 500,
            startY: 1200,
            dx: 80,
            speed: 15,
            hp: 400,
            waypoints: [
                { x: 700,  y: 400,  dwell: 10, label: '西北高地难民营' },
                { x: 1200, y: 2100, dwell: 10, label: '南部深谷矿区' },
                { x: 1800, y: 400,  dwell: 10, label: '东北高地据点' },
                { x: 2100, y: 1200 },
            ],
        },

        zones: [
            { id: 'exit_gate', shape: 'circle', x: 2100, y: 1200, r: 160, label: '星门撤离区', color: 0x00ff88 },
        ],

        waves: [
            {
                interval: 10,
                priority: 'protect',
                spawns: [
                    { type: 'zergling', count: 6, at: 'north', spawnInterval: 0.5 },
                ],
            },
            {
                interval: 15,
                priority: 'protect',
                spawns: [
                    { type: 'zergling',  count: 6, at: 'north', spawnInterval: 0.4 },
                    { type: 'hydralisk', count: 4, at: 'east',  spawnInterval: 0.8, delay: 1 },
                ],
            },
            {
                interval: 15,
                priority: 'protect',
                spawns: [
                    { type: 'hydralisk', count: 16, at: 'east', spawnInterval: 0.6 },
                ],
            },
            {
                interval: 15,
                priority: 'protect',
                spawns: [
                    { type: 'zergling',  count: 10, at: 'north', spawnInterval: 0.4 },
                    { type: 'hydralisk', count: 8,  at: 'south', spawnInterval: 0.7, delay: 1 },
                ],
            },
            {
                interval: 20,
                priority: 'protect',
                spawns: [
                    { type: 'ultralisk', count: 22, at: 'northeast', spawnInterval: 0.9 },
                ],
            },
            {
                interval: 25,
                priority: 'protect',
                spawns: [
                    { type: 'zergling',  count: 12, at: 'north', spawnInterval: 0.3 },
                    { type: 'hydralisk', count: 8,  at: 'east',  spawnInterval: 0.5, delay: 1 },
                    { type: 'ultralisk', count: 8,  at: 'south', spawnInterval: 0.8, delay: 2 },
                ],
            },
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
            '坚守，等待方舟援军抵达。<br><br>' +
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
            spawnPoints: {
                north:     { x: 1200, y: 100  },
                south:     { x: 1200, y: 2300 },
                west:      { x: 100,  y: 1200 },
                east:      { x: 2300, y: 1200 },
                northwest: { x: 300,  y: 300  },
                northeast: { x: 2100, y: 300  },
            },
        },

        protectTargets: [
            { id: 'beacon_main', type: 'beacon', x: 1200, y: 900, label: '方舟信标' },
        ],

        start: { minerals: 500, gas: 180, maxSupply: 30, waveTimer: 40 },

        initialUnits: [
            { type: 'marine',  dx: 0,   dy: 120 },
            { type: 'marine',  dx: 40,  dy: 120 },
            { type: 'firebat', dx: -40, dy: 120 },
            { type: 'tank',    dx: 80,  dy: 140 },
        ],

        waves: [
            {
                interval: 45,
                spawns: [
                    { type: 'zergling', count: 16, at: 'north', spawnInterval: 0.4 },
                ],
            },
            {
                interval: 45,
                spawns: [
                    { type: 'zergling',  count: 14, at: 'northwest', spawnInterval: 0.4 },
                    { type: 'hydralisk', count: 10, at: 'northeast', spawnInterval: 0.7, delay: 1 },
                ],
            },
            {
                interval: 42,
                spawns: [
                    { type: 'hydralisk', count: 34, at: 'north', spawnInterval: 0.5 },
                ],
            },
            {
                interval: 40,
                priority: 'protect',
                spawns: [
                    { type: 'zergling',  count: 28, at: 'west', spawnInterval: 0.3 },
                    { type: 'hydralisk', count: 20, at: 'east', spawnInterval: 0.5, delay: 1 },
                ],
            },
            {
                interval: 38,
                priority: 'protect',
                spawns: [
                    { type: 'zergling',  count: 30, at: 'north', spawnInterval: 0.3 },
                    { type: 'hydralisk', count: 12, at: 'west',  spawnInterval: 0.5, delay: 1 },
                    { type: 'ultralisk', count: 10, at: 'east',  spawnInterval: 0.8, delay: 2 },
                ],
            },
            {
                interval: 35,
                priority: 'protect',
                spawns: [
                    { type: 'hydralisk', count: 40, at: 'north', spawnInterval: 0.4 },
                    { type: 'ultralisk', count: 24, at: 'east',  spawnInterval: 0.7, delay: 1 },
                ],
            },
            {
                interval: 32,
                priority: 'protect',
                spawns: [
                    { type: 'zergling',  count: 40, at: 'northwest', spawnInterval: 0.2 },
                    { type: 'hydralisk', count: 20, at: 'northeast', spawnInterval: 0.4, delay: 1 },
                    { type: 'ultralisk', count: 16, at: 'north',     spawnInterval: 0.6, delay: 2 },
                ],
            },
            {
                interval: 30,
                priority: 'protect',
                spawns: [
                    { type: 'ultralisk', count: 50, at: 'north', spawnInterval: 0.6 },
                    { type: 'hydralisk', count: 30, at: 'east',  spawnInterval: 0.4, delay: 1 },
                ],
            },
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

    // ===== 新增：无尽攻坚 =====
    abyss_purge: {
        id: 'abyss_purge',
        name: '星渊清算',
        subtitle: '12 座虫巢节点',
        briefing:
            '<strong>目标：</strong> 星渊深处潜伏着 12 座虫巢节点。<br><br>' +
            '它们会持续不断地涌出敌人——每摧毁一座节点，虫潮便削弱一分。<br><br>' +
            '<span style="color: var(--accent);">⚠️ 虫潮没有尽头。第 10 波起会出现首领级异虫。</span><br>' +
            '<span style="color: var(--accent);">⚠️ 指挥中心一旦沦陷，全任务失败。</span>',

        unlock: { type: 'campaign', requires: 'hold_the_line' },

        map: {
            width: 4800, height: 4800,
            base:  { x: 2400, y: 4400 },
            depot: { x: 2280, y: 4400 },
            nodes: [],
        },

        start: { minerals: 500, gas: 200, maxSupply: 30, waveTimer: 30 },

        initialUnits: [
            { type: 'marine', dx: 0,   dy: 120 },
            { type: 'marine', dx: 40,  dy: 120 },
            { type: 'marine', dx: -40, dy: 120 },
            { type: 'tank',   dx: 80,  dy: 140 },
        ],

        // 无尽波：waves 为空，由 wave.js 的 _buildEndlessWave 动态生成
        endless: true,
        waves: [],

        // 12 座敌方建筑：均匀分布在地图上半部，HP 由近到远逐步升高
        enemyBuildings: [
            // 近排（低 HP，地刺，距基地最近）
            { id: 'node_01', type: 'spike', x: 800,  y: 2900, hp: 1400, tags: ['assault_node'], label: '地刺节点 1'  },
            { id: 'node_02', type: 'spike', x: 1800, y: 3000, hp: 1500, tags: ['assault_node'], label: '地刺节点 2'  },
            { id: 'node_03', type: 'spike', x: 3000, y: 3000, hp: 1500, tags: ['assault_node'], label: '地刺节点 3'  },
            { id: 'node_04', type: 'spike', x: 4000, y: 2900, hp: 1400, tags: ['assault_node'], label: '地刺节点 4'  },
            // 中排（中 HP，孢子炮）
            { id: 'node_05', type: 'spore', x: 500,  y: 1900, hp: 2000, tags: ['assault_node'], label: '孢子炮节点 5' },
            { id: 'node_06', type: 'spore', x: 1500, y: 1800, hp: 2100, tags: ['assault_node'], label: '孢子炮节点 6' },
            { id: 'node_07', type: 'spore', x: 3300, y: 1800, hp: 2100, tags: ['assault_node'], label: '孢子炮节点 7' },
            { id: 'node_08', type: 'spore', x: 4300, y: 1900, hp: 2000, tags: ['assault_node'], label: '孢子炮节点 8' },
            // 远排（高 HP，孢子炮，距基地最远）
            { id: 'node_09', type: 'spore', x: 700,  y: 800,  hp: 2500, tags: ['assault_node'], label: '孢子炮节点 9'  },
            { id: 'node_10', type: 'spore', x: 1700, y: 700,  hp: 2600, tags: ['assault_node'], label: '孢子炮节点 10' },
            { id: 'node_11', type: 'spore', x: 3100, y: 700,  hp: 2600, tags: ['assault_node'], label: '孢子炮节点 11' },
            { id: 'node_12', type: 'spore', x: 4100, y: 800,  hp: 2500, tags: ['assault_node'], label: '孢子炮节点 12' },
        ],

        objectives: [
            { id: 'purge', type: 'destroy_target', tag: 'assault_node', count: 12, label: '摧毁全部 12 座虫巢节点', required: true },
        ],

        failConditions: [
            { type: 'base_destroyed', reason: '指挥中心被摧毁' },
        ],

        rewards: { coresPerWin: 8 },

        victoryText: '12 座节点全部灰飞烟灭，虫潮终于平息。',
        defeatText: '指挥中心沦陷，虫潮吞没了这颗星球……',

        scripts: [
            { trigger: { type: 'onStart' }, dialogue: 'abyss_purge_intro' },
        ],
    },
};