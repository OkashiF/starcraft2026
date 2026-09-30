# 星渊黎明 (Dawn of the Abyss) — 项目 README

一个基于 Phaser 3 的浏览器 RTS 原型，已从单文件拆分为多文件、并升级为多战役模式。本文档说明项目结构、各文件职责，以及**改什么内容要动哪些文件**。

---

## 一、快速开始

1. 直接用浏览器打开 `index.html` 即可运行（无需构建、无需本地服务器）。
2. 依赖仅一个 CDN：Phaser 3.60.0。
3. 存档使用 `localStorage`，键名 `star_abyss_save`，保存科技升级、核心库存、战役进度。
4. 脚本必须按 `index.html` 中既定顺序加载，顺序错了会报 `undefined`。

---

## 二、目录结构

```
 star-abyss/
 ├── index.html
 ├── css/
 │   └── style.css
 └── js/
     ├── config.js
     ├── audio.js
     ├── state.js
     ├── ui.js
     ├── arkUI.js
     ├── textures.js
     ├── entities.js
     ├── app.js
     ├── scene.js
     ├── data/
     │   ├── campaigns.js
     │   ├── dialogues.js
     │   └── ark.js
     └── systems/
         ├── unlock.js
         ├── ark.js
         ├── vfx.js
         ├── combat.js
         ├── enemyAI.js
         ├── wave.js
         ├── zone.js
         ├── objective.js
         ├── script.js
         ├── input.js
         ├── camera.js
         └── minimap.js
```

---

## 三、脚本加载顺序

`index.html` 底部必须按此顺序引入，否则依赖会找不到：

1. Phaser CDN
2. `js/config.js`
3. `js/audio.js`
4. `js/state.js`
5. `js/data/campaigns.js`
6. `js/data/dialogues.js`
7. `js/data/ark.js`
8. `js/systems/unlock.js`
9. `js/systems/ark.js`
10. `js/ui.js`
11. `js/arkUI.js`
12. `js/textures.js`
13. `js/entities.js`
14. `js/systems/vfx.js`
15. `js/systems/combat.js`
16. `js/systems/enemyAI.js`
17. `js/systems/wave.js`
18. `js/systems/objective.js`
19. `js/systems/script.js`
20. `js/systems/zone.js`
21. `js/systems/input.js`
22. `js/systems/camera.js`
23. `js/systems/minimap.js`
24. `js/scene.js`
25. `js/app.js`

注意：`js/data/ark.js` 必须在 `js/systems/ark.js` 之前；`js/systems/ark.js` 必须在 `js/ui.js` 与 `js/state.js` 使用前加载；`js/systems/zone.js` 必须在 `js/scene.js` 之前加载（`scene.js` 在 `create` 中实例化 `ZoneSystem`）；`state.load()` 之后由 `app.js` 调用 `Ark.ensureState()`。

---

## 四、各文件位置与职责

### 根目录

| 文件 | 职责 |
|---|---|
| `index.html` | 页面骨架、DOM 结构、脚本加载入口。包含主菜单层、HUD 层、目标面板（`#objectives-panel`）、剧情弹窗、对话浮层、伤害遮罩、Toast 容器。主菜单右侧为“战前装载”（`#loadout-panel`）。HUD 顶栏新增顶部指挥官技能栏（`#top-skill-bar`），由 `js/ui.js` 的 `renderTopSkillBar` 动态生成。底部生产/建造按钮已扩展新单位与新建筑，未解锁/未携带的按钮会被 `updateUI` 隐藏。 |
| `css/style.css` | 全部样式：变量、菜单、HUD、底栏、按钮、小地图、目标/失败条件面板、弹窗、对话浮层、Toast 动画、方舟面板、部门卡、装载槽、卡牌库、顶部技能栏（`.top-skill-bar` / `.top-skill-btn`）。 |

### `js/` 核心

