import { SymbolFactory } from "./SymbolFactory";
import { Symbol } from "./StringTransformation";

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
    private onSymbolPress: (index: integer) => void
    private activeSymbolImage: Phaser.GameObjects.Image;

    constructor(private scene: Phaser.Scene, private symbolFactory: SymbolFactory, private x: number, private y: number, private width: number, private height: number, private maxStringLength: integer) {
        const interactionArea = this.scene.add.rectangle(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height, 0x000000, 0.5);
        const maxSymbolWidth = this.width / this.maxStringLength
        const maxSymbolHeight = this.height
        this.maxSymbolSize = Math.min(maxSymbolWidth, maxSymbolHeight)

        this.symbolStringImages = []
        this.activeSymbolImage = this.scene.add.image(0, 0, "active_symbol_indicator").setOrigin(0)
        this.activeSymbolImage.setDisplaySize(this.maxSymbolSize, this.maxSymbolSize)
        this.activeSymbolImage.setVisible(false)
    }

    setOnSymbolPress(callback: (symbolIndex: integer) => void) {
        this.onSymbolPress = callback
    }

    setSymbolString(symbols: Symbol[]) {
        const newImages = symbols.map((s, i) => {
            const img = this.symbolFactory.createSymbolImage(this.scene, s, this.x + i * this.maxSymbolSize, this.y, this.maxSymbolSize, true)
            img.on(Phaser.Input.Events.POINTER_DOWN, () => { if (this.onSymbolPress) { this.onSymbolPress(i) } })
            return img
        })
        this.symbolStringImages.forEach((img) => {img.destroy()})
        this.symbolStringImages = newImages
    }

    setActiveSymbolIndex(symbolIndex: integer | null) {
        if (symbolIndex === null) {
            this.activeSymbolImage.setVisible(false)
        } else {
            this.activeSymbolImage.setVisible(true)
            this.activeSymbolImage.setPosition(this.x + symbolIndex * this.maxSymbolSize, this.y)
        }
    }

}