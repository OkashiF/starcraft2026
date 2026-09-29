// js/systems/minimap.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.MinimapSystem = class {
    constructor(scene) {
        this.scene = scene;
        this.canvas = null;
        this.ctx = null;
        this.dragging = false;
    }

    setup() {
        this.canvas = document.getElementById('minimap-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.addEventListener('mousedown', (e) => {
            this.dragging = true;
            this._moveCamera(e);
        });
        document.addEventListener('mousemove', (e) => {
            if (this.dragging) this._moveCamera(e);
        });
        document.addEventListener('mouseup', () => { this.dragging = false; });
    }

    _moveCamera(e) {
        const rect = this.canvas.getBoundingClientRect();
        const campaign = StarAbyss.State.getCurrentCampaign();
        const mapW = campaign ? campaign.map.width : StarAbyss.Config.MAP.WIDTH;
        const mapH = campaign ? campaign.map.height : StarAbyss.Config.MAP.HEIGHT;

        // 将点击坐标映射到 canvas 内部 140x140 坐标系
        const scaleX = 140 / rect.width;
        const scaleY = 140 / rect.height;
        let x = (e.clientX - rect.left) * scaleX;
        let y = (e.clientY - rect.top) * scaleY;

        x = Math.max(0, Math.min(140, x));
        y = Math.max(0, Math.min(140, y));

        // 内部坐标 -> 世界坐标
        const worldX = (x / 140) * mapW;
        const worldY = (y / 140) * mapH;

        this.scene.cameras.main.centerOn(worldX, worldY);
    }

    update() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const campaign = StarAbyss.State.getCurrentCampaign();
        const mapW = campaign ? campaign.map.width : StarAbyss.Config.MAP.WIDTH;
        const mapH = campaign ? campaign.map.height : StarAbyss.Config.MAP.HEIGHT;
        const scaleX = 140 / mapW;
        const scaleY = 140 / mapH;

        ctx.clearRect(0, 0, 140, 140);

        ctx.fillStyle = '#00f0ff';
        this.scene.friendlyBuildings.getChildren().forEach(b => {
            ctx.fillRect(b.x * scaleX - 2, b.y * scaleY - 2, 5, 5);
        });

        ctx.fillStyle = '#00ff88';
        this.scene.friendlyUnits.getChildren().forEach(u => {
            ctx.fillRect(u.x * scaleX, u.y * scaleY, 3, 3);
        });

        ctx.fillStyle = '#ff2a6d';
        this.scene.enemyUnits.getChildren().forEach(e => {
            ctx.fillRect(e.x * scaleX, e.y * scaleY, 3, 3);
        });

        const cam = this.scene.cameras.main;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(cam.worldView.x * scaleX, cam.worldView.y * scaleY, cam.worldView.width * scaleX, cam.worldView.height * scaleY);

        // 区域
        if (this.scene.zoneSystem) {
            this.scene.zoneSystem.zones.forEach(z => {
                ctx.strokeStyle = z.owner === 'player' ? '#00ff88'
                                : z.owner === 'enemy'  ? '#ff2a6d'
                                : '#00f0ff';
                ctx.lineWidth = 1;
                if (z.shape === 'rect') {
                    ctx.strokeRect(
                        (z.x - z.w / 2) * scaleX,
                        (z.y - z.h / 2) * scaleY,
                        z.w * scaleX, z.h * scaleY
                    );
                } else {
                    ctx.beginPath();
                    ctx.arc(z.x * scaleX, z.y * scaleY, z.r * scaleX, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });
        }

        // 保护目标（信标、护盾发生器）
        ctx.fillStyle = '#ffb703';
        this.scene.friendlyBuildings.getChildren().forEach(b => {
            if (b.targetId) ctx.fillRect(b.x * scaleX - 3, b.y * scaleY - 3, 6, 6);
        });
        // 敌方关键建筑
        ctx.fillStyle = '#ff2a6d';
        this.scene.enemyUnits.getChildren().forEach(e => {
            if (e.isEnemyBuilding) ctx.fillRect(e.x * scaleX - 3, e.y * scaleY - 3, 6, 6);
        });
        // 车队
        if (this.scene.convoyUnits) {
            ctx.fillStyle = '#ffb703';
            this.scene.convoyUnits.getChildren().forEach(c => {
                if (c.active && c.hp > 0) ctx.fillRect(c.x * scaleX - 3, c.y * scaleY - 3, 6, 6);
            });
        }
    }
};