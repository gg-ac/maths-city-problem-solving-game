import { GameObjects } from 'phaser';
import BaseScene from './BaseScene';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/GameConstants';
import { SymbolFactory } from '../task/SymbolFactory';
import { TransformationRule } from '../task/StringTransformation';
import { TaskTrialStringTransformation } from '../task/TaskTrialStringTransformation';
import { StringState } from '../task/StringPanel';
import { GazeAperture } from '../task/GazeAperture';

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

        // A target string
        const targetString = symbolFactory.getSymbolsByIDs(["1", "3", "4"])

        // Some forbidden strings
        const forbiddenString1 = symbolFactory.getSymbolsByIDs(["3", "1", "4"])
        // const forbiddenString2 = symbolFactory.getSymbolsByIDs(["4", "2", "3", "1"])
        // const forbiddenString3 = symbolFactory.getSymbolsByIDs(["2", "1", "1", "4"])

        // The task instance handling state, graphics, and interaction
        const task = new TaskTrialStringTransformation(this, [r2, r1], new StringState(string_1_symbols, null), targetString, [forbiddenString1], symbolFactory)

        const gazeAperture = new GazeAperture(this, 100)
        gazeAperture.setActive(false)
        
        
        super.create()
    }
}
