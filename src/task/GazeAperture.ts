import Phaser from 'phaser';

export class GazeAperture {
    private aperture: Phaser.GameObjects.Arc;
    private mask: Phaser.Display.Masks.GeometryMask;


    constructor(private scene: Phaser.Scene, private radius: number) {
        this.aperture = this.scene.add.circle(0, 0, this.radius, 0x000000).setVisible(false);
        this.mask = this.aperture.createGeometryMask();

        this.scene.cameras.main.setMask(this.mask)

        // Update the mask position on pointer move
        this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            this.updateAperturePosition(pointer.x, pointer.y);
        });
    }

    private updateAperturePosition(x: number, y: number) {
        this.aperture.setPosition(x, y)
    }

    setActive(active:boolean){
        active ? this.scene.cameras.main.setMask(this.mask) : this.scene.cameras.main.clearMask()
    }
}
