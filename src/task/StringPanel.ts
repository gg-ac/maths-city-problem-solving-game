import { SymbolFactory } from "./SymbolFactory";
import { Symbol } from "./StringTransformation";
import { MAX_SYMBOL_SIZE, STATE_AREA_MARGIN, STATE_SYMBOL_HORIZONTAL_MARGIN, STATE_SYMBOL_PAD, STATE_SYMBOL_PRESS_OFFSET, STATE_SYMBOL_VERTICAL_MARGIN } from "../constants/GameConstants";

export class StringState {
    constructor(public currentString: Symbol[], public currentActiveIndex: integer | null) {
    }
}

export class StringPanelState {
    private _currentState: StringState;

    private stateHistory: StringState[];
    constructor(private initialState: StringState, private onStateChange: (newState: StringState) => void) {
        this.stateHistory = []
        this.currentState = this.initialState
    }

    public get currentState(): StringState {
        return this._currentState;
    }
    public set currentState(newState: StringState) {
        this._currentState = newState;
        this.stateHistory.push(newState)
        this.onStateChange(newState)
    }

    public activateSymbol(symbolIndex: integer) {
        if (this.currentState.currentActiveIndex !== symbolIndex) {
            this.currentState = new StringState(this.currentState.currentString, symbolIndex)
        } else {
            this.currentState = new StringState(this.currentState.currentString, null)
        }
    }

    public getStateHistoryData() {
        return this.stateHistory.map((str) => {
            const symbolList = str.currentString.map((sym) => {
                return sym.id
            })
            return { "symbols": symbolList, "activeIndex": str.currentActiveIndex }
        })
    }

}

export class StringPanelGraphics {
    private maxSymbolSize: number;
    private symbolStringImages: Phaser.GameObjects.Image[]
    private symbolBackgroundUnusedSpaceImages: Phaser.GameObjects.NineSlice[]
    private symbolBackgroundUpImages: Phaser.GameObjects.NineSlice[]
    private symbolBackgroundDownImages: Phaser.GameObjects.NineSlice[]
    private onSymbolPress: (index: integer) => void
    private activeSymbolImage: Phaser.GameObjects.Image;
    private pressVerticalOffset: number
    private centredX:number
    private centredY:number
    background: Phaser.GameObjects.NineSlice;

    constructor(private scene: Phaser.Scene, private symbolFactory: SymbolFactory, private x: number, private y: number, private width: number, private height: number, private maxStringLength: integer) {
        
        this.background = this.scene.add.nineslice(this.x + STATE_AREA_MARGIN, this.y + STATE_AREA_MARGIN, "bg-area-d", 0, 256, 256, 24, 24, 24, 24).setOrigin(0).setInteractive();
        this.background.setSize(this.width - 2 * STATE_AREA_MARGIN, this.height - 2 * STATE_AREA_MARGIN)

        const maxSymbolWidth = (this.width - (this.maxStringLength + 1) * STATE_SYMBOL_HORIZONTAL_MARGIN) / this.maxStringLength
        const maxSymbolHeight = this.height
        this.maxSymbolSize = Math.min(maxSymbolWidth, maxSymbolHeight, MAX_SYMBOL_SIZE)

        this.symbolStringImages = []
        this.symbolBackgroundUnusedSpaceImages = []
        this.symbolBackgroundUpImages = []
        this.symbolBackgroundDownImages = []
        this.activeSymbolImage = this.scene.add.image(0, 0, "active_symbol_indicator").setOrigin(0)
        this.activeSymbolImage.setDisplaySize(this.maxSymbolSize, this.maxSymbolSize)
        this.activeSymbolImage.setVisible(false)

        this.pressVerticalOffset = STATE_SYMBOL_PRESS_OFFSET
        this.centredX = this.x + (this.width - ((this.maxSymbolSize + STATE_SYMBOL_HORIZONTAL_MARGIN) * this.maxStringLength)) / 2
        this.centredY = this.y + (this.height - (this.maxSymbolSize + 2 * STATE_SYMBOL_VERTICAL_MARGIN)) / 2

        for(let i = 0; i < this.maxStringLength; i++){
            const bgUnused = this.scene.add.nineslice(this.centredX + i * (this.maxSymbolSize + STATE_SYMBOL_HORIZONTAL_MARGIN), this.centredY, "bg-unused-symbol-space", 0, 256, 256, 30, 30, 30, 48).setOrigin(0)
            bgUnused.setSize(this.maxSymbolSize, this.maxSymbolSize + this.pressVerticalOffset)
            bgUnused.setVisible(false)
            this.symbolBackgroundUnusedSpaceImages.push(bgUnused)
        }
    }

