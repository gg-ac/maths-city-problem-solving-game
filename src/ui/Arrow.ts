import Phaser from 'phaser';

class Arrow extends Phaser.GameObjects.Graphics {
    private startX: number;
    private startY: number;
    private endX: number;
    private endY: number;
    private color: number;
    private headSize: number;
    private lineWidth: number; 
    private amplitude: number; // Amplitude of the back-and-forth movement
    private tween: Phaser.Tweens.Tween; // Tween for animation

    constructor(
        scene: Phaser.Scene,
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        color: number = 0xffffff,
        headSize: number = 10,
        lineWidth: number = 2
    ) {
        super(scene, { x: 0, y: 0 });
        this.scene = scene;
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.color = color;
        this.headSize = headSize;
        this.lineWidth = lineWidth;


        this.drawArrow();
        this.scene.add.existing(this);

        
        this.amplitude = 20
        this.createTween();
    }

    private createTween(): void {
        const angle = Phaser.Math.Angle.Between(this.startX, this.startY, this.endX, this.endY);
        const directionX = Math.cos(angle);
        const directionY = Math.sin(angle);

        // Create a tween that moves the arrow back and forth
        this.tween = this.scene.tweens.add({
            targets: this,
            x: this.x + directionX * this.amplitude,
            y: this.y + directionY * this.amplitude,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private drawArrow(): void {
        // Clear previous graphics
        this.clear();

        // Calculate the angle of the arrow
        const angle = Phaser.Math.Angle.Between(this.startX, this.startY, this.endX, this.endY);

        // Calculate the length of the line to ensure it ends just before the arrowhead
        const lineLength = Phaser.Math.Distance.Between(this.startX, this.startY, this.endX, this.endY) - this.headSize;

        // Calculate the end position of the line
        const lineEndX = this.startX + (lineLength - this.headSize + this.lineWidth) * Math.cos(angle);
        const lineEndY = this.startY + (lineLength - this.headSize + this.lineWidth) * Math.sin(angle);
        const headX = this.startX + lineLength * Math.cos(angle);
        const headY = this.startY + lineLength * Math.sin(angle);

        // Draw the line
        this.lineStyle(this.lineWidth, this.color, 1);
        this.beginPath();
        this.moveTo(this.startX, this.startY);
        this.lineTo(lineEndX, lineEndY);
        this.strokePath();

        // Draw the arrowhead
        this.drawArrowHead(headX, headY, angle);
    }

    private drawArrowHead(x: number, y: number, angle: number): void {
        const headLength = this.headSize; // Length of the arrow head
        const headAngle1 = angle + Phaser.Math.DegToRad(150); // Left side of the arrow head
        const headAngle2 = angle + Phaser.Math.DegToRad(-150); // Right side of the arrow head

        this.beginPath();
        this.moveTo(x, y);
        this.lineTo(x + headLength * Math.cos(headAngle1), y + headLength * Math.sin(headAngle1));
        this.lineTo(x + headLength * Math.cos(headAngle2), y + headLength * Math.sin(headAngle2));
        this.lineTo(x, y);
        this.fillStyle(this.color, 1);
        this.fillPath();
    }
}

export default Arrow;