| 文件 | 职责 |
|---|---|
| `js/config.js` | 全局通用数值：地图默认尺寸、经济速率、升级成本、状态效果参数（`STATUS`）、单位定义（含 `armorType` / `tags` / `bonusVs` / 医疗 / 修理 / 标记 / 嘲讽 / 狙击等新兵种，以及主动技能 `ability`：陆战队 `stim` 兴奋剂 / 医疗兵 `heal_burst` 治疗波 / 盾卫 `taunt_roar` 嘲讽怒吼）、敌人定义（含 `armorType` / `tags` / `bonusVs` / `deathExplosion` / `onHitAcid`，以及技能型字段：`projectile` 远程弹道 / `healer` 单体治疗 / `aura` 群体减伤 / `summoner` 限时召唤 / `canAttack: false` 不能攻击 / `immobile: true` 不能移动）、建筑定义（含新增友方建筑 `flame_turret` / `sniper_turret` / `repair_station` / `radar_station` / `wall` 与敌方建筑 `hive` / `spike` / `spore`）、指挥官技能（含新增 `airdrop` / `shield_field` / `scan` / `nano_repair` / `minefield` / `emp`）、据点默认属性、占领参数、刷怪参数、晋升参数、任务系统默认参数。多战役不覆盖的默认值放这里。 |
| `js/audio.js` | Web Audio 实时合成音效。`playShoot` / `playExplosion` / `playClick` / `playAlarm`，无外部音频文件。 |
| `js/state.js` | 存档 + 单局状态。持久化：核心库存、三项科技等级（`upgrades`，由方舟科研实验室节点通过 `legacyKey` 同步写入）、战役进度、方舟数据（`ark`：资源、部门等级与节点、库存、战绩、卡牌解锁与装载）。单局：当前战役 id、资源、人口、波次、计时、胜负标记、放置建筑类型、任务统计。提供 `load` / `save` / `resetSession` / `getCurrentCampaign` / `commitCores` / `recordKill` / `recordLoss`。`resetSession` 会读取 `Ark.getBonuses()` 应用开局加成。 |
| `js/ui.js` | 全部 DOM 操作集中处（方舟面板除外，见 `arkUI.js`）。HUD 刷新、目标 / 失败条件面板刷新（`renderObjectivesPanel`）、菜单核心库存与旧科技按钮刷新（`updateMenuUI`）、战役列表渲染（`renderMissionList`）、选择卡片、单位技能栏、Toast、受击闪红、对话浮层、剧情/结算弹窗。`renderArkPanel` 转发到 `StarAbyss.ArkUI.render()`。`updateUI` 中所有生产 / 建造按钮会先经 `Ark.canBuild` 过滤：未解锁或未携带的单位/建筑按钮直接 `display:none`；补给电站无卡牌，始终显示。`renderTopSkillBar`：只渲染已解锁且已携带的指挥官技能卡，按资源是否足够决定禁用，快捷键沿用 `R/T/Y/U/I/O/P/G`。`_renderUnitSkills`：坦克显示架设切换；选中单位若带 `ability`，追加主动技能按钮，显示"Z 技能名"或冷却倒计时"技能名 (Ns)"，点击调用 `scene.combat.activateUnitAbility()`。 |
| `js/arkUI.js` | 方舟与装载界面渲染。`renderLoadout`：主菜单右侧“战前装载”，显示卡槽占用、卡牌库、点击携带/卸下；按 `slotCost` 累加已占用格，支持占 2 格的卡牌。`render`：方舟母舰面板，按部门渲染等级、节点列表、升级按钮。`toggleCard` / `unequip` / `upgradeDepartment` / `upgradeNode` 为 `onclick` 入口。跨模块入口 `StarAbyss.ArkUI`。 |
| `js/textures.js` | 用 Phaser Graphics 程序化生成所有矢量纹理（基地、补给站、炮塔、四种友军、三种敌人、据点、子弹、火焰、粒子、护盾发生器 / 要塞核心 `tex_shield_gen`、运输车 `tex_convoy`、方舟信标 `tex_beacon`）。新增纹理：`tex_rocketeer` / `tex_medic` / `tex_engineer` / `tex_drone` / `tex_shieldman` / `tex_sniper` / `tex_rocket` / `tex_acid` / `tex_flame_turret` / `tex_sniper_turret` / `tex_repair_station` / `tex_radar_station` / `tex_wall` / `tex_reaper` / `tex_acidspitter` / `tex_crystalspike` / `tex_flier` / `tex_hive` / `tex_spike` / `tex_spore` / `tex_mine`。 |
| `js/entities.js` | `UnitFactory`（生成友军/敌人）。`spawnFriendly(type, x, y, isFree, opts)` 第 5 参 `opts.lifetime` 用于临时召唤物（空投增援等）；若单位定义带 `ability`，会在 `unit.ability` 上实例化（含 `readyAt` 冷却计时）。`spawnEnemy(type, x, y, tags, priority)` 第 4 参 `tags` 用于 `destroy_target` 目标统计，第 5 参 `priority` 写入 `enemy.attackPriority` 供 `enemyAI.js` 索敌分支；落地技能型字段 `canAttack`（`false` 只贴脸不出手）/ `immobile`（`true` 原地攻击）/ `healer`（单体治疗，含 `lastHeal` 计时）/ `aura`（群体减伤）/ `summoner`（限时召唤，含 `nextSummon` 计时）。`_initCommon` 初始化 `armorType` / `tags` / `bonusVs` / `status`（stun / slow / burn / mark / shield）。`BuildingFactory` 放置建筑，`spawnProtectTarget` 生成友方保护目标、`spawnEnemyBuilding` 生成敌方关键建筑，支持敌方建筑炮塔（`isEnemyTurret`）与刷怪（`spawner`）；`spawnEnemyBuilding` 将 `cfg.tags` 写入建筑对象的 `b.tags`，供 `wave.js` 的 `_getAliveEnemyBuildings` 按 tag 过滤。 |
| `js/app.js` | 应用流程控制。初始化菜单、准备战役、开始游戏、触发生产 / 放置建筑 / 指挥官技能（均先经 `Ark.canBuild` / `Ark.canUseSkill` 校验）、结算胜负、返回菜单、打开/关闭方舟面板。`initMenu` 会调用 `ArkUI.renderLoadout` 渲染战前装载。`buyUpgrade` 保留兼容，转发到 `Ark.upgradeNode`。`selectBuildingToPlace` 支持新建筑名称。`window.gameApp` 供 HTML `onclick` 使用。 |
| `js/scene.js` | `MainScene`。负责场景组装：设置世界边界、背景网格、实例化所有 system 与 factory、按当前战役初始化地图（生成保护目标、敌方关键建筑、车队、区域）、`update` 中依次调用各 system。车队由 `_spawnConvoy` 生成、`_updateConvoy` 沿 `waypoints` 移动；waypoint 支持 `dwell`（停留秒数）与 `label`（标签），到达带 `dwell` 的点时车队原地停留，倒计时结束再前进。 |

### `js/data/` 数据层

