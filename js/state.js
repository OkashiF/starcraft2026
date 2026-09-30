// js/state.js
window.StarAbyss = window.StarAbyss || {};

const SAVE_KEY = 'star_abyss_save';

StarAbyss.State = {
    // 持久化
    totalCores: 0,
    upgrades: { infantryHp: 0, mechAtk: 0, economy: 0 },
    campaignProgress: {},

    // 方舟持久化数据
    ark: {
        resources: { alloy: 0, data: 0, supply: 0 },
        departments: {},
        inventory: [],
        stats: { wins: 0, losses: 0 },
        cards: { unlocked: {}, equipped: [] },
        loadout: { bonusSlots: 0 }
    },

    // 单局
    currentCampaignId: null,
    minerals: 0,
    gas: 0,
    usedSupply: 0,
    maxSupply: 20,
    techCores: 0,
    wave: 1,
    waveTimer: 45,
    maxWaves: 5,
    isGameOver: false,
    gameStarted: false,
    inMenu: true,
    placingBuildingType: null,

    // 单局计时与统计
    battleElapsed: 0,
    unitsLost: 0,
    killsByType: {},
    killsByTag: {},

    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return;
            const p = JSON.parse(raw);

            this.totalCores = p.totalCores || 0;
            this.upgrades = Object.assign(
                { infantryHp: 0, mechAtk: 0, economy: 0 },
                p.upgrades || {}
            );
            this.campaignProgress = p.campaignProgress || {};

            if (p.ark) {
                this.ark = {
                    resources: Object.assign(
                        { alloy: 0, data: 0, supply: 0 },
                        p.ark.resources || {}
                    ),
                    departments: p.ark.departments || {},
                    inventory: p.ark.inventory || [],
                    stats: Object.assign({ wins: 0, losses: 0 }, p.ark.stats || {}),
                    cards: Object.assign(
                        { unlocked: {}, equipped: [] },
                        p.ark.cards || {}
                    ),
                    loadout: Object.assign(
                        { bonusSlots: 0 },
                        p.ark.loadout || {}
                    )
                };
            }
        } catch (e) {
            console.warn('Load save failed:', e);
        }
    },

    save() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({
                totalCores: this.totalCores,
                upgrades: this.upgrades,
                campaignProgress: this.campaignProgress,
                ark: this.ark
            }));
        } catch (e) {
            console.warn('Save failed:', e);
        }
    },
    addCores(amount = 1000) {
        const n = Number(amount);
        if (!Number.isFinite(n)) return this.totalCores;

        this.totalCores += n;
        this.save();

        if (StarAbyss.UI && StarAbyss.UI.updateMenuUI) {
            StarAbyss.UI.updateMenuUI();
        }

        console.log('[cheat] 当前核心：', this.totalCores);
        return this.totalCores;
    },

    resetSession(campaignId) {
        const campaign = StarAbyss.Campaigns[campaignId];
        if (!campaign) {
            console.warn('Unknown campaignId:', campaignId);
            return;
        }

        const eco = this.upgrades.economy;
        const arkBonuses = (StarAbyss.Ark && StarAbyss.Ark.getBonuses)
            ? StarAbyss.Ark.getBonuses()
            : {};

        this.currentCampaignId = campaignId;
        this.minerals = campaign.start.minerals + eco * 100 + (arkBonuses.startMinerals || 0);
        this.gas = campaign.start.gas + eco * 50 + (arkBonuses.startGas || 0);
        this.maxSupply = campaign.start.maxSupply;
        this.usedSupply = 0;
        this.techCores = 0;
        this.wave = 1;
        this.waveTimer = campaign.start.waveTimer;
        this.maxWaves = campaign.waves.length;
        this.isGameOver = false;
        this.gameStarted = false;
        this.inMenu = false;
        this.placingBuildingType = null;

        this.battleElapsed = 0;
        this.unitsLost = 0;
        this.killsByType = {};
        this.killsByTag = {};
    },

    getCurrentCampaign() {
        return StarAbyss.Campaigns[this.currentCampaignId] || null;
    },

    commitCores() {
        this.totalCores += this.techCores;
        if (this.currentCampaignId) {
            StarAbyss.UnlockSystem.addCores(this.currentCampaignId, this.techCores);
        }
        this.save();
    },

    recordKill(enemyType, tags) {
        this.killsByType[enemyType] = (this.killsByType[enemyType] || 0) + 1;
        if (tags && tags.length) {
            tags.forEach(t => {
                this.killsByTag[t] = (this.killsByTag[t] || 0) + 1;
            });
        }
    },

    recordLoss() {
        this.unitsLost += 1;
    }
};