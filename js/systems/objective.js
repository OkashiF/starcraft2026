// js/systems/objective.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.ObjectiveSystem = class {
    constructor(scene) {
        this.scene = scene;
        this.failed = false;
        this.failReason = '';
        this.completedObjectives = new Set();
    }

    reset() {
        this.failed = false;
        this.failReason = '';
        this.completedObjectives.clear();
    }

    update(_time, _delta) {
        const S = StarAbyss.State;
        if (!S.gameStarted || S.isGameOver) return;

        const campaign = StarAbyss.Campaigns[S.currentCampaignId];
        if (!campaign) return;

        // 1. 失败条件优先
        const failCfg = campaign.failConditions || [];
        for (const fc of failCfg) {
            if (this._checkFail(fc)) {
                this.failed = true;
                this.failReason = fc.reason || this._defaultFailReason(fc);
                StarAbyss.App.gameOver(false, this.failReason);
                return;
            }
        }

        // 2. 目标判定
        const objectives = this._getActiveObjectives(campaign);
        if (objectives.length === 0) return;

        // 触发单目标完成事件
        objectives.forEach(obj => {
            const key = obj.id || obj.type;
            if (this.completedObjectives.has(key)) return;
            if (this._isDone(obj)) {
                this.completedObjectives.add(key);
                this.scene.scriptSystem.fire({ type: 'onObjectiveComplete', objectiveId: key });
                StarAbyss.UI.showToast(`✅ 目标完成：${this._describe(obj)}`);
            }
        });

        const allDone = objectives.every(obj => this._isDone(obj));
        if (allDone) {
            StarAbyss.App.gameOver(true);
        }
    }

    _getActiveObjectives(campaign) {
        if (campaign.phases && campaign.phases.length > 0) {
            for (const phase of campaign.phases) {
                const objs = phase.objectives || [];
                if (!objs.every(o => this._isDone(o))) return objs;
            }
            return [];
        }
        return campaign.objectives || [];
    }

    _isDone(obj) {
        const S = StarAbyss.State;
        const scene = this.scene;

        switch (obj.type) {
            case 'survive_waves':
                return S.wave > obj.value;

            case 'survive_time':
                return S.battleElapsed >= obj.value;

            case 'capture_all_nodes': {
                const nodes = scene.captureNodes.getChildren();
                return nodes.length > 0 && nodes.every(n => n.owner === 'player');
            }

            case 'capture_node': {
                const nodes = scene.captureNodes.getChildren().filter(n => n.nodeType === obj.nodeType);
                return nodes.length > 0 && nodes.every(n => n.owner === 'player');
            }

            case 'hold_zone': {
                const z = scene.zoneSystem && scene.zoneSystem.getZone(obj.zoneId);
                if (!z) return false;
                return z.owner === 'player' && z.holdTime >= obj.seconds;
            }

            case 'reach_zone': {
    const z = scene.zoneSystem && scene.zoneSystem.getZone(obj.zoneId);
    if (!z) return false;
    let count = 0;

    if (obj.unitTag === 'convoy') {
        // 只统计运输车
        if (scene.convoyUnits) {
            scene.convoyUnits.getChildren().forEach(c => {
                if (c.active && c.hp > 0 && scene.zoneSystem._insideZone(z, c.x, c.y)) count++;
            });
        }
    } else {
        // 默认统计玩家单位
        scene.friendlyUnits.getChildren().forEach(u => {
            if (scene.zoneSystem._insideZone(z, u.x, u.y)) count++;
        });
    }
    return count >= (obj.count || 1);
}

            case 'extract_units': {
                const z = scene.zoneSystem && scene.zoneSystem.getZone(obj.zoneId);
                if (!z) return false;
                let count = 0;
                scene.friendlyUnits.getChildren().forEach(u => {
                    if (scene.zoneSystem._insideZone(z, u.x, u.y)) count++;
                });
                return count >= (obj.count || 1);
            }

            case 'protect_target': {
    		const t = this._findTarget(obj.targetId);
   		 if (!t || !t.active || t.hp <= 0) return false;
    		// 若关联另一目标完成，则本目标才完成（避免秒胜）
    		if (obj.untilObjective) {
        		const linked = this._findObjective(obj.untilObjective);
        		return linked && this._isDone(linked);
    		}
    		// 无关联则需指定持续时间
		if (obj.seconds) return t.protectTime >= obj.seconds;
    		return false;
	}

            case 'destroy_target': {
                return this._countKillsByTag(obj.tag) >= (obj.count || 1);
            }

            case 'kill_count': {
                return this._countKillsByType(obj.enemyType) >= (obj.count || 1);
            }

            case 'boss_kill': {
                return this._countKillsByType(obj.bossId) >= 1;
            }

            case 'composite': {
                const mode = obj.mode || 'all';
                const results = (obj.objectives || []).map(o => this._isDone(o));
                if (mode === 'all') return results.every(r => r);
                if (mode === 'any') return results.some(r => r);
                return false;
            }
        }
        return false;
    }

    _checkFail(fc) {
        const S = StarAbyss.State;
        const scene = this.scene;

        switch (fc.type) {
            case 'base_destroyed':
                return !scene.commandCenter || !scene.commandCenter.active || scene.commandCenter.hp <= 0;

            case 'target_destroyed':
            case 'target_dead': {
                const targetId = fc.params && fc.params.targetId;
                if (targetId === 'convoy_all') {
                    if (!scene.convoyUnits) return false;
                    const alive = scene.convoyUnits.getChildren().filter(c => c.active && c.hp > 0);
                    return alive.length === 0;
                }
                const t = this._findTarget(targetId);
                return !t || !t.active || t.hp <= 0;
            }

            case 'timeout': {
                const seconds = (fc.params && fc.params.seconds) || 600;
                return S.battleElapsed >= seconds;
            }

            case 'friendly_loss_limit':
                return S.unitsLost >= (fc.max || 10);

            case 'ally_all_dead': {
                const allies = scene.allyUnits ? scene.allyUnits.getChildren() : [];
                return allies.length === 0;
            }

            case 'zone_lost': {
                const z = scene.zoneSystem && scene.zoneSystem.getZone(fc.params.zoneId);
                if (!z) return false;
                return z.owner === 'enemy';
            }
        }
        return false;
    }

    _findTarget(targetId) {
        const scene = this.scene;
        let found = null;
        scene.friendlyBuildings.getChildren().forEach(b => {
            if (b.targetId === targetId) found = b;
        });
        if (found) return found;
        scene.friendlyUnits.getChildren().forEach(u => {
            if (u.targetId === targetId) found = u;
        });
        return found;
    }

    _countKillsByTag(tag) {
        return (StarAbyss.State.killsByTag || {})[tag] || 0;
    }

    _countKillsByType(type) {
        return (StarAbyss.State.killsByType || {})[type] || 0;
    }

    _defaultFailReason(fc) {
        const map = {
            base_destroyed: '指挥中心被摧毁',
            target_destroyed: '保护目标被摧毁',
            target_dead: '保护单位阵亡',
            timeout: '任务超时',
            friendly_loss_limit: '部队损失超过上限',
            ally_all_dead: '友军全灭',
            zone_lost: '关键区域失守',
        };
        return map[fc.type] || '任务失败';
    }

    describeObjectives(campaign) {
        if (!campaign) return [];
        const objs = this._getActiveObjectives(campaign);
        return objs.map(obj => this._describe(obj));
    }

    describeFailConditions(campaign) {
        if (!campaign || !campaign.failConditions) return [];
        return campaign.failConditions.map(fc => fc.reason || this._defaultFailReason(fc));
    }

    _describe(obj) {
        switch (obj.type) {
            case 'survive_waves':     return `生存 ${obj.value} 波`;
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