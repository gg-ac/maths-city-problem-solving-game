import { GAME_HEIGHT, GAME_WIDTH, MAX_INTERACTIONS_PER_TRIAL, PANEL_SECTION_HEIGHTS } from "../constants/GameConstants";
import { RulePanelGraphics, RulePanelState } from "./RulePanel";
import { SymbolFactory } from "./SymbolFactory";
import { StringPanelGraphics, StringPanelState, StringState } from "./StringPanel";
import { TransformationRule, Symbol } from "./StringTransformation";
import { TargetStringGraphics } from "./TargetStringGraphics";
import { ForbiddenStringGraphics } from "./ForbiddenStringGraphics";
import { OverlayCamera } from "./OverlayCamera";
import { DataStore, EventRuleApply, EventSelect, EventTaskStatus, EventType } from "./DataStorage";


enum TrialState {
    Initialising = "Initialising",
    InProgress = "In Progress",
    Completed = "Completed",
    Ended = "Ended",
    Paused = "Paused",
    Failed = "Failed"
}

export class TaskTrialStringTransformation {



    private stringPanelGraphics: StringPanelGraphics;
    private stringPanelState: StringPanelState;
    private rulePanelGraphics: RulePanelGraphics;
    private rulePanelState: RulePanelState;
    private targetStringGraphics: TargetStringGraphics;
    private forbiddenStringGraphics: ForbiddenStringGraphics[];

    private trialState: TrialState
    actionCounter: number;
    overlayCamera: OverlayCamera;

    constructor(private scene: Phaser.Scene, private rules: TransformationRule[], private startState: StringState, private targetString: Symbol[], private forbiddenStrings: Symbol[][], private symbolFactory: SymbolFactory, private dataStore: DataStore, private onTrialComplete: () => void) {

        this.trialState = TrialState.Initialising

        // A counter for interaction events, used to put a cap on the number of actions
        this.actionCounter = 0

        this.overlayCamera = new OverlayCamera(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height)
        this.scene.cameras.addExisting(this.overlayCamera)
        this.overlayCamera.setScene(this.scene)

        this.stringPanelGraphics = new StringPanelGraphics(this.scene, this.symbolFactory, 0, PANEL_SECTION_HEIGHTS.forbiddenStringPanel, GAME_WIDTH, PANEL_SECTION_HEIGHTS.stringPanel, 7, this.overlayCamera)
        this.stringPanelState = new StringPanelState(this.startState, (newState, manualChange) => this.onStringPanelStateChange(newState, manualChange))
        this.stringPanelGraphics.setOnSymbolPress((index) => this.onStringPanelSymbolPressed(index))

        this.rulePanelGraphics = new RulePanelGraphics(this.scene, this.symbolFactory, 0, PANEL_SECTION_HEIGHTS.forbiddenStringPanel + PANEL_SECTION_HEIGHTS.stringPanel + PANEL_SECTION_HEIGHTS.targetStringPanel, GAME_WIDTH, PANEL_SECTION_HEIGHTS.rulePanel, 5, this.rules, this.overlayCamera)
        this.rulePanelState = new RulePanelState((index, manualChange) => this.onActiveRuleChange(index, manualChange))
        this.rulePanelGraphics.setOnRulePress((index) => this.onRulePanelRulePressed(index))

        this.targetStringGraphics = new TargetStringGraphics(this.scene, this.targetString, this.symbolFactory, 0, PANEL_SECTION_HEIGHTS.forbiddenStringPanel + PANEL_SECTION_HEIGHTS.stringPanel, GAME_WIDTH, PANEL_SECTION_HEIGHTS.targetStringPanel, this.overlayCamera)
        this.targetStringGraphics.positionBelow(this.stringPanelGraphics.background)

        this.forbiddenStringGraphics = []
        const forbiddenStringRowHeight = PANEL_SECTION_HEIGHTS.forbiddenStringPanel / this.forbiddenStrings.length
        this.forbiddenStrings.forEach((string, index) => {
            const newForbiddenStringGraphics = new ForbiddenStringGraphics(this.scene, string, this.symbolFactory, 0, forbiddenStringRowHeight * index, GAME_WIDTH, forbiddenStringRowHeight, this.overlayCamera)
            this.forbiddenStringGraphics.push(newForbiddenStringGraphics)
            newForbiddenStringGraphics.positionBelow(this.stringPanelGraphics.background)
        })

        this.overlayCamera.updateOverlay()

        this.trialState = TrialState.InProgress
        this.dataStore.startNewTrial(this.rules, this.startState.currentString, this.targetString, this.forbiddenStrings)
        this.dataStore.addEvent(new EventTaskStatus(EventType.START_TRIAL))

    }

    private onStringPanelStateChange(newState: StringState, manualChange: boolean) {
        if (this.trialState === TrialState.Initialising || this.trialState === TrialState.InProgress) {

            this.stringPanelGraphics.setSymbolString(newState.currentString)
            this.stringPanelGraphics.setActiveSymbolIndex(newState.currentActiveIndex)

            if (this.trialState === TrialState.InProgress) {
                this.dataStore.addEvent(new EventSelect(EventType.SELECT_SYMBOL, this.stringPanelState?.getCurrentState().currentActiveIndex, manualChange, this.stringPanelState?.getCurrentState().currentString))
            }
        }
    }

