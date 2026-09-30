// js/systems/enemyAI.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.EnemyAISystem = class {
    constructor(scene) {
        this.scene = scene;
    }

    update(time, _delta) {
        const scene = this.scene;
        const S = StarAbyss.State;
        if (!S.gameStarted || S.isGameOver) return;

        // 收集所有可攻击目标：指挥中心、保护目标、友军单位、车队
        const protectTargets = [];
        scene.friendlyBuildings.getChildren().forEach(b => {
            if (b.targetId) protectTargets.push(b);
        });
        if (scene.convoyUnits) {
            scene.convoyUnits.getChildren().forEach(c => {
                if (c.active && c.hp > 0) protectTargets.push(c);
            });
        }

        // 盾卫嘲讽列表
        const taunts = [];
        scene.friendlyUnits.getChildren().forEach(u => {
            if (!u.active) return;
            const def = StarAbyss.Config.UNITS[u.uType];
            if (def && def.isTaunt) taunts.push(u);
        });

        scene.enemyUnits.getChildren().forEach(enemy => {
            if (enemy.isEnemyBuilding) return;   // 跳过敌方建筑

            // 状态限制
            const status = enemy.status || {};
            if (status.stunUntil > time) {
                enemy.setVelocity(0, 0);
                return;
            }
            const speedMult = status.slowUntil > time ? StarAbyss.Config.STATUS.SLOW_FACTOR : 1;

            const priority = enemy.attackPriority || 'default';
            const attackRange = enemy.attackRange || 35;

            let target = null;
            let targetType = null;
            let targetDist = Infinity;

            // 盾卫嘲讽优先级最高（范围内）
            let tauntTarget = null, tauntDist = Infinity;
            taunts.forEach(u => {
                const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, u.x, u.y);
                if (d < 140 && d < tauntDist) { tauntTarget = u; tauntDist = d; }
            });
            if (tauntTarget) {
                target = tauntTarget;
                targetType = 'unit';
                targetDist = tauntDist;
            } else if (priority === 'protect') {
                protectTargets.forEach(t => {
                    if (!t.active || t.hp <= 0) return;
                    const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, t.x, t.y);
                    if (d < targetDist) {
                        target = t;
                        targetType = 'protect';
                        targetDist = d;
                    }
                });

                scene.friendlyUnits.getChildren().forEach(u => {
                    if (!u.active) return;
                    const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, u.x, u.y);
                    if (d < 120 && d < targetDist) {
                        target = u;
                        targetType = 'unit';
                        targetDist = d;
                    }
                });

                if (!target) {
                    target = scene.commandCenter;
                    targetType = 'base';
                    targetDist = target
                        ? Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y)
                        : Infinity;
                }
            } else if (priority === 'base') {
                target = scene.commandCenter;
                targetType = 'base';
                targetDist = target
                    ? Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y)
                    : Infinity;

                scene.friendlyUnits.getChildren().forEach(u => {
                    if (!u.active) return;
                    const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, u.x, u.y);
                    if (d < 120 && d < targetDist) {
                        target = u;
                        targetType = 'unit';
                        targetDist = d;
                    }
                });
                protectTargets.forEach(t => {
                    if (!t.active || t.hp <= 0) return;
                    const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, t.x, t.y);
                    if (d < 120 && d < targetDist) {
                        target = t;
                        targetType = 'protect';
                        targetDist = d;
                    }
                });
            } else {
                target = scene.commandCenter;
                targetType = 'base';
                targetDist = target
                    ? Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y)
                    : Infinity;

                scene.friendlyUnits.getChildren().forEach(u => {
                    if (!u.active) return;
                    const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, u.x, u.y);
                    if (d < 120 && d < targetDist) {
                        target = u;
                        targetType = 'unit';
                        targetDist = d;
                    }
                });

                protectTargets.forEach(t => {
                    if (!t.active || t.hp <= 0) return;
                    const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, t.x, t.y);
                    if (d < 200 && d < targetDist) {
                        target = t;
                        targetType = 'protect';
                        targetDist = d;
                    }
                });
            }

            if (!target) return;

            if (targetDist > attackRange) {
                scene.physics.moveToObject(enemy, target, enemy.speed * speedMult);
                enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, target.x, target.y);
            } else {
                enemy.setVelocity(0, 0);
                if (time > enemy.lastAtkTime + enemy.atkCooldown) {
                    enemy.lastAtkTime = time;

                    const def = StarAbyss.Config.ENEMIES[enemy.eType] || {};

                    if (targetType === 'base') {
                        scene.combat.damageBuilding(scene.commandCenter, enemy.damage, enemy);
                        StarAbyss.UI.flashDamage();
                        StarAbyss.UI.updateSelectionCard(scene);
                        if (!scene.commandCenter.active || scene.commandCenter.hp <= 0) {
                            StarAbyss.App.gameOver(false, '指挥中心被摧毁');
                        }
                    } else if (targetType === 'unit') {
                        target.hp -= enemy.damage;
                        if (target.hp <= 0) {
                            scene.combat._killFriendly(target);
                        }
                    } else if (targetType === 'protect') {
                        scene.combat.damageBuilding(target, enemy.damage, enemy);

                        // 远程敌人（酸蚀者）命中时生成酸液
                        if (def.onHitAcid && !enemy.isEnemyBuilding) {
                            scene.combat._acidZones.push({
                                x: target.x,
                                y: target.y,
                                radius: def.onHitAcid.radius,
                                dps: def.onHitAcid.dps,
                                until: time + def.onHitAcid.duration,
                            });
                        }
                    }
                }
            }
        });
    }
};