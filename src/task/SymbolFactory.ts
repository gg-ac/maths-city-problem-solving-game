import { Symbol } from "./StringTransformation";


export class SymbolFactory {
    private symbolToGraphicKey: Map<Symbol, string>;
    private idToSymbol: Map<string, Symbol>;
    private usedIDs: Set<string>;

    constructor() {
        this.symbolToGraphicKey = new Map<Symbol, string>();
        this.idToSymbol = new Map<string, Symbol>();
        this.usedIDs = new Set()
    }

    registerSymbol(symbolID: string, isGeneric: boolean, graphicKey: string): void {
        if (!this.usedIDs.has(symbolID)) {
            const newSymbol = new Symbol(symbolID, isGeneric)
            this.symbolToGraphicKey.set(newSymbol, graphicKey);
            this.idToSymbol.set(symbolID, newSymbol)
            this.usedIDs.add(symbolID)
        } else {
            throw new Error(`Cannot create a symbol with ID '${symbolID}'. Another symbol using this ID already exists.`)
        }
    }

    getSymbolsByIDs(ids: string[]): Symbol[] {
        const symbols = ids.map((id) => {
            if (this.idToSymbol.has(id)) {
                return this.idToSymbol.get(id) as Symbol; // Type assertion
            } else {
                throw new Error(`No symbol with ID '${id}' exists in this SymbolFactory.`);
            }
        });
        return symbols;
    }

    createSymbolImage(scene: Phaser.Scene, symbol: Symbol, startX: number, startY: number, size: number, interactive: boolean): Phaser.GameObjects.Image {
        const graphicKey = this.symbolToGraphicKey.get(symbol);
        if (graphicKey) {
            const image = scene.add.image(startX, startY, graphicKey).setOrigin(0)
            image.setDisplaySize(size, size)
            if (interactive) { image.setInteractive() }
            return image
        } else {
            throw new Error(`Symbol with ID ${symbol.id} was not assigned an image in this SymbolFactor instance`)
        }

    }

}