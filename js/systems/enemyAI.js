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

        scene.enemyUnits.getChildren().forEach(enemy => {
            if (enemy.isEnemyBuilding) return;   // 跳过敌方建筑

            const priority = enemy.attackPriority || 'default';

            let target = null;
            let targetType = null;
            let targetDist = Infinity;

            if (priority === 'protect') {
                // 保护目标优先：无视距离扑向最近的保护目标
                protectTargets.forEach(t => {
                    if (!t.active || t.hp <= 0) return;
                    const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, t.x, t.y);
                    if (d < targetDist) {
                        target = t;
                        targetType = 'protect';
                        targetDist = d;
                    }
                });

                // 极近距离友军转火（120px）
                scene.friendlyUnits.getChildren().forEach(u => {
                    const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, u.x, u.y);
                    if (d < 120 && d < targetDist) {
                        target = u;
                        targetType = 'unit';
                        targetDist = d;
                    }
                });

                // 没有保护目标时回落到基地
                if (!target) {
                    target = scene.commandCenter;
                    targetType = 'base';
                    targetDist = target
                        ? Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y)
                        : Infinity;
                }
            } else if (priority === 'base') {
                // 基地优先：无视距离扑向指挥中心
                target = scene.commandCenter;
                targetType = 'base';
                targetDist = target
                    ? Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y)
                    : Infinity;

                // 极近距离友军 / 保护目标转火（120px）
                scene.friendlyUnits.getChildren().forEach(u => {
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
                // default：保持原有行为
                target = scene.commandCenter;
                targetType = 'base';
                targetDist = target
                    ? Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y)
                    : Infinity;

                // 优先攻击附近友军单位
                scene.friendlyUnits.getChildren().forEach(u => {
                    const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, u.x, u.y);
                    if (d < 120 && d < targetDist) {
                        target = u;
                        targetType = 'unit';
                        targetDist = d;
                    }
                });

                // 其次攻击保护目标（在附近时优先于基地）
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

            if (targetDist > 35) {
                scene.physics.moveToObject(enemy, target, enemy.speed);
                enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, target.x, target.y);
            } else {
                enemy.setVelocity(0, 0);
                if (time > enemy.lastAtkTime + enemy.atkCooldown) {
                    enemy.lastAtkTime = time;

                    if (targetType === 'base') {
                        scene.commandCenter.hp -= enemy.damage;
                        StarAbyss.UI.flashDamage();
                        StarAbyss.UI.updateSelectionCard(scene);
                        if (scene.commandCenter.hp <= 0) {
                            scene.combat._destroyBuilding(scene.commandCenter);
                            StarAbyss.App.gameOver(false, '指挥中心被摧毁');
                        }
                    } else if (targetType === 'unit') {
                        target.hp -= enemy.damage;
                        if (target.hp <= 0) {
                            S.usedSupply = Math.max(0, S.usedSupply - 1);
                            S.recordLoss();
                            if (target.starText) target.starText.destroy();
                            target.destroy();
                            StarAbyss.UI.updateUI();
                        }
                    } else if (targetType === 'protect') {
                        scene.combat.damageBuilding(target, enemy.damage, enemy);
                    }
                }
            }
        });
    }
};