    private onStringPanelSymbolPressed(index: integer) {
        if (this.actionCounter < MAX_INTERACTIONS_PER_TRIAL) {
            if (this.trialState == TrialState.InProgress) {
                this.stringPanelState.activateSymbol(index, true);
                this.actionCounter++
                this.tryApplyCurrentRule()
            }
        }
    }

    private onActiveRuleChange(index: integer | null, manualChange: boolean) {
        if (this.trialState == TrialState.InProgress) {
            this.rulePanelGraphics.setActiveSubpanel(index)
            this.dataStore.addEvent(new EventSelect(EventType.SELECT_RULE, this.rulePanelState?.activeRuleIndex, manualChange))
        }
    }

    private onRulePanelRulePressed(index: integer) {
        if (this.actionCounter < MAX_INTERACTIONS_PER_TRIAL) {
            if (this.trialState == TrialState.InProgress) {
                this.rulePanelState.activateRule(index, true)
                this.actionCounter++
                this.tryApplyCurrentRule()
            }
        }
    }

    private tryApplyCurrentRule() {
        const targetIndex = this.stringPanelState.getCurrentState().currentActiveIndex
        const ruleIndex = this.rulePanelState.activeRuleIndex
        let rule: TransformationRule | null = null
        if (ruleIndex !== null) {
            rule = this.rules[ruleIndex]
        }

        if (rule !== null && targetIndex !== null) {
            const startString = this.stringPanelState.getCurrentState().currentString
            const result = rule.apply(this.stringPanelState.getCurrentState().currentString, targetIndex)


            if (result !== null) {
                // Indices of the symbols which "came out" of the rule application
                const changedIndices = rule.output.map((_, i) => { return targetIndex + i })

                const forbiddenStringMatchIndex = this.isStringForbidden(result)
                if (forbiddenStringMatchIndex !== -1) {

                    this.dataStore.addEvent(new EventRuleApply(EventType.FORBIDDEN_RULE_APPLICATION, this.rulePanelState?.activeRuleIndex, this.stringPanelState?.getCurrentState().currentActiveIndex, startString, undefined, undefined, forbiddenStringMatchIndex))

                    // If the resulting state would be a forbidden state, don't update current state
                    console.log(`Cannot apply rule: resulting state would be forbidden state ${forbiddenStringMatchIndex}`)
                    this.stringPanelState.setCurrentState(new StringState(this.stringPanelState.getCurrentState().currentString, null), false)
                    this.rulePanelState.activateRule(null, false)
                    if (ruleIndex !== null) {
                        this.rulePanelGraphics.animateRuleShake(ruleIndex)
                        this.forbiddenStringGraphics[forbiddenStringMatchIndex].animateStringShake()
                    }
                } else {
                    // Otherwise, update the current state                           
                    this.dataStore.addEvent(new EventRuleApply(EventType.SUCCESSFUL_RULE_APPLICATION, this.rulePanelState?.activeRuleIndex, this.stringPanelState?.getCurrentState().currentActiveIndex, startString, result))

                    this.stringPanelState.setCurrentState(new StringState(result, null), false)

                    console.log("Rule application: Succeeded")
                    this.rulePanelState.activateRule(null, false)
                    changedIndices.forEach((index, i) => { this.stringPanelGraphics.jumpSymbol(index, i * 50) })
                }
            } else {

                this.dataStore.addEvent(new EventRuleApply(EventType.INVALID_RULE_APPLICATION, this.rulePanelState?.activeRuleIndex, this.stringPanelState?.getCurrentState().currentActiveIndex, startString, undefined))

                this.stringPanelState.setCurrentState(new StringState(this.stringPanelState.getCurrentState().currentString, null), false)
                this.rulePanelState.activateRule(null, false)
                if (ruleIndex !== null) {
                    this.rulePanelGraphics.animateRuleShake(ruleIndex)
                }
                console.log("Rule application: Failed")
            }
        }

        if (this.checkTargetAcheived()) {
            console.log("Trial completed!")
            if (this.trialState !== TrialState.Completed) {
                this.targetStringGraphics.jumpSymbols()
            }
            if (this.trialState !== TrialState.Completed) {
                this.dataStore.addEvent(new EventTaskStatus(EventType.GOAL_ACHIEVED))
                this.completeTrial()
                this.endTrial()
            }

        }
    }

    public completeTrial(){
        if (this.trialState !== TrialState.Completed) {
            this.trialState = TrialState.Completed
            this.onTrialComplete()
        }
    }

    public endTrial() {
        if (this.trialState !== TrialState.Ended) {
            this.trialState = TrialState.Ended
            this.dataStore.addEvent(new EventTaskStatus(EventType.END_TRIAL))
            this.scene.cameras.remove(this.overlayCamera)            
        }
    }

    private checkTargetAcheived() {
        const currentString = this.stringPanelState.getCurrentState().currentString
        return this.symbolArraysMatch(currentString, this.targetString)
    }

    private isStringForbidden(inputString: Symbol[]) {
        return this.forbiddenStrings.findIndex((forbiddenString) => { return this.symbolArraysMatch(inputString, forbiddenString) })
    }

    private symbolArraysMatch(s1: Symbol[], s2: Symbol[]) {
        if (s1.length !== s2.length) {
            return false;
        }

        for (let i = 0; i < s1.length; i++) {
            if (s1[i].id !== s2[i].id) {
                return false;
            }
        }

        return true;
    }

}
