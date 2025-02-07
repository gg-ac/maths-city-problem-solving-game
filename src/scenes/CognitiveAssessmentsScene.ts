import { GameObjects } from 'phaser';
import BaseScene from './BaseScene';
import { SymbolFactory } from '../task/SymbolFactory';
import { DataStore } from '../task/DataStorage';
import { StudySchedule } from '../constants/studySchedule';
import { RunningMemorySpanTask } from '../task/RunningMemorySpanTrial';
import { shuffleArray } from '../utils/Utilities';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/GameConstants';


export class CognitiveAssessmentsScene extends BaseScene {
    background: GameObjects.Image;
    title: GameObjects.Text;
    orientation_warning_text: GameObjects.Text;
    currentTrialIndex: number;
    currentTrial: RunningMemorySpanTask | null;
    symbolFactory: SymbolFactory;
    totalTrials: integer;

    private digitSounds: { [key: string]: string } = {
        '0': 'assets/instruction_messages/sound_0.mp3',
        '1': 'assets/instruction_messages/sound_1.mp3',
        '2': 'assets/instruction_messages/sound_2.mp3',
        '3': 'assets/instruction_messages/sound_3.mp3',
        '4': 'assets/instruction_messages/sound_4.mp3',
        '5': 'assets/instruction_messages/sound_5.mp3',
        '6': 'assets/instruction_messages/sound_6.mp3',
        '7': 'assets/instruction_messages/sound_7.mp3',
        '8': 'assets/instruction_messages/sound_8.mp3',
        '9': 'assets/instruction_messages/sound_9.mp3',
    };
    STRING_LENGTHS: number[];

    constructor(private dataStore:DataStore, private currentSessionNumber:integer, private currentStudyID:string, private  currentStudyGroup:string, private nextSceneKey:string) {
        super('CognitiveAssessmentsScene');
    }

    preload() {
        for (const digit in this.digitSounds) {
            this.load.audio(digit, this.digitSounds[digit]);
        }
    }

    create() {

        
        this.STRING_LENGTHS = shuffleArray([12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]) as integer[]


        this.currentTrialIndex = 0
        this.totalTrials = this.STRING_LENGTHS.length

        const testSoundButton = this.add.text(GAME_WIDTH / 2, 2 * GAME_HEIGHT / 4, 'Test Sound', { fontSize: '72px', color: '#0f0' }).setInteractive().setOrigin(0.5);

        const startTaskButton = this.add.text(GAME_WIDTH / 2, 3 * GAME_HEIGHT / 4, 'Start Task', { fontSize: '72px', color: '#0f0' }).setInteractive().setOrigin(0.5);


        startTaskButton.on('pointerdown', () => {
            startTaskButton.destroy();
            testSoundButton.destroy();
            this.currentTrial = this.generateNextTrial(this.STRING_LENGTHS[this.currentTrialIndex])
        });

        let playing = false
        testSoundButton.on('pointerdown', () => {
            if (!playing){
                playing = true
                this.playDigitSounds(["1", "2", "3", "4"]).then(() => {
                    playing = false
                })
            }
        });

        
        super.create()

        // Save the session number metadata to the session object in the database
        this.dataStore.dbSetSessionInfoData(this.currentSessionNumber, this.currentStudyID, this.currentStudyGroup)
    }


    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async playDigitSounds(digitKeys:string[]) {
        for (const digit of digitKeys) {
            this.sound.play(digit);
            await this.sleep(250);
        }
    }

    onTrialComplete(restTime: number) {


        this.currentTrialIndex++
        if (this.currentTrialIndex < this.totalTrials) {
            this.time.delayedCall(restTime * 1000, () => {   
                this.currentTrial?.clearGraphics()             
                const nextTrial = this.generateNextTrial(this.STRING_LENGTHS[this.currentTrialIndex])
                this.currentTrial = nextTrial
            }, [], this);
        } else {

            // Start the next scene
            this.time.delayedCall(restTime * 1000, () => {
                this.currentTrial?.clearGraphics()
                this.scene.start(this.nextSceneKey)
            }, [], this);            
        }


    }

    registerSymbols(studySchedule: StudySchedule, symbolFactory: SymbolFactory) {
        studySchedule.symbols.forEach((s) => {
            symbolFactory.registerSymbol(s.symbolID, s.isGeneric, s.graphicKey)
        })
    }

    generateNextTrial(sequenceLength:integer) {
        return new RunningMemorySpanTask(this, sequenceLength, 21, this.dataStore, () => {this.onTrialComplete(2)})
    }


}