| 文件 | 职责 |
|---|---|
| `js/data/campaigns.js` | 所有战役定义。每个战役含：id、名称、副标题、简报 HTML、解锁条件、地图（尺寸、基地/补给站坐标、据点列表、`spawnPoints` 出生点表、`spawnZones` 出生区域表）、开局资源与人口、初始单位、波次表、目标列表、失败条件列表（`failConditions`）、奖励、胜负文案、脚本触发表。波次项使用 `spawns[]` 指定每波敌人（每项含 `type` / `count` / `at` / `zone` / `delay` / `spawnInterval` / `priority` / `tags` / `boss` / `fromBuildings`），波级支持 `interval` / `priority`。可选字段：`zones`（区域）、`convoy`（护送车队）、`protectTargets`（保护目标）、`enemyBuildings`（敌方关键建筑）、`phases`（多阶段任务）、`endless`（无尽波：置 `true` 且 `waves: []`，由 `wave.js` 的 `_buildEndlessWave` 动态生成）、`arkLoot`：该战役胜利/失败时发放的方舟资源，未定义则用 `ArkData.DEFAULT_LOOT`。末尾新增无尽攻坚战役 `abyss_purge`（4800×4800 地图、12 座 `assault_node` 敌方建筑、`endless: true`）。 |
| `js/data/dialogues.js` | 所有对话文本。按 id 索引，含 `speaker` 与 `text`。战役脚本通过 id 引用。末尾新增 `abyss_purge_intro`（星渊清算开场）。 |
| `js/data/ark.js` | 方舟数据定义。`ArkData.DEPARTMENTS`：部门 id、名称、图标、描述、最大等级、部门升级成本数组、每级 `bonusPerLevel`、以及多升级节点 `upgrades[]`（每个节点含 `id` / `name` / `desc` / `maxLevel` / `cost` / `requires` / `effects` / `unlocks`；可选 `legacyKey`，升级时同步写入 `State.upgrades[legacyKey]`）。`research.upgrades` 已并入原主菜单旧三项科技：`node_infantryHp`（`legacyKey: 'infantryHp'`）、`node_mechAtk`（`legacyKey: 'mechAtk'`）、`node_economy`（`legacyKey: 'economy'`），各 `maxLevel: 3`、`cost: [2, 5, 10]`、`requires: { deptLevel: 1 }`。新增大量解锁节点：兵营 `unlock_medic` / `unlock_engineer`，机库 `unlock_drone` / `unlock_airdrop`，科研 `unlock_rocketeer` / `unlock_shieldman` / `unlock_sniper` / `unlock_flame_turret` / `unlock_sniper_turret`，工程 `unlock_repair_station` / `unlock_wall` / `unlock_nano_repair` / `unlock_minefield`，情报 `unlock_radar_station`，舰桥 `unlock_shield_field` / `unlock_scan`，动力 `unlock_emp`。`ArkData.CARDS`：统一卡牌定义（`unit` / `building` / `skill`），含 `id` / `type` / `name` / `slotCost` / `buildKey` 或 `skillKey` / `defaultUnlocked` / `unlockBy` / `desc`。新增大量单位卡、建筑卡、技能卡。`ArkData.LOADOUT`：`baseSlots` / `maxSlots` / `allowDuplicate` / `defaultEquipped`。`ArkData.DEFAULT_LOOT`：战役胜负默认发放的方舟资源（合金/数据/补给）。 |
| `js/systems/unlock.js` | 战役解锁与进度。判断某战役是否解锁、生成锁定原因、确保进度条目、标记完成、累加核心、列出全部战役。 |
| `js/systems/vfx.js` | 特效：环境粒子、枪口焰、命中爆点、死亡爆炸。 |
| `js/systems/combat.js` | 友军攻击逻辑、炮塔攻击、弹道生成、命中判定、敌人受伤与死亡、击杀统计（`recordKill`）、经验与晋升、保护目标受伤与摧毁（`damageBuilding` / `_destroyBuilding`）、坦克架设切换、指挥官技能（含新增 `airdrop` / `shield_field` / `scan` / `nano_repair` / `minefield` / `emp`）。新增：伤害计算 `computeDamage`（armorType + bonusVs + mark）、状态效果处理 `_processStatus`（灼烧 / 酸液 / 护盾）、医疗兵治疗、工程师修理、无人机标记、盾卫嘲讽、地雷阵、酸液区域、纳米修复区域、敌方建筑炮塔与刷怪。**技能型敌人 / 友军主动技能**：友军主动技能入口 `activateUnitAbility()`（按 `unit.ability.id` 分支：`stim` 兴奋剂扣血加速 / `heal_burst` 治疗波 / `taunt_roar` 嘲讽怒吼写敌人 `tauntedBy` + `tauntUntil`，`ab.readyAt` 计冷却）；友军 `stimUntil` 到期恢复 `speed` / `atkCooldown`；`damageEnemy` 入口叠加群体减伤光环（`enemy.aura` 取范围内最大 `damageReduction` 单值、不乘算堆叠）；敌方召唤物 `lifetime` 到点销毁；敌方投射物命中判定（`enemyProjectile` + `hitTarget` 距离 24px）走 `_applyEnemyProjectileHit`；敌方 `healer` 每 `cooldown` 治疗范围内最低血量敌人；敌方 `summoner` 每 `interval` 召唤 `count` 个限时 `lifetime` 单位（tags 自动加 `'summoned'`）。 |
| `js/systems/enemyAI.js` | 敌人追踪与攻击。按 `enemy.attackPriority` 分支：`'default'`（或未设）保持原逻辑（附近友军 120px > 保护目标 200px > 指挥中心）；`'protect'` 无视距离扑向最近保护目标（信标、护盾发生器、车队），仅友军 80px 内转火，无保护目标时回落到指挥中心；`'base'` 无视距离扑向指挥中心，仅友军/保护目标 80px 内转火。跳过敌方建筑（`isEnemyBuilding`）。基地被摧毁时触发失败。新增：眩晕 / 减速状态处理、盾卫被动嘲讽优先（范围 140px）、酸蚀者命中生成酸液区域。**技能型敌人支持**：主动嘲讽（盾卫 `taunt_roar` 写入敌人 `tauntedBy` / `tauntUntil`，优先级最高）、`enemy.immobile` 原地攻击（不进 `moveToObject`）、`enemy.canAttack === false` 只贴脸不出手、`_attack` 统一处理近战即时伤害与远程弹道（有 `def.projectile` 走 `_fireProjectile`，伤害经 `combat.computeDamage`）、`_fireProjectile` 生成带 `enemyProjectile` / `hitTarget` / `targetType` / `onHitAcid` 的弹道对象交由 `combat.js` 命中判定。 |
| `js/systems/wave.js` | 资源每秒增长（叠加 `Ark.getBonuses()` 的 `econMineralsPerSec` / `econGasPerSec`）、单局计时（`battleElapsed`）、据点持续收益、波次计时、按当前战役的波次表刷怪、据点占领判定、血条与占领进度条绘制（含车队、保护目标、敌方建筑）。刷怪走 `waves[].spawns[]` 新逻辑：每项指定 `type` / `count` / `at`（出生点 id 或 `{x,y}`）/ `zone`（出生区域 id 或内联区域对象）/ `delay` / `spawnInterval` / `priority` / `tags` / `boss` / `fromBuildings`。`_resolveSpawnPosition` 解析出生位置：优先 `at` 精确点，其次 `zone` 区域内随机（`circle` / `rect`），最后兜底为地图边缘随机。spawn 项 `boss: true` 时该组敌人放大 1.6 倍、HP ×3、伤害 ×1.5，并自动写入 `tags: ['boss']`。**无尽波**：当战役声明 `endless: true` 且静态 `waves[]` 耗尽时，调用 `_buildEndlessWave(campaign, S.wave)` 动态生成下一波（只改敌人种类与数量，HP/伤害不动；1–4 波以迅猛虫/刺蛇为主，5+ 裂解虫、6+ 飞刺、7+ 噬星巨兽、9+ 酸蚀者、10+ Boss、12+ 晶刺兽，Boss 数每 5 波 +1）。**从建筑刷怪**：`spawns[].fromBuildings` 为 `true` 或 tag 字符串时，由 `_resolveSpawnFromBuilding(tagFilter, index)` 在存活敌方建筑间**轮询均匀分配**、建筑附近圆形随机偏移出生；每个个体在 `delayedCall` 内**实时重查**存活建筑列表，某建筑被摧毁后该点自动跳过。`_getAliveEnemyBuildings(tagFilter)` 按 `e.isEnemyBuilding` / `e.active` / `e.hp > 0` / `e.tags` 过滤。 |
| `js/systems/zone.js` | 区域系统。 `init(campaign)` 读取 `zones` 生成区域；`update` 判定玩家 / 敌人在区域内外的进出事件、占领进度、驻留计时；`getZone` / `getZoneOwner` / `_insideZone` 供 `objective.js` 与 `script.js` 查询。 |
| `js/systems/objective.js` | 任务系统核心。 支持多目标类型：`survive_waves` / `survive_time` / `capture_all_nodes` / `capture_node` / `hold_zone` / `reach_zone` / `extract_units` / `protect_target` / `destroy_target` / `kill_count` / `boss_kill` / `composite`。支持失败条件：`base_destroyed` / `target_destroyed` / `target_dead` / `timeout` / `friendly_loss_limit` / `ally_all_dead` / `zone_lost`。支持 `phases` 多阶段。全部完成触发胜利，失败条件触发 `gameOver(false, failReason)`。 |
| `js/systems/script.js` | 战役脚本触发。监听 `onStart` / `onWave` / `onNodeCaptured` / `onObjectiveComplete` / `onTargetDestroyed` / `onUnitEnterZone` / `onZoneCaptured` / `onTimer` / `onAllyEvent`，命中后播放对应对话或执行 action。每个脚本只触发一次。 |
| `js/systems/input.js` | 框选、右键移动、建筑放置、快捷键。快捷键更新：`1–0` 生产新单位（陆战队 / 火蝠 / 幽灵 / 坦克 / 火箭兵 / 医疗兵 / 工程师 / 无人机 / 盾卫 / 狙击手），`Q/W/A/S/D/F` 放置新建筑（自动炮塔 / 火焰塔 / 狙击塔 / 维修站 / 雷达站 / 障碍墙），`E` 切换坦克架设，`Z` 触发选中单位的主动技能（`scene.combat.activateUnitAbility()`），`R/T/Y/U/I/O/P/G` 释放指挥官技能（轨道打击 / 战场维修 / 空投增援 / 护盾场 / 侦察扫描 / 纳米修复 / 地雷阵 / 电磁脉冲）。 |
| `js/systems/camera.js` | 方向键与 WASD 平移镜头。 |
| `js/systems/minimap.js` | 小地图绘制（建筑、友军、敌军、区域、车队、保护目标、敌方关键建筑、镜头框）与点击/拖拽跳转镜头。 |

