import Phaser from 'phaser';
import { HideableItem } from './HideableItem';

export class TriangleButton extends Phaser.GameObjects.Graphics implements HideableItem {
    private isRightPointing: boolean;
    private originalScale: number;
    private growShrinkTween: Phaser.Tweens.Tween;
    private enabled: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, private size: number, isRightPointing: boolean, private onPress: () => void) {
        super(scene, { x, y });
        this.enabled = true
        this.isRightPointing = isRightPointing;
        this.originalScale = 1;

        // Draw the triangle
        this.drawTriangle(1);

        // Add the button to the scene
        scene.add.existing(this);

        // Set interactive
        this.setInteractive(new Phaser.Geom.Rectangle(-50, -50, 100, 100), Phaser.Geom.Rectangle.Contains);
        this.on(Phaser.Input.Events.POINTER_DOWN, this.onButtonClicked)

        // Start the grow/shrink animation
        this.startGrowShrinkAnimation();
    }

    public setVisible(visible: boolean): this {
        if (visible) {
            this.enable()
        } else {
            this.disable()
            this.clear()
        }
        return this
    }

    public disable() {
        this.enabled = false
        this.drawTriangle(0.5);
        this.growShrinkTween.pause()
    }

    public enable() {
        this.enabled = true
        this.drawTriangle(1);
        this.growShrinkTween.resume()
    }

    private onButtonClicked() {
        if (this.enabled) {
            this.onPress()
        }
    }

    private drawTriangle(alpha: number) {
        this.clear();

        const triangle = new Phaser.Geom.Triangle();
        if (this.isRightPointing) {
            triangle.setTo(-this.size / 2, -this.size / 2, this.size / 2, 0, -this.size / 2, this.size / 2);
        } else {
            triangle.setTo(-this.size / 2, 0, this.size / 2, -this.size / 2, this.size / 2, this.size / 2);
        }
        this.fillStyle(0xffffff, alpha);
        this.fillTriangle(triangle.x1, triangle.y1, triangle.x2, triangle.y2, triangle.x3, triangle.y3);
    }

    private startGrowShrinkAnimation() {
        this.growShrinkTween = this.scene.tweens.add({
            targets: this,
            scaleX: { from: 0.8, to: 1, duration: 750, yoyo: true, repeat: -1 },
            scaleY: { from: 0.8, to: 1, duration: 750, yoyo: true, repeat: -1 },
            ease: "Sine.easeInOut"
        });
    }

    public stopAnimation() {
        if (this.growShrinkTween) {
            this.growShrinkTween.stop();
        }
    }
}
