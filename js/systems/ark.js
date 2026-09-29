// js/systems/ark.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.Ark = {
    // 确保存档方舟结构完整，自动补全缺失部门、节点、卡牌、装载
    ensureState() {
        const S = StarAbyss.State;
        const D = StarAbyss.ArkData;

        if (!S.ark) {
            S.ark = {
                resources: { alloy: 0, data: 0, supply: 0 },
                departments: {},
                inventory: [],
                stats: { wins: 0, losses: 0 },
                cards: { unlocked: {}, equipped: [] },
                loadout: { bonusSlots: 0 }
            };
        }

        if (!S.ark.resources) {
            S.ark.resources = { alloy: 0, data: 0, supply: 0 };
        } else {
            S.ark.resources.alloy  = S.ark.resources.alloy  || 0;
            S.ark.resources.data   = S.ark.resources.data   || 0;
            S.ark.resources.supply = S.ark.resources.supply || 0;
        }

        if (!S.ark.departments) S.ark.departments = {};
        if (!S.ark.inventory)   S.ark.inventory   = [];
        if (!S.ark.stats)       S.ark.stats       = { wins: 0, losses: 0 };
        if (!S.ark.cards)       S.ark.cards       = { unlocked: {}, equipped: [] };
        if (!S.ark.cards.unlocked) S.ark.cards.unlocked = {};
        if (!Array.isArray(S.ark.cards.equipped)) S.ark.cards.equipped = [];
        if (!S.ark.loadout)     S.ark.loadout     = { bonusSlots: 0 };
        if (typeof S.ark.loadout.bonusSlots !== 'number') S.ark.loadout.bonusSlots = 0;

        // 补全部门
        Object.keys(D.DEPARTMENTS).forEach(id => {
            if (!S.ark.departments[id]) {
                S.ark.departments[id] = { level: 0, nodes: {} };
            }
            if (typeof S.ark.departments[id].level !== 'number') {
                S.ark.departments[id].level = 0;
            }
            if (!S.ark.departments[id].nodes) {
                S.ark.departments[id].nodes = {};
            }
        });

        // 补全默认解锁卡
        Object.keys(D.CARDS).forEach(cardId => {
            const card = D.CARDS[cardId];
            if (card.defaultUnlocked) {
                S.ark.cards.unlocked[cardId] = true;
            }
        });

        // 如果已装备为空，给默认装备
        if (S.ark.cards.equipped.length === 0) {
            S.ark.cards.equipped = D.LOADOUT.defaultEquipped.slice();
        }
    },

    // 汇总所有部门 + 节点提供的加成
    getBonuses() {
        this.ensureState();
        const result = {};
        const defs = StarAbyss.ArkData.DEPARTMENTS;
        const S = StarAbyss.State;

        Object.keys(defs).forEach(id => {
            const def = defs[id];
            const dept = S.ark.departments[id];
            const lv = dept ? dept.level : 0;

            // 部门每级加成
            if (lv > 0 && def.bonusPerLevel) {
                Object.keys(def.bonusPerLevel).forEach(key => {
                    const val = def.bonusPerLevel[key] * lv;
                    result[key] = (result[key] || 0) + val;
                });
            }

            // 节点加成
            if (dept && dept.nodes) {
                (def.upgrades || []).forEach(node => {
                    const nodeLv = dept.nodes[node.id] || 0;
                    if (nodeLv <= 0) return;
                    (node.effects || []).forEach(eff => {
                        if (!eff.key) return;
                        const val = (eff.value || 0) * nodeLv;
                        result[eff.key] = (result[eff.key] || 0) + val;
                    });
                });
            }
        });

        return result;
    },

    // 单个部门信息 + 所有节点信息
    getDepartmentInfo(id) {
        this.ensureState();
        const def = StarAbyss.ArkData.DEPARTMENTS[id];
        if (!def) return null;

        const dept = StarAbyss.State.ark.departments[id];
        const level = dept.level;
        const isMax = level >= def.maxLevel;
        const nextCost = isMax ? 0 : (def.upgradeCost[level] || 0);
        const canAfford = !isMax && StarAbyss.State.totalCores >= nextCost;

        const upgrades = (def.upgrades || []).map(node => {
            const nodeLv = dept.nodes[node.id] || 0;
            const nodeMax = nodeLv >= (node.maxLevel || 1);
            const costArr = node.cost || [];
            const nextNodeCost = nodeMax ? 0 : (costArr[nodeLv] || 0);
            const canAffordNode = !nodeMax && StarAbyss.State.totalCores >= nextNodeCost;
            const req = node.requires || {};
            const reqDeptOk = !req.deptLevel || level >= req.deptLevel;
            const reqNodesOk = !req.nodes || req.nodes.every(nid => (dept.nodes[nid] || 0) > 0);
            const canUpgrade = !nodeMax && reqDeptOk && reqNodesOk && canAffordNode;

            return {
                def: node,
                level: nodeLv,
                isMax: nodeMax,
                nextCost: nextNodeCost,
                canAfford: canAffordNode,
                canUpgrade,
                reqDeptOk,
                reqNodesOk
            };
        });

        return { def, level, isMax, nextCost, canAfford, upgrades };
    },

    // 升级部门等级
    upgradeDepartment(id) {
        this.ensureState();
        const info = this.getDepartmentInfo(id);
        if (!info) return false;

        if (info.isMax) {
            StarAbyss.UI.showToast('该部门已满级');
            return false;
        }
        if (StarAbyss.State.totalCores < info.nextCost) {
            if (StarAbyss.audio && StarAbyss.audio.playAlarm) StarAbyss.audio.playAlarm();
            StarAbyss.UI.showToast(`科技核心不足（需要 ${info.nextCost}）`);
            return false;
        }

        const S = StarAbyss.State;
        S.totalCores -= info.nextCost;
        S.ark.departments[id].level += 1;
        const newLevel = S.ark.departments[id].level;
        S.save();

        if (StarAbyss.audio && StarAbyss.audio.playClick) StarAbyss.audio.playClick();
        StarAbyss.UI.showToast(`${info.def.name} 升级至 Lv.${newLevel}`);

        if (StarAbyss.ArkUI && StarAbyss.ArkUI.render) StarAbyss.ArkUI.render();
        if (StarAbyss.ArkUI && StarAbyss.ArkUI.renderLoadout) StarAbyss.ArkUI.renderLoadout();
        if (StarAbyss.UI.updateMenuUI) StarAbyss.UI.updateMenuUI();
        return true;
    },

    // 升级部门下的某个节点
    upgradeNode(deptId, nodeId) {
        this.ensureState();
        const deptDef = StarAbyss.ArkData.DEPARTMENTS[deptId];
        if (!deptDef) return false;
        const nodeDef = (deptDef.upgrades || []).find(n => n.id === nodeId);
        if (!nodeDef) return false;

        const dept = StarAbyss.State.ark.departments[deptId];
        const currentLv = dept.nodes[nodeId] || 0;
        const maxLv = nodeDef.maxLevel || 1;
        if (currentLv >= maxLv) {
            StarAbyss.UI.showToast('该升级项已满级');
            return false;
        }

        const req = nodeDef.requires || {};
        if (req.deptLevel && dept.level < req.deptLevel) {
            StarAbyss.UI.showToast(`需要 ${deptDef.name} Lv.${req.deptLevel}`);
            return false;
        }
        if (req.nodes) {
            const ok = req.nodes.every(nid => (dept.nodes[nid] || 0) > 0);
            if (!ok) {
                StarAbyss.UI.showToast('前置升级项未完成');
                return false;
            }
        }

        const costArr = nodeDef.cost || [];
        const cost = costArr[currentLv] || 0;
        if (StarAbyss.State.totalCores < cost) {
            if (StarAbyss.audio && StarAbyss.audio.playAlarm) StarAbyss.audio.playAlarm();
            StarAbyss.UI.showToast(`科技核心不足（需要 ${cost}）`);
            return false;
        }

        StarAbyss.State.totalCores -= cost;
        dept.nodes[nodeId] = currentLv + 1;

        // 解锁卡牌
        if (nodeDef.unlocks && nodeDef.unlocks.cards) {
            nodeDef.unlocks.cards.forEach(cardId => {
                StarAbyss.State.ark.cards.unlocked[cardId] = true;
            });
        }

        StarAbyss.State.save();
        if (StarAbyss.audio && StarAbyss.audio.playClick) StarAbyss.audio.playClick();
        StarAbyss.UI.showToast(`${nodeDef.name} 升级至 Lv.${currentLv + 1}`);

        if (StarAbyss.ArkUI && StarAbyss.ArkUI.render) StarAbyss.ArkUI.render();
        if (StarAbyss.ArkUI && StarAbyss.ArkUI.renderLoadout) StarAbyss.ArkUI.renderLoadout();
        if (StarAbyss.UI.updateMenuUI) StarAbyss.UI.updateMenuUI();
        return true;
    },

    // ===== 卡牌与装载 =====
    getCard(cardId) {
        return StarAbyss.ArkData.CARDS[cardId] || null;
    },

    isCardUnlocked(cardId) {
        this.ensureState();
        const card = this.getCard(cardId);
        if (!card) return false;
        if (card.defaultUnlocked) return true;
        return !!StarAbyss.State.ark.cards.unlocked[cardId];
    },

    getLoadout() {
        this.ensureState();
        return StarAbyss.State.ark.cards.equipped.slice();
    },

    getUsedSlots() {
        const equipped = this.getLoadout();
        let used = 0;
        equipped.forEach(cardId => {
            const card = this.getCard(cardId);
            if (card) used += card.slotCost || 1;
        });
        return used;
    },

    getMaxSlots() {
        this.ensureState();
        const base = StarAbyss.ArkData.LOADOUT.baseSlots || 3;
        const bonuses = this.getBonuses();
        const bonus = (bonuses.loadoutSlot || 0) + (StarAbyss.State.ark.loadout.bonusSlots || 0);
        const max = StarAbyss.ArkData.LOADOUT.maxSlots || 8;
        return Math.min(max, base + bonus);
    },

    isEquipped(cardId) {
        return this.getLoadout().indexOf(cardId) >= 0;
    },

    canEquip(cardId) {
        this.ensureState();
        const card = this.getCard(cardId);
        if (!card) return false;
        if (!this.isCardUnlocked(cardId)) return false;
        if (!StarAbyss.ArkData.LOADOUT.allowDuplicate && this.isEquipped(cardId)) return false;

        const used = this.getUsedSlots();
        const max = this.getMaxSlots();
        return used + (card.slotCost || 1) <= max;
    },

    equipCard(cardId) {
        this.ensureState();
        if (!this.canEquip(cardId)) {
            if (StarAbyss.audio && StarAbyss.audio.playAlarm) StarAbyss.audio.playAlarm();
            StarAbyss.UI.showToast('无法携带：未解锁、已携带或卡槽不足');
            return false;
        }
        StarAbyss.State.ark.cards.equipped.push(cardId);
        StarAbyss.State.save();
        if (StarAbyss.audio && StarAbyss.audio.playClick) StarAbyss.audio.playClick();
        if (StarAbyss.ArkUI && StarAbyss.ArkUI.renderLoadout) StarAbyss.ArkUI.renderLoadout();
        return true;
    },

    unequipCard(cardId) {
        this.ensureState();
        const idx = StarAbyss.State.ark.cards.equipped.indexOf(cardId);
        if (idx < 0) return false;
        StarAbyss.State.ark.cards.equipped.splice(idx, 1);
        StarAbyss.State.save();
        if (StarAbyss.audio && StarAbyss.audio.playClick) StarAbyss.audio.playClick();
        if (StarAbyss.ArkUI && StarAbyss.ArkUI.renderLoadout) StarAbyss.ArkUI.renderLoadout();
        return true;
    },

    // 建造检查：buildKey 对应 Config.UNITS / BUILDINGS 的 key
    canBuild(buildKey) {
        this.ensureState();
        const D = StarAbyss.ArkData;
        let found = null;
        Object.keys(D.CARDS).forEach(cardId => {
            const card = D.CARDS[cardId];
            if ((card.type === 'unit' || card.type === 'building') && card.buildKey === buildKey) {
                found = card;
            }
        });

        // 没有对应卡牌的，默认允许（例如补给电站）
        if (!found) return true;

        if (!this.isCardUnlocked(found.id)) return false;
        return this.isEquipped(found.id);
    },

    // 技能检查
    canUseSkill(skillKey) {
        this.ensureState();
        const D = StarAbyss.ArkData;
        let found = null;
        Object.keys(D.CARDS).forEach(cardId => {
            const card = D.CARDS[cardId];
            if (card.type === 'skill' && card.skillKey === skillKey) {
                found = card;
            }
        });

        if (!found) return false;
        if (!this.isCardUnlocked(found.id)) return false;
        return this.isEquipped(found.id);
    },

    // 战役结算发放战利品
    grantBattleLoot(victory, campaign, extra = {}) {
        this.ensureState();

        const fallback = StarAbyss.ArkData.DEFAULT_LOOT[victory ? 'victory' : 'defeat'];
        const campaignLoot =
            (campaign && campaign.arkLoot && campaign.arkLoot[victory ? 'victory' : 'defeat']) || null;
        const base = campaignLoot || fallback;

        const gained = {
            alloy:  (base.alloy  || 0) + (extra.alloy  || 0),
            data:   (base.data   || 0) + (extra.data   || 0),
            supply: (base.supply || 0) + (extra.supply || 0)
        };

        const r = StarAbyss.State.ark.resources;
        r.alloy  += gained.alloy;
        r.data   += gained.data;
        r.supply += gained.supply;

        if (victory) StarAbyss.State.ark.stats.wins  += 1;
        else         StarAbyss.State.ark.stats.losses += 1;

        StarAbyss.State.save();
        return gained;
    }
};