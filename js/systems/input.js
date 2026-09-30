// js/systems/input.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.InputSystem = class {
    constructor(scene) {
        this.scene = scene;
    }

    setup() {
        const scene = this.scene;

        scene.selectionRect = scene.add.rectangle(0, 0, 0, 0, 0x00f0ff, 0.25).setOrigin(0, 0);
        scene.selectionRect.setStrokeStyle(1, 0x00f0ff);
        scene.selectionRect.setVisible(false);

        scene.isSelecting = false;
        scene.startPos = new Phaser.Math.Vector2();

        scene.ghostBuilding = scene.add.rectangle(0, 0, 40, 40, 0x00ff88, 0.4).setVisible(false);

        scene.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this._handleRightClick(pointer.worldX, pointer.worldY);
                return;
            }
            if (StarAbyss.State.placingBuildingType) {
                scene.buildingFactory.placeBuildingAt(StarAbyss.State.placingBuildingType, pointer.worldX, pointer.worldY);
                StarAbyss.State.placingBuildingType = null;
                scene.ghostBuilding.setVisible(false);
                return;
            }
            scene.isSelecting = true;
            scene.startPos.set(pointer.worldX, pointer.worldY);
            scene.selectionRect.setPosition(pointer.worldX, pointer.worldY).setSize(0, 0).setVisible(true);
            this._clearSelections();
        });

        scene.input.on('pointermove', (pointer) => {
            if (scene.isSelecting) {
                const w = pointer.worldX - scene.startPos.x;
                const h = pointer.worldY - scene.startPos.y;
                scene.selectionRect.setSize(w, h);
            }
            if (StarAbyss.State.placingBuildingType) {
                scene.ghostBuilding.setPosition(pointer.worldX, pointer.worldY).setVisible(true);
            }
        });

        scene.input.on('pointerup', (pointer) => {
            if (pointer.rightButtonReleased()) return;
            scene.isSelecting = false;
            scene.selectionRect.setVisible(false);

            let minX = Math.min(scene.startPos.x, pointer.worldX);
            let maxX = Math.max(scene.startPos.x, pointer.worldX);
            let minY = Math.min(scene.startPos.y, pointer.worldY);
            let maxY = Math.max(scene.startPos.y, pointer.worldY);

            if (Math.abs(maxX - minX) < 10 && Math.abs(maxY - minY) < 10) {
                minX -= 20; maxX += 20; minY -= 20; maxY += 20;
            }

            const rect = new Phaser.Geom.Rectangle(minX, minY, maxX - minX, maxY - minY);
            scene.friendlyUnits.getChildren().forEach(unit => {
                if (Phaser.Geom.Rectangle.ContainsPoint(rect, new Phaser.Geom.Point(unit.x, unit.y))) {
                    scene.selectedUnits.push(unit);
                    unit.setTint(0x00ff88);
                }
            });
            StarAbyss.UI.updateSelectionCard(scene);
        });

        this._setupHotkeys();
    }

    _setupHotkeys() {
        window.addEventListener('keydown', (e) => {
            const S = StarAbyss.State;
            if (S.inMenu || S.isGameOver || !S.gameStarted) return;

            const scene = this.scene;
            switch (e.key) {
                case '1': StarAbyss.App.triggerBuild('marine'); break;
                case '2': StarAbyss.App.triggerBuild('firebat'); break;
                case '3': StarAbyss.App.triggerBuild('ghost'); break;
                case '4': StarAbyss.App.triggerBuild('tank'); break;
                case '5': StarAbyss.App.triggerBuild('rocketeer'); break;
                case '6': StarAbyss.App.triggerBuild('medic'); break;
                case '7': StarAbyss.App.triggerBuild('engineer'); break;
                case '8': StarAbyss.App.triggerBuild('drone'); break;
                case '9': StarAbyss.App.triggerBuild('shieldman'); break;
                case '0': StarAbyss.App.triggerBuild('sniper'); break;

                case 'q': case 'Q': StarAbyss.App.selectBuildingToPlace('turret'); break;
                case 'w': case 'W': StarAbyss.App.selectBuildingToPlace('flame_turret'); break;
                case 'e': case 'E': scene.combat.toggleSiegeMode(); break;
                case 'a': case 'A': StarAbyss.App.selectBuildingToPlace('sniper_turret'); break;
                case 's': case 'S': StarAbyss.App.selectBuildingToPlace('repair_station'); break;
                case 'd': case 'D': StarAbyss.App.selectBuildingToPlace('radar_station'); break;
                case 'f': case 'F': StarAbyss.App.selectBuildingToPlace('wall'); break;

                case 'r': case 'R': StarAbyss.App.useCommanderSkill('orbital'); break;
                case 't': case 'T': StarAbyss.App.useCommanderSkill('repair'); break;
                case 'y': case 'Y': StarAbyss.App.useCommanderSkill('airdrop'); break;
                case 'u': case 'U': StarAbyss.App.useCommanderSkill('shield_field'); break;
                case 'i': case 'I': StarAbyss.App.useCommanderSkill('scan'); break;
                case 'o': case 'O': StarAbyss.App.useCommanderSkill('nano_repair'); break;
                case 'p': case 'P': StarAbyss.App.useCommanderSkill('minefield'); break;
                case 'g': case 'G': StarAbyss.App.useCommanderSkill('emp'); break;
            }
        });
    }

    _clearSelections() {
        const scene = this.scene;
        scene.selectedUnits.forEach(u => u.clearTint());
        scene.selectedUnits = [];
        scene.selectedBuilding = null;
        StarAbyss.UI.updateSelectionCard(scene);
    }

    _handleRightClick(wx, wy) {
        const scene = this.scene;
        if (scene.selectedUnits.length === 0) return;
        StarAbyss.audio.playClick();

        scene.selectedUnits.forEach((unit, idx) => {
            const angle = idx * (Math.PI * 2 / scene.selectedUnits.length);
            const offset = scene.selectedUnits.length > 1 ? 25 : 0;
            unit.targetPos = new Phaser.Math.Vector2(
                wx + Math.cos(angle) * offset,
                wy + Math.sin(angle) * offset
            );
        });

        const circle = scene.add.circle(wx, wy, 12, 0x00f0ff, 0.6);
        scene.tweens.add({ targets: circle, scale: 0, alpha: 0, duration: 450, onComplete: () => circle.destroy() });
    }
};