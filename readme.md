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
| `index.html` | 页面骨架、DOM 结构、脚本加载入口。包含主菜单层、HUD 层、目标面板（`#objectives-panel`）、剧情弹窗、对话浮层、伤害遮罩、Toast 容器。主菜单右侧为“战前装载”（`#loadout-panel`）。 |
| `css/style.css` | 全部样式：变量、菜单、HUD、底栏、按钮、小地图、目标/失败条件面板、弹窗、对话浮层、Toast 动画、方舟面板、部门卡、装载槽、卡牌库。 |

### `js/` 核心

| 文件 | 职责 |
|---|---|
| `js/config.js` | 全局通用数值：地图默认尺寸、经济速率、升级成本、单位定义、敌人定义、建筑定义（含 `shield_gen` / `convoy` / `beacon` / `fortress_core`）、指挥官技能、据点默认属性、占领参数、刷怪参数、晋升参数、任务系统默认参数（`OBJECTIVE_DEFAULT` / `FAIL_DEFAULT` / `PROTECT_TARGETS`）。多战役不覆盖的默认值放这里。 |
| `js/audio.js` | Web Audio 实时合成音效。`playShoot` / `playExplosion` / `playClick` / `playAlarm`，无外部音频文件。 |
| `js/state.js` | 存档 + 单局状态。持久化：核心库存、三项旧科技等级（`upgrades`）、战役进度、方舟数据（`ark`：资源、部门等级与节点、库存、战绩、卡牌解锁与装载）。单局：当前战役 id、资源、人口、波次、计时、胜负标记、放置建筑类型、任务统计。提供 `load` / `save` / `resetSession` / `getCurrentCampaign` / `commitCores` / `recordKill` / `recordLoss`。`resetSession` 会读取 `Ark.getBonuses()` 应用开局加成。 |
| `js/ui.js` | 全部 DOM 操作集中处（方舟面板除外，见 `arkUI.js`）。HUD 刷新、目标 / 失败条件面板刷新（`renderObjectivesPanel`）、菜单核心库存与旧科技按钮刷新（`updateMenuUI`，已做空值保护）、战役列表渲染（`renderMissionList`）、选择卡片、单位技能栏、Toast、受击闪红、对话浮层、剧情/结算弹窗。`renderArkPanel` 现转发到 `StarAbyss.ArkUI.render()`。`updateUI` 中所有生产 / 建造 / 技能按钮的 `disabled` 会先经 `Ark.canBuild` / `Ark.canUseSkill` 过滤未携带卡牌。 |
| `js/arkUI.js` | 方舟与装载界面渲染。`renderLoadout`：主菜单右侧“战前装载”，显示卡槽占用、卡牌库、点击携带/卸下；按 `slotCost` 累加已占用格，支持占 2 格的卡牌。`render`：方舟母舰面板，按部门渲染等级、节点列表、升级按钮。`toggleCard` / `unequip` / `upgradeDepartment` / `upgradeNode` 为 `onclick` 入口。跨模块入口 `StarAbyss.ArkUI`。 |
| `js/textures.js` | 用 Phaser Graphics 程序化生成所有矢量纹理（基地、补给站、炮塔、四种友军、三种敌人、据点、子弹、火焰、粒子、护盾发生器 / 要塞核心 `tex_shield_gen`、运输车 `tex_convoy`、方舟信标 `tex_beacon`）。 |
| `js/entities.js` | `UnitFactory`（生成友军/敌人，`spawnEnemy` 支持传入 `tags` 用于 `destroy_target` 目标统计）与 `BuildingFactory`（放置建筑，`spawnProtectTarget` 生成友方保护目标、`spawnEnemyBuilding` 生成敌方关键建筑）。单位属性从 `config.js` + 当前科技等级计算。注意：实体层不做卡牌校验，卡牌校验在 `App.triggerBuild` / `App.selectBuildingToPlace` / `UI.updateUI` 中。 |
| `js/app.js` | 应用流程控制。初始化菜单、准备战役、开始游戏、触发生产 / 放置建筑 / 指挥官技能（均先经 `Ark.canBuild` / `Ark.canUseSkill` 校验）、结算胜负、返回菜单、打开/关闭方舟面板。`initMenu` 会调用 `ArkUI.renderLoadout` 渲染战前装载。`buyUpgrade` 保留兼容，转发到 `Ark.upgradeNode`。`window.gameApp` 供 HTML `onclick` 使用。 |
| `js/scene.js` | `MainScene`。负责场景组装：设置世界边界、背景网格、实例化所有 system 与 factory、按当前战役初始化地图（生成保护目标、敌方关键建筑、车队、区域）、`update` 中依次调用各 system。 |

