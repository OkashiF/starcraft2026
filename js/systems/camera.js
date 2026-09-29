// js/systems/camera.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.CameraSystem = class {
    constructor(scene) {
        this.scene = scene;
        this.speed = 18;

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
    }

    update(_time, _delta) {
        const cam = this.scene.cameras.main;
        if (this.cursors.left.isDown || this.wasd.left.isDown) cam.scrollX -= this.speed;
        if (this.cursors.right.isDown || this.wasd.right.isDown) cam.scrollX += this.speed;
        if (this.cursors.up.isDown || this.wasd.up.isDown) cam.scrollY -= this.speed;
        if (this.cursors.down.isDown || this.wasd.down.isDown) cam.scrollY += this.speed;
    }
};