// js/arkUI.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.ArkUI = {
    $: (id) => document.getElementById(id),

    // ===== 主菜单：战前装载 =====
    renderLoadout() {
        const panel = this.$('loadout-panel');
        if (!panel) return;

        if (!StarAbyss.Ark) return;
        StarAbyss.Ark.ensureState();

        const D = StarAbyss.ArkData;
        const used = StarAbyss.Ark.getUsedSlots();
        const max  = StarAbyss.Ark.getMaxSlots();
        const equipped = StarAbyss.Ark.getLoadout();

        // 已装备卡：每张卡渲染一个格子，格内角标显示它占用几格
        const slotHtml = [];
        let consumed = 0;
        equipped.forEach(cardId => {
            const card = D.CARDS[cardId];
            const sc = card ? (card.slotCost || 1) : 1;
            consumed += sc;
            slotHtml.push(`
                <div class="loadout-slot filled" title="点击卸下" onclick="StarAbyss.ArkUI.unequip('${cardId}')">
                    ${card ? card.name : cardId}
                    <span class="slot-cost">${sc}</span>
                </div>
            `);
        });

        // 剩余空槽：max - 已占用格数
        const emptyCount = Math.max(0, max - consumed);
        for (let i = 0; i < emptyCount; i++) {
            slotHtml.push(`<div class="loadout-slot">空槽</div>`);
        }

        // 卡牌库
        const cardList = Object.keys(D.CARDS).map(cardId => {
            const card = D.CARDS[cardId];
            const unlocked = StarAbyss.Ark.isCardUnlocked(cardId);
            const isEq     = StarAbyss.Ark.isEquipped(cardId);
            const typeName = card.type === 'unit' ? '单位'
                           : card.type === 'building' ? '建筑'
                           : '技能';
            const cls = `card-item ${isEq ? 'equipped' : ''} ${!unlocked ? 'locked' : ''}`;
            return `
                <div class="${cls}" onclick="StarAbyss.ArkUI.toggleCard('${cardId}')">
                    <div class="card-cost">${card.slotCost || 1}格</div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-type">${typeName}${unlocked ? '' : ' · 未解锁'}</div>
                    <div class="card-desc">${card.desc || ''}</div>
                </div>
            `;
        }).join('');

        panel.innerHTML = `
            <div style="font-size:12px;color:#88a0c0;margin-bottom:6px;">
                卡槽：${used}/${max} · 点击卡牌携带，点击已装备槽卸下
            </div>
            <div class="loadout-slots">${slotHtml.join('')}</div>
            <div class="card-library">${cardList}</div>
        `;

        if (StarAbyss.UI && StarAbyss.UI.updateMenuUI) {
            StarAbyss.UI.updateMenuUI();
        }
    },

    toggleCard(cardId) {
        if (StarAbyss.Ark.isEquipped(cardId)) {
            StarAbyss.Ark.unequipCard(cardId);
        } else {
            StarAbyss.Ark.equipCard(cardId);
        }
        this.renderLoadout();
    },

    unequip(cardId) {
        StarAbyss.Ark.unequipCard(cardId);
        this.renderLoadout();
    },

    // ===== 方舟母舰面板 =====
    render() {
        const body = this.$('ark-body');
        if (!body) return;

        if (!StarAbyss.Ark) return;
        StarAbyss.Ark.ensureState();

        const S = StarAbyss.State;
        const D = StarAbyss.ArkData;

        const coresEl = this.$('ark-cores');
        const alloyEl = this.$('ark-alloy');
        const dataEl = this.$('ark-data');
        const supplyEl = this.$('ark-supply');
        if (coresEl) coresEl.textContent = S.totalCores;
        if (alloyEl) alloyEl.textContent = S.ark.resources.alloy;
        if (dataEl) dataEl.textContent = S.ark.resources.data;
        if (supplyEl) supplyEl.textContent = S.ark.resources.supply;

        const deptIds = Object.keys(D.DEPARTMENTS);
        const cards = deptIds.map(deptId => {
            const info = StarAbyss.Ark.getDepartmentInfo(deptId);
            if (!info) return '';
            const def = info.def;

            const nodeHtml = (info.upgrades || []).map(nodeInfo => {
                const n = nodeInfo.def;
                const reqText = [];
                if (n.requires && n.requires.deptLevel) reqText.push(`需要部门 Lv.${n.requires.deptLevel}`);
                if (n.requires && n.requires.nodes) reqText.push('需要前置节点');

                const btnText = nodeInfo.isMax
                    ? '已满级'
                    : `升级 (${nodeInfo.nextCost} 核心)`;

                const disabled = !nodeInfo.canUpgrade ? 'disabled' : '';
                const lockedCls = !nodeInfo.reqDeptOk || !nodeInfo.reqNodesOk ? 'locked' : '';

                return `
                    <div class="upgrade-node ${lockedCls}">
                        <div class="upgrade-node-info">
                            <div class="upgrade-node-name">${n.name} <span style="color:var(--accent);font-size:11px;">Lv.${nodeInfo.level}/${n.maxLevel || 1}</span></div>
                            <div class="upgrade-node-desc">${n.desc || ''} ${reqText.join(' · ')}</div>
                        </div>
                        <button class="upgrade-node-btn" ${disabled}
                            onclick="StarAbyss.ArkUI.upgradeNode('${deptId}','${n.id}')">
                            ${btnText}
                        </button>
                    </div>
                `;
            }).join('');

            const deptBtnText = info.isMax
                ? '部门已满级'
                : `部门升级 (${info.nextCost} 核心)`;
            const deptBtnDisabled = info.isMax || !info.canAfford ? 'disabled' : '';

            return `
                <div class="dept-card ${info.isMax ? 'maxed' : ''}">
                    <div class="dept-header">
                        <div class="dept-name">${def.icon} ${def.name}
                            <span class="dept-level">Lv.${info.level}/${def.maxLevel}</span>
                        </div>
                    </div>
                    <div class="dept-desc">${def.desc}</div>
                    <div class="dept-upgrades">${nodeHtml || '<div style="font-size:12px;color:#556;">暂无独立升级项</div>'}</div>
                    <button class="dept-upgrade-btn" ${deptBtnDisabled}
                        onclick="StarAbyss.ArkUI.upgradeDepartment('${deptId}')">
                        ${deptBtnText}
                    </button>
                </div>
            `;
        }).join('');

        body.innerHTML = `<div class="ark-dept-list">${cards}</div>`;
    },

    upgradeDepartment(deptId) {
        StarAbyss.Ark.upgradeDepartment(deptId);
        this.render();
    },

    upgradeNode(deptId, nodeId) {
        StarAbyss.Ark.upgradeNode(deptId, nodeId);
        this.render();
    }
};