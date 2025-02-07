import { GameObjects } from 'phaser';
import BaseScene from './BaseScene';
import { SymbolFactory } from '../task/SymbolFactory';
import { Symbol, TransformationRule } from '../task/StringTransformation';
import { TaskTrialStringTransformation } from '../task/TaskTrialStringTransformation';
import { StringState } from '../task/StringPanel';
import { DataStore } from '../task/DataStorage';
import { StudySchedule } from '../constants/studySchedule';


export class MainGameScene extends BaseScene {
    background: GameObjects.Image;
    title: GameObjects.Text;
    orientation_warning_text: GameObjects.Text;
    currentTrialIndex: number;
    currentTrial: TaskTrialStringTransformation | null;
    symbolFactory: SymbolFactory;
    totalTrials: integer;
    totalScore: number;

    constructor(private dataStore: DataStore, private studySchedule: StudySchedule, private currentSessionNumber: integer, private currentStudyID: string, private currentStudyGroup: string, private nextSceneKey: string, private resumeTrialIndex: integer | null) {
        super('MainGameScene');
    }

    create() {
        this.symbolFactory = new SymbolFactory()
        this.registerSymbols(this.studySchedule, this.symbolFactory)

        this.currentTrialIndex = 0
        if (this.resumeTrialIndex !== null) {
            this.currentTrialIndex = this.resumeTrialIndex
        }
        this.totalTrials = this.studySchedule.trials.length
        this.currentTrial = this.generateNextTrial(this.studySchedule, this.currentTrialIndex, this.symbolFactory)

        super.create()

        this.totalScore = 0

    }

    onTrialComplete(restTime: number, lastTrialScore: number) {

        this.totalScore += lastTrialScore

        let continueToNextTrial = () => {
            this.currentTrial?.endTrial()
            const nextTrial = this.generateNextTrial(this.studySchedule, this.currentTrialIndex, this.symbolFactory)
            this.currentTrial = nextTrial
        }

        let continueToEndScene = () => {
            this.scene.start(this.nextSceneKey)
        }

        console.log(this.currentTrialIndex, this.totalTrials)
        this.currentTrialIndex++
        console.log(this.currentTrialIndex, this.totalTrials)
        if (this.currentTrialIndex < this.totalTrials) {
            this.dataStore.localTotalScore = this.totalScore
            this.currentTrial?.displayFeedback(continueToNextTrial, 1000, this.totalScore)

        } else {
            this.dataStore.localTotalScore = this.totalScore
            this.currentTrial?.displayFeedback(continueToEndScene, 1000, this.totalScore)
        }



    }

    registerSymbols(studySchedule: StudySchedule, symbolFactory: SymbolFactory) {
        studySchedule.symbols.forEach((s) => {
            symbolFactory.registerSymbol(s.symbolID, s.isGeneric, s.graphicKey)
        })
    }

    generateNextTrial(studySchedule: StudySchedule, currentTrialIndex: integer, symbolFactory: SymbolFactory) {

        let rules: TransformationRule[] = []
        let forbiddenStrings: Symbol[][] = []
        let targetString: Symbol[] = []
        let startString: Symbol[] = []

        if (studySchedule.trials.length <= currentTrialIndex) {
            return null
        } else {
            const currentTrialData = studySchedule.trials[currentTrialIndex]
            rules = currentTrialData.rules.map((r) => {
                return new TransformationRule(symbolFactory.getSymbolsByIDs(r.input), symbolFactory.getSymbolsByIDs(r.output))
            })
            forbiddenStrings = currentTrialData.forbiddenStrings.map((s) => symbolFactory.getSymbolsByIDs(s))
            let forbiddenIsPrefix = false
            if (currentTrialData.forbiddenIsPrefix != undefined) {
                forbiddenIsPrefix = currentTrialData.forbiddenIsPrefix
            }
            targetString = symbolFactory.getSymbolsByIDs(currentTrialData.targetString)
            startString = symbolFactory.getSymbolsByIDs(currentTrialData.startString)
            return new TaskTrialStringTransformation(this, currentTrialData.isPractice, currentTrialData.instructionsKey, this.currentTrialIndex + 1, studySchedule.trials.length - this.currentTrialIndex, currentTrialData.trialDurationSeconds * 1000, rules, new StringState(startString, null), targetString, forbiddenStrings, forbiddenIsPrefix, symbolFactory, this.dataStore, (lastTrialScore: number) => this.onTrialComplete(currentTrialData.postTrialRest, lastTrialScore))
        }


    }

    update(time: number, delta: number): void {
        if (this.currentTrial !== null) {
            this.currentTrial.update()
        }
    }




}