---

## 五、改什么内容 → 动哪些文件

### 数值与平衡

| 想改的内容 | 要动的文件 |
|---|---|
| 单位价格、血量、伤害、射程、攻速、弹道速度 | `js/config.js`（`UNITS`） |
| 单位护甲类型、标签、克制倍率 | `js/config.js`（`UNITS[].armorType` / `tags` / `bonusVs`） |
| 单位主动技能（名称 / 冷却 / 持续时间 / 效果参数） | `js/config.js`（`UNITS[].ability`） |
| 敌人血量、速度、伤害、经验、掉核心概率 | `js/config.js`（`ENEMIES`） |
| 敌人护甲类型、标签、克制倍率、死亡爆炸、酸液命中 | `js/config.js`（`ENEMIES[].armorType` / `tags` / `bonusVs` / `deathExplosion` / `onHitAcid`） |
| 敌人远程弹道（速度 / 纹理 / tint / 寿命） | `js/config.js`（`ENEMIES[].projectile`） |
| 敌人单体治疗（治疗量 / 半径 / 冷却） | `js/config.js`（`ENEMIES[].healer`） |
| 敌人群体减伤光环（半径 / 减伤比例） | `js/config.js`（`ENEMIES[].aura`） |
| 敌人召唤（单位类型 / 数量 / 间隔 / 召唤物寿命） | `js/config.js`（`ENEMIES[].summoner`） |
| 敌人不能攻击 / 不能移动 | `js/config.js`（`ENEMIES[].canAttack: false` / `immobile: true`） |
| 建筑血量、造价、炮塔射程/伤害/攻速 | `js/config.js`（`BUILDINGS`） |
| 保护目标（护盾发生器、运输车、信标、要塞核心）血量/纹理 | `js/config.js`（`BUILDINGS`） |
| 指挥官技能消耗与效果 | `js/config.js`（`SKILLS`） |
| 状态效果参数（减速倍率、标记受伤倍率） | `js/config.js`（`STATUS`） |
| 每秒资源、经济科技加成 | `js/config.js`（`ECON`） |
| 旧三项科技升级成本 | `js/config.js`（`UPGRADE_COSTS`） |
| 占领速度、衰减、雷达核心概率、热能泉瓦斯加成 | `js/config.js`（`CAPTURE`） |
| 晋升经验门槛与加成 | `js/config.js`（`PROMOTION`） |
| 保护目标标签与颜色 | `js/config.js`（`PROTECT_TARGETS`） |
| 单个战役的开局资源、人口、波次间隔、Boss 波 | `js/data/campaigns.js`（对应战役的 `start` 与 `waves`；波级 `interval` / `priority`，`spawns[].boss: true` 标记 Boss 组） |
| 无尽波增强曲线 | `js/systems/wave.js`（`_buildEndlessWave`） |
| 部门数量、名称、图标、描述 | `js/data/ark.js`（`DEPARTMENTS`） |
| 部门等级成本、每级加成 | `js/data/ark.js`（`DEPARTMENTS[id].upgradeCost` / `bonusPerLevel`） |
| 部门下的多升级节点（成本、前置、效果、解锁） | `js/data/ark.js`（`DEPARTMENTS[id].upgrades[]`） |
| 卡牌（兵种/建筑/技能）名称、占格、解锁来源 | `js/data/ark.js`（`CARDS`） |
| 装载基础卡槽数、卡槽上限、默认装备 | `js/data/ark.js`（`LOADOUT`） |
| 战役默认战利品（合金/数据/补给） | `js/data/ark.js`（`DEFAULT_LOOT`） |
| 单战役定制战利品 | `js/data/campaigns.js`（该战役 `arkLoot`） |

### 单位 / 敌人 / 建筑

