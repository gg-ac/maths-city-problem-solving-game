import { GameObjects } from 'phaser';
import BaseScene from './BaseScene';
import { GAME_HEIGHT, GAME_WIDTH, SYMBOL_SIZE } from '../constants/GameConstants';
import { SymbolFactory } from '../task/StringGraphics';
import { TransformationRule } from '../task/StringTransformation';

export class TestScene extends BaseScene
{
    background: GameObjects.Image;
    title: GameObjects.Text;
    orientation_warning_text: GameObjects.Text;

    constructor ()
    {
        super('TestScene');
    }

    create ()
    {
        this.background = this.add.image(GAME_WIDTH/2, GAME_HEIGHT/2, 'background');
        this.background.setDisplaySize(GAME_WIDTH, GAME_HEIGHT)

        this.title = this.add.text(20, 40, 'Hello', {
            fontFamily: 'Corbel', fontSize: 46, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0).setInteractive();


        const symbolFactory = new SymbolFactory(this)
        symbolFactory.addSymbol("1", false, "s1")
        symbolFactory.addSymbol("2", false, "s2")
        symbolFactory.addSymbol("3", false, "s3")
        symbolFactory.addSymbol("4", false, "s4")

        const r1_in = symbolFactory.getSymbolsByIDs(["2", "1", "3"])
        const r1_out = symbolFactory.getSymbolsByIDs(["1", "3"])
        const r1 = new TransformationRule(r1_in, r1_out)

        const string_1 = ["2", "2", "1", "3", "4", "2"]
        const string_1_symbols = symbolFactory.getSymbolsByIDs(string_1)
        const transformation_result = r1.apply(string_1_symbols, 1)

        const symbolImages = symbolFactory.createSymbolImagesFromIDs(["2", "2", "1", "3", "4", "2"], 100, 100, SYMBOL_SIZE)
        
        if (transformation_result !== null){
            const transformedSymbolImages = symbolFactory.createSymbolImagesFromSymbols(transformation_result, 100, 250, SYMBOL_SIZE)
        }
        
        super.create()
    }
}
