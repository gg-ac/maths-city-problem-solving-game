import Phaser from 'phaser';


function cloneGameObject(original: Phaser.GameObjects.Image | Phaser.GameObjects.NineSlice, scene: Phaser.Scene): Phaser.GameObjects.Image | Phaser.GameObjects.NineSlice {
    let clonedObject: Phaser.GameObjects.Image | Phaser.GameObjects.NineSlice;

    if (original instanceof Phaser.GameObjects.Image) {
        // Clone Image
        clonedObject = scene.add.image(original.x, original.y, original.texture.key);
    } else if (original instanceof Phaser.GameObjects.NineSlice) {
        // Clone NineSlice
        clonedObject = scene.add.nineslice(
            original.x,
            original.y,
            original.texture.key,
            0,
            original.width,
            original.height,
            original.leftWidth,
            original.rightWidth,
            original.topHeight,
            original.bottomHeight
        );
    } else {
        throw new Error("Unsupported GameObject type for cloning.");
    }

    // Copy common properties
    clonedObject.setOrigin(original.originX, original.originY);
    clonedObject.setScale(original.scaleX, original.scaleY);
    clonedObject.setAlpha(original.alpha);
    clonedObject.setRotation(original.rotation);

    return clonedObject;
}

class ShineEffect {
    private scene: Phaser.Scene;
    private stripe: Phaser.GameObjects.Graphics | null;
    private targetObject: Phaser.GameObjects.Image | Phaser.GameObjects.NineSlice;
    private mask: Phaser.Display.Masks.BitmapMask | null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public trigger(target: Phaser.GameObjects.Image | Phaser.GameObjects.NineSlice, duration: number = 1000) {
        this.stripe = this.scene.add.graphics();
        this.stripe.fillStyle(0xffffff, 1);
        this.targetObject = target;

        // Clear previous graphics
        this.stripe.setToTop()
        this.stripe.clear();

        // Create a texture mask based on the target object's texture
        const maskTexture = cloneGameObject(target, this.scene).setVisible(false)

        // Create a mask from the texture
        this.mask = this.scene.add.bitmapMask(maskTexture, target.x, target.y);


        // Draw the stripe
        const stripeWidth = target.width / 5; // Width of the stripe
        const stripeHeight = target.height * 2; // Height of the stripe

        const x = target.x
        const y = target.y

        // Draw the stripe
        this.stripe.fillStyle(0xffffff, 1)
        this.stripe.fillRect(x - stripeHeight, y, stripeWidth, stripeHeight);

        this.stripe.setRotation(0.2)

        this.stripe.setMask(this.mask);

        // Create a tween to animate the stripe
        this.scene.tweens.add({
            targets: this.stripe,
            x: x + target.width + 2 * stripeHeight, // Move the stripe across
            duration: duration, // Duration of the animation
            ease: 'Power2',
            onComplete: () => {
                // Clear the stripe after animation
                if (this.stripe != null) {
                    this.stripe.clear();
                    this.stripe = null
                    this.mask = null
                }
            }
        });
    }
}

export default ShineEffect;