| 想加的内容 | 要动的文件 |
|---|---|
| 新增一个友军兵种 | `js/config.js`（加定义，含 `armorType` / `tags` / `bonusVs` / 特殊字段）→ `js/textures.js`（加纹理）→ `index.html`（加按钮）→ `js/data/ark.js`（加 `CARDS` 条目与解锁节点）→ `js/ui.js`（按钮显隐与 enable 判定已通用）→ `js/app.js` 快捷键可选 |
| 给友军加主动技能 | `js/config.js`（`UNITS[].ability`）→ `js/entities.js`（`spawnFriendly` 自动实例化，无需改）→ `js/systems/combat.js`（`activateUnitAbility` 加 `ab.id` 分支）→ `js/ui.js`（`_renderUnitSkills` 已通用）→ `js/systems/input.js`（`Z` 键已绑定） |
| 新增一个敌人类型 | `js/config.js`（加定义，含 `armorType` / `tags` / `bonusVs` / 特殊字段）→ `js/textures.js`（加纹理）→ `js/data/campaigns.js`（写进某波 `types`） |
| 给敌人加技能（治疗 / 光环 / 召唤 / 不能攻击 / 不能移动 / 远程弹道） | `js/config.js`（`ENEMIES[]` 加 `healer` / `aura` / `summoner` / `canAttack` / `immobile` / `projectile` 字段）→ `js/entities.js`（`spawnEnemy` 已通用落地）→ `js/systems/enemyAI.js`（`_attack` / `_fireProjectile` 已通用）→ `js/systems/combat.js`（`healer` / `aura` / `summoner` / 弹道命中已通用） |
| 新增一个可建造建筑 | `js/config.js`（加定义）→ `js/textures.js`（加纹理）→ `index.html`（加按钮）→ `js/data/ark.js`（加 `CARDS` 条目与解锁节点）→ `js/entities.js`（`BuildingFactory` 分支已通用）→ `js/ui.js`（按钮显隐已通用） |
| 新增一个保护目标建筑 | `js/config.js`（`BUILDINGS` 加定义）→ `js/textures.js`（加纹理）→ `js/data/campaigns.js`（该战役 `protectTargets`） |
| 新增一个敌方关键建筑 | `js/config.js`（`BUILDINGS` 加定义，可含 `range` / `damage` / `spawner`）→ `js/textures.js`（加纹理）→ `js/data/campaigns.js`（该战役 `enemyBuildings`）→ `js/entities.js`（`spawnEnemyBuilding` 已支持炮塔与刷怪） |
| 调整单位升级加成 | `js/config.js`（`hpPerUpgrade` / `damagePerUpgrade`） |
| 新增状态效果 | `js/config.js`（`STATUS`）+ `js/entities.js`（`_initCommon` 初始化 `status`）+ `js/systems/combat.js`（伤害计算 / 状态处理）+ `js/systems/enemyAI.js`（眩晕 / 减速） |
| 新增光环 / 治疗 / 修理 / 标记 / 嘲讽 | `js/config.js`（单位定义加 `isHealer` / `isRepairer` / `isMarker` / `isTaunt` 等）+ `js/systems/combat.js`（友军 update）+ `js/systems/enemyAI.js`（嘲讽优先） |
| 新增临时召唤物 | `js/config.js`（单位定义）+ `js/entities.js`（`spawnFriendly` 支持 `opts.lifetime`）+ `js/systems/combat.js`（技能生成） |
| 新增地雷 / 酸液 / 纳米区域 | `js/config.js`（技能或敌人定义）+ `js/systems/combat.js`（`_mines` / `_acidZones` / `_nanoZones`） |
| 新增 Boss 波 | `js/data/campaigns.js`（波次项加 `boss: true`）+ `js/systems/wave.js`（已支持放大与属性加成） |

### 系统逻辑

