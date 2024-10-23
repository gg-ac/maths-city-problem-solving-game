import { UI_PANEL_SIDE_MARGIN, UI_PANEL_SIDE_PAD } from "../constants/GameConstants";
import { OverlayCamera } from "./OverlayCamera";

export class UIPanelGraphics {
    private maxSymbolSize: number;
    private background: Phaser.GameObjects.NineSlice;
    private outline: Phaser.GameObjects.NineSlice;
    private undoButton: Phaser.GameObjects.Image;

    constructor(private scene: Phaser.Scene, private x: number, private y: number, private width: number, private height: number, private onUndoPress: () => void, private overlayCamera:OverlayCamera) {
        const clippedWidth = this.width - 2 * UI_PANEL_SIDE_MARGIN
        this.background = this.scene.add.nineslice(this.x + UI_PANEL_SIDE_MARGIN, this.y, "bg-area-l", 0, 256, 256, 24, 24, 24, 24).setOrigin(0);
        this.background.setSize(clippedWidth, this.height)

        this.outline = this.scene.add.nineslice(this.x + UI_PANEL_SIDE_MARGIN, this.y, "bg-area-outline", 0, 256, 256, 24, 24, 24, 24).setOrigin(0);
        this.outline.setSize(clippedWidth, this.height)
        this.overlayCamera.registerOverlayObjects([this.outline])

        const resetButtonSize = this.height - UI_PANEL_SIDE_PAD * 2

        this.undoButton = this.scene.add.image(this.x + UI_PANEL_SIDE_MARGIN + clippedWidth/2, this.y + this.height/2, "icon-undo").setInteractive()
        this.undoButton.setDisplaySize(resetButtonSize, resetButtonSize)
        this.undoButton.on(Phaser.Input.Events.POINTER_DOWN, this.onUndoPress)
    }
}