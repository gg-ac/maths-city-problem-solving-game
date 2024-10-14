import { EXTRA_OVERLAP_HEIGHT, MAX_SYMBOL_SIZE, STATE_AREA_MARGIN, STATE_SYMBOL_HORIZONTAL_MARGIN, STATE_SYMBOL_PAD, STATE_SYMBOL_VERTICAL_MARGIN } from "../constants/GameConstants";
import { Symbol } from "./StringTransformation";
import { SymbolFactory } from "./SymbolFactory";

export class TargetStringGraphics{

    private maxSymbolSize: number;
    private background: Phaser.GameObjects.NineSlice;
    private centredY: number;
    private centredX: number;
    private images: Phaser.GameObjects.Image[];

    constructor(private scene:Phaser.Scene, private targetString:Symbol[], private symbolFactory:SymbolFactory, private x:number, private y:number, private width:number, private height:number, private maxStringLength:integer){
        // this.background = this.scene.add.rectangle(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height, 0x112233, 0.5);
        // this.background.setVisible(false)

        this.background = this.scene.add.nineslice(this.x + STATE_AREA_MARGIN, this.y - EXTRA_OVERLAP_HEIGHT, "bg-area-m", 0, 256, 256, 24, 24, 24, 24).setOrigin(0).setInteractive();
        this.background.setSize(this.width - 2 * STATE_AREA_MARGIN, this.height - 2 * STATE_AREA_MARGIN + EXTRA_OVERLAP_HEIGHT)


        const maxSymbolWidth = (this.width - (this.maxStringLength + 1) * STATE_SYMBOL_HORIZONTAL_MARGIN) / this.maxStringLength
        const maxSymbolHeight = this.height
        this.maxSymbolSize = Math.min(maxSymbolWidth, maxSymbolHeight, MAX_SYMBOL_SIZE)

        this.centredX = this.x + (this.width - ((this.maxSymbolSize + STATE_SYMBOL_HORIZONTAL_MARGIN) * this.maxStringLength)) / 2
        this.centredY = this.y + (this.height - (this.height - 2 * STATE_AREA_MARGIN)) / 2

        this.images = []
        this.createImages(this.targetString)
    }

    positionBelow(object:Phaser.GameObjects.GameObject){
        this.background.setBelow(object)
    }

    jumpSymbols() {
        // Jump animation for each symbol with a delay
        this.images.forEach((symbol, i) => {
            this.scene.tweens.add({
                targets: symbol,
                y: symbol.y - 50, // Jump up by 50 pixels
                duration: 300, // Duration of the jump
                ease: 'Power1', // Easing function
                yoyo: true, // Return to original position
                repeat: 0, // No repeat
                delay: i * 200 // Delay for each successive symbol
            });
        });
    }

    private createImages(targetString: Symbol[]) {
        targetString.forEach((symbol, i) => {
            this.images.push(this.symbolFactory.createSymbolImage(this.scene, symbol, this.centredX + i * (this.maxSymbolSize + STATE_SYMBOL_HORIZONTAL_MARGIN) + STATE_SYMBOL_PAD, this.centredY + STATE_SYMBOL_PAD, this.maxSymbolSize - (2 * STATE_SYMBOL_PAD), true))
        })
    }
}