| 想改的内容 | 要动的文件 |
|---|---|
| 单位索敌与开火行为 | `js/systems/combat.js` |
| 伤害计算（护甲类型 / 克制 / 标记） | `js/systems/combat.js`（`computeDamage`） |
| 状态效果（眩晕 / 减速 / 灼烧 / 标记 / 护盾） | `js/entities.js`（`_initCommon`）+ `js/systems/combat.js`（`_processStatus`）+ `js/systems/enemyAI.js`（眩晕 / 减速） |
| 医疗兵治疗 | `js/config.js`（`isHealer` / `healAmount` / `healRange`）+ `js/systems/combat.js` |
| 工程师修理 | `js/config.js`（`isRepairer` / `repairAmount` / `repairRange`）+ `js/systems/combat.js` |
| 侦察无人机标记 | `js/config.js`（`isMarker` / `markerRange` / `markerDuration`）+ `js/systems/combat.js` |
| 盾卫被动嘲讽 | `js/config.js`（`isTaunt` / `tauntRange`）+ `js/systems/enemyAI.js` |
| 友军主动技能 | `js/config.js`（`UNITS[].ability`）+ `js/entities.js`（`spawnFriendly` 实例化 `unit.ability`）+ `js/systems/combat.js`（`activateUnitAbility`）+ `js/systems/input.js`（`Z` 键）+ `js/ui.js`（`_renderUnitSkills` 按钮） |
| 友军兴奋剂（扣血加速） | `js/config.js`（`UNITS.marine.ability`）+ `js/systems/combat.js`（`stimUntil` 到期恢复 `speed` / `atkCooldown`） |
| 友军治疗波 | `js/config.js`（`UNITS.medic.ability`）+ `js/systems/combat.js`（`activateUnitAbility` 内 `heal_burst` 分支） |
| 友军嘲讽怒吼（主动） | `js/config.js`（`UNITS.shieldman.ability`）+ `js/systems/combat.js`（`taunt_roar` 分支）+ `js/systems/enemyAI.js`（`tauntedBy` / `tauntUntil` 优先） |
| 地雷阵 / 酸液区域 / 纳米修复区域 | `js/systems/combat.js`（`_mines` / `_acidZones` / `_nanoZones`）+ `js/config.js`（对应技能或敌人定义） |
| 炮塔攻击行为（友方 / 敌方） | `js/systems/combat.js` |
| 敌方建筑炮塔与刷怪 | `js/entities.js`（`spawnEnemyBuilding`）+ `js/systems/combat.js`（敌方建筑炮塔与刷怪） |
| 保护目标受伤与摧毁 | `js/systems/combat.js`（`damageBuilding` / `_destroyBuilding`） |
| 击杀统计（供 destroy_target 用） | `js/systems/combat.js`（`_killEnemy` / `_destroyBuilding` 调 `State.recordKill`） |
| 敌人 AI 行为 | `js/systems/enemyAI.js`（按 `enemy.attackPriority` 分支：default / protect / base；主动嘲讽 `tauntedBy` / `tauntUntil` 优先；`immobile` 原地攻击；`canAttack: false` 只贴脸不出手） |
| 敌人远程攻击 | `js/systems/enemyAI.js`（`_fireProjectile` 生成 `enemyProjectile` 弹道）+ `js/systems/combat.js`（`_applyEnemyProjectileHit` 命中判定，距离 24px） |
| 敌人单体治疗 | `js/config.js`（`ENEMIES[].healer`）+ `js/entities.js`（`spawnEnemy` 落地）+ `js/systems/combat.js`（`healer` 循环，治疗范围内最低血量敌人） |
| 敌人群体减伤光环 | `js/config.js`（`ENEMIES[].aura`）+ `js/entities.js` + `js/systems/combat.js`（`damageEnemy` 入口取范围内最大 `damageReduction` 单值） |
| 敌人限时召唤 | `js/config.js`（`ENEMIES[].summoner`）+ `js/entities.js` + `js/systems/combat.js`（`summoner` 循环 + 召唤物 `lifetime` 清理，tags 自动加 `'summoned'`） |
| 敌人不能攻击 / 不能移动 | `js/config.js`（`ENEMIES[].canAttack: false` / `immobile: true`）+ `js/entities.js`（`spawnEnemy` 落地）+ `js/systems/enemyAI.js`（主循环分支） |
| 敌人攻击保护目标 / 车队 | `js/systems/enemyAI.js`（`protectTargets` 收集逻辑 + `attackPriority` 分支） |
| 波次攻击优先级 | `js/data/campaigns.js`（`waves[].priority` 作为波级默认，`waves[].spawns[].priority` 覆盖波级）+ `js/systems/wave.js`（`triggerNextWave` 传入 `spawnEnemy`）+ `js/entities.js`（`spawnEnemy` 写入 `enemy.attackPriority`） |
| Boss 波 | `js/data/campaigns.js`（`waves[].spawns[].boss: true`）+ `js/systems/wave.js`（放大与属性加成） |
| 无尽波生成 | `js/systems/wave.js`（`_buildEndlessWave`；战役需 `endless: true`，静态 `waves[]` 耗尽后自动接管） |
| 从敌方建筑刷怪 | `js/systems/wave.js`（`_resolveSpawnFromBuilding` / `_getAliveEnemyBuildings`；由 `spawns[].fromBuildings` 触发，建筑被摧毁后该点自动跳过） |
| 刷怪规则、资源增长、据点占领 | `js/systems/wave.js`（新逻辑读 `waves[].spawns[]`；`_resolveSpawnPosition` 解析出生点） |
| 敌方出生位置解析 | `js/systems/wave.js`（`_resolveSpawnPosition`：`at` 精确点 / `zone` 圆形/矩形区域随机 / 兜底边缘随机） |
| 单局计时 `battleElapsed` | `js/systems/wave.js`（每秒 `+1`）+ `js/state.js`（`resetSession` 归零） |
| 区域判定、占领、进出事件 | `js/systems/zone.js` |
| 胜负条件 | `js/systems/objective.js`（目标 + 失败条件）+ `js/systems/enemyAI.js`（基地被毁） |
| 多阶段任务 | `js/systems/objective.js`（`_getActiveObjectives` 读 `phases`） |
| 快捷键 | `js/systems/input.js`（含新增 `Z` 单位技能） |
| 镜头移动 | `js/systems/camera.js` |
| 小地图绘制与跳转 | `js/systems/minimap.js` |
| 粒子与爆炸表现 | `js/systems/vfx.js` |
| 场景初始化、system 装配 | `js/scene.js` |
| 车队移动逻辑 | `js/scene.js`（`_spawnConvoy` / `_updateConvoy`，waypoint 支持 `dwell` 停留 / `label` 标签） |
| 旧科技等级同步 | `js/systems/ark.js`（`upgradeNode` 读 `nodeDef.legacyKey` 写入 `State.upgrades`） |
| 方舟加成汇总规则 | `js/systems/ark.js`（`getBonuses`：部门等级 + 节点 `effects`） |
| 部门升级流程 | `js/systems/ark.js`（`upgradeDepartment`）+ `js/arkUI.js`（`render`） |
| 部门节点升级流程 | `js/systems/ark.js`（`upgradeNode`）+ `js/arkUI.js`（`upgradeNode`） |
| 卡牌解锁与装载 | `js/systems/ark.js`（`unlockCard` 逻辑内联在 `upgradeNode` / `equipCard` / `unequipCard` / `canEquip`）+ `js/arkUI.js`（`renderLoadout`） |
| 建造 / 技能卡牌校验 | `js/systems/ark.js`（`canBuild` / `canUseSkill`）+ `js/app.js` + `js/ui.js` |
| 战役结算发放方舟资源 | `js/systems/ark.js`（`grantBattleLoot`）+ `js/app.js`（`gameOver`） |
| 开局应用方舟加成 | `js/state.js`（`resetSession`）+ `js/systems/wave.js`（每秒资源） |

---

## 六、多战役数据模型速览

一个战役在 `js/data/campaigns.js` 中包含以下字段：

**必需字段：**

- `id` / `name` / `subtitle` / `briefing`
- `unlock`：`{ type: 'default' }` 或 `{ type: 'campaign', requires: '另一战役id' }`
- `map`：`width`、`height`、`base`、`depot`、`nodes[]`（每项含 `type`、`x`、`y`）、`spawnPoints`（可选，出生点表：id → `{ x, y }`）、`spawnZones`（可选，出生区域表：id → `{ shape: 'circle' | 'rect', x, y, r | w/h }`）
- `start`：`minerals`、`gas`、`maxSupply`、`waveTimer`
- `initialUnits[]`：`type` + `dx` / `dy`
- `waves[]`：每项 `interval`、`spawns[]`；波级可选 `priority`（`'default'` / `'protect'` / `'base'`，作为该波 spawn 默认优先级；缺省 `'default'`）。`spawns[]` 每项：`type`（敌人类型 key）、`count`（数量）、可选 `at`（出生点 id 或 `{ x, y }`）、可选 `zone`（出生区域 id 或内联区域对象）、可选 `fromBuildings`（`true` 或 tag 字符串；从当前存活的敌方建筑位置刷怪，建筑被摧毁后自动跳过该点）、可选 `delay`（秒，该组延迟开始生成）、可选 `spawnInterval`（同组逐个生成的间隔秒）、可选 `priority`（覆盖波级）、可选 `tags`（传给 `spawnEnemy`，用于 `destroy_target` 统计）、可选 `boss: true`（该组敌人放大 1.6 倍、HP ×3、伤害 ×1.5，并自动写入 `tags: ['boss']`）。**若战役声明 `endless: true`，`waves` 可为 `[]`，静态波用完后由 `wave.js` 的 `_buildEndlessWave` 动态生成。**
- `objectives[]`：见下
- `failConditions[]`：见下
- `rewards`：`coresPerWin`
- `victoryText` / `defeatText`
- `scripts[]`：`trigger` + `dialogue`

