import { MAX_SYMBOL_SIZE } from "../constants/GameConstants";
import { Symbol } from "./StringTransformation";
import { SymbolFactory } from "./SymbolFactory";

export class ForbiddenStringGraphics{

    private maxSymbolSize: number;
    private background: Phaser.GameObjects.Rectangle;

    constructor(private scene:Phaser.Scene, private forbiddenString:Symbol[], private symbolFactory:SymbolFactory, private x:number, private y:number, private width:number, private height:number){
        this.background = this.scene.add.rectangle(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height, 0x112233, 0.5);
        this.background.setVisible(false)

        const maxSymbolWidth = this.width / this.forbiddenString.length
        const maxSymbolHeight = this.height
        this.maxSymbolSize = Math.min(maxSymbolWidth, maxSymbolHeight, MAX_SYMBOL_SIZE)
        this.createImages(this.forbiddenString)
    }

    private createImages(forbiddenString: Symbol[]) {
        forbiddenString.forEach((symbol, i) => {
            this.symbolFactory.createSymbolImage(this.scene, symbol, this.x + i * this.maxSymbolSize, this.y, this.maxSymbolSize, true)
        })
    }
}