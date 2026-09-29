// js/ui.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.UI = {
    $: (id) => document.getElementById(id),

    updateUI() {
        const S = StarAbyss.State;
        const C = StarAbyss.Config;

        this.$('res-minerals').innerText = Math.floor(S.minerals);
        this.$('res-gas').innerText = Math.floor(S.gas);
        this.$('res-supply').innerText = `${S.usedSupply}/${S.maxSupply}`;
        this.$('res-cores').innerText = S.techCores;
        this.$('wave-timer').innerText = S.waveTimer + 's';

        // 是否已解锁且已携带
        const canBuild = (key) => {
            if (StarAbyss.Ark && StarAbyss.Ark.canBuild) {
                return StarAbyss.Ark.canBuild(key);
            }
            return true;
        };
        const canSkill = (key) => {
            if (StarAbyss.Ark && StarAbyss.Ark.canUseSkill) {
                return StarAbyss.Ark.canUseSkill(key);
            }
            return true;
        };

        const U = C.UNITS;
        this.$('btn-build-marine').disabled  = !canBuild('marine')  || S.minerals < U.marine.cost.minerals || S.usedSupply >= S.maxSupply;
        this.$('btn-build-firebat').disabled = !canBuild('firebat') || S.minerals < U.firebat.cost.minerals || S.gas < U.firebat.cost.gas || S.usedSupply + U.firebat.supply > S.maxSupply;
        this.$('btn-build-ghost').disabled   = !canBuild('ghost')   || S.minerals < U.ghost.cost.minerals   || S.gas < U.ghost.cost.gas   || S.usedSupply + U.ghost.supply > S.maxSupply;
        this.$('btn-build-tank').disabled    = !canBuild('tank')    || S.minerals < U.tank.cost.minerals    || S.gas < U.tank.cost.gas    || S.usedSupply + U.tank.supply > S.maxSupply;

        const B = C.BUILDINGS;
        this.$('btn-build-turret').disabled = !canBuild('turret') || S.minerals < B.turret.cost.minerals || S.gas < B.turret.cost.gas;
        this.$('btn-build-depot').disabled  = S.minerals < B.depot.cost.minerals;

        this.$('btn-skill-orbital').disabled = !canSkill('orbital') || S.minerals < C.SKILLS.orbital.cost;
        this.$('btn-skill-repair').disabled  = !canSkill('repair')  || S.minerals < C.SKILLS.repair.cost;

        // 目标面板
        this.renderObjectivesPanel();
    },

    // ===== 目标 / 失败条件面板 =====
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
        const failSys = scene && scene.objectiveSystem;

        const objectives = (objSys && objSys.describeObjectives)
            ? objSys.describeObjectives(campaign)
            : (campaign.objectives || []).map(o => o.type);
        const fails = (failSys && failSys.describeFailConditions)
            ? failSys.describeFailConditions(campaign)
            : [];

        let html = '<div class="obj-title">🎯 任务目标</div>';
        html += objectives.map(t => `<div class="obj-row">• ${t}</div>`).join('');

        if (fails.length) {
            html += '<div class="obj-title fail">⚠️ 失败条件</div>';
            html += fails.map(t => `<div class="obj-row fail">• ${t}</div>`).join('');
        }
        panel.innerHTML = html;
    },

    // 主菜单资源与旧科技按钮刷新
    // 注意：HTML 里已删除旧三项科技节点，这里做空值保护
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

    // 方舟面板渲染：转发到 ArkUI（新方舟系统）
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
        bar.innerHTML = '';
        if (scene.selectedUnits.length === 0) return;

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