**可选字段：**

- `endless`：`true` 时启用无尽波，静态 `waves[]` 耗尽后自动由 `wave.js` 动态生成下一波（只改种类与数量，HP/伤害不动）
- `arkLoot`：该战役胜利/失败时发放的方舟资源，未定义则用 `DEFAULT_LOOT`
- `zones[]`：区域（撤离区、保护区、占领区）
- `convoy`：护送车队定义
- `protectTargets[]`：友方保护目标（信标、护盾发生器）
- `enemyBuildings[]`：敌方关键建筑（要塞核心、护盾发生器、虫巢、地刺、孢子炮等）
- `phases[]`：多阶段任务（每阶段自己的 `objectives`）

**目标类型（`objectives[]` 每项）：**

| type | 关键参数 | 说明 |
|---|---|---|
| `survive_waves` | `value` | 生存 N 波 |
| `survive_time` | `value` | 坚守 N 秒 |
| `capture_all_nodes` | — | 占领全部据点 |
| `capture_node` | `nodeType` | 占领指定类型据点 |
| `hold_zone` | `zoneId`、`seconds` | 守住区域 N 秒 |
| `reach_zone` | `zoneId`、`count`、`unitTag` | 至少 N 个单位抵达区域；`unitTag: 'convoy'` 时只统计运输车 |
| `extract_units` | `zoneId`、`count` | 至少 N 个友军单位进入撤离区 |
| `protect_target` | `targetId`、`untilObjective` / `seconds` | 保护目标存活；需关联其他目标或指定持续时间，避免秒胜 |
| `destroy_target` | `tag`、`count` | 摧毁带指定 tag 的目标 N 个 |
| `kill_count` | `enemyType`、`count` | 击杀指定敌人 N 个 |
| `boss_kill` | `bossId` | 击杀 Boss |
| `composite` | `mode`、`objectives[]` | 复合目标（`all` / `any`） |

**失败条件类型（`failConditions[]` 每项）：**

| type | 关键参数 | 说明 |
|---|---|---|
| `base_destroyed` | — | 指挥中心被毁 |
| `target_destroyed` | `params.targetId` | 保护目标被毁（`targetId: 'convoy_all'` 表示车队全灭） |
| `target_dead` | `params.targetId` | 保护单位阵亡 |
| `timeout` | `params.seconds` | 超时失败 |
| `friendly_loss_limit` | `max` | 损失超过 N 个单位 |
| `ally_all_dead` | — | 友军全灭（P3 同盟时启用） |
| `zone_lost` | `params.zoneId` | 关键区域被敌方占领 |

据点类型目前支持 `radar` 与 `thermal`，通用外观与标签在 `js/config.js` 的 `NODE_DEFAULT` 中定义。

**区域（`zones[]` 每项）：**

```js
{ id: 'exit_gate', shape: 'circle' | 'rect', x, y, r | w/h, label, color, holdTime }
```

**出生点 / 出生区域（`map.spawnPoints` / `map.spawnZones`）：**

```js
map: {
    width: 2400, height: 2400,
    base:  { x: 1200, y: 1200 },
    depot: { x: 1080, y: 1200 },
    nodes: [
        { type: 'radar',   x: 1200, y: 700  },
        { type: 'thermal', x: 600,  y: 1600 },
    ],
    spawnPoints: {
        north: { x: 1200, y: 100  },
        east:  { x: 2300, y: 1200 },
        // 更多出生点 id...
    },
    spawnZones: {
        north_area: { shape: 'rect',   x: 2000, y: 0,    w: 1200, h: 400 },
        east_area:  { shape: 'circle', x: 5000, y: 1800, r: 300 },
    },
}
```

**波次（`waves[]`）：**

```js
waves: [
    {
        interval: 45,
        priority: 'default',        // 波级默认优先级，可被 spawns[].priority 覆盖
        spawns: [
            { type: 'zergling',  count: 10, at: 'north', spawnInterval: 0.6 },
            { type: 'hydralisk', count: 6,  at: 'east',  spawnInterval: 1.0, delay: 2 },
            { type: 'ultralisk', count: 4,  zone: 'north_area', spawnInterval: 1.2, priority: 'protect' },
            { type: 'hydralisk', count: 1,  at: 'south', boss: true },
        ],
    },
]
```

**无尽波（`endless: true`）：**

```js
{
    endless: true,
    waves: [],                       // 静态波留空，由 wave.js 的 _buildEndlessWave 动态生成
    // ...
}
```

**从敌方建筑刷怪（`spawns[].fromBuildings`）：**

```js
{
    endless: true,
    waves: [],
    enemyBuildings: [
        { id: 'node_01', type: 'spike', x: 800, y: 2900, hp: 1400, tags: ['assault_node'], label: '地刺节点 1' },
        // ... 更多建筑
    ],
    // 动态生成的波内 spawn 示例：
    // { type: 'zergling',  count: 1, fromBuildings: true,   spawnInterval: 0.5 }
    // { type: 'ultralisk', count: 2, fromBuildings: 'assault_node', boss: true }
    // 说明：fromBuildings 为 true 时任意存活敌方建筑均可作为出生点；
    //       为 tag 字符串时只取带该 tag 的存活建筑。
    //       同一组内按轮询均匀分配；每个个体生成时实时重查存活建筑，
    //       某建筑被摧毁后该点不再出怪。
    objectives: [
        { id: 'purge', type: 'destroy_target', tag: 'assault_node', count: 12, label: '摧毁全部 12 座虫巢节点', required: true },
    ],
    failConditions: [
        { type: 'base_destroyed', reason: '指挥中心被摧毁' },
    ],
}
```

**护送车队（`convoy`）：**

```js
{
    count: 3,
    startX, startY, dx, speed,
    hp,                                   // 可选，运输车血量，默认 400
    waypoints: [
        { x, y, dwell?, label? },         // dwell: 停留秒数；label: 途经点标签
        ...
    ],
}
```

**保护目标（`protectTargets[]`）：**

```js
{ id, type, x, y, label }
```

**敌方关键建筑（`enemyBuildings[]`）：**

```js
{ id, type, x, y, hp, tags: [...], label }
```

**`arkLoot` 示例：**

```js
arkLoot: {
    victory: { alloy: 40, data: 30, supply: 20 },
    defeat:  { alloy: 10, data: 5,  supply: 0  },
}
```

---

## 七、协作边界建议（多智能体 / 多人）

