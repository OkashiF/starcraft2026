// js/systems/script.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.ScriptSystem = class {
    constructor(scene) {
        this.scene = scene;
        this.fired = new Set();
    }

    reset() {
        this.fired.clear();
    }

    fire(event) {
        const S = StarAbyss.State;
        const campaign = StarAbyss.Campaigns[S.currentCampaignId];
        if (!campaign || !campaign.scripts) return;

        campaign.scripts.forEach((script, idx) => {
            const key = `${S.currentCampaignId}:${idx}`;
            if (this.fired.has(key)) return;
            if (!this._matches(script.trigger, event)) return;

            this.fired.add(key);
            if (script.dialogue) this._playDialogue(script.dialogue);
            if (script.action) this._runAction(script.action);
        });
    }

    _matches(trigger, event) {
        if (!trigger || !event) return false;
        if (trigger.type !== event.type) return false;

        switch (trigger.type) {
            case 'onWave':
                return trigger.wave === event.wave;
            case 'onNodeCaptured':
                return trigger.nodeType === event.nodeType;
            case 'onObjectiveComplete':
                return !trigger.objectiveId || trigger.objectiveId === event.objectiveId;
            case 'onTargetDestroyed':
                return !trigger.targetId || trigger.targetId === event.targetId;
            case 'onUnitEnterZone':
                if (trigger.zoneId && trigger.zoneId !== event.zoneId) return false;
                if (trigger.faction && trigger.faction !== event.faction) return false;
                return true;
            case 'onZoneCaptured':
                if (trigger.zoneId && trigger.zoneId !== event.zoneId) return false;
                if (trigger.owner && trigger.owner !== event.owner) return false;
                return true;
            case 'onTimer':
                return Math.abs((trigger.seconds || 0) - (event.elapsed || 0)) < 1;
            case 'onAllyEvent':
                return !trigger.event || trigger.event === event.event;
            default:
                return true;
        }
    }

    _playDialogue(id) {
        const d = StarAbyss.Dialogues[id];
        if (!d) return;
        StarAbyss.UI.showDialogue(d);
    }

    _runAction(action) {
        // 预留：可扩展为刷怪、提示、强制失败等
        if (action.type === 'toast') {
            StarAbyss.UI.showToast(action.text || '');
        } else if (action.type === 'gameOver') {
            StarAbyss.App.gameOver(!!action.victory, action.reason || '');
        }
    }
};