### `js/data/` 数据层

| 文件 | 职责 |
|---|---|
| `js/data/campaigns.js` | 所有战役定义。每个战役含：id、名称、副标题、简报 HTML、解锁条件、地图（尺寸、基地/补给站坐标、据点列表）、开局资源与人口、初始单位、波次表、目标列表、失败条件列表（`failConditions`）、奖励、胜负文案、脚本触发表。可选字段：`zones`（区域）、`convoy`（护送车队）、`protectTargets`（保护目标）、`enemyBuildings`（敌方关键建筑）、`phases`（多阶段任务）、`arkLoot`：该战役胜利/失败时发放的方舟资源，未定义则用 `ArkData.DEFAULT_LOOT`。 |
| `js/data/dialogues.js` | 所有对话文本。按 id 索引，含 `speaker` 与 `text`。战役脚本通过 id 引用。 |
| `js/data/ark.js` | 方舟数据定义。`ArkData.DEPARTMENTS`：部门 id、名称、图标、描述、最大等级、部门升级成本数组、每级 `bonusPerLevel`、以及多升级节点 `upgrades[]`（每个节点含 `id` / `name` / `desc` / `maxLevel` / `cost` / `requires` / `effects` / `unlocks`）。`ArkData.CARDS`：统一卡牌定义（`unit` / `building` / `skill`），含 `id` / `type` / `name` / `slotCost` / `buildKey` 或 `skillKey` / `defaultUnlocked` / `unlockBy` / `desc`。`ArkData.LOADOUT`：`baseSlots` / `maxSlots` / `allowDuplicate` / `defaultEquipped`。`ArkData.DEFAULT_LOOT`：战役胜负默认发放的方舟资源（合金/数据/补给）。 |

### `js/systems/` 系统层

