import { Symbol } from "./StringTransformation";

export class SymbolFactory {
    private scene: Phaser.Scene;
    private symbolToGraphicKey: Map<Symbol, string>;
    private idToSymbol: Map<string, Symbol>;
    private usedIDs: Set<string>;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.symbolToGraphicKey = new Map<Symbol, string>();
        this.idToSymbol = new Map<string, Symbol>();
        this.usedIDs = new Set()
    }

    addSymbol(symbolID: string, isGeneric: boolean, graphicKey: string): void {
        if (!this.usedIDs.has(symbolID)) {
            const newSymbol = new Symbol(symbolID, isGeneric)
            this.symbolToGraphicKey.set(newSymbol, graphicKey);
            this.idToSymbol.set(symbolID, newSymbol)
            this.usedIDs.add(symbolID)
        }else{
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
    

    createSymbolImagesFromSymbols(symbols:Symbol[], startX: number, startY: number, size: number): Phaser.GameObjects.Image[] {
        const images: Phaser.GameObjects.Image[] = [];

        symbols.forEach((s, index) => {
            const graphicKey = this.symbolToGraphicKey.get(s);
            if (graphicKey) {
                const image = this.scene.add.image(startX + index * size, startY, graphicKey).setOrigin(0);
                image.setDisplaySize(size, size)
                images.push(image);
            }
        });

        return images;
    }

    createSymbolImagesFromIDs(symbolIDs:string[], startX: number, startY: number, size: number): Phaser.GameObjects.Image[] {
        const images: Phaser.GameObjects.Image[] = [];
        const symbols = this.getSymbolsByIDs(symbolIDs)

        symbols.forEach((s, index) => {
            const graphicKey = this.symbolToGraphicKey.get(s);
            if (graphicKey) {
                const image = this.scene.add.image(startX + index * size, startY, graphicKey).setOrigin(0);
                image.setDisplaySize(size, size)
                images.push(image);
            }
        });

        return images;
    }

}