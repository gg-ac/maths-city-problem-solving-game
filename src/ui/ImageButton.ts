import Phaser from 'phaser';

export class ImageButton extends Phaser.GameObjects.Image {
    private isOver: boolean = false;
    private isDown: boolean = false;
    private upTexture: string;
    private downTexture?: string;

    constructor(scene: Phaser.Scene, x: number, y: number, upTexture: string, downTexture?: string) {
        super(scene, x, y, upTexture);
        this.upTexture = upTexture;
        this.downTexture = downTexture;

        // Enable input on the image
        this.setInteractive();

        // Add event listeners for pointer events
        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);
        this.on('pointerdown', this.onPointerDown, this);
        this.on('pointerup', this.onPointerUp, this);
    }

    private onPointerOver(): void {
        this.isOver = true;
    }

    private onPointerOut(): void {
        this.isOver = false;
        this.setTexture(this.upTexture); // Reset to up texture
    }

    private onPointerDown(): void {
        this.isDown = true;
        if (this.downTexture) {
            this.setTexture(this.downTexture); // Change to down texture
        }
    }

    private onPointerUp(pointer: Phaser.Input.Pointer): void {
        if (this.isDown) {
            this.isDown = false;

            // Check if the pointer is still over the button
            if (this.isOver) {
                this.emit('clicked', pointer); // Emit a custom event
            }
            this.setTexture(this.upTexture); // Reset to up texture
        }
    }
}
