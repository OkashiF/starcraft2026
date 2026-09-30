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

        // 收集所有可攻击目标
        const protectTargets = [];
        scene.friendlyBuildings.getChildren().forEach(b => {
            if (b.targetId) protectTargets.push(b);
        });
        if (scene.convoyUnits) {
            scene.convoyUnits.getChildren().forEach(c => {
                if (c.active && c.hp > 0) protectTargets.push(c);
            });
        }

        // 盾卫被动嘲讽列表
        const taunts = [];
        scene.friendlyUnits.getChildren().forEach(u => {
            if (!u.active) return;
            const def = StarAbyss.Config.UNITS[u.uType];
            if (def && def.isTaunt) taunts.push(u);
        });

        scene.enemyUnits.getChildren().forEach(enemy => {
            if (enemy.isEnemyBuilding) return;

            // 状态限制
            const status = enemy.status || {};
            if (status.stunUntil > time) {
                enemy.setVelocity(0, 0);
                return;
            }
            const speedMult = status.slowUntil > time ? StarAbyss.Config.STATUS.SLOW_FACTOR : 1;
            const priority = enemy.attackPriority || 'default';
            const attackRange = enemy.attackRange || 35;

            let target = null, targetType = null, targetDist = Infinity;

            // 1) 主动嘲讽（盾卫怒吼）
            if (enemy.tauntedBy && enemy.tauntedBy.active && time < enemy.tauntUntil) {
                target = enemy.tauntedBy;
                targetType = 'unit';
                targetDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y);
            }

            // 2) 被动盾卫嘲讽
            if (!target) {
                let tgt = null, td = Infinity;
                taunts.forEach(u => {
                    const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, u.x, u.y);
                    if (d < 140 && d < td) { tgt = u; td = d; }
                });
                if (tgt) { target = tgt; targetType = 'unit'; targetDist = td; }
            }

            // 3) 标准索敌优先级
            if (!target) {
                if (priority === 'protect') {
                    protectTargets.forEach(t => {
                        if (!t.active || t.hp <= 0) return;
                        const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, t.x, t.y);
                        if (d < targetDist) { target = t; targetType = 'protect'; targetDist = d; }
                    });
                    scene.friendlyUnits.getChildren().forEach(u => {
                        if (!u.active) return;
                        const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, u.x, u.y);
                        if (d < 120 && d < targetDist) { target = u; targetType = 'unit'; targetDist = d; }
                    });
                    if (!target) {
                        target = scene.commandCenter;
                        targetType = 'base';
                        targetDist = target ? Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y) : Infinity;
                    }
                } else if (priority === 'base') {
                    target = scene.commandCenter;
                    targetType = 'base';
                    targetDist = target ? Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y) : Infinity;
                    scene.friendlyUnits.getChildren().forEach(u => {
                        if (!u.active) return;
                        const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, u.x, u.y);
                        if (d < 120 && d < targetDist) { target = u; targetType = 'unit'; targetDist = d; }
                    });
                    protectTargets.forEach(t => {
                        if (!t.active || t.hp <= 0) return;
                        const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, t.x, t.y);
                        if (d < 120 && d < targetDist) { target = t; targetType = 'protect'; targetDist = d; }
                    });
                } else {
                    target = scene.commandCenter;
                    targetType = 'base';
                    targetDist = target ? Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y) : Infinity;
                    scene.friendlyUnits.getChildren().forEach(u => {
                        if (!u.active) return;
                        const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, u.x, u.y);
                        if (d < 120 && d < targetDist) { target = u; targetType = 'unit'; targetDist = d; }
                    });
                    protectTargets.forEach(t => {
                        if (!t.active || t.hp <= 0) return;
                        const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, t.x, t.y);
                        if (d < 200 && d < targetDist) { target = t; targetType = 'protect'; targetDist = d; }
                    });
                }
            }

            if (!target) return;

            // ===== 不能移动：原地攻击 =====
            if (enemy.immobile) {
                enemy.setVelocity(0, 0);
                if (targetDist <= attackRange
                    && enemy.canAttack !== false
                    && time > enemy.lastAtkTime + enemy.atkCooldown) {
                    enemy.lastAtkTime = time;
                    this._attack(enemy, target, targetType, time);
                }
                return;
            }

            if (targetDist > attackRange) {
                scene.physics.moveToObject(enemy, target, enemy.speed * speedMult);
                enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, target.x, target.y);
            } else {
                enemy.setVelocity(0, 0);
                if (enemy.canAttack === false) return;   // 不能攻击：只贴脸，不出手
                if (time > enemy.lastAtkTime + enemy.atkCooldown) {
                    enemy.lastAtkTime = time;
                    this._attack(enemy, target, targetType, time);
                }
            }
        });
    }

    _attack(enemy, target, targetType, time) {
        const scene = this.scene;
        const def = StarAbyss.Config.ENEMIES[enemy.eType] || {};
        const dmg = scene.combat.computeDamage(enemy.damage, def, target);

        // 远程：发射投射物
        if (def.projectile) {
            this._fireProjectile(enemy, target, targetType, def, dmg);
            return;
        }

        // 近战：即时伤害
        if (targetType === 'base') {
            scene.combat.damageBuilding(scene.commandCenter, dmg, enemy);
            StarAbyss.UI.flashDamage();
            StarAbyss.UI.updateSelectionCard(scene);
            if (!scene.commandCenter.active || scene.commandCenter.hp <= 0) {
                StarAbyss.App.gameOver(false, '指挥中心被摧毁');
            }
        } else if (targetType === 'unit') {
            target.hp -= dmg;
            if (target.hp <= 0) scene.combat._killFriendly(target);
        } else if (targetType === 'protect') {
            scene.combat.damageBuilding(target, dmg, enemy);
            if (def.onHitAcid) {
                scene.combat._acidZones.push({
                    x: target.x, y: target.y,
                    radius: def.onHitAcid.radius, dps: def.onHitAcid.dps,
                    until: time + def.onHitAcid.duration,
                });
            }
        }
    }

    _fireProjectile(enemy, target, targetType, def, dmg) {
        const scene = this.scene;
        const projDef = def.projectile;
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, target.x, target.y);

        const proj = scene.physics.add.sprite(enemy.x, enemy.y, projDef.texture);
        proj.rotation = angle;
        if (projDef.tint) proj.setTint(projDef.tint);
        if (projDef.scale && projDef.scale !== 1) proj.setScale(projDef.scale);
        scene.projectiles.add(proj);

        proj.enemyProjectile = true;
        proj.damage = dmg;
        proj.hitTarget = target;
        proj.targetType = targetType;
        proj.onHitAcid = def.onHitAcid;

        scene.physics.moveToObject(proj, target, projDef.speed);
        scene.time.delayedCall(projDef.lifespan || 1200, () => { if (proj.active) proj.destroy(); });
    }
};