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

        // 13. 护盾发生器 / 要塞核心
        g.fillStyle(0x0a1526); g.fillRoundedRect(0, 0, 70, 70, 10);
        g.lineStyle(3, 0x00f0ff); g.strokeRoundedRect(0, 0, 70, 70, 10);
        g.fillStyle(0x00f0ff, 0.25); g.fillCircle(35, 35, 24);
        g.lineStyle(2, 0x00f0ff); g.strokeCircle(35, 35, 24);
        g.fillStyle(0xffffff); g.fillCircle(35, 35, 8);
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
        g.fillStyle(0x00ff88); g.fillRect(32, 12, 6, 46);
        g.fillStyle(0xffffff); g.fillCircle(35, 20, 8);
        g.fillStyle(0x00ff88, 0.4); g.fillCircle(35, 20, 14);
        g.generateTexture('tex_beacon', 70, 70); g.clear();

        // ===== 第 1 批新增纹理 =====

        // 16. 火箭兵
        g.fillStyle(0x0a3a6a); g.fillRoundedRect(4, 4, 24, 24, 6);
        g.fillStyle(0x001155); g.fillCircle(16, 16, 7);
        g.fillStyle(0xffb703); g.fillRect(16, 12, 6, 8);
        g.fillStyle(0x333333); g.fillRoundedRect(22, 12, 18, 10, 3);
        g.fillStyle(0xff5500); g.fillRect(38, 14, 4, 6);
        g.generateTexture('tex_rocketeer', 44, 32); g.clear();

        // 17. 医疗兵
        g.fillStyle(0xdddddd); g.fillRoundedRect(4, 4, 24, 24, 6);
        g.fillStyle(0x004488); g.fillCircle(16, 16, 7);
        g.fillStyle(0xff2a6d); g.fillRect(13, 8, 6, 16);
        g.fillRect(8, 13, 16, 6);
        g.generateTexture('tex_medic', 32, 32); g.clear();

        // 18. 工程师
        g.fillStyle(0xcc8800); g.fillRoundedRect(4, 4, 24, 24, 6);
        g.fillStyle(0x442200); g.fillCircle(16, 16, 7);
        g.fillStyle(0x00f0ff); g.fillRect(12, 12, 8, 8);
        g.fillStyle(0x666666); g.fillRect(24, 20, 14, 4);
        g.generateTexture('tex_engineer', 40, 32); g.clear();

        // 19. 侦察无人机
        g.fillStyle(0x88ccff); g.fillCircle(16, 16, 10);
        g.fillStyle(0x005577); g.fillCircle(16, 16, 6);
        g.fillStyle(0x00f0ff); g.fillCircle(16, 16, 3);
        g.lineStyle(2, 0x88ccff);
        g.beginPath(); g.moveTo(4, 6); g.lineTo(16, 16); g.lineTo(28, 6); g.strokePath();
        g.beginPath(); g.moveTo(4, 26); g.lineTo(16, 16); g.lineTo(28, 26); g.strokePath();
        g.generateTexture('tex_drone', 32, 32); g.clear();

        // 20. 盾卫
        g.fillStyle(0x223344); g.fillRoundedRect(4, 4, 28, 28, 6);
        g.fillStyle(0x001155); g.fillCircle(18, 18, 8);
        g.fillStyle(0x88bbdd); g.fillRoundedRect(28, 2, 12, 32, 4);
        g.lineStyle(2, 0x00f0ff); g.strokeRoundedRect(28, 2, 12, 32, 4);
        g.generateTexture('tex_shieldman', 42, 36); g.clear();

        // 21. 狙击手
        g.fillStyle(0x223322); g.fillRoundedRect(4, 4, 24, 24, 6);
        g.fillStyle(0x001155); g.fillCircle(16, 16, 7);
        g.fillStyle(0x88ff88); g.fillRect(16, 12, 4, 8);
        g.fillStyle(0x222222); g.fillRect(24, 14, 28, 4);
        g.fillStyle(0xff2200); g.fillCircle(52, 16, 3);
        g.generateTexture('tex_sniper', 56, 32); g.clear();

        // 22. 火箭弹
        g.fillStyle(0xffb703); g.fillRoundedRect(0, 0, 16, 6, 3);
        g.fillStyle(0xff5500); g.fillTriangle(16, 0, 16, 6, 22, 3);
        g.fillStyle(0xffffff); g.fillRect(2, 2, 4, 2);
        g.generateTexture('tex_rocket', 22, 6); g.clear();

        // 23. 酸液弹
        g.fillStyle(0x88ff00); g.fillCircle(8, 8, 8);
        g.fillStyle(0xccff88); g.fillCircle(8, 8, 4);
        g.generateTexture('tex_acid', 16, 16); g.clear();

        // 24. 火焰塔
        g.fillStyle(0x2a1515); g.fillCircle(20, 20, 18);
        g.lineStyle(4, 0xff5500); g.strokeCircle(20, 20, 18);
        g.fillStyle(0xff5500); g.fillTriangle(8, 12, 8, 28, 32, 20);
        g.fillStyle(0xffaa00); g.fillCircle(20, 20, 5);
        g.generateTexture('tex_flame_turret', 40, 40); g.clear();

        // 25. 狙击塔
        g.fillStyle(0x1a2a22); g.fillCircle(20, 20, 18);
        g.lineStyle(4, 0x88ff88); g.strokeCircle(20, 20, 18);
        g.fillStyle(0x222222); g.fillRect(18, 10, 22, 4);
        g.fillStyle(0xff2200); g.fillCircle(40, 12, 3);
        g.generateTexture('tex_sniper_turret', 44, 40); g.clear();

        // 26. 维修站
        g.fillStyle(0x112233); g.fillRoundedRect(0, 0, 50, 50, 8);
        g.lineStyle(3, 0xffb703); g.strokeRoundedRect(0, 0, 50, 50, 8);
        g.fillStyle(0xffb703); g.fillRect(20, 10, 10, 30);
        g.fillRect(10, 20, 30, 10);
        g.generateTexture('tex_repair_station', 50, 50); g.clear();

        // 27. 雷达站
        g.fillStyle(0x112233); g.fillRoundedRect(0, 0, 50, 50, 8);
        g.lineStyle(3, 0x00f0ff); g.strokeRoundedRect(0, 0, 50, 50, 8);
        g.lineStyle(2, 0x00f0ff);
        g.strokeCircle(25, 25, 16);
        g.strokeCircle(25, 25, 10);
        g.fillStyle(0x00f0ff); g.fillCircle(25, 25, 3);
        g.generateTexture('tex_radar_station', 50, 50); g.clear();

        // 28. 障碍墙
        g.fillStyle(0x223344); g.fillRect(0, 0, 40, 40);
        g.lineStyle(2, 0x445566); g.strokeRect(0, 0, 40, 40);
        g.lineStyle(1, 0x667788);
        g.beginPath();
        g.moveTo(0, 20); g.lineTo(40, 20);
        g.moveTo(20, 0); g.lineTo(20, 40);
        g.strokePath();
        g.generateTexture('tex_wall', 40, 40); g.clear();

        // 29. 裂解虫
        g.fillStyle(0xaa1133); g.fillCircle(14, 14, 12);
        g.fillStyle(0xff5500); g.fillCircle(14, 14, 6);
        g.fillStyle(0xffdd00); g.fillCircle(14, 14, 3);
        g.generateTexture('tex_reaper', 28, 28); g.clear();

        // 30. 酸蚀者
        g.fillStyle(0x223311); g.fillRoundedRect(4, 10, 28, 20, 8);
        g.fillStyle(0x88ff00); g.fillCircle(20, 20, 8);
        g.fillStyle(0xccff88); g.fillCircle(20, 20, 4);
        g.fillStyle(0x88ff00); g.fillCircle(8, 12, 2);
        g.fillCircle(8, 28, 2);
        g.generateTexture('tex_acidspitter', 40, 40); g.clear();

        // 31. 晶刺兽
        g.fillStyle(0x334466); g.fillEllipse(24, 22, 40, 32);
        g.fillStyle(0x88bbff);
        g.fillTriangle(24, 0, 14, 16, 34, 16);
        g.fillTriangle(24, 44, 14, 28, 34, 28);
        g.fillTriangle(0, 22, 16, 14, 16, 30);
        g.fillTriangle(48, 22, 32, 14, 32, 30);
        g.fillStyle(0x00f0ff); g.fillCircle(24, 22, 4);
        g.generateTexture('tex_crystalspike', 48, 44); g.clear();

        // 32. 飞刺
        g.fillStyle(0x6622aa); g.fillEllipse(18, 14, 30, 14);
        g.fillStyle(0xaa88ff);
        g.fillTriangle(0, 14, 14, 8, 14, 20);
        g.fillTriangle(36, 14, 22, 8, 22, 20);
        g.fillStyle(0xff2200); g.fillCircle(18, 12, 2);
        g.generateTexture('tex_flier', 36, 28); g.clear();

        // 33. 虫巢
        g.fillStyle(0x330011); g.fillEllipse(40, 40, 70, 60);
        g.fillStyle(0x660022); g.fillCircle(40, 40, 26);
        g.fillStyle(0xaa1133); g.fillCircle(40, 40, 16);
        g.fillStyle(0xff2a6d); g.fillCircle(40, 40, 8);
        g.fillStyle(0x00ff00); g.fillCircle(28, 28, 3); g.fillCircle(52, 28, 3);
        g.fillCircle(28, 52, 3); g.fillCircle(52, 52, 3);
        g.generateTexture('tex_hive', 80, 80); g.clear();

        // 34. 地刺
        g.fillStyle(0x330011); g.fillRect(8, 24, 24, 12);
        g.fillStyle(0xaa1133);
        g.fillTriangle(20, 0, 8, 30, 32, 30);
        g.fillStyle(0xff2a6d); g.fillTriangle(20, 8, 14, 28, 26, 28);
        g.generateTexture('tex_spike', 40, 40); g.clear();

        // 35. 孢子炮
        g.fillStyle(0x223311); g.fillCircle(25, 25, 22);
        g.lineStyle(3, 0x88ff00); g.strokeCircle(25, 25, 22);
        g.fillStyle(0x88ff00); g.fillCircle(25, 25, 12);
        g.fillStyle(0xccff88); g.fillCircle(25, 25, 5);
        g.generateTexture('tex_spore', 50, 50); g.clear();

        // 36. 地雷
        g.fillStyle(0x222222); g.fillCircle(10, 10, 9);
        g.fillStyle(0xff2200); g.fillCircle(10, 10, 4);
        g.generateTexture('tex_mine', 20, 20); g.clear();

        g.destroy();
    },
};