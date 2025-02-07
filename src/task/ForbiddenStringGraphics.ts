import { EXTRA_OVERLAP_HEIGHT, FORBIDDEN_TARGET_SYMBOL_PAD, GOAL_ICON_ALPHA, ICON_SIZE, MAX_SYMBOL_SIZE, STATE_AREA_MARGIN, STATE_SUBPANEL_EXTRA_MARGIN, STATE_SYMBOL_HORIZONTAL_MARGIN, STATE_SYMBOL_PAD, STATE_SYMBOL_PAD_TARGET, STATE_SYMBOL_VERTICAL_MARGIN } from "../constants/GameConstants";
import { HideableItem } from "../ui/HideableItem";
import { OverlayCamera } from "./OverlayCamera";
import { Symbol } from "./StringTransformation";
import { SymbolFactory } from "./SymbolFactory";

export class ForbiddenStringGraphics implements HideableItem {

    private maxSymbolSize: number;
    private background: Phaser.GameObjects.NineSlice;
    private centredX: number;
    private centredY: number;
    private images: Phaser.GameObjects.Image[];
    private icon: Phaser.GameObjects.Image;
    private panelBorder: Phaser.GameObjects.NineSlice;

    constructor(private scene: Phaser.Scene, private forbiddenString: Symbol[], private forbiddenStringIsPrefix: boolean, private symbolFactory: SymbolFactory, private maxSymbols:integer, private x: number, private y: number, private width: number, private height: number, private overlayCamera: OverlayCamera) {

        const maxSymbolWidth = this.width / (maxSymbols)
        const maxSymbolHeight = this.height
        this.maxSymbolSize = Math.min(maxSymbolWidth, maxSymbolHeight, MAX_SYMBOL_SIZE)

        
        this.centredY = this.y + (this.height - (this.height - 2 * STATE_AREA_MARGIN)) / 2

        this.icon = this.scene.add.image(this.x + this.maxSymbolSize, this.centredY, "icon-warning").setOrigin(0).setDisplaySize(this.maxSymbolSize - FORBIDDEN_TARGET_SYMBOL_PAD, this.maxSymbolSize - FORBIDDEN_TARGET_SYMBOL_PAD).setAlpha(GOAL_ICON_ALPHA)
        this.centredX = this.icon.x + this.icon.displayWidth //this.x + this.maxSymbolSize + (this.width - (this.maxSymbolSize * effectiveStringLength)) / 2
        this.images = []
        this.createImages(this.forbiddenString)
        // this.panelBorder = this.scene.add.nineslice(this.x + STATE_AREA_MARGIN, this.y + 2 * STATE_AREA_MARGIN, "bg-area-outline", 0, 256, 256, 24, 24, 24, 24).setOrigin(0).setInteractive();
        // this.panelBorder.setSize(this.width - STATE_SUBPANEL_EXTRA_MARGIN - 2 * STATE_AREA_MARGIN, this.height -  STATE_AREA_MARGIN)
        // this.overlayCamera.registerOverlayObjects([this.icon, this.panelBorder])
    }

    animateStringShake() {
        [...this.images, this.icon].forEach((object) => {
            this.scene.tweens.add({
                targets: object,
                x: { value: object.x + 10, duration: 50, ease: 'Sine.easeInOut', yoyo: true, repeat: 5 },
                y: { value: object.y, duration: 50, ease: 'Sine.easeInOut', yoyo: true, repeat: 5 },
            });
        })
    }

    positionBelow(object: Phaser.GameObjects.GameObject) {
        //this.background.setBelow(object)
        return
    }

    private createImages(forbiddenString: Symbol[]) {
        forbiddenString.forEach((symbol, i) => {
            this.images.push(this.symbolFactory.createSymbolImage(this.scene, symbol, this.centredX + i * this.maxSymbolSize, this.centredY, this.maxSymbolSize - FORBIDDEN_TARGET_SYMBOL_PAD, true, GOAL_ICON_ALPHA))
        })
        console.log(this.forbiddenString)
        console.log(this.forbiddenString.length)
        console.log(this.forbiddenStringIsPrefix)
        if (this.forbiddenString.length > 0) {
            if (this.forbiddenStringIsPrefix) {
                const image = this.scene.add.image(this.centredX + forbiddenString.length * this.maxSymbolSize, this.centredY, "ellipsis-symbol").setOrigin(0).setAlpha(GOAL_ICON_ALPHA)
                image.setDisplaySize(this.maxSymbolSize - FORBIDDEN_TARGET_SYMBOL_PAD, this.maxSymbolSize - FORBIDDEN_TARGET_SYMBOL_PAD)
                this.images.push(image)
            }
        }
    }

    setVisible(visible: boolean) {
        this.images.forEach((img) => {
            img.setVisible(visible)
        })
        this.icon.setVisible(visible)
    }
}