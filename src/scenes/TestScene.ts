import { GameObjects } from 'phaser';
import BaseScene from './BaseScene';
import { GAME_HEIGHT, GAME_WIDTH, SYMBOL_SIZE } from '../constants/GameConstants';
import { SymbolFactory } from '../task/SymbolFactory';
import { TransformationRule } from '../task/StringTransformation';
import { TaskTrialStringTransformation } from '../task/TaskTrialStringTransformation';
import { StringState } from '../task/StringPanel';

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

        // this.title = this.add.text(20, 40, 'Hello', {
        //     fontFamily: 'Corbel', fontSize: 46, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setOrigin(0).setInteractive();

        // Register some symbol images with the symbol factory
        const symbolFactory = new SymbolFactory()
        symbolFactory.registerSymbol("1", false, "s1")
        symbolFactory.registerSymbol("2", false, "s2")
        symbolFactory.registerSymbol("3", false, "s3")
        symbolFactory.registerSymbol("4", false, "s4")
        symbolFactory.registerSymbol("5", true, "sg1") // Generic
        symbolFactory.registerSymbol("6", true, "sg2") // Generic

        // Some test rules
        const r1_in = symbolFactory.getSymbolsByIDs(["2", "1", "3"])
        const r1_out = symbolFactory.getSymbolsByIDs(["1", "3"])
        const r1 = new TransformationRule(r1_in, r1_out)
        const r2_in = symbolFactory.getSymbolsByIDs(["5", "6"])
        const r2_out = symbolFactory.getSymbolsByIDs(["6", "5"])
        const r2 = new TransformationRule(r2_in, r2_out)

        // An initial string
        const string_1 = ["2", "2", "1", "3", "4", "2"]
        const string_1_symbols = symbolFactory.getSymbolsByIDs(string_1)

        // The task instance handling state, graphics, and interaction
        const task = new TaskTrialStringTransformation(this, [r1, r2], new StringState(string_1_symbols, null), symbolFactory)
        
        super.create()
    }
}
