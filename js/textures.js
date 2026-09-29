// js/textures.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.Textures = {
    generate(scene) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });

        // 0. 通用粒子
        g.fillStyle(0xffffff, 1); g.fillCircle(8, 8, 8);
        g.fillStyle(0xffffff, 0.5); g.fillCircle(8, 8, 12);
        g.generateTexture('tex_particle', 24, 24); g.clear();

        // 1. 指挥中心
        g.fillStyle(0x0a1526); g.fillRoundedRect(0, 0, 120, 120, 16);
        g.lineStyle(4, 0x004488); g.strokeRoundedRect(0, 0, 120, 120, 16);
        g.fillStyle(0x112244); g.fillRect(20, 20, 80, 80);
        g.lineStyle(2, 0x00f0ff); g.strokeRect(20, 20, 80, 80);
        g.fillStyle(0x00f0ff, 0.2); g.fillCircle(60, 60, 30);
        g.fillStyle(0x00f0ff); g.fillCircle(60, 60, 15);
        g.fillStyle(0xffb703); g.fillRect(55, 10, 10, 10);
        g.generateTexture('tex_base', 120, 120); g.clear();

        // 2. 补给电站
        g.fillStyle(0x112233); g.fillRoundedRect(0, 0, 50, 50, 8);
        g.lineStyle(3, 0x445566); g.strokeRoundedRect(0, 0, 50, 50, 8);
        g.fillStyle(0x00ff88, 0.4); g.fillRect(10, 10, 30, 30);
        g.fillStyle(0x00ff88); g.fillCircle(25, 25, 8);
        g.lineStyle(2, 0x00ff88);
        g.beginPath(); g.moveTo(25, 5); g.lineTo(25, 45); g.moveTo(5, 25); g.lineTo(45, 25); g.strokePath();
        g.generateTexture('tex_depot', 50, 50); g.clear();

        // 3. 自动炮塔
        g.fillStyle(0x222222); g.fillCircle(20, 20, 18);
        g.lineStyle(4, 0x444444); g.strokeCircle(20, 20, 18);
        g.fillStyle(0xffb703); g.fillTriangle(10, 10, 10, 30, 30, 20);
        g.fillStyle(0x666666); g.fillRect(20, 10, 18, 4);
        g.fillRect(20, 26, 18, 4);
        g.generateTexture('tex_turret', 40, 40); g.clear();

        // 4. 陆战队
        g.fillStyle(0x0044ff); g.fillRoundedRect(4, 4, 24, 24, 6);
        g.fillStyle(0x001155); g.fillCircle(16, 16, 8);
        g.fillStyle(0xffb703); g.fillRect(16, 12, 6, 8);
        g.fillStyle(0x888888); g.fillRect(22, 20, 14, 4);
        g.generateTexture('tex_marine', 36, 32); g.clear();

        // 5. 火蝠
        g.fillStyle(0xff3300); g.fillRoundedRect(4, 2, 24, 28, 8);
        g.fillStyle(0x550000); g.fillCircle(16, 16, 10);
        g.fillStyle(0x00f0ff); g.fillRect(16, 12, 6, 8);
        g.fillStyle(0x333333); g.fillRect(24, 6, 12, 6);
        g.fillRect(24, 20, 12, 6);
        g.generateTexture('tex_firebat', 40, 32); g.clear();

        // 6. 幽灵
        g.fillStyle(0x331144); g.fillTriangle(4, 4, 4, 28, 24, 16);
        g.fillStyle(0x111111); g.fillCircle(16, 16, 6);
        g.fillStyle(0xff0000); g.fillCircle(18, 16, 2);
        g.fillStyle(0x444444); g.fillRect(16, 20, 24, 2);
        g.generateTexture('tex_ghost', 40, 32); g.clear();

        // 7. 攻城坦克
        g.fillStyle(0x222222); g.fillRoundedRect(0, 0, 40, 12, 4);
        g.fillRoundedRect(0, 32, 40, 12, 4);
        g.fillStyle(0x445566); g.fillRoundedRect(6, 8, 32, 28, 4);
        g.fillStyle(0x334455); g.fillCircle(24, 22, 12);
        g.fillStyle(0x00f0ff); g.fillRect(24, 18, 24, 8);
        g.generateTexture('tex_tank', 48, 44); g.clear();

        // 8. 迅猛虫
        g.fillStyle(0x881122);
        g.beginPath(); g.moveTo(8, 8); g.lineTo(28, 16); g.lineTo(8, 24); g.fill();
        g.fillStyle(0xff2a6d); g.fillCircle(12, 16, 6);
        g.fillStyle(0x00ff00); g.fillCircle(16, 12, 2); g.fillCircle(16, 20, 2);
        g.generateTexture('tex_zergling', 32, 32); g.clear();

        // 9. 刺蛇
        g.fillStyle(0x550011); g.fillRoundedRect(4, 12, 24, 16, 8);
        g.fillStyle(0xff2a6d);
        g.fillTriangle(16, 12, 36, 4, 28, 16);
        g.fillTriangle(16, 28, 36, 36, 28, 24);
        g.fillStyle(0x00ff00); g.fillCircle(20, 12, 2); g.fillCircle(20, 28, 2);
        g.generateTexture('tex_hydralisk', 40, 40); g.clear();

        // 10. 噬星巨兽
        g.fillStyle(0x330011); g.fillEllipse(37.5, 30, 50, 40);
        g.fillStyle(0x880022); g.fillRoundedRect(15, 10, 40, 40, 12);
        g.fillStyle(0xdd0033);
        g.beginPath(); g.moveTo(40, 15); g.lineTo(75, 0); g.lineTo(55, 20); g.fill();
        g.beginPath(); g.moveTo(40, 45); g.lineTo(75, 60); g.lineTo(55, 40); g.fill();
        g.fillStyle(0x00ff00); g.fillCircle(50, 20, 3); g.fillCircle(50, 40, 3);
        g.generateTexture('tex_ultralisk', 75, 60); g.clear();

        // 11. 战略据点
        g.fillStyle(0x0a1526); g.fillCircle(40, 40, 38);
        g.lineStyle(3, 0x00f0ff); g.strokeCircle(40, 40, 38);
        g.fillStyle(0x00f0ff, 0.2); g.fillCircle(40, 40, 30);
        g.lineStyle(2, 0x00f0ff);
        g.beginPath(); g.moveTo(40, 40); g.lineTo(70, 10); g.strokePath();
        g.fillStyle(0xffffff); g.fillCircle(40, 40, 6);
        g.generateTexture('tex_node_radar', 80, 80); g.clear();

        // 12. 弹药 / 火焰
        g.fillStyle(0xffdd00); g.fillRoundedRect(0, 0, 12, 4, 2);
        g.fillStyle(0xffffff); g.fillRect(8, 1, 4, 2);
        g.generateTexture('tex_bullet', 12, 4); g.clear();

        g.fillStyle(0xff5500); g.fillCircle(12, 12, 12);
        g.fillStyle(0xffaa00); g.fillCircle(12, 12, 6);
        g.generateTexture('tex_flame', 24, 24); g.clear();

        // ===== 新增纹理 =====

        // 13. 护盾发生器 / 要塞核心（通用菱形能量体）
        g.fillStyle(0x0a1526); g.fillRoundedRect(0, 0, 70, 70, 10);
        g.lineStyle(3, 0x00f0ff); g.strokeRoundedRect(0, 0, 70, 70, 10);
        g.fillStyle(0x00f0ff, 0.25); g.fillCircle(35, 35, 24);
        g.lineStyle(2, 0x00f0ff); g.strokeCircle(35, 35, 24);
        g.fillStyle(0xffffff); g.fillCircle(35, 35, 8);
        // 四角能量节点
        g.fillStyle(0x00f0ff);
        g.fillCircle(10, 10, 4); g.fillCircle(60, 10, 4);
        g.fillCircle(10, 60, 4); g.fillCircle(60, 60, 4);
        g.generateTexture('tex_shield_gen', 70, 70); g.clear();

        // 14. 难民运输车
        g.fillStyle(0x222222); g.fillRoundedRect(2, 8, 46, 34, 6);
        g.fillStyle(0xffb703); g.fillRect(6, 12, 12, 26);
        g.fillStyle(0x112233); g.fillRect(22, 14, 22, 10);
        g.fillStyle(0x112233); g.fillRect(22, 28, 22, 10);
        g.fillStyle(0x00ff88); g.fillRect(2, 16, 3, 18);
        g.generateTexture('tex_convoy', 50, 50); g.clear();

        // 15. 方舟信标
        g.fillStyle(0x0a1526); g.fillRoundedRect(0, 0, 70, 70, 10);
        g.lineStyle(3, 0x00ff88); g.strokeRoundedRect(0, 0, 70, 70, 10);
        g.fillStyle(0x00ff88, 0.25); g.fillCircle(35, 35, 26);
        g.lineStyle(2, 0x00ff88); g.strokeCircle(35, 35, 26);
        // 中央灯塔
        g.fillStyle(0x00ff88); g.fillRect(32, 12, 6, 46);
        g.fillStyle(0xffffff); g.fillCircle(35, 20, 8);
        g.fillStyle(0x00ff88, 0.4); g.fillCircle(35, 20, 14);
        g.generateTexture('tex_beacon', 70, 70); g.clear();

        g.destroy();
    },
};