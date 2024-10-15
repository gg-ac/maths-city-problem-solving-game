import { GAME_HEIGHT, GAME_WIDTH, PANEL_SECTION_HEIGHTS } from "../constants/GameConstants";
import { RulePanelGraphics, RulePanelState } from "./RulePanel";
import { SymbolFactory } from "./SymbolFactory";
import { StringPanelGraphics, StringPanelState, StringState } from "./StringPanel";
import { TransformationRule, Symbol } from "./StringTransformation";
import { TargetStringGraphics } from "./TargetStringGraphics";
import { ForbiddenStringGraphics } from "./ForbiddenStringGraphics";
import { OverlayCamera } from "./OverlayCamera";


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

    constructor(private scene: Phaser.Scene, private rules: TransformationRule[], private startState: StringState, private targetString: Symbol[], private forbiddenStrings: Symbol[][], private symbolFactory: SymbolFactory) {

        this.trialState = TrialState.Initialising

        const overlayCamera = new OverlayCamera(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height)
        this.scene.cameras.addExisting(overlayCamera)
        overlayCamera.setScene(this.scene)

        this.stringPanelGraphics = new StringPanelGraphics(this.scene, this.symbolFactory, 0, PANEL_SECTION_HEIGHTS.forbiddenStringPanel, GAME_WIDTH, PANEL_SECTION_HEIGHTS.stringPanel, 7, overlayCamera)
        this.stringPanelState = new StringPanelState(this.startState, (newState) => this.onStringPanelStateChange(newState))
        this.stringPanelGraphics.setOnSymbolPress((index) => this.onStringPanelSymbolPressed(index))

        this.rulePanelGraphics = new RulePanelGraphics(this.scene, this.symbolFactory, 0, PANEL_SECTION_HEIGHTS.forbiddenStringPanel + PANEL_SECTION_HEIGHTS.stringPanel + PANEL_SECTION_HEIGHTS.targetStringPanel, GAME_WIDTH, PANEL_SECTION_HEIGHTS.rulePanel, 5, this.rules, overlayCamera)
        this.rulePanelState = new RulePanelState((index) => this.onActiveRuleChange(index))
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
        

    }

    private onStringPanelStateChange(newState: StringState) {
        if (this.trialState === TrialState.Initialising || this.trialState === TrialState.InProgress) {

            // if(this.stringPanelState === undefined){
            //     console.log("New string (undefined)")
            //     this.stringPanelGraphics.setSymbolString(newState.currentString)
            // }else if(newState.currentString !== this.stringPanelState.currentState.currentString){
            //     console.log("New string (replaced)")
            //     this.stringPanelGraphics.setSymbolString(newState.currentString)
            // }
            this.stringPanelGraphics.setSymbolString(newState.currentString)
            this.stringPanelGraphics.setActiveSymbolIndex(newState.currentActiveIndex)
        }
    }

    private onStringPanelSymbolPressed(index: integer) {
        if (this.trialState == TrialState.InProgress) {
            this.stringPanelState.activateSymbol(index);
            this.tryApplyCurrentRule()
        }
    }

    private onActiveRuleChange(index: integer | null) {
        if (this.trialState == TrialState.InProgress) {
            this.rulePanelGraphics.setActiveSubpanel(index)
        }
    }

    private onRulePanelRulePressed(index: integer) {
        if (this.trialState == TrialState.InProgress) {
            this.rulePanelState.activateRule(index)
            this.tryApplyCurrentRule()
        }
    }

    private tryApplyCurrentRule() {
        const targetIndex = this.stringPanelState.currentState.currentActiveIndex
        const ruleIndex = this.rulePanelState.activeRuleIndex
        let rule: TransformationRule | null = null
        if (ruleIndex !== null) {
            rule = this.rules[ruleIndex]
        }

        if (rule !== null && targetIndex !== null) {
            const result = rule.apply(this.stringPanelState.currentState.currentString, targetIndex)
            

            if (result !== null) {
                // Indices of the symbols which "came out" of the rule application
                const changedIndices = rule.output.map((_, i) => {return targetIndex + i})

                const forbiddenStringMatchIndex = this.isStringForbidden(result)
                if (forbiddenStringMatchIndex !== -1) {
                    // If the resulting state would be a forbidden state, don't update current state
                    console.log(`Cannot apply rule: resulting state would be forbidden state ${forbiddenStringMatchIndex}`)                    
                    this.stringPanelState.currentState = new StringState(this.stringPanelState.currentState.currentString, null)
                    this.rulePanelState.activateRule(null)
                    if (ruleIndex !== null) {
                        this.rulePanelGraphics.animateRuleShake(ruleIndex)
                        this.forbiddenStringGraphics[forbiddenStringMatchIndex].animateStringShake()
                    }
                } else {
                    // Otherwise, update the current state                
                    this.stringPanelState.currentState = new StringState(result, null)
                    console.log("Rule application: Succeeded")
                    this.rulePanelState.activateRule(null)
                    changedIndices.forEach((index, i) => {this.stringPanelGraphics.jumpSymbol(index, i*50)})
                }
            } else {
                this.stringPanelState.currentState = new StringState(this.stringPanelState.currentState.currentString, null)
                this.rulePanelState.activateRule(null)
                if (ruleIndex !== null) {
                    this.rulePanelGraphics.animateRuleShake(ruleIndex)
                }
                console.log("Rule application: Failed")
            }
        }

        if (this.checkTargetAcheived()) {
            console.log("Trial completed!")
            if(this.trialState !== TrialState.Completed){
                this.targetStringGraphics.jumpSymbols()
            }
            this.trialState = TrialState.Completed
        }
    }

    private checkTargetAcheived() {
        const currentString = this.stringPanelState.currentState.currentString
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