| 角色 | 主要负责文件 |
|---|---|
| 数值/平衡 | `js/config.js`、`js/data/campaigns.js` |
| 战役内容/剧情 | `js/data/campaigns.js`、`js/data/dialogues.js` |
| UI/排版 | `index.html`、`css/style.css`、`js/ui.js`、`js/arkUI.js` |
| 方舟经营/部门/卡牌数据 | `js/data/ark.js`、`js/systems/ark.js`、`js/arkUI.js` |
| 流程/存档 | `js/app.js`、`js/state.js`、`js/systems/unlock.js` |
| 场景/系统装配 | `js/scene.js` |
| 战斗/敌人/波次/目标 | `js/systems/combat.js`、`enemyAI.js`、`wave.js`、`objective.js` |
| 区域/地形 | `js/systems/zone.js`（未来 `terrain.js`） |
| 输入/镜头/小地图 | `js/systems/input.js`、`camera.js`、`minimap.js` |
| 美术纹理/特效/音效 | `js/textures.js`、`js/systems/vfx.js`、`js/audio.js` |

约定：跨模块通信只通过 `StarAbyss.State`、`StarAbyss.App` 与 `StarAbyss.Ark`。方舟系统对外只暴露 `StarAbyss.Ark`（`ensureState` / `getBonuses` / `getDepartmentInfo` / `upgradeDepartment` / `upgradeNode` / `getCard` / `isCardUnlocked` / `getLoadout` / `getUsedSlots` / `getMaxSlots` / `isEquipped` / `canEquip` / `equipCard` / `unequipCard` / `canBuild` / `canUseSkill` / `grantBattleLoot`）。方舟与装载界面只暴露 `StarAbyss.ArkUI`（`renderLoadout` / `toggleCard` / `unequip` / `render` / `upgradeDepartment` / `upgradeNode`）。其它模块不得直接读写 `StarAbyss.State.ark` 内部结构，统一走 `Ark` 接口。区域系统对外只暴露 `StarAbyss.ZoneSystem` 的 `getZone` / `getZoneOwner` / `_insideZone` / `zones`。

---

## 八、已知限制

- 科技升级目前全局共享，未按战役分桶。
- 星级评价目前只有“胜利即 3 星”，未实现按用时 / 损失 / 核心计算。
- 波次表默认仍为静态数组；`waves[].spawns[]` 已支持按种类精确指定数量、出生点 / 出生区域、生成延迟、生成间隔、攻击优先级与 Boss。战役可通过 `endless: true` 启用无尽波（由 `wave.js` 的 `_buildEndlessWave` 按公式动态生成，只改种类与数量，HP/伤害不动）；`spawns[].fromBuildings` 可从存活敌方建筑位置刷怪，建筑被摧毁后该点自动跳过。随机事件 / 动态增援机制仍无。
- 地形仅背景网格，区域（`zones`）已支持占领与进出事件，但无阻挡格、无高低差、无寻路。
- 敌人 AI 为直线追踪，无绕行与编队；已支持盾卫被动 / 主动嘲讽与眩晕 / 减速状态。
- 敌方群体减伤光环取范围内最大 `damageReduction` 单值，不做乘算堆叠；如需多层叠加需扩展 `damageEnemy` 入口。
- 敌方召唤物 `lifetime` 到点直接 `destroy()`，不走 `_killEnemy`，不计入击杀统计、不给经验、不掉资源；如需计击杀需在 `combat.js` 召唤物清理分支改走 `_killEnemy`。
- 敌方远程弹道命中判定为"距目标 24px 内"，无目标预测 / 无碰撞网格；目标死亡或消失时弹道直接销毁。
- 友军主动技能目前只有 `stim` / `heal_burst` / `taunt_roar` 三种；新增技能需在 `combat.js` 的 `activateUnitAbility` 内加 `ab.id` 分支，并可在 `ui.js` 的 `_renderUnitSkills` 无需改动（按钮通用）。
- 新增敌人若复用现有纹理，靠 `tint` 区分（如 `healer` 用 `tex_medic`、`warden` 用 `tex_shieldman`）；如需专属外观需在 `textures.js` 补纹理。
- 敌方关键建筑（护盾发生器、要塞核心）仍复用 `tex_shield_gen`，但虫巢 / 地刺 / 孢子炮已有专属纹理。
- `protect_target` 目标必须配合 `untilObjective` 或 `seconds` 才有意义，否则会开局即完成。
- `minimap.js` 已按当前战役地图尺寸动态计算比例和点击映射；但小地图 canvas 内部坐标系固定为 140×140，若改 CSS 显示尺寸无需改代码，若改 canvas `width/height` 属性需同步更新 `minimap.js` 中的 140 常量。
- 方舟目前有 10 个部门：舰桥指挥中心、科研实验室、兵营训练舱、机库军械库、工程制造局、动力核心、情报通讯、医疗冻眠舱、生活娱乐、后勤仓储。舰桥、科研、兵营、机库、工程、动力、情报已有升级节点，医疗、生活仍为空壳（仅显示等级，无实际效果）。
- 方舟家具/设备/装修网格/套装/老兵空投尚未实现。
- 方舟资源只有核心、合金、数据、补给四类，暂无电力、算力、士气、声望，且目前用于升级项的资源仅核心，未配置升级材料多元化。
- 卡牌系统目前已有：3 张初始卡（陆战队员、火蝠、自动炮塔）+ 需解锁单位卡（幽灵、坦克、火箭兵、医疗兵、工程师、侦察无人机、盾卫、狙击手）+ 需解锁建筑卡（火焰塔、狙击塔、维修站、雷达站、障碍墙）+ 需解锁技能卡（轨道打击、战场维修、空投增援、护盾场、侦察扫描、纳米修复、地雷阵、电磁脉冲），暂无载具卡、遗物卡。
- 卡槽基础 5 格，上限 12 格；卡片升级（例如陆战队员卡 Lv.1→Lv.5）尚未实现。
- 方舟加成目前只接入 `resetSession` 开局资源与 `wave.js` 每秒资源；尚未接入单位属性、建筑属性、老兵、部门支援等更深的战斗逻辑。
- 无尽波 `_buildEndlessWave` 的曲线是写死的公式（每 5 波 Boss +1），若需按战役定制不同曲线，需要把公式抽到 `campaigns.js` 的 `endlessCurve` 字段（当前未实现）。
- `fromBuildings` 出生点偏移固定为建筑周围 50–90px 环形随机，不支持按建筑类型定制偏移；如需不同偏移，需扩展 `_resolveSpawnFromBuilding`。
- ---

## 九、其他

- 控制台作弊命令：StarAbyss.State.addCores(9999) // 添加 9999 核心