| 文件 | 职责 |
|---|---|
| `js/systems/unlock.js` | 战役解锁与进度。判断某战役是否解锁、生成锁定原因、确保进度条目、标记完成、累加核心、列出全部战役。 |
| `js/systems/ark.js` | 方舟系统入口。`ensureState` 补全存档方舟结构（资源、部门、部门节点、卡牌解锁、装载、默认装备），自动兼容旧档；`getBonuses` 汇总所有部门等级 + 节点 `effects` 提供的战斗加成；`getDepartmentInfo` 返回单个部门等级与所有节点升级信息；`upgradeDepartment` 消耗 `totalCores` 升级部门；`upgradeNode` 消耗 `totalCores` 升级节点并处理 `unlocks.cards`；`getCard` / `isCardUnlocked` / `getLoadout` / `getUsedSlots` / `getMaxSlots` / `isEquipped` / `canEquip` / `equipCard` / `unequipCard` 管理卡牌与装载；`canBuild(buildKey)` / `canUseSkill(skillKey)` 供战斗与 UI 校验；`grantBattleLoot` 战役结算发放方舟资源。跨模块通过 `StarAbyss.Ark` 访问。 |
| `js/systems/vfx.js` | 特效：环境粒子、枪口焰、命中爆点、死亡爆炸。 |
| `js/systems/combat.js` | 友军攻击逻辑、炮塔攻击、弹道生成、命中判定、敌人受伤与死亡、击杀统计（`recordKill`）、经验与晋升、保护目标受伤与摧毁（`damageBuilding` / `_destroyBuilding`）、坦克架设切换、指挥官技能（轨道打击 / 战场维修，`activateCommanderSkill` 开头会调 `Ark.canUseSkill` 二次校验）。 |
| `js/systems/enemyAI.js` | 敌人追踪与攻击。优先攻击附近友军，其次攻击保护目标（信标、护盾发生器、车队），否则进攻指挥中心。跳过敌方建筑（`isEnemyBuilding`）。 基地被摧毁时触发失败。 |
| `js/systems/wave.js` | 资源每秒增长（叠加 `Ark.getBonuses()` 的 `econMineralsPerSec` / `econGasPerSec`）、单局计时（`battleElapsed`）、据点持续收益、波次计时、按当前战役的波次表刷怪、据点占领判定、血条与占领进度条绘制（含车队、保护目标）。 |
| `js/systems/zone.js` | 区域系统。 `init(campaign)` 读取 `zones` 生成区域；`update` 判定玩家 / 敌人在区域内外的进出事件、占领进度、驻留计时；`getZone` / `getZoneOwner` / `_insideZone` 供 `objective.js` 与 `script.js` 查询。 |
| `js/systems/objective.js` | 任务系统核心。 支持多目标类型：`survive_waves` / `survive_time` / `capture_all_nodes` / `capture_node` / `hold_zone` / `reach_zone` / `extract_units` / `protect_target` / `destroy_target` / `kill_count` / `boss_kill` / `composite`。支持失败条件：`base_destroyed` / `target_destroyed` / `target_dead` / `timeout` / `friendly_loss_limit` / `ally_all_dead` / `zone_lost`。支持 `phases` 多阶段。全部完成触发胜利，失败条件触发 `gameOver(false, failReason)`。 |
| `js/systems/script.js` | 战役脚本触发。监听 `onStart` / `onWave` / `onNodeCaptured` / `onObjectiveComplete` / `onTargetDestroyed` / `onUnitEnterZone` / `onZoneCaptured` / `onTimer` / `onAllyEvent`，命中后播放对应对话或执行 action。每个脚本只触发一次。 |
| `js/systems/input.js` | 框选、右键移动、建筑放置、快捷键 1–6 / R / T / E。 |
| `js/systems/camera.js` | 方向键与 WASD 平移镜头。 |
| `js/systems/minimap.js` | 小地图绘制（建筑、友军、敌军、区域、车队、保护目标、敌方关键建筑、镜头框）与点击/拖拽跳转镜头。 |

---

## 五、改什么内容 → 动哪些文件

### 数值与平衡

| 想改的内容 | 要动的文件 |
|---|---|
| 单位价格、血量、伤害、射程、攻速、弹道速度 | `js/config.js`（`UNITS`） |
| 敌人血量、速度、伤害、经验、掉核心概率 | `js/config.js`（`ENEMIES`） |
| 建筑血量、造价、炮塔射程/伤害/攻速 | `js/config.js`（`BUILDINGS`） |
| 保护目标（护盾发生器、运输车、信标、要塞核心）血量/纹理 | `js/config.js`（`BUILDINGS`） |
| 指挥官技能消耗与效果 | `js/config.js`（`SKILLS`） |
| 每秒资源、经济科技加成 | `js/config.js`（`ECON`） |
| 旧三项科技升级成本 | `js/config.js`（`UPGRADE_COSTS`） |
| 占领速度、衰减、雷达核心概率、热能泉瓦斯加成 | `js/config.js`（`CAPTURE`） |
| 晋升经验门槛与加成 | `js/config.js`（`PROMOTION`） |
| 保护目标标签与颜色 | `js/config.js`（`PROTECT_TARGETS`） |
| 单个战役的开局资源、人口、波次间隔 | `js/data/campaigns.js`（对应战役的 `start` 与 `waves`） |
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
| 新增一个友军兵种 | `js/config.js`（加定义）→ `js/textures.js`（加纹理）→ `index.html`（加按钮）→ `js/data/ark.js`（加 `CARDS` 条目）→ `js/ui.js`（按钮 enable 判定已通用）→ `js/app.js` 快捷键可选 |
| 新增一个敌人类型 | `js/config.js`（加定义）→ `js/textures.js`（加纹理）→ `js/data/campaigns.js`（写进某波 `types`） |
| 新增一个可建造建筑 | `js/config.js`（加定义）→ `js/textures.js`（加纹理）→ `index.html`（加按钮）→ `js/data/ark.js`（加 `CARDS` 条目）→ `js/entities.js`（`BuildingFactory` 分支）→ `js/ui.js`（按钮判定） |
| 新增一个保护目标建筑 | `js/config.js`（`BUILDINGS` 加定义）→ `js/textures.js`（加纹理）→ `js/data/campaigns.js`（该战役 `protectTargets`） |
| 新增一个敌方关键建筑 | `js/config.js`（`BUILDINGS` 加定义）→ `js/textures.js`（加纹理）→ `js/data/campaigns.js`（该战役 `enemyBuildings`） |
| 调整单位升级加成 | `js/config.js`（`hpPerUpgrade` / `damagePerUpgrade`） |

