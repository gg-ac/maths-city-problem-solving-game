import { GameObjects } from 'phaser';
import BaseScene from './BaseScene';
import { SymbolFactory } from '../task/SymbolFactory';
import { TransformationRule } from '../task/StringTransformation';
import { TaskTrialStringTransformation } from '../task/TaskTrialStringTransformation';
import { StringState } from '../task/StringPanel';
import { GazeAperture } from '../task/GazeAperture';
import { DataStore } from '../task/DataStorage';

export class TestScene extends BaseScene
{
    background: GameObjects.Image;
    title: GameObjects.Text;
    orientation_warning_text: GameObjects.Text;
    dataStore: DataStore;

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
        const rules = [r2, r1]

        // An initial string
        const string_1 = ["2", "2", "1", "3", "4", "2"]
        const start_string = symbolFactory.getSymbolsByIDs(string_1)

        // A target string
        const targetString = symbolFactory.getSymbolsByIDs(["1", "3", "4"])

        // Some forbidden strings
        const forbiddenString1 = symbolFactory.getSymbolsByIDs(["3", "1", "4"])
        // const forbiddenString2 = symbolFactory.getSymbolsByIDs(["4", "2", "3", "1"])
        // const forbiddenString3 = symbolFactory.getSymbolsByIDs(["2", "1", "1", "4"])

        
        this.dataStore = new DataStore("test_participant", rules, start_string, targetString, [forbiddenString1])

        // The task instance handling state, graphics, and interaction
        const task = new TaskTrialStringTransformation(this, rules, new StringState(start_string, null), targetString, [forbiddenString1], symbolFactory, this.dataStore, () => this.onTrialComplete())

        const gazeAperture = new GazeAperture(this, 100)
        gazeAperture.setActive(false)
        
        
        super.create()
    }

    onTrialComplete(){        

        // Convert the object to a JSON string
        const jsonData = JSON.stringify(this.dataStore.toObject(), null, 2); // Pretty-printing

        // Create a Blob from the JSON string
        const blob = new Blob([jsonData], { type: 'application/json' });

        // Create a link element
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'data.json';

        // Programmatically click the link to trigger the download
        link.click();

        // Clean up the URL object
        URL.revokeObjectURL(link.href);
    }
}
