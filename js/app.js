// js/app.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.App = {
    phaserGame: null,
    scene: null,

    $: (id) => document.getElementById(id),

    initMenu() {
        const S = StarAbyss.State;
        S.inMenu = true;
        S.gameStarted = false;

        this.$('ui-layer').style.display = 'none';
        this.$('story-modal').style.display = 'none';
        this.$('dialogue-overlay').style.display = 'none';
        if (this.$('ark-panel')) this.$('ark-panel').style.display = 'none';
        this.$('main-menu').style.display = 'flex';

        StarAbyss.UI.updateMenuUI();
        StarAbyss.UI.renderMissionList((campaignId) => this.prepareMission(campaignId));
        if (StarAbyss.ArkUI && StarAbyss.ArkUI.renderLoadout) {
            StarAbyss.ArkUI.renderLoadout();
        }
    },

    openArk() {
        StarAbyss.audio.init();
        StarAbyss.audio.playClick();
        this.$('main-menu').style.display = 'none';
        this.$('ark-panel').style.display = 'flex';
        if (StarAbyss.ArkUI && StarAbyss.ArkUI.render) {
            StarAbyss.ArkUI.render();
        } else {
            StarAbyss.UI.renderArkPanel();
        }
    },

    closeArk() {
        StarAbyss.audio.playClick();
        this.$('ark-panel').style.display = 'none';
        this.$('main-menu').style.display = 'flex';
        StarAbyss.UI.updateMenuUI();
        if (StarAbyss.ArkUI && StarAbyss.ArkUI.renderLoadout) {
            StarAbyss.ArkUI.renderLoadout();
        }
    },

    prepareMission(campaignId) {
        const campaign = StarAbyss.Campaigns[campaignId];
        if (!campaign) return;
        if (!StarAbyss.UnlockSystem.isUnlocked(campaignId)) {
            StarAbyss.UI.showToast('该战役尚未解锁');
            return;
        }

        StarAbyss.audio.init();
        StarAbyss.audio.playClick();

        StarAbyss.State.resetSession(campaignId);
        StarAbyss.UI.updateUI();

        this.$('main-menu').style.display = 'none';

        const objHtml = (campaign.objectives || []).map((obj, i) => {
            const text = this._describeObjective(obj);
            return `${i + 1}. ${text}`;
        }).join('<br>');

        const failHtml = (campaign.failConditions || []).map(fc => {
            return `• ${fc.reason || fc.type}`;
        }).join('<br>');

        StarAbyss.UI.showStoryModal({
            title: `🛰️ ${campaign.name}`,
            stage: `【${campaign.subtitle}】`,
            html: `<strong>副官：</strong><br><br>${campaign.briefing}<br><br>
                <strong>任务目标：</strong><br>${objHtml}
                ${failHtml ? `<br><br><strong style="color:#ff6b6b;">失败条件：</strong><br>${failHtml}` : ''}`,
            buttonText: '收到，立即开始建立防线！(Enter)',
            onClick: () => this.startGame()
        });
    },

    startGame() {
        StarAbyss.audio.playClick();
        this.$('story-modal').style.display = 'none';
        this.$('ui-layer').style.display = 'flex';
        this.$('dialogue-overlay').style.display = 'none';

        const S = StarAbyss.State;
        S.isGameOver = false;
        S.gameStarted = true;
        S.inMenu = false;

        if (this.phaserGame.scene.isActive('MainScene')) {
            this.phaserGame.scene.stop('MainScene');
        }
        this.phaserGame.scene.start('MainScene');
    },

    buyUpgrade(type) {
        const map = {
            infantryHp: ['research', 'node_infantryHp'],
            mechAtk: ['research', 'node_mechAtk'],
            economy: ['research', 'node_economy']
        };
        const target = map[type];
        if (!target) return;
        StarAbyss.Ark.upgradeNode(target[0], target[1]);
    },

    triggerBuild(type) {
        const S = StarAbyss.State;
        if (!S.gameStarted || S.inMenu || S.isGameOver) return;

        if (StarAbyss.Ark && !StarAbyss.Ark.canBuild(type)) {
            StarAbyss.audio.playAlarm();
            StarAbyss.UI.showToast('该单位未解锁或未在战前装载中携带');
            return;
        }

        StarAbyss.audio.playClick();
        if (this.scene) this.scene.unitFactory.spawnFriendly(type);
    },

    selectBuildingToPlace(bType) {
        const S = StarAbyss.State;
        if (!S.gameStarted || S.inMenu || S.isGameOver) return;

        if (bType !== 'depot' && StarAbyss.Ark && !StarAbyss.Ark.canBuild(bType)) {
            StarAbyss.audio.playAlarm();
            StarAbyss.UI.showToast('该建筑未解锁或未在战前装载中携带');
            return;
        }

        StarAbyss.audio.playClick();
        S.placingBuildingType = bType;
        const names = {
            turret: '自动炮塔', depot: '补给电站',
            flame_turret: '火焰塔', sniper_turret: '狙击塔',
            repair_station: '维修站', radar_station: '雷达站', wall: '障碍墙'
        };
        StarAbyss.UI.showToast(`模式: 请在地图上点击放置 [${names[bType] || bType}]`);
    },

    useCommanderSkill(skill) {
        if (StarAbyss.Ark && !StarAbyss.Ark.canUseSkill(skill)) {
            StarAbyss.audio.playAlarm();
            StarAbyss.UI.showToast('该指挥官技能未解锁或未在战前装载中携带');
            return;
        }

        StarAbyss.audio.playClick();
        if (this.scene) this.scene.combat.activateCommanderSkill(skill);
    },

    gameOver(victory, failReason) {
        const S = StarAbyss.State;
        if (S.isGameOver) return;
        S.isGameOver = true;
        S.gameStarted = false;

        const campaign = S.getCurrentCampaign();
        const cores = S.techCores;

        S.commitCores();

        if (victory && campaign) {
            StarAbyss.UnlockSystem.markCompleted(campaign.id, 3);
        }

        const loot = StarAbyss.Ark.grantBattleLoot(victory, campaign);
        S.save();

        const title = victory ? '🏆 战役全面胜利！' : '💥 任务失败...';
        const stage = campaign ? `【${campaign.name}】` : '';

        const lootHtml = `
            <div class="loot-row">
                <span>🔬 科技核心 +${cores}</span>
                <span>⚙️ 合金 +${loot.alloy}</span>
                <span>📊 数据 +${loot.data}</span>
                ${loot.supply > 0 ? `<span>📦 补给 +${loot.supply}</span>` : ''}
            </div>
        `;

        let html;
        if (victory) {
            html = `<strong>副官：</strong> 报告指挥官！<br><br>${campaign ? campaign.victoryText : '我们守住了阵地。'}<br><br>
                战斗中回收了以下物资（已自动上传至方舟）：<br>${lootHtml}`;
        } else {
            const reason = failReason || '指挥中心结构完整度归零';
            html = `<strong>失败原因：</strong> ${reason}<br><br>${campaign ? campaign.defeatText : '但我们不会放弃。'}<br><br>
                逃生舱抢运出了以下物资带回方舟：<br>${lootHtml}`;
        }

        StarAbyss.UI.showStoryModal({
            title, stage, html,
            buttonText: '返回方舟指挥部',
            onClick: () => {
                this.initMenu();
                if (this.phaserGame.scene.isActive('MainScene')) {
                    this.phaserGame.scene.stop('MainScene');
                }
                this.phaserGame.scene.start('MainScene');
            }
        });
    },

    _describeObjective(obj) {
        switch (obj.type) {
            case 'survive_waves':     return `生存 ${obj.value} 波异虫进攻`;
            case 'survive_time':      return `坚守 ${obj.value} 秒`;
            case 'capture_all_nodes': return `占领全部据点`;
            case 'capture_node':      return `占领 ${obj.nodeType} 据点`;
            case 'hold_zone':         return `守住区域 ${obj.seconds} 秒`;
            case 'reach_zone':        return `抵达区域（${obj.count || 1} 单位）`;
            case 'extract_units':     return `撤离 ${obj.count || 1} 单位`;
            case 'protect_target':    return `保护 ${obj.label || obj.targetId}`;
            case 'destroy_target':    return `摧毁 ${obj.count || 1} 个 ${obj.label || obj.tag}`;
            case 'kill_count':        return `击杀 ${obj.count || 1} 个敌人`;
            case 'boss_kill':         return `击杀 Boss`;
            case 'composite':         return '完成复合目标';
        }
        return obj.type;
    }
};

window.gameApp = StarAbyss.App;

window.addEventListener('load', () => {
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#050811',
        physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
        scene: [StarAbyss.MainScene]
    };

    window.addEventListener('resize', () => {
        if (StarAbyss.App.phaserGame) {
            StarAbyss.App.phaserGame.scale.resize(window.innerWidth, window.innerHeight);
        }
    });

    StarAbyss.State.load();
    StarAbyss.Ark.ensureState();
    StarAbyss.App.initMenu();
    StarAbyss.App.phaserGame = new Phaser.Game(config);
});