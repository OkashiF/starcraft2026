// js/systems/unlock.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.UnlockSystem = {
    isUnlocked(campaignId) {
        const campaign = StarAbyss.Campaigns ? StarAbyss.Campaigns[campaignId] : null;
        if (!campaign) return false;
        const unlock = campaign.unlock;
        if (!unlock || unlock.type === 'default') return true;
        if (unlock.type === 'campaign') {
            const progressMap = StarAbyss.State.campaignProgress || {};
            const p = progressMap[unlock.requires];
            return !!(p && p.completed);
        }
        return false;
    },

    getLockReason(campaignId) {
        const campaign = StarAbyss.Campaigns ? StarAbyss.Campaigns[campaignId] : null;
        if (!campaign) return '';
        const unlock = campaign.unlock;
        if (!unlock || unlock.type === 'default') return '';
        if (unlock.type === 'campaign') {
            const req = StarAbyss.Campaigns ? StarAbyss.Campaigns[unlock.requires] : null;
            return `需先完成「${req ? req.name : unlock.requires}」`;
        }
        return '未解锁';
    },

    ensureProgress(campaignId) {
        if (!StarAbyss.State.campaignProgress) {
            StarAbyss.State.campaignProgress = {};
        }
        const p = StarAbyss.State.campaignProgress;
        if (!p[campaignId]) {
            p[campaignId] = { completed: false, bestStars: 0, coresEarned: 0 };
        }
        return p[campaignId];
    },

    markCompleted(campaignId, stars) {
        const entry = this.ensureProgress(campaignId);
        entry.completed = true;
        entry.bestStars = Math.max(entry.bestStars, stars);
    },

    addCores(campaignId, cores) {
        const entry = this.ensureProgress(campaignId);
        entry.coresEarned += cores;
    },

    listCampaigns() {
        return StarAbyss.Campaigns ? Object.values(StarAbyss.Campaigns) : [];
    },
};