### 战役内容

| 想加的内容 | 要动的文件 |
|---|---|
| 新增一个战役 | 只改 `js/data/campaigns.js`（追加对象）；如需对话再改 `js/data/dialogues.js` |
| 调整某战役地图尺寸/基地位置/据点位置 | `js/data/campaigns.js`（该战役的 `map`） |
| 调整某战役初始单位 | `js/data/campaigns.js`（`initialUnits`） |
| 调整某战役波次组成、数量、间隔 | `js/data/campaigns.js`（`waves`） |
| 改某战役目标 | `js/data/campaigns.js`（`objectives`），必要时扩 `js/systems/objective.js` |
| 加失败条件 | `js/data/campaigns.js`（`failConditions`），必要时扩 `js/systems/objective.js`（`_checkFail`） |
| 加区域（撤离区/保护区/占领区） | `js/data/campaigns.js`（`zones`）→ `js/systems/zone.js` 已支持 |
| 加护送车队 | `js/data/campaigns.js`（`convoy`）→ `js/scene.js`（`_spawnConvoy` 已支持） |
| 加保护目标 | `js/data/campaigns.js`（`protectTargets`）→ `js/entities.js`（`spawnProtectTarget` 已支持） |
| 加敌方关键建筑 | `js/data/campaigns.js`（`enemyBuildings`）→ `js/entities.js`（`spawnEnemyBuilding` 已支持） |
| 改某战役胜负文案 | `js/data/campaigns.js`（`victoryText` / `defeatText`） |
| 加战役内对话 | `js/data/dialogues.js`（加条目）+ `js/data/campaigns.js`（`scripts` 引用） |
| 加新的脚本触发类型 | `js/systems/script.js`（扩展 `_matches`）+ 对应系统发事件 |
| 加新的目标类型 | `js/systems/objective.js`（扩展 `_isDone`）+ `js/app.js`（`_describeObjective` 文案）+ `js/ui.js`（`_describe` 文案） |
| 加新的失败条件 | `js/systems/objective.js`（扩展 `_checkFail` + `_defaultFailReason`） |
| 加多阶段任务 | `js/data/campaigns.js`（`phases`）+ `js/systems/objective.js`（`_getActiveObjectives` 已支持） |
| 战役解锁条件 | `js/data/campaigns.js`（`unlock`）+ `js/systems/unlock.js` |
| 战役进度持久化 | `js/state.js`（`campaignProgress` 已存在）+ `js/systems/unlock.js` |
| 给某战役发定制方舟战利品 | `js/data/campaigns.js`（`arkLoot.victory` / `arkLoot.defeat`） |

### 方舟 / 部门 / 卡牌 / 装载

