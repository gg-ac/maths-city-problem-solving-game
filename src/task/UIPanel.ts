import { BUTTON_PANEL_SIDE_MARGIN, UI_PANEL_SIDE_MARGIN, UI_PANEL_SIDE_PAD } from "../constants/GameConstants";
import { HideableItem } from "../ui/HideableItem";
import { ImageButton } from "../ui/ImageButton";
import { DigitalPanel } from "../ui/NumberPanel";
import { Odometer } from "../ui/Odomeret";
import { OverlayCamera } from "./OverlayCamera";

export class UIPanelGraphics implements HideableItem {
    private maxSymbolSize: number;
    private background: Phaser.GameObjects.NineSlice;
    private outline: Phaser.GameObjects.NineSlice;
    private undoButton: Phaser.GameObjects.Image;
    private resetButton: Phaser.GameObjects.Image;
    private timePanel: DigitalPanel;
    private stagePanel: DigitalPanel;
    private interactionDisabled: boolean;

    constructor(private scene: Phaser.Scene, private x: number, private y: number, private width: number, private height: number, private onUndoPress: () => void, private onResetPress: () => void, private overlayCamera: OverlayCamera) {
        this.interactionDisabled = false

        const clippedWidth = this.width
        // this.background = this.scene.add.nineslice(this.x + BUTTON_PANEL_SIDE_MARGIN, this.y, "bg-area-l", 0, 256, 256, 24, 24, 24, 24).setOrigin(0);
        // this.background.setSize(clippedWidth, this.height)

        // this.outline = this.scene.add.nineslice(this.x + BUTTON_PANEL_SIDE_MARGIN, this.y, "bg-area-outline", 0, 256, 256, 24, 24, 24, 24).setOrigin(0);
        // this.outline.setSize(clippedWidth, this.height)
        // this.overlayCamera.registerOverlayObjects([this.outline])

        const resetButtonSize = this.height - UI_PANEL_SIDE_PAD * 2

        this.stagePanel = new DigitalPanel(this.scene, "000", this.x + BUTTON_PANEL_SIDE_MARGIN + 0.01 * clippedWidth, this.y + this.height / 2, 175, 80)
        this.timePanel = new DigitalPanel(this.scene, "000", this.x + BUTTON_PANEL_SIDE_MARGIN + 0.33 * clippedWidth, this.y + this.height / 2, 175, 80)
        //this.odometer.setValue(6)

        this.undoButton = new ImageButton(this.scene, this.x + BUTTON_PANEL_SIDE_MARGIN + 0.72 * clippedWidth, this.y + this.height / 2, "button-undo-up", "button-undo-down")
        this.undoButton.setDisplaySize(resetButtonSize, resetButtonSize)
        this.undoButton.on('clicked', () => this.onUndo())
        this.scene.add.existing(this.undoButton)

        this.resetButton = new ImageButton(this.scene, this.x + BUTTON_PANEL_SIDE_MARGIN + 0.95 * clippedWidth, this.y + this.height / 2, "button-reset-up", "button-reset-down")
        this.resetButton.setDisplaySize(resetButtonSize, resetButtonSize)
        this.resetButton.on('clicked', () => this.onReset())
        this.scene.add.existing(this.resetButton)
    }

    private onUndo(){
        if (!this.interactionDisabled) { 
            this.onUndoPress()
        } 
    }

    private onReset(){
        if (!this.interactionDisabled) { 
            this.onResetPress()
        } 
    }
    setVisible(visible: boolean, disableInteractive: boolean): void {
        this.stagePanel.setVisible(visible)
        this.timePanel.setVisible(visible)
        if (disableInteractive) {
            this.interactionDisabled = true
        } else {
            this.interactionDisabled = false
        }
    }

    updateTimeRemaining(value: integer) {
        this.timePanel.setValue(`${value}`)
    }

    updateStageText(currentStage: integer) {
        this.stagePanel.setValue(`${currentStage}`)
    }
}