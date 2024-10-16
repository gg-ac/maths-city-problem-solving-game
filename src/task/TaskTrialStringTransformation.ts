import { GAME_HEIGHT, GAME_WIDTH, PANEL_SECTION_HEIGHTS } from "../constants/GameConstants";
import { RulePanelGraphics, RulePanelState } from "./RulePanel";
import { SymbolFactory } from "./SymbolFactory";
import { StringPanelGraphics, StringPanelState, StringState } from "./StringPanel";
import { TransformationRule, Symbol } from "./StringTransformation";
import { TargetStringGraphics } from "./TargetStringGraphics";
import { ForbiddenStringGraphics } from "./ForbiddenStringGraphics";
import { OverlayCamera } from "./OverlayCamera";
import { DataStore, EventType, TaskStateData } from "./DataStorage";


enum TrialState {
    Initialising = "Initialising",
    InProgress = "In Progress",
    Completed = "Completed",
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

    constructor(private scene: Phaser.Scene, private rules: TransformationRule[], private startState: StringState, private targetString: Symbol[], private forbiddenStrings: Symbol[][], private symbolFactory: SymbolFactory, private dataStore: DataStore, private onTrialComplete: () => void) {

        this.trialState = TrialState.Initialising

        const overlayCamera = new OverlayCamera(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height)
        this.scene.cameras.addExisting(overlayCamera)
        overlayCamera.setScene(this.scene)

        this.stringPanelGraphics = new StringPanelGraphics(this.scene, this.symbolFactory, 0, PANEL_SECTION_HEIGHTS.forbiddenStringPanel, GAME_WIDTH, PANEL_SECTION_HEIGHTS.stringPanel, 7, overlayCamera)
        this.stringPanelState = new StringPanelState(this.startState, (newState, manualChange) => this.onStringPanelStateChange(newState, manualChange))
        this.stringPanelGraphics.setOnSymbolPress((index) => this.onStringPanelSymbolPressed(index))

        this.rulePanelGraphics = new RulePanelGraphics(this.scene, this.symbolFactory, 0, PANEL_SECTION_HEIGHTS.forbiddenStringPanel + PANEL_SECTION_HEIGHTS.stringPanel + PANEL_SECTION_HEIGHTS.targetStringPanel, GAME_WIDTH, PANEL_SECTION_HEIGHTS.rulePanel, 5, this.rules, overlayCamera)
        this.rulePanelState = new RulePanelState((index, manualChange) => this.onActiveRuleChange(index, manualChange))
        this.rulePanelGraphics.setOnRulePress((index) => this.onRulePanelRulePressed(index))

        this.targetStringGraphics = new TargetStringGraphics(this.scene, this.targetString, this.symbolFactory, 0, PANEL_SECTION_HEIGHTS.forbiddenStringPanel + PANEL_SECTION_HEIGHTS.stringPanel, GAME_WIDTH, PANEL_SECTION_HEIGHTS.targetStringPanel, overlayCamera)
        this.targetStringGraphics.positionBelow(this.stringPanelGraphics.background)

        this.forbiddenStringGraphics = []
        const forbiddenStringRowHeight = PANEL_SECTION_HEIGHTS.forbiddenStringPanel / this.forbiddenStrings.length
        this.forbiddenStrings.forEach((string, index) => {
            const newForbiddenStringGraphics = new ForbiddenStringGraphics(this.scene, string, this.symbolFactory, 0, forbiddenStringRowHeight * index, GAME_WIDTH, forbiddenStringRowHeight, overlayCamera)
            this.forbiddenStringGraphics.push(newForbiddenStringGraphics)
            newForbiddenStringGraphics.positionBelow(this.stringPanelGraphics.background)
        })

        overlayCamera.updateOverlay()

        this.trialState = TrialState.InProgress
        this.dataStore.startNewTrial()
        this.dataStore.addEvent(EventType.START_TRIAL, false, new TaskStateData(this.rulePanelState?.activeRuleIndex, this.stringPanelState?.getCurrentState()))

    }

    private onStringPanelStateChange(newState: StringState, manualChange:boolean) {
        if (this.trialState === TrialState.Initialising || this.trialState === TrialState.InProgress) {

            this.stringPanelGraphics.setSymbolString(newState.currentString)
            this.stringPanelGraphics.setActiveSymbolIndex(newState.currentActiveIndex)

            if (this.trialState === TrialState.InProgress) {
                this.dataStore.addEvent(EventType.SELECT_SYMBOL, manualChange, new TaskStateData(this.rulePanelState?.activeRuleIndex, this.stringPanelState?.getCurrentState()))
            }
        }
    }

    private onStringPanelSymbolPressed(index: integer) {
        if (this.trialState == TrialState.InProgress) {
            this.stringPanelState.activateSymbol(index, true);
            this.tryApplyCurrentRule()
        }
    }

    private onActiveRuleChange(index: integer | null, manualChange:boolean) {
        if (this.trialState == TrialState.InProgress) {
            this.rulePanelGraphics.setActiveSubpanel(index)
            this.dataStore.addEvent(EventType.SELECT_RULE, manualChange, new TaskStateData(this.rulePanelState?.activeRuleIndex, this.stringPanelState?.getCurrentState()))
        }
    }

    private onRulePanelRulePressed(index: integer) {
        if (this.trialState == TrialState.InProgress) {
            this.rulePanelState.activateRule(index, true)
            this.tryApplyCurrentRule()
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
            const result = rule.apply(this.stringPanelState.getCurrentState().currentString, targetIndex)


            if (result !== null) {
                // Indices of the symbols which "came out" of the rule application
                const changedIndices = rule.output.map((_, i) => { return targetIndex + i })

                const forbiddenStringMatchIndex = this.isStringForbidden(result)
                if (forbiddenStringMatchIndex !== -1) {
                    
                    this.dataStore.addEvent(EventType.FORBIDDEN_RULE_APPLICATION, false, new TaskStateData(this.rulePanelState?.activeRuleIndex, this.stringPanelState?.getCurrentState()))
                    
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
                    this.dataStore.addEvent(EventType.SUCCESSFUL_RULE_APPLICATION, false, new TaskStateData(this.rulePanelState?.activeRuleIndex, new StringState(result, this.stringPanelState?.getCurrentState().currentActiveIndex)))
                             
                    this.stringPanelState.setCurrentState(new StringState(result, null), false)
                     
                    console.log("Rule application: Succeeded")
                    this.rulePanelState.activateRule(null, false)
                    changedIndices.forEach((index, i) => { this.stringPanelGraphics.jumpSymbol(index, i * 50) })
                }
            } else {
                this.dataStore.addEvent(EventType.INVALID_RULE_APPLICATION, false, new TaskStateData(this.rulePanelState?.activeRuleIndex, this.stringPanelState?.getCurrentState()))
                    
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
            if(this.trialState !== TrialState.Completed){
                this.trialState = TrialState.Completed
                this.dataStore.addEvent(EventType.GOAL_ACHIEVED, false, new TaskStateData(this.rulePanelState?.activeRuleIndex, this.stringPanelState?.getCurrentState()))
                this.onTrialComplete()
            }
             
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