| 想改的内容 | 要动的文件 |
|---|---|
| 新增方舟部门 | `js/data/ark.js`（`DEPARTMENTS` 加条目）→ `js/systems/ark.js`（`ensureState` 自动补全，无需改逻辑） |
| 部门下加升级节点 | `js/data/ark.js`（`DEPARTMENTS[id].upgrades[]` 加条目） |
| 节点解锁某张卡牌 | `js/data/ark.js`（节点加 `unlocks.cards: ['xxx']`） |
| 节点提供全局加成 | `js/data/ark.js`（节点加 `effects: [{ key, value }]`）+ `js/systems/ark.js`（`getBonuses` 已汇总）+ 使用处（如 `state.js` / `wave.js` / `entities.js`） |
| 节点前置条件 | `js/data/ark.js`（节点加 `requires: { deptLevel, nodes }`） |
| 新增一张卡牌 | `js/data/ark.js`（`CARDS` 加条目）+ 若为新单位/建筑则按"单位/建筑"流程补 `config.js` / `textures.js` / `index.html` |
| 调整卡槽基础数 / 上限 / 默认装备 | `js/data/ark.js`（`LOADOUT`） |
| 调整卡槽扩容节点 | `js/data/ark.js`（对应节点的 `effects: [{ key: 'loadoutSlot', value: 1 }]`） |
| 卡牌携带校验（建造/技能） | `js/systems/ark.js`（`canBuild` / `canUseSkill`）+ `js/app.js` + `js/ui.js`（均已接入） |
| 旧三项科技迁入科研实验室 | `js/data/ark.js`（在 `research.upgrades` 中补节点）；`js/app.js`（`buyUpgrade` 中已有转发映射，可按需调整） |

### UI / 流程

| 想改的内容 | 要动的文件 |
|---|---|
| 主菜单布局、标题、面板 | `index.html` + `css/style.css` |
| 战役列表样式 | `css/style.css`（`.mission-list`、`.mission-card`） |
| 战役列表渲染逻辑 | `js/ui.js`（`renderMissionList`） |
| 战前装载面板布局与卡槽 | `index.html`（`#loadout-panel`）+ `css/style.css`（`.loadout-*`、`.card-*`）+ `js/arkUI.js`（`renderLoadout` / `toggleCard` / `unequip`） |
| HUD 顶栏资源显示 | `index.html` + `js/ui.js`（`updateUI`） |
| 目标 / 失败条件面板样式 | `css/style.css`（`.objectives-panel`、`.obj-title`、`.obj-row`） |
| 目标 / 失败条件面板渲染 | `js/ui.js`（`renderObjectivesPanel`）+ `js/systems/objective.js`（`describeObjectives` / `describeFailConditions`） |
| 底栏生产/建造按钮 | `index.html` + `js/ui.js`（`updateUI` 里的 enable 判定，已叠加 `Ark.canBuild`） |
| 选择卡片、单位技能栏 | `js/ui.js`（`updateSelectionCard`、`_renderUnitSkills`） |
| 剧情简报弹窗 | `js/ui.js`（`showStoryModal`）+ `js/app.js`（`prepareMission`） |
| 结算弹窗 | `js/ui.js`（`showStoryModal`）+ `js/app.js`（`gameOver`） |
| 战役内对话浮层 | `css/style.css`（`#dialogue-overlay`）+ `js/ui.js`（`showDialogue`） |
| Toast 提示 | `js/ui.js`（`showToast`） |
| 受击闪红 | `js/ui.js`（`flashDamage`） |
| 主菜单方舟入口按钮 | `index.html`（`.ark-entry-btn`）+ `css/style.css` |
| 方舟面板布局、资源条、部门卡 | `index.html`（`#ark-panel`）+ `css/style.css`（`.ark-*`、`.dept-*`、`.upgrade-node-*`）+ `js/arkUI.js`（`render`） |
| 方舟部门升级节点渲染 | `js/arkUI.js`（`render` 中 `nodeHtml` 部分）+ `css/style.css`（`.upgrade-node-*`） |
| 结算弹窗战利品行 | `js/app.js`（`gameOver`）+ `css/style.css`（`.loot-row`） |

