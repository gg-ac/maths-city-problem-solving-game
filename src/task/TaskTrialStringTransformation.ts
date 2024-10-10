import { GAME_HEIGHT, GAME_WIDTH, PANEL_SECTION_HEIGHTS } from "../constants/GameConstants";
import { RulePanelGraphics, RulePanelState } from "./RulePanel";
import { SymbolFactory } from "./SymbolFactory";
import { StringPanelGraphics, StringPanelState, StringState } from "./StringPanel";
import { TransformationRule, Symbol } from "./StringTransformation";
import { TargetStringGraphics } from "./TargetStringGraphics";


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

    private trialState:TrialState

    constructor(private scene: Phaser.Scene, private rules: TransformationRule[], private startState: StringState, private targetString: Symbol[], private symbolFactory: SymbolFactory) {

        this.trialState = TrialState.Initialising

        this.stringPanelGraphics = new StringPanelGraphics(this.scene, this.symbolFactory, 0, 0, GAME_WIDTH, PANEL_SECTION_HEIGHTS.stringPanel, 10)
        this.stringPanelState = new StringPanelState(this.startState, (newState) => this.onStringPanelStateChange(newState))
        this.stringPanelGraphics.setOnSymbolPress((index) => this.onStringPanelSymbolPressed(index))

        this.rulePanelGraphics = new RulePanelGraphics(this.scene, this.symbolFactory, 0, PANEL_SECTION_HEIGHTS.stringPanel + PANEL_SECTION_HEIGHTS.targetStringPanel, GAME_WIDTH, PANEL_SECTION_HEIGHTS.rulePanel, 10, this.rules)
        this.rulePanelState = new RulePanelState((index) => this.onActiveRuleChange(index))
        this.rulePanelGraphics.setOnRulePress((index) => this.onRulePanelRulePressed(index))

        this.targetStringGraphics = new TargetStringGraphics(this.scene, this.targetString, this.symbolFactory, 0, PANEL_SECTION_HEIGHTS.stringPanel, GAME_WIDTH, PANEL_SECTION_HEIGHTS.targetStringPanel)
    
        this.trialState = TrialState.InProgress

    }

    private onStringPanelStateChange(newState:StringState){
        if(this.trialState === TrialState.Initialising || this.trialState === TrialState.InProgress){
            this.stringPanelGraphics.setSymbolString(newState.currentString)
            this.stringPanelGraphics.setActiveSymbolIndex(newState.currentActiveIndex)
        }
    }

    private onStringPanelSymbolPressed(index:integer){
        if(this.trialState == TrialState.InProgress){
            this.stringPanelState.activateSymbol(index);
            this.tryApplyCurrentRule()
        }
    }

    private onActiveRuleChange(index:integer | null){
        if(this.trialState == TrialState.InProgress){
            this.rulePanelGraphics.setActiveSubpanel(index)
        }
    }

    private onRulePanelRulePressed(index:integer){
        if(this.trialState == TrialState.InProgress){
            this.rulePanelState.activateRule(index)
            this.tryApplyCurrentRule()
        }
    }

    private tryApplyCurrentRule(){
        const targetIndex = this.stringPanelState.currentState.currentActiveIndex
        const ruleIndex = this.rulePanelState.activeRuleIndex
        let rule:TransformationRule|null = null
        if(ruleIndex !== null){
         rule = this.rules[ruleIndex]
        }

        if(rule !== null && targetIndex !== null){
            const result = rule.apply(this.stringPanelState.currentState.currentString, targetIndex)
            if(result !== null){
                this.stringPanelState.currentState = new StringState(result, null)
                console.log("Rule application: Succeeded")
                this.rulePanelState.activateRule(null)
            }else{
                this.stringPanelState.currentState = new StringState(this.stringPanelState.currentState.currentString, null)
                console.log("Rule application: Failed")
            }
        }
        if(this.checkTargetAcheived()){
            console.log("Trial completed!")
            this.trialState = TrialState.Completed
        }
    }

    private checkTargetAcheived(){
        const currentString = this.stringPanelState.currentState.currentString
        return this.symbolArraysMatch(currentString, this.targetString)
    }

    private symbolArraysMatch(s1:Symbol[], s2:Symbol[]){
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
