export class OverlayCamera extends Phaser.Cameras.Scene2D.Camera {
    private overlayObjects: Set<Phaser.GameObjects.GameObject>;
    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height)
        this.overlayObjects = new Set()
        this.setAlpha(0.25)
    }

    registerOverlayObjects(objects: Phaser.GameObjects.GameObject[]) {
        objects.forEach((o) => this.overlayObjects.add(o))
        this.updateOverlay()
    }

    deregisterOverlayObjects(objects: Phaser.GameObjects.GameObject[]) {
        objects.forEach((o) => this.overlayObjects.delete(o))
        this.updateOverlay()
    }

    updateOverlay() {
        let toIgnore: Phaser.GameObjects.GameObject[] = []        
        if (this.scene !== undefined) {            
            for (const child of this.scene.children.list) {
                if (!this.overlayObjects.has(child)) {
                    toIgnore.push(child)
                }
            }
        }
        this.ignore(toIgnore)
    }


}