### 系统逻辑

| 想改的内容 | 要动的文件 |
|---|---|
| 单位索敌与开火行为 | `js/systems/combat.js` |
| 炮塔攻击行为 | `js/systems/combat.js` |
| 保护目标受伤与摧毁 | `js/systems/combat.js`（`damageBuilding` / `_destroyBuilding`） |
| 击杀统计（供 destroy_target 用） | `js/systems/combat.js`（`_killEnemy` / `_destroyBuilding` 调 `State.recordKill`） |
| 敌人 AI 行为 | `js/systems/enemyAI.js` |
| 敌人攻击保护目标 / 车队 | `js/systems/enemyAI.js`（`protectTargets` 收集逻辑） |
| 刷怪规则、资源增长、据点占领 | `js/systems/wave.js` |
| 单局计时 `battleElapsed` | `js/systems/wave.js`（每秒 `+1`）+ `js/state.js`（`resetSession` 归零） |
| 区域判定、占领、进出事件 | `js/systems/zone.js` |
| 胜负条件 | `js/systems/objective.js`（目标 + 失败条件）+ `js/systems/enemyAI.js`（基地被毁） |
| 多阶段任务 | `js/systems/objective.js`（`_getActiveObjectives` 读 `phases`） |
| 快捷键 | `js/systems/input.js` |
| 镜头移动 | `js/systems/camera.js` |
| 小地图绘制与跳转 | `js/systems/minimap.js` |
| 粒子与爆炸表现 | `js/systems/vfx.js` |
| 场景初始化、system 装配 | `js/scene.js` |
| 车队移动逻辑 | `js/scene.js`（`_spawnConvoy` / `_updateConvoy`） |
| 方舟加成汇总规则 | `js/systems/ark.js`（`getBonuses`：部门等级 + 节点 `effects`） |
| 部门升级流程 | `js/systems/ark.js`（`upgradeDepartment`）+ `js/arkUI.js`（`render`） |
| 部门节点升级流程 | `js/systems/ark.js`（`upgradeNode`）+ `js/arkUI.js`（`upgradeNode`） |
| 卡牌解锁与装载 | `js/systems/ark.js`（`unlockCard` 逻辑内联在 `upgradeNode` / `equipCard` / `unequipCard` / `canEquip`）+ `js/arkUI.js`（`renderLoadout`） |
| 建造 / 技能卡牌校验 | `js/systems/ark.js`（`canBuild` / `canUseSkill`）+ `js/app.js` + `js/ui.js` |
| 战役结算发放方舟资源 | `js/systems/ark.js`（`grantBattleLoot`）+ `js/app.js`（`gameOver`） |
| 开局应用方舟加成 | `js/state.js`（`resetSession`）+ `js/systems/wave.js`（每秒资源） |

### 音效

| 想改的内容 | 要动的文件 |
|---|---|
| 开枪 / 爆炸 / 点击 / 警报音色 | `js/audio.js` |
| 触发时机 | 调用处：`js/systems/combat.js`、`js/systems/wave.js`、`js/app.js`、`js/ui.js`、`js/arkUI.js` |

### 存档

| 想改的内容 | 要动的文件 |
|---|---|
| 存档字段（核心、科技、战役进度） | `js/state.js`（`load` / `save`） |
| 方舟存档字段（资源、部门、节点、卡牌、装载、战绩） | `js/state.js`（`ark`）+ `js/systems/ark.js`（`ensureState` 自动补全） |
| 清档 / 迁移 | `js/state.js` |
| 每战役独立科技（当前为全局共享） | `js/state.js`（需把 `upgrades` 改为按战役分桶）+ `js/entities.js`（读取处） |
| 新增部门后旧档兼容 | `js/systems/ark.js`（`ensureState` 自动补全缺失部门） |
| 新增卡牌后旧档兼容 | `js/systems/ark.js`（`ensureState` 自动补默认解锁卡） |


