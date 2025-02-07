import { EXTRA_OVERLAP_HEIGHT, FORBIDDEN_TARGET_SYMBOL_PAD, GOAL_ICON_ALPHA, ICON_SIZE, MAX_SYMBOL_SIZE, OVERLAY_ALPHA, STATE_AREA_MARGIN, STATE_SUBPANEL_EXTRA_MARGIN, STATE_SYMBOL_HORIZONTAL_MARGIN, STATE_SYMBOL_PAD, STATE_SYMBOL_PAD_TARGET } from "../constants/GameConstants";
import { HideableItem } from "../ui/HideableItem";
import { OverlayCamera } from "./OverlayCamera";
import { Symbol } from "./StringTransformation";
import { SymbolFactory } from "./SymbolFactory";

export class TargetStringGraphics implements HideableItem{

    private maxSymbolSize: number;
    private background: Phaser.GameObjects.NineSlice;
    private centredY: number;
    private centredX: number;
    private images: Phaser.GameObjects.Image[];
    private icon: Phaser.GameObjects.Image;
    private panelBorder: Phaser.GameObjects.NineSlice;

    constructor(private scene:Phaser.Scene, private targetString:Symbol[], private symbolFactory:SymbolFactory, maxSymbols:integer, private x:number, private y:number, private width:number, private height:number, private overlayCamera:OverlayCamera){

       
        const maxSymbolWidth = this.width / (maxSymbols)
        const maxSymbolHeight = this.height
        this.maxSymbolSize = Math.min(maxSymbolWidth, maxSymbolHeight, MAX_SYMBOL_SIZE)

        this.centredY = this.y + (this.height - (this.height - 2 * STATE_AREA_MARGIN)) / 2


        this.icon = this.scene.add.image(this.x  + this.maxSymbolSize, this.centredY, "icon-tick").setOrigin(0).setDisplaySize(this.maxSymbolSize - FORBIDDEN_TARGET_SYMBOL_PAD, this.maxSymbolSize - FORBIDDEN_TARGET_SYMBOL_PAD).setAlpha(GOAL_ICON_ALPHA)
        this.centredX = this.icon.x + this.icon.displayWidth
        this.images = []
        this.createImages(this.targetString)
        // this.panelBorder = this.scene.add.nineslice(this.x + STATE_AREA_MARGIN, this.y - STATE_AREA_MARGIN, "bg-area-outline", 0, 256, 256, 24, 24, 24, 24).setOrigin(0).setInteractive();
        // this.panelBorder.setSize(this.width - STATE_SUBPANEL_EXTRA_MARGIN - 2 * STATE_AREA_MARGIN, this.height - STATE_AREA_MARGIN)

        // this.overlayCamera.registerOverlayObjects([this.icon, this.panelBorder])
    }

    positionBelow(object:Phaser.GameObjects.GameObject){
        //this.background.setBelow(object)
        return
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
            this.images.push(this.symbolFactory.createSymbolImage(this.scene, symbol, this.centredX + i * this.maxSymbolSize, this.centredY, this.maxSymbolSize  - FORBIDDEN_TARGET_SYMBOL_PAD, true, GOAL_ICON_ALPHA))
        })
    }

    setVisible(visible:boolean){
        this.images.forEach((img) => {
            img.setVisible(visible)
        })
        this.icon.setVisible(visible)
    }
}