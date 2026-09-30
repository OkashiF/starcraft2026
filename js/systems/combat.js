// js/systems/combat.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.CombatSystem = class {
    constructor(scene) {
        this.scene = scene;
        this._mines = [];      // 地雷阵
        this._acidZones = [];  // 酸液区域
        this._nanoZones = [];  // 纳米修复区域
    }

    // ===== 伤害计算：armorType + bonusVs + mark =====
    computeDamage(baseDamage, attackerDef, target) {
        let mult = 1;
        if (attackerDef && attackerDef.bonusVs && target.armorType) {
            mult *= attackerDef.bonusVs[target.armorType] || 1;
        }
        if (target.status && target.status.markUntil > this.scene.time.now) {
            mult *= StarAbyss.Config.STATUS.MARK_MULT;
        }
        return Math.round(baseDamage * mult);
    }

    // ===== 状态效果每帧处理 =====
    _processStatus(entity, time, delta, isFriendly) {
        const s = entity.status;
        if (!s) return;
        const dt = delta / 1000;

        // 护盾吸收
        if (s.shield > 0 && s.shieldUntil && time > s.shieldUntil) {
            s.shield = 0;
        }

        // 灼烧 / 酸液
        if (s.burnUntil > time && s.burnDps > 0) {
            entity.hp -= s.burnDps * dt;
            if (entity.hp <= 0) {
                if (isFriendly) this._killFriendly(entity);
                else this._killEnemy(entity);
            }
        }

        // 眩晕 / 减速体现在移动逻辑里（enemyAI / 单位移动）
    }

    update(time, delta) {
        const scene = this.scene;
        const S = StarAbyss.State;
        if (!S.gameStarted || S.isGameOver) return;

        // ===== 友军单位 =====
        scene.friendlyUnits.getChildren().forEach(unit => {
            if (!unit.active) return;

            // 生命周期（临时召唤物）
            if (unit.lifetime && time - unit.spawnedAt > unit.lifetime) {
                if (unit.starText) unit.starText.destroy();
                S.usedSupply = Math.max(0, S.usedSupply - (StarAbyss.Config.UNITS[unit.uType]?.supply || 0));
                unit.destroy();
                StarAbyss.UI.updateUI();
                return;
            }

            this._processStatus(unit, time, delta, true);

            if (unit.starText) unit.starText.setPosition(unit.x, unit.y - 30);

            // 状态限制
            const isStunned = unit.status.stunUntil > time;
            const isSlowed = unit.status.slowUntil > time;
            const speedMult = isSlowed ? StarAbyss.Config.STATUS.SLOW_FACTOR : 1;

            const def = StarAbyss.Config.UNITS[unit.uType];
            if (!def) return;

            // ===== 医疗兵：治疗最低血量友军 =====
            if (def.isHealer) {
                if (time > (unit.lastAtkTime + unit.atkCooldown)) {
                    let target = null, lowPct = 1;
                    scene.friendlyUnits.getChildren().forEach(u => {
                        if (!u.active || u === unit || u.hp >= u.maxHp) return;
                        const d = Phaser.Math.Distance.Between(unit.x, unit.y, u.x, u.y);
                        if (d > def.healRange) return;
                        const pct = u.hp / u.maxHp;
                        if (pct < lowPct) { lowPct = pct; target = u; }
                    });
                    if (target) {
                        unit.lastAtkTime = time;
                        target.hp = Math.min(target.maxHp, target.hp + def.healAmount);
                        scene.vfx.hitBurst(target.x, target.y, 0x00ff88, 3);
                    }
                }
                unit.setVelocity(0, 0);
                if (unit.targetPos) this._moveToTarget(unit, speedMult);
                return;
            }

            // ===== 工程师：修理建筑 =====
            if (def.isRepairer) {
                if (time > (unit.lastAtkTime + unit.atkCooldown)) {
                    let target = null, lowPct = 1;
                    scene.friendlyBuildings.getChildren().forEach(b => {
                        if (!b.active || b.hp >= b.maxHp) return;
                        const d = Phaser.Math.Distance.Between(unit.x, unit.y, b.x, b.y);
                        if (d > def.repairRange) return;
                        const pct = b.hp / b.maxHp;
                        if (pct < lowPct) { lowPct = pct; target = b; }
                    });
                    if (target) {
                        unit.lastAtkTime = time;
                        target.hp = Math.min(target.maxHp, target.hp + def.repairAmount);
                        scene.vfx.hitBurst(target.x, target.y, 0xffb703, 3);
                    }
                }
                unit.setVelocity(0, 0);
                if (unit.targetPos) this._moveToTarget(unit, speedMult);
                return;
            }

            // ===== 无人机：标记敌人 =====
            if (def.isMarker) {
                if (time > (unit.lastAtkTime + unit.atkCooldown)) {
                    let nearest = null, md = def.markerRange;
                    scene.enemyUnits.getChildren().forEach(e => {
                        if (!e.active || e.isEnemyBuilding) return;
                        const d = Phaser.Math.Distance.Between(unit.x, unit.y, e.x, e.y);
                        if (d < md) { md = d; nearest = e; }
                    });
                    if (nearest) {
                        unit.lastAtkTime = time;
                        nearest.status.markUntil = time + def.markerDuration;
                        scene.vfx.hitBurst(nearest.x, nearest.y, 0x00f0ff, 2);
                    }
                }
                if (unit.targetPos) this._moveToTarget(unit, speedMult);
                else unit.setVelocity(0, 0);
                return;
            }

            // ===== 战斗单位 =====
            if (isStunned) {
                unit.setVelocity(0, 0);
                return;
            }

            let nearestEnemy = null;
            let minDist = unit.range;
            scene.enemyUnits.getChildren().forEach(enemy => {
                if (!enemy.active) return;
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
                    this._fire(unit, nearestEnemy, angle, def);
                }
            } else if (unit.targetPos) {
                this._moveToTarget(unit, speedMult);
            } else {
                unit.setVelocity(0, 0);
            }
        });

        // ===== 友军建筑炮塔 =====
        scene.friendlyBuildings.getChildren().forEach(b => {
            if (!b.active) return;
            const def = StarAbyss.Config.BUILDINGS[b.bType];
            if (!def || !def.range || !def.damage) return;
            if (def.supplyBonus) return; // 补给站不是炮塔

            let enemy = null, mDist = def.range;
            scene.enemyUnits.getChildren().forEach(e => {
                if (!e.active) return;
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
                proj.damage = this.computeDamage(def.damage, def, enemy);
                proj.splashRadius = def.splash ? 30 : 0;
                proj.casterDef = def;
                scene.physics.moveToObject(proj, enemy, 500);
                scene.time.delayedCall(600, () => { if (proj.active) proj.destroy(); });
            }
        });

        // ===== 敌方建筑炮塔 =====
        scene.enemyUnits.getChildren().forEach(eb => {
            if (!eb.active || !eb.isEnemyTurret) return;
            if (time <= eb.lastAtkTime + eb.atkCooldown) return;

            let target = null, mDist = eb.range;
            scene.friendlyUnits.getChildren().forEach(u => {
                if (!u.active) return;
                const d = Phaser.Math.Distance.Between(eb.x, eb.y, u.x, u.y);
                if (d < mDist) { mDist = d; target = u; }
            });
            if (target) {
                eb.lastAtkTime = time;
                const angle = Phaser.Math.Angle.Between(eb.x, eb.y, target.x, target.y);
                const proj = scene.physics.add.sprite(eb.x, eb.y, 'tex_bullet');
                proj.rotation = angle;
                proj.setTint(0xff2a6d);
                scene.projectiles.add(proj);
                proj.damage = this.computeDamage(eb.damage, eb.defense || {}, target);
                proj.enemyProjectile = true;
                scene.physics.moveToObject(proj, target, 450);
                scene.time.delayedCall(700, () => { if (proj.active) proj.destroy(); });
            }
        });

        // ===== 敌方建筑刷怪 =====
        scene.enemyUnits.getChildren().forEach(eb => {
            if (!eb.active || !eb.spawner) return;
            if (time < eb.nextSpawn) return;
            eb.nextSpawn = time + eb.spawner.interval;
            for (let i = 0; i < eb.spawner.count; i++) {
                const ox = (Math.random() - 0.5) * 60;
                const oy = (Math.random() - 0.5) * 60;
                scene.unitFactory.spawnEnemy(eb.spawner.type, eb.x + ox, eb.y + oy, null, 'default');
            }
        });

        // ===== 地雷阵 =====
        this._mines = this._mines.filter(m => m.active);
        this._mines.forEach(m => {
            if (time - m.placedAt > m.lifetime) { m.destroy(); return; }
            scene.enemyUnits.getChildren().forEach(e => {
                if (!e.active || e.isEnemyBuilding) return;
                const d = Phaser.Math.Distance.Between(m.x, m.y, e.x, e.y);
                if (d < m.triggerRadius) {
                    this.damageEnemy(e, m.damage);
                    scene.vfx.deathBurst(m.x, m.y, 0xffb703, 12);
                    StarAbyss.audio.playExplosion();
                    m.destroy();
                }
            });
        });

        // ===== 酸液区域 =====
        this._acidZones = this._acidZones.filter(z => z.until > time);
        this._acidZones.forEach(z => {
            scene.friendlyUnits.getChildren().forEach(u => {
                if (!u.active) return;
                const d = Phaser.Math.Distance.Between(z.x, z.y, u.x, u.y);
                if (d < z.radius) {
                    if (!u.status.burnUntil || u.status.burnUntil < time) {
                        u.status.burnUntil = z.until;
                        u.status.burnDps = z.dps;
                    }
                }
            });
        });

        // ===== 纳米修复区域 =====
        this._nanoZones = this._nanoZones.filter(z => z.until > time);
        this._nanoZones.forEach(z => {
            const heal = z.hpPerSec * delta / 1000;
            scene.friendlyUnits.getChildren().forEach(u => {
                if (!u.active) return;
                const d = Phaser.Math.Distance.Between(z.x, z.y, u.x, u.y);
                if (d < z.radius) u.hp = Math.min(u.maxHp, u.hp + heal);
            });
        });
    }

    _moveToTarget(unit, speedMult = 1) {
        const scene = this.scene;
        const d = Phaser.Math.Distance.Between(unit.x, unit.y, unit.targetPos.x, unit.targetPos.y);
        if (d > 12) {
            scene.physics.moveTo(unit, unit.targetPos.x, unit.targetPos.y, unit.speed * speedMult);
            unit.rotation = Phaser.Math.Angle.Between(unit.x, unit.y, unit.targetPos.x, unit.targetPos.y);
        } else {
            unit.setVelocity(0, 0);
            unit.targetPos = null;
        }
    }

    _fire(unit, target, angle, def) {
        const scene = this.scene;
        const projDef = def.projectile;
        if (!projDef) return;

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
        proj.damage = this.computeDamage(unit.damage, def, target);
        proj.splashRadius = def.splashRadius || 0;
        proj.casterDef = def;
        proj.ownerUnit = unit;
        scene.physics.moveToObject(proj, target, projDef.speed);

        if (projDef.flame) {
            scene.tweens.add({ targets: proj, scale: projDef.endScale || 1.5, alpha: 0, duration: projDef.lifespan });
        }
        scene.time.delayedCall(projDef.lifespan, () => { if (proj.active) proj.destroy(); });
    }

    handleProjectileHitEnemy(proj, enemy) {
        if (!proj.active) return;
        const dmg = proj.damage || 0;
        const splash = proj.splashRadius || 0;
        const casterDef = proj.casterDef;
        const ownerUnit = proj.ownerUnit;
        const px = proj.x, py = proj.y;
        proj.destroy();

        this.damageEnemy(enemy, dmg);

        if (splash > 0) {
            this.scene.enemyUnits.getChildren().forEach(e => {
                if (!e.active || e === enemy) return;
                const d = Phaser.Math.Distance.Between(px, py, e.x, e.y);
                if (d < splash) {
                    this.damageEnemy(e, Math.round(dmg * 0.6));
                }
            });
        }
    }

    damageEnemy(enemy, amount) {
        const scene = this.scene;
        if (!enemy.active) return;
        const time = scene.time.now;

        // 护盾优先吸收
        if (enemy.status && enemy.status.shield > 0 && enemy.status.shieldUntil > time) {
            const absorbed = Math.min(enemy.status.shield, amount);
            enemy.status.shield -= absorbed;
            amount -= absorbed;
        }

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

        // ===== 死亡爆炸（裂解虫等） =====
        if (def.deathExplosion) {
            const ex = def.deathExplosion;
            scene.vfx.deathBurst(enemy.x, enemy.y, 0xffb703, 20);
            // 对友军造成伤害
            scene.friendlyUnits.getChildren().forEach(u => {
                if (!u.active) return;
                const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, u.x, u.y);
                if (d < ex.radius) {
                    u.hp -= ex.damage;
                    if (u.hp <= 0) this._killFriendly(u);
                }
            });
            // 对建筑额外伤害
            scene.friendlyBuildings.getChildren().forEach(b => {
                if (!b.active) return;
                const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, b.x, b.y);
                if (d < ex.radius) {
                    const dmg = Math.round(ex.damage * (ex.buildingBonus || 1));
                    this.damageBuilding(b, dmg, enemy);
                }
            });
        }

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

    _killFriendly(unit) {
        const S = StarAbyss.State;
        const def = StarAbyss.Config.UNITS[unit.uType];
        S.usedSupply = Math.max(0, S.usedSupply - (def ? def.supply : 1));
        S.recordLoss();
        if (unit.starText) unit.starText.destroy();
        unit.destroy();
        StarAbyss.UI.updateUI();
    }

    // 敌人攻击保护目标/友方建筑时调用
    damageBuilding(building, amount, attacker) {
        if (!building || !building.active) return;
        const time = this.scene.time.now;

        // 护盾
        if (building.status && building.status.shield > 0 && building.status.shieldUntil > time) {
            const absorbed = Math.min(building.status.shield, amount);
            building.status.shield -= absorbed;
            amount -= absorbed;
        }

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

        if (b.tags && b.tags.length) {
            StarAbyss.State.recordKill(b.bType || 'building', b.tags);
        }
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

    // ===== 指挥官技能 =====
    activateCommanderSkill(skill) {
        const scene = this.scene;
        const S = StarAbyss.State;
        const C = StarAbyss.Config.SKILLS;

        if (StarAbyss.Ark && !StarAbyss.Ark.canUseSkill(skill)) {
            StarAbyss.audio.playAlarm();
            StarAbyss.UI.showToast('该指挥官技能未解锁或未在战前装载中携带');
            return;
        }

        const cfg = C[skill];
        if (!cfg) return;
        if (S.minerals < cfg.cost) {
            StarAbyss.UI.showToast('❌ 资源不足！');
            return;
        }
        S.minerals -= cfg.cost;
        StarAbyss.UI.updateUI();

        switch (skill) {
            case 'orbital': this._skillOrbital(cfg); break;
            case 'repair': this._skillRepair(cfg); break;
            case 'airdrop': this._skillAirdrop(cfg); break;
            case 'shield_field': this._skillShieldField(cfg); break;
            case 'scan': this._skillScan(cfg); break;
            case 'nano_repair': this._skillNanoRepair(cfg); break;
            case 'minefield': this._skillMinefield(cfg); break;
            case 'emp': this._skillEmp(cfg); break;
        }
    }

    _skillOrbital(cfg) {
        const scene = this.scene;
        scene.cameras.main.shake(300, 0.02);
        StarAbyss.audio.playExplosion();
        scene.enemyUnits.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            this.damageEnemy(enemy, cfg.damage);
        });
        StarAbyss.UI.showToast('🚀 已实施全局轨道打击！');
    }

    _skillRepair(cfg) {
        const scene = this.scene;
        scene.friendlyUnits.getChildren().forEach(u => {
            u.hp = Math.min(u.maxHp, u.hp + cfg.unitHeal);
        });
        scene.friendlyBuildings.getChildren().forEach(b => {
            b.hp = Math.min(b.maxHp, b.hp + cfg.buildingHeal);
        });
        StarAbyss.UI.showToast('🛠️ 全基地战场紧急维修完成！');
    }

    _skillAirdrop(cfg) {
        const scene = this.scene;
        const cx = scene.commandCenter.x;
        const cy = scene.commandCenter.y;
        for (let i = 0; i < cfg.count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const r = 100 + Math.random() * 60;
            const unit = scene.unitFactory.spawnFriendly(
                cfg.unitType,
                cx + Math.cos(ang) * r,
                cy + Math.sin(ang) * r,
                true,
                { lifetime: cfg.lifetime }
            );
            if (unit) scene.vfx.hitBurst(unit.x, unit.y, 0x00f0ff, 8);
        }
        StarAbyss.UI.showToast(`🪂 空投增援：${cfg.count} 名陆战队员已抵达战场`);
    }

    _skillShieldField(cfg) {
        const scene = this.scene;
        const time = scene.time.now;
        let count = 0;
        scene.friendlyUnits.getChildren().forEach(u => {
            if (!u.active) return;
            const d = Phaser.Math.Distance.Between(u.x, u.y, scene.commandCenter.x, scene.commandCenter.y);
            if (d < cfg.radius + 300) {
                u.status.shield = cfg.shield;
                u.status.shieldUntil = time + cfg.duration;
                count++;
            }
        });
        scene.friendlyBuildings.getChildren().forEach(b => {
            if (!b.active) return;
            const d = Phaser.Math.Distance.Between(b.x, b.y, scene.commandCenter.x, scene.commandCenter.y);
            if (d < cfg.radius + 300) {
                if (!b.status) b.status = {};
                b.status.shield = cfg.shield;
                b.status.shieldUntil = time + cfg.duration;
            }
        });
        scene.cameras.main.flash(200, 0, 240, 255);
        StarAbyss.UI.showToast(`🛡️ 护盾场展开：${count} 个友军获得 ${cfg.shield} 护盾`);
    }

    _skillScan(cfg) {
        const scene = this.scene;
        const time = scene.time.now;
        let count = 0;
        scene.enemyUnits.getChildren().forEach(e => {
            if (!e.active) return;
            if (!e.status) e.status = {};
            e.status.markUntil = time + cfg.markDuration;
            count++;
        });
        scene.cameras.main.flash(200, 0, 240, 255);
        StarAbyss.UI.showToast(`📡 侦察扫描完成：${count} 个敌人被标记`);
    }

    _skillNanoRepair(cfg) {
        const scene = this.scene;
        this._nanoZones.push({
            x: scene.commandCenter.x,
            y: scene.commandCenter.y,
            radius: cfg.radius + 200,
            hpPerSec: cfg.hpPerSec,
            until: scene.time.now + cfg.duration,
        });
        StarAbyss.UI.showToast(`💚 纳米修复已激活：${cfg.duration / 1000} 秒内持续回复`);
    }

    _skillMinefield(cfg) {
        const scene = this.scene;
        const cx = scene.commandCenter.x;
        const cy = scene.commandCenter.y;
        for (let i = 0; i < cfg.count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const r = 150 + Math.random() * 200;
            const mine = scene.physics.add.sprite(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 'tex_mine');
            mine.placedAt = scene.time.now;
            mine.lifetime = cfg.lifetime;
            mine.triggerRadius = cfg.triggerRadius;
            mine.damage = cfg.damage;
            this._mines.push(mine);
        }
        StarAbyss.UI.showToast(`💣 已布设 ${cfg.count} 颗地雷`);
    }

    _skillEmp(cfg) {
        const scene = this.scene;
        const time = scene.time.now;
        let count = 0;
        scene.enemyUnits.getChildren().forEach(e => {
            if (!e.active) return;
            if (!e.status) e.status = {};
            e.status.stunUntil = time + cfg.stunDuration;
            count++;
        });
        scene.cameras.main.flash(300, 255, 255, 0);
        StarAbyss.UI.showToast(`⚡ 电磁脉冲：${count} 个敌人被眩晕 ${cfg.stunDuration / 1000} 秒`);
    }
};