---

## 六、多战役数据模型速览

一个战役在 `js/data/campaigns.js` 中包含以下字段：

**必需字段：**
- `id` / `name` / `subtitle` / `briefing`
- `unlock`：`{ type: 'default' }` 或 `{ type: 'campaign', requires: '另一战役id' }`
- `map`：`width`、`height`、`base`、`depot`、`nodes[]`（每项含 `type`、`x`、`y`）
- `start`：`minerals`、`gas`、`maxSupply`、`waveTimer`
- `initialUnits[]`：`type` + `dx` / `dy`
- `waves[]`：每项 `count`、`types[]`、`interval`
- `objectives[]`：见下
- `failConditions[]`：见下
- `rewards`：`coresPerWin`
- `victoryText` / `defeatText`
- `scripts[]`：`trigger` + `dialogue`

**可选字段：**
- `arkLoot`：该战役胜利/失败时发放的方舟资源，未定义则用 `DEFAULT_LOOT`
- `zones[]`：区域（撤离区、保护区、占领区）
- `convoy`：护送车队定义
- `protectTargets[]`：友方保护目标（信标、护盾发生器）
- `enemyBuildings[]`：敌方关键建筑（要塞核心、护盾发生器）
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

**护送车队（`convoy`）：**

```js
{
    count: 3,
    startX, startY, dx, speed,
    waypoints: [{ x, y }, ...],
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
- 星级评价目前只有“胜利即 3 星”，未实现按用时 / 损失 / 核心数计算。
- 波次表为静态数组，尚无随机事件 / Boss 波 / 增援机制。
- 地形仅背景网格，区域（`zones`）已支持占领与进出事件，但无阻挡格、无高低差、无寻路。
- 敌人 AI 为直线追踪，无绕行与编队。
- 敌方关键建筑（护盾发生器、要塞核心）目前用 `tex_shield_gen` 复用纹理，尚无专属外观。
- `protect_target` 目标必须配合 `untilObjective` 或 `seconds` 才有意义，否则会开局即完成。
- `minimap.js` 已按当前战役地图尺寸动态计算比例和点击映射；但小地图 canvas 内部坐标系固定为 140×140，若改 CSS 显示尺寸无需改代码，若改 canvas `width/height` 属性需同步更新 `minimap.js` 中的 140 常量。
- 方舟目前有 10 个部门：舰桥指挥中心、科研实验室、兵营训练舱、机库军械库、工程制造局、动力核心、情报通讯、医疗冻眠舱、生活娱乐、后勤仓储。只有舰桥、科研、工程、后勤四个部门有升级节点或每级加成，其余部门暂为空壳（仅显示等级，无实际效果）。
- 方舟家具/设备/装修网格/套装/老兵空投尚未实现。
- 方舟资源只有核心、合金、数据、补给四类，暂无电力、算力、士气、声望。
- 卡牌系统目前只有 3 张初始卡（陆战队员、火蝠、自动炮塔）+ 2 张需解锁单位卡（幽灵、坦克）+ 2 张需解锁技能卡（轨道打击、战场维修），暂无建筑卡扩展、载具卡、遗物卡。
- 卡槽基础 3 格、上限 8 格，扩容节点只做了 3 级；卡片升级（例如陆战队员卡 Lv.1→Lv.5）尚未实现。
- 旧三项科技（`infantryHp` / `mechAtk` / `economy`）仍保留在 `State.upgrades` 中并被实体、经济读取，尚未在方舟科研实验室里建立对应节点；`App.buyUpgrade` 中的转发映射指向了尚未创建的节点 id（`node_infantryHp` 等），调用会静默失败。
- 方舟加成目前只接入 `resetSession` 开局资源与 `wave.js` 每秒资源；尚未接入单位属性、建筑属性、老兵、部门支援等更深的战斗逻辑。