    setOnSymbolPress(callback: (symbolIndex: integer) => void) {
        this.onSymbolPress = callback
    }

    pressEvent(symbolIndex:integer){
        if (this.onSymbolPress) { 
            this.onSymbolPress(symbolIndex) 
            console.log(`pressed ${symbolIndex}`)
        }

    }

    setSymbolString(symbols: Symbol[]) {
        console.log("Replaced")
        this.symbolBackgroundUpImages.forEach((img) => img.destroy())
        this.symbolBackgroundUpImages = []
        this.symbolBackgroundDownImages.forEach((img) => img.destroy())
        this.symbolBackgroundDownImages = []

        const newImages = []
        
        for (let i = 0; i < symbols.length; i++){

            const s = symbols[i]
            const onPress = () => this.pressEvent(i)

            const bgUp = this.scene.add.nineslice(this.centredX + i * (this.maxSymbolSize + STATE_SYMBOL_HORIZONTAL_MARGIN), this.centredY, "bg-rule-button-up-light", 0, 256, 256, 30, 30, 30, 48).setOrigin(0).setInteractive();
            bgUp.setSize(this.maxSymbolSize, this.maxSymbolSize+ this.pressVerticalOffset)
            bgUp.on(Phaser.Input.Events.POINTER_DOWN, onPress)
            this.symbolBackgroundUpImages.push(bgUp)

            const bgDown = this.scene.add.nineslice(this.centredX + i * (this.maxSymbolSize + STATE_SYMBOL_HORIZONTAL_MARGIN), this.centredY, "bg-rule-button-down-light", 0, 256, 256, 30, 30, 48, 30).setOrigin(0).setInteractive();
            bgDown.setSize(this.maxSymbolSize, this.maxSymbolSize + this.pressVerticalOffset)
            bgDown.on(Phaser.Input.Events.POINTER_DOWN, onPress)
            this.symbolBackgroundDownImages.push(bgDown)

            const img = this.symbolFactory.createSymbolImage(this.scene, s, this.centredX + i * (this.maxSymbolSize + STATE_SYMBOL_HORIZONTAL_MARGIN) + STATE_SYMBOL_PAD, this.centredY + STATE_SYMBOL_PAD, this.maxSymbolSize - (2 * STATE_SYMBOL_PAD), true)
            img.on(Phaser.Input.Events.POINTER_DOWN, onPress)
            
            //const group = this.scene.add.group([bgUp, bgDown, img])

            newImages.push(img)
        }

        // Only show the empty space markers when the space is empty
        for (let j = 0; j < this.symbolBackgroundUnusedSpaceImages.length; j++){
            if(j < symbols.length){
                this.symbolBackgroundUnusedSpaceImages[j].setVisible(false)
            }else{
                this.symbolBackgroundUnusedSpaceImages[j].setVisible(true)
            }
        }

        this.symbolStringImages.forEach((img) => { img.destroy() })
        this.symbolStringImages = []
        this.symbolStringImages = newImages
    }

    setActiveSymbolIndex(symbolIndex: integer | null) {

        if (symbolIndex !== null) {
            
            this.symbolBackgroundDownImages.forEach((img, i) => {
                
                if (i === symbolIndex) {
                    console.log(i, symbolIndex, "A")
                    img.setVisible(true)
                    this.symbolStringImages[i].setY(this.centredY + STATE_SYMBOL_PAD + this.pressVerticalOffset)
                }
                else {
                    console.log(i, symbolIndex, "B")
                    img.setVisible(false)
                    this.symbolStringImages[i].setY(this.centredY + STATE_SYMBOL_PAD)
                }
            })
            this.symbolBackgroundUpImages.forEach((img, i) => { i === symbolIndex ? img.setVisible(false) : img.setVisible(true) })

        } else {
            this.symbolStringImages.forEach((img) => img.setY(this.centredY + STATE_SYMBOL_PAD))
            this.symbolBackgroundDownImages.forEach((img) => img.setVisible(false))
            this.symbolBackgroundUpImages.forEach((img) => img.setVisible(true))
        }


    }

}