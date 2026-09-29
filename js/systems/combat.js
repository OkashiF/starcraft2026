// js/systems/combat.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.CombatSystem = class {
    constructor(scene) {
        this.scene = scene;
    }

    update(time, _delta) {
        const scene = this.scene;
        const S = StarAbyss.State;
        if (!S.gameStarted || S.isGameOver) return;

        scene.friendlyUnits.getChildren().forEach(unit => {
            if (unit.starText) unit.starText.setPosition(unit.x, unit.y - 30);

            let nearestEnemy = null;
            let minDist = unit.range;
            scene.enemyUnits.getChildren().forEach(enemy => {
                const d = Phaser.Math.Distance.Between(unit.x, unit.y, enemy.x, enemy.y);
                if (d < minDist) { minDist = d; nearestEnemy = enemy; }
            });

            if (nearestEnemy) {
                const angle = Phaser.Math.Angle.Between(unit.x, unit.y, nearestEnemy.x, nearestEnemy.y);
                unit.rotation = angle;
                unit.setVelocity(0, 0);

                if (time > unit.lastAtkTime + unit.atkCooldown) {
                    unit.lastAtkTime = time;
                    StarAbyss.audio.playShoot();
                    this._fire(unit, nearestEnemy, angle);
                }
            } else if (unit.targetPos) {
                const d = Phaser.Math.Distance.Between(unit.x, unit.y, unit.targetPos.x, unit.targetPos.y);
                if (d > 12) {
                    scene.physics.moveToObject(unit, unit.targetPos, unit.speed);
                    unit.rotation = Phaser.Math.Angle.Between(unit.x, unit.y, unit.targetPos.x, unit.targetPos.y);
                } else {
                    unit.setVelocity(0, 0);
                    unit.targetPos = null;
                }
            } else {
                unit.setVelocity(0, 0);
            }
        });

        // 炮塔攻击
        scene.friendlyBuildings.getChildren().forEach(b => {
            if (b.bType !== 'turret') return;
            const def = StarAbyss.Config.BUILDINGS.turret;
            let enemy = null, mDist = def.range;
            scene.enemyUnits.getChildren().forEach(e => {
                const d = Phaser.Math.Distance.Between(b.x, b.y, e.x, e.y);
                if (d < mDist) { mDist = d; enemy = e; }
            });
            if (enemy && time > b.lastAtkTime + def.atkCooldown) {
                b.lastAtkTime = time;
                StarAbyss.audio.playShoot();
                const angle = Phaser.Math.Angle.Between(b.x, b.y, enemy.x, enemy.y);
                b.rotation = angle;
                scene.vfx.muzzleFlash(b.x + Math.cos(angle) * 20, b.y + Math.sin(angle) * 20, Phaser.Math.RadToDeg(angle), 0xffdd00);
                const proj = scene.physics.add.sprite(b.x, b.y, 'tex_bullet');
                proj.rotation = angle;
                scene.projectiles.add(proj);
                proj.damage = def.damage;
                scene.physics.moveToObject(proj, enemy, 500);
                scene.time.delayedCall(600, () => { if (proj.active) proj.destroy(); });
            }
        });
    }

    _fire(unit, target, angle) {
        const scene = this.scene;
        const def = StarAbyss.Config.UNITS[unit.uType];
        const projDef = def.projectile;

        scene.vfx.muzzleFlash(
            unit.x + Math.cos(angle) * 15,
            unit.y + Math.sin(angle) * 15,
            Phaser.Math.RadToDeg(angle),
            projDef.muzzle
        );

        const proj = scene.physics.add.sprite(unit.x, unit.y, projDef.texture);
        proj.rotation = angle;
        if (projDef.scale && projDef.scale !== 1) proj.setScale(projDef.scale);
        if (projDef.tint) proj.setTint(projDef.tint);
        scene.projectiles.add(proj);
        proj.damage = unit.damage;
        scene.physics.moveToObject(proj, target, projDef.speed);

        if (projDef.flame) {
            scene.tweens.add({ targets: proj, scale: projDef.endScale || 1.5, alpha: 0, duration: projDef.lifespan });
        }
        scene.time.delayedCall(projDef.lifespan, () => { if (proj.active) proj.destroy(); });
    }

    handleProjectileHitEnemy(proj, enemy) {
        proj.destroy();
        this.damageEnemy(enemy, proj.damage);
    }

    damageEnemy(enemy, amount) {
        const scene = this.scene;
        if (!enemy.active) return;
        enemy.hp -= amount;

        enemy.setTint(0xffffff);
        scene.time.delayedCall(80, () => { if (enemy.active) enemy.clearTint(); });
        scene.vfx.hitBurst(enemy.x, enemy.y, 0xff2a6d, 3);

        if (enemy.hp <= 0) this._killEnemy(enemy);
    }

    _killEnemy(enemy) {
        const scene = this.scene;
        const S = StarAbyss.State;
        const def = StarAbyss.Config.ENEMIES[enemy.eType] || { xp: 10, coreChance: 0 };

        StarAbyss.audio.playExplosion();
        scene.vfx.deathBurst(
            enemy.x, enemy.y,
            enemy.eType === 'ultralisk' ? 0xff2a6d : 0xaa0033,
            enemy.eType === 'ultralisk' ? 40 : 15
        );

        // 经验 + 晋升
        const P = StarAbyss.Config.PROMOTION;
        scene.friendlyUnits.getChildren().forEach(u => {
            if (!u.active) return;
            if (Phaser.Math.Distance.Between(u.x, u.y, enemy.x, enemy.y) >= 250) return;
            u.xp += def.xp;
            if (u.rank === 0 && u.xp >= P.XP_VET) {
                u.rank = 1;
                u.maxHp += P.VET_BONUS.hp;
                u.hp += P.VET_BONUS.hp;
                u.damage += P.VET_BONUS.damage;
                StarAbyss.UI.showToast('🌟 前线单位晋升：老兵！');
                StarAbyss.UI.updateSelectionCard(scene);
            } else if (u.rank === 1 && u.xp >= P.XP_ELITE) {
                u.rank = 2;
                u.maxHp += P.ELITE_BONUS.hp;
                u.hp += P.ELITE_BONUS.hp;
                u.damage += P.ELITE_BONUS.damage;
                StarAbyss.UI.showToast('⭐ 前线单位晋升：精锐！');
                StarAbyss.UI.updateSelectionCard(scene);
            }
        });

        // 击杀统计
        S.recordKill(enemy.eType, enemy.tags || []);

        // 触发目标摧毁事件
        if (enemy.tags && enemy.tags.length) {
            enemy.tags.forEach(tag => {
                scene.scriptSystem.fire({ type: 'onTargetDestroyed', targetId: tag });
            });
        }

        enemy.destroy();
        S.minerals += 15;
        S.gas += 5;
        if (Math.random() < def.coreChance) S.techCores++;
        StarAbyss.UI.updateUI();
    }

    // 敌人攻击保护目标/友方建筑时调用
    damageBuilding(building, amount, attacker) {
        if (!building || !building.active) return;
        building.hp -= amount;
        building.setTint(0xffffff);
        this.scene.time.delayedCall(80, () => { if (building.active) building.clearTint(); });
        this.scene.vfx.hitBurst(building.x, building.y, 0xff2a6d, 4);

        if (building.hp <= 0) {
            this._destroyBuilding(building);
        }
    }

_destroyBuilding(b) {
    const scene = this.scene;
    StarAbyss.audio.playExplosion();
    scene.vfx.deathBurst(b.x, b.y, 0xff2a6d, 30);

    // 计入击杀统计，供 destroy_target 判定
    if (b.tags && b.tags.length) {
        StarAbyss.State.recordKill(b.bType || 'building', b.tags);
    }

    // 触发脚本事件
    if (b.targetId) {
        scene.scriptSystem.fire({ type: 'onTargetDestroyed', targetId: b.targetId });
    }
    if (b.tags && b.tags.length) {
        b.tags.forEach(tag => {
            scene.scriptSystem.fire({ type: 'onTargetDestroyed', targetId: tag });
        });
    }
    if (b.label && b.label.destroy) b.label.destroy();
    if (b.hpBar && b.hpBar.destroy) b.hpBar.destroy();

    b.destroy();
}

    toggleSiegeMode() {
        const scene = this.scene;
        if (scene.selectedUnits.length === 0) return;
        const S = StarAbyss.State;
        const def = StarAbyss.Config.UNITS.tank;
        const s = def.siege;
        let toggled = false;

        scene.selectedUnits.forEach(u => {
            if (u.uType !== 'tank') return;
            u.isSiegeMode = !u.isSiegeMode;
            if (u.isSiegeMode) {
                u.speed = s.speed;
                u.range = s.range;
                u.damage = s.damage + S.upgrades.mechAtk * s.damagePerUpgrade;
                u.atkCooldown = s.atkCooldown;
                u.setTint(s.tint);
                u.setVelocity(0, 0);
            } else {
                u.speed = u.baseStats.speed;
                u.range = u.baseStats.range;
                u.damage = u.baseStats.damage;
                u.atkCooldown = u.baseStats.atkCooldown;
                u.setTint(0x00ff88);
            }
            toggled = true;
        });
        if (toggled) StarAbyss.audio.playClick();
    }

    activateCommanderSkill(skill) {
        const scene = this.scene;
        const S = StarAbyss.State;
        const C = StarAbyss.Config.SKILLS;

        if (StarAbyss.Ark && !StarAbyss.Ark.canUseSkill(skill)) {
            StarAbyss.audio.playAlarm();
            StarAbyss.UI.showToast('该指挥官技能未解锁或未在战前装载中携带');
            return;
        }

        if (skill === 'orbital' && S.minerals >= C.orbital.cost) {
            S.minerals -= C.orbital.cost;
            StarAbyss.UI.updateUI();
            scene.cameras.main.shake(300, 0.02);
            StarAbyss.audio.playExplosion();
            scene.enemyUnits.getChildren().forEach(enemy => this.damageEnemy(enemy, C.orbital.damage));
            StarAbyss.UI.showToast('🚀 已实施全局轨道打击！');
        } else if (skill === 'repair' && S.minerals >= C.repair.cost) {
            S.minerals -= C.repair.cost;
            StarAbyss.UI.updateUI();
            scene.friendlyUnits.getChildren().forEach(u => {
                u.hp = Math.min(u.maxHp, u.hp + C.repair.unitHeal);
            });
            scene.friendlyBuildings.getChildren().forEach(b => {
                b.hp = Math.min(b.maxHp, b.hp + C.repair.buildingHeal);
            });
            StarAbyss.UI.showToast('🛠️ 全基地战场紧急维修完成！');
        }
    }
};