import { EXTRA_OVERLAP_HEIGHT, ICON_SIZE, MAX_SYMBOL_SIZE, OVERLAY_ALPHA, STATE_AREA_MARGIN, STATE_SUBPANEL_EXTRA_MARGIN, STATE_SYMBOL_HORIZONTAL_MARGIN, STATE_SYMBOL_PAD, STATE_SYMBOL_PAD_TARGET } from "../constants/GameConstants";
import { OverlayCamera } from "./OverlayCamera";
import { Symbol } from "./StringTransformation";
import { SymbolFactory } from "./SymbolFactory";

export class TargetStringGraphics{

    private maxSymbolSize: number;
    private background: Phaser.GameObjects.NineSlice;
    private centredY: number;
    private centredX: number;
    private images: Phaser.GameObjects.Image[];
    private icon: Phaser.GameObjects.Image;
    private panelBorder: Phaser.GameObjects.NineSlice;

    constructor(private scene:Phaser.Scene, private targetString:Symbol[], private symbolFactory:SymbolFactory, private x:number, private y:number, private width:number, private height:number, private overlayCamera:OverlayCamera){

        const mainAreaWidth = this.width - ICON_SIZE - STATE_SUBPANEL_EXTRA_MARGIN

        this.background = this.scene.add.nineslice(this.x + STATE_AREA_MARGIN, this.y - STATE_AREA_MARGIN, "bg-area-m", 0, 256, 256, 24, 24, 24, 24).setOrigin(0).setInteractive();
        this.background.setSize(this.width - STATE_SUBPANEL_EXTRA_MARGIN - 2 * STATE_AREA_MARGIN, this.height - STATE_AREA_MARGIN)


        const maxSymbolWidth = (mainAreaWidth - (targetString.length + 1) * STATE_SYMBOL_HORIZONTAL_MARGIN) / targetString.length
        const maxSymbolHeight = this.height
        this.maxSymbolSize = Math.min(maxSymbolWidth, maxSymbolHeight, MAX_SYMBOL_SIZE)

        this.centredX = this.x + ICON_SIZE + (mainAreaWidth - ((this.maxSymbolSize + STATE_SYMBOL_HORIZONTAL_MARGIN) * targetString.length)) / 2
        this.centredY = this.y + (this.height - (this.height - 2 * STATE_AREA_MARGIN)) / 2

        this.images = []
        this.createImages(this.targetString)

        this.icon = this.scene.add.image(this.x  + ICON_SIZE, this.y - STATE_AREA_MARGIN - ICON_SIZE/9 + this.height / 2, "icon-target").setOrigin(0.5).setDisplaySize(ICON_SIZE, ICON_SIZE)
    
        this.panelBorder = this.scene.add.nineslice(this.x + STATE_AREA_MARGIN, this.y - STATE_AREA_MARGIN, "bg-area-outline", 0, 256, 256, 24, 24, 24, 24).setOrigin(0).setInteractive();
        this.panelBorder.setSize(this.width - STATE_SUBPANEL_EXTRA_MARGIN - 2 * STATE_AREA_MARGIN, this.height - STATE_AREA_MARGIN)

        this.overlayCamera.registerOverlayObjects([this.icon, this.panelBorder])
    }

    positionBelow(object:Phaser.GameObjects.GameObject){
        this.background.setBelow(object)
    }

    jumpSymbols() {
        // Jump animation for each symbol with a delay
        [this.icon, ...this.images].forEach((symbol, i) => {
            this.scene.tweens.add({
                targets: symbol,
                y: symbol.y - 40,
                duration: 200,
                ease: 'Power1',
                yoyo: true,
                repeat: 0,
                delay: i * 100
            });
        });
    }

    private createImages(targetString: Symbol[]) {
        targetString.forEach((symbol, i) => {
            this.images.push(this.symbolFactory.createSymbolImage(this.scene, symbol, this.centredX + i * (this.maxSymbolSize + STATE_SYMBOL_HORIZONTAL_MARGIN) + STATE_SYMBOL_PAD_TARGET, this.centredY + STATE_SYMBOL_PAD_TARGET, this.maxSymbolSize - (2 * STATE_SYMBOL_PAD_TARGET), true))
        })
    }
}