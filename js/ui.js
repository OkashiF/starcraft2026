// js/ui.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.UI = {
    $: (id) => document.getElementById(id),

    // 指挥官技能快捷键映射（顶部技能栏）
    SKILL_HOTKEYS: {
        orbital: 'R',
        repair: 'T',
        airdrop: 'Y',
        shield_field: 'U',
        scan: 'I',
        nano_repair: 'O',
        minefield: 'P',
        emp: 'G',
    },

    updateUI() {
        const S = StarAbyss.State;
        const C = StarAbyss.Config;

        this.$('res-minerals').innerText = Math.floor(S.minerals);
        this.$('res-gas').innerText = Math.floor(S.gas);
        this.$('res-supply').innerText = `${S.usedSupply}/${S.maxSupply}`;
        this.$('res-cores').innerText = S.techCores;
        this.$('wave-timer').innerText = S.waveTimer + 's';

        const canBuild = (key) => {
            if (StarAbyss.Ark && StarAbyss.Ark.canBuild) {
                return StarAbyss.Ark.canBuild(key);
            }
            return true;
        };

        const U = C.UNITS;
        const B = C.BUILDINGS;

        // ===== 单位按钮：未解锁 / 未携带 → 隐藏；已解锁 → 按资源/人口禁用 =====
        const refreshUnitBtn = (btnId, unitKey) => {
            const btn = this.$(btnId);
            if (!btn) return;
            const u = U[unitKey];
            if (!u) { btn.style.display = 'none'; return; }

            if (!canBuild(unitKey)) {
                btn.style.display = 'none';
                return;
            }
            btn.style.display = '';
            btn.disabled = S.minerals < u.cost.minerals
                || S.gas < u.cost.gas
                || S.usedSupply + u.supply > S.maxSupply;
        };
        refreshUnitBtn('btn-build-marine', 'marine');
        refreshUnitBtn('btn-build-firebat', 'firebat');
        refreshUnitBtn('btn-build-ghost', 'ghost');
        refreshUnitBtn('btn-build-tank', 'tank');
        refreshUnitBtn('btn-build-rocketeer', 'rocketeer');
        refreshUnitBtn('btn-build-medic', 'medic');
        refreshUnitBtn('btn-build-engineer', 'engineer');
        refreshUnitBtn('btn-build-drone', 'drone');
        refreshUnitBtn('btn-build-shieldman', 'shieldman');
        refreshUnitBtn('btn-build-sniper', 'sniper');

        // ===== 建筑按钮：无卡牌（如 depot）永远显示；有卡牌则按解锁/携带 =====
        const refreshBuildingBtn = (btnId, bKey, costOverride) => {
            const btn = this.$(btnId);
            if (!btn) return;
            const def = B[bKey];
            const cost = costOverride || (def && def.cost) || { minerals: 0, gas: 0 };

            // depot 没有卡牌，canBuild 返回 true
            if (!canBuild(bKey)) {
                btn.style.display = 'none';
                return;
            }
            btn.style.display = '';
            btn.disabled = S.minerals < (cost.minerals || 0) || S.gas < (cost.gas || 0);
        };
        refreshBuildingBtn('btn-build-turret', 'turret');
        refreshBuildingBtn('btn-build-depot', 'depot');
        refreshBuildingBtn('btn-build-flame_turret', 'flame_turret');
        refreshBuildingBtn('btn-build-sniper_turret', 'sniper_turret');
        refreshBuildingBtn('btn-build-repair_station', 'repair_station');
        refreshBuildingBtn('btn-build-radar_station', 'radar_station');
        refreshBuildingBtn('btn-build-wall', 'wall');

        // ===== 顶部指挥官技能栏 =====
        this.renderTopSkillBar();

        // ===== 目标面板 =====
        this.renderObjectivesPanel();
    },

    // ===== 顶部指挥官技能栏 =====
    // 仅显示已解锁且已在战前装载中携带的技能卡
    renderTopSkillBar() {
        const bar = this.$('top-skill-bar');
        if (!bar) return;

        if (!StarAbyss.Ark || !StarAbyss.ArkData) {
            bar.innerHTML = '';
            return;
        }
        StarAbyss.Ark.ensureState();

        const S = StarAbyss.State;
        const D = StarAbyss.ArkData;
        const SK = StarAbyss.Config.SKILLS;
        const equipped = StarAbyss.Ark.getLoadout();

        // 收集携带的技能卡
        const equippedSkills = [];
        equipped.forEach(cardId => {
            const card = D.CARDS[cardId];
            if (!card || card.type !== 'skill') return;
            if (!StarAbyss.Ark.isCardUnlocked(cardId)) return;
            equippedSkills.push(card);
        });

        if (equippedSkills.length === 0) {
            bar.innerHTML = '';
            bar.style.display = 'none';
            return;
        }
        bar.style.display = 'flex';

        const html = equippedSkills.map(card => {
            const skillKey = card.skillKey;
            const cfg = SK[skillKey];
            if (!cfg) return '';
            const canAfford = S.minerals >= cfg.cost;
            const disabled = canAfford ? '' : 'disabled';
            const hotkey = this.SKILL_HOTKEYS[skillKey] || '';
            return `
                <button class="top-skill-btn" ${disabled}
                    title="${card.name} · ${card.desc || ''} （消耗 ${cfg.cost} 💎）"
                    onclick="gameApp.useCommanderSkill('${skillKey}')">
                    <span class="top-skill-hotkey">${hotkey}</span>
                    <span class="top-skill-name">${card.name}</span>
                    <span class="top-skill-cost">${cfg.cost}💎</span>
                </button>
            `;
        }).join('');

        bar.innerHTML = html;
    },

    renderObjectivesPanel() {
        const S = StarAbyss.State;
        const campaign = S.getCurrentCampaign && S.getCurrentCampaign();
        const panel = this.$('objectives-panel');
        if (!panel) return;
        if (!campaign || !S.gameStarted) {
            panel.innerHTML = '';
            return;
        }

        const scene = StarAbyss.App.scene;
        const objSys = scene && scene.objectiveSystem;

        const objectives = (objSys && objSys.describeObjectives)
            ? objSys.describeObjectives(campaign)
            : (campaign.objectives || []).map(o => o.type);
        const fails = (objSys && objSys.describeFailConditions)
            ? objSys.describeFailConditions(campaign)
            : [];

        let html = '<div class="obj-title">🎯 任务目标</div>';
        html += objectives.map(t => `<div class="obj-row">• ${t}</div>`).join('');

        if (fails.length) {
            html += '<div class="obj-title fail">⚠️ 失败条件</div>';
            html += fails.map(t => `<div class="obj-row fail">• ${t}</div>`).join('');
        }
        panel.innerHTML = html;
    },

    updateMenuUI() {
        const S = StarAbyss.State;

        const coresEl = this.$('menu-total-cores');
        if (coresEl) coresEl.innerText = S.totalCores;

        ['infantryHp', 'mechAtk', 'economy'].forEach(type => {
            const lvText = this.$('lv-upg-' + type);
            const btn = this.$('btn-upg-' + type);
            if (!lvText && !btn) return;

            const level = S.upgrades[type] || 0;
            const cost = level < 3 ? StarAbyss.Config.UPGRADE_COSTS[level] : 'MAX';

            if (lvText) lvText.innerText = `Lv.${level}/3`;

            if (btn) {
                if (level >= 3) {
                    btn.innerText = '已满级';
                    btn.disabled = true;
                } else {
                    btn.innerText = `升级 (${cost} 核心)`;
                    btn.disabled = S.totalCores < cost;
                }
            }
        });
    },

    renderArkPanel() {
        if (StarAbyss.ArkUI && StarAbyss.ArkUI.render) {
            StarAbyss.ArkUI.render();
        }
    },

    renderMissionList(onSelect) {
        const list = this.$('mission-list');
        if (!list) return;
        list.innerHTML = '';

        const campaigns = StarAbyss.UnlockSystem.listCampaigns();
        campaigns.forEach(c => {
            const unlocked = StarAbyss.UnlockSystem.isUnlocked(c.id);
            const progress = (StarAbyss.State.campaignProgress && StarAbyss.State.campaignProgress[c.id]) || {};
            const stars = progress.bestStars || 0;

            const card = document.createElement('div');
            card.className = 'mission-card' + (unlocked ? '' : ' locked');

            const starsText = '★'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars));

            card.innerHTML = `
                <div>
                    <h3 style="color: var(--primary); font-size: 18px; margin: 0;">${c.name}</h3>
                    <div style="font-size: 12px; color: #88a0c0; margin-top: 2px;">${c.subtitle}</div>
                    <p style="font-size: 13px; color: #d0e0f0; line-height: 1.5; margin: 10px 0 0 0;">${c.briefing}</p>
                    <div style="font-size: 12px; color: var(--accent); margin-top: 8px;">
                        ${unlocked
                            ? `完成度: ${starsText}`
                            : `🔒 ${StarAbyss.UnlockSystem.getLockReason(c.id)}`}
                    </div>
                </div>
                <button class="start-btn" ${unlocked ? '' : 'disabled'}>
                    ${unlocked ? '空降部署 (LAUNCH)' : '未解锁'}
                </button>
            `;

            if (unlocked) {
                card.querySelector('.start-btn').onclick = () => onSelect(c.id);
            }

            list.appendChild(card);
        });
    },

    updateSelectionCard(scene) {
        const titleEl = this.$('unit-title');
        const starsEl = this.$('unit-stars');
        const hpFill = this.$('hp-fill');
        const hpText = this.$('hp-text');
        const iconEl = this.$('unit-icon');

        const U = StarAbyss.Config.UNITS;

        if (scene.selectedUnits.length > 0) {
            const u = scene.selectedUnits[0];
            const def = U[u.uType];
            titleEl.innerText = `${def.name} (${scene.selectedUnits.length}个单位)`;
            starsEl.innerText = u.rank === 2 ? '★★ 精锐' : (u.rank === 1 ? '★ 老兵' : '新兵');
            const hpPct = Math.max(0, (u.hp / u.maxHp) * 100);
            hpFill.style.width = hpPct + '%';
            hpText.innerText = `HP: ${Math.floor(u.hp)} / ${u.maxHp}`;
            iconEl.innerText = def.portrait;
        } else if (scene.commandCenter) {
            titleEl.innerText = '方舟指挥中心';
            starsEl.innerText = '★★★';
            const hpPct = Math.max(0, (scene.commandCenter.hp / scene.commandCenter.maxHp) * 100);
            hpFill.style.width = hpPct + '%';
            hpText.innerText = `HP: ${Math.floor(scene.commandCenter.hp)} / ${scene.commandCenter.maxHp}`;
            iconEl.innerText = '🏛️';
        }

        this._renderUnitSkills(scene);
    },

    _renderUnitSkills(scene) {
        const bar = this.$('unit-skills');
        if (!bar) return;
        bar.innerHTML = '';
        if (!scene || !scene.selectedUnits || scene.selectedUnits.length === 0) return;

        // ===== 坦克架设 =====
        const allTanks = scene.selectedUnits.every(u => u.uType === 'tank');
        if (allTanks) {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.style.width = 'auto';
            btn.style.padding = '6px 12px';
            btn.style.flexDirection = 'row';
            btn.style.gap = '8px';
            btn.innerHTML = `<span style="color:var(--accent);font-weight:bold;">E</span> 切换架设模式`;
            btn.onclick = () => scene.combat.toggleSiegeMode();
            bar.appendChild(btn);
        }

        // ===== 单位主动技能（取选中单位中第一个拥有技能的） =====
        const withAbility = scene.selectedUnits.find(u => u.ability);
        if (withAbility) {
            const ab = withAbility.ability;
            const now = scene.time.now;
            const ready = now >= (ab.readyAt || 0);
            const cdLeft = Math.max(0, Math.ceil(((ab.readyAt || 0) - now) / 1000));

            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.style.width = 'auto';
            btn.style.padding = '6px 12px';
            btn.style.flexDirection = 'row';
            btn.style.gap = '8px';
            btn.disabled = !ready;
            btn.innerHTML = ready
                ? `<span style="color:var(--accent);font-weight:bold;">Z</span> ${ab.name}`
                : `${ab.name} (${cdLeft}s)`;
            btn.onclick = () => scene.combat.activateUnitAbility();
            bar.appendChild(btn);
        }
    },

    showToast(msg) {
        const container = this.$('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.innerText = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    flashDamage() {
        const overlay = this.$('damage-overlay');
        if (!overlay) return;
        overlay.style.opacity = '1';
        setTimeout(() => overlay.style.opacity = '0', 250);
        StarAbyss.audio.playAlarm();
    },

    showDialogue(dialogue, durationMs = 6000) {
        const overlay = this.$('dialogue-overlay');
        const speakerEl = this.$('dialogue-speaker');
        const textEl = this.$('dialogue-text');

        speakerEl.innerText = dialogue.speaker || '副官';
        textEl.innerHTML = dialogue.text || '';
        overlay.style.display = 'block';

        if (this._dialogueTimer) clearTimeout(this._dialogueTimer);
        this._dialogueTimer = setTimeout(() => {
            overlay.style.display = 'none';
        }, durationMs);
    },

    showStoryModal({ title, stage, html, buttonText, onClick }) {
        const modal = this.$('story-modal');
        const titleEl = this.$('story-title');
        const stageEl = this.$('story-stage');
        const content = this.$('dialog-text');
        const btn = this.$('story-action');

        titleEl.innerHTML = title;
        stageEl.innerText = stage || '';
        content.innerHTML = html;
        btn.innerText = buttonText;
        btn.onclick = onClick;

        modal.style.display = 'flex';
    },

    hideStoryModal() { this.$('story-modal').style.display = 'none'; },
};