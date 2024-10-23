import { GameObjects } from 'phaser';
import BaseScene from './BaseScene';
import { SymbolFactory } from '../task/SymbolFactory';
import { Symbol, TransformationRule } from '../task/StringTransformation';
import { TaskTrialStringTransformation } from '../task/TaskTrialStringTransformation';
import { StringState } from '../task/StringPanel';
import { DataStore } from '../task/DataStorage';
import { StudySchedule } from '../constants/studySchedule';
import { authorisedUser } from '../main';


export class TestScene extends BaseScene {
    background: GameObjects.Image;
    title: GameObjects.Text;
    orientation_warning_text: GameObjects.Text;
    dataStore: DataStore;
    currentTrialIndex: number;
    currentTrial: TaskTrialStringTransformation | null;
    studySchedule: StudySchedule;
    symbolFactory: SymbolFactory;
    totalTrials: integer;

    constructor() {
        super('TestScene');
    }

    create() {

        this.dataStore = new DataStore(authorisedUser.user.uid)

        this.studySchedule = this.cache.json.get('studySchedule') as StudySchedule;
        this.symbolFactory = new SymbolFactory()
        this.registerSymbols(this.studySchedule, this.symbolFactory)

        this.currentTrialIndex = 0
        this.totalTrials = this.studySchedule.trials.length
        this.currentTrial = this.generateNextTrial(this.studySchedule, this.currentTrialIndex, this.symbolFactory)

        super.create()
    }

    onTrialComplete(restTime: number) {

        this.currentTrialIndex++
        if (this.currentTrialIndex < this.totalTrials) {
            this.time.delayedCall(restTime * 1000, () => {
                this.currentTrial?.endTrial()
                const nextTrial = this.generateNextTrial(this.studySchedule, this.currentTrialIndex, this.symbolFactory)
                this.currentTrial = nextTrial
            }, [], this);
        } else {
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
            targetString = symbolFactory.getSymbolsByIDs(currentTrialData.targetString)
            startString = symbolFactory.getSymbolsByIDs(currentTrialData.startString)
            return new TaskTrialStringTransformation(this, rules, new StringState(startString, null), targetString, forbiddenStrings, symbolFactory, this.dataStore, () => this.onTrialComplete(currentTrialData.postTrialRest))
        }
    }

}
