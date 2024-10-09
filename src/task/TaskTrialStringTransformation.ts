import { GAME_HEIGHT, GAME_WIDTH } from "../constants/GameConstants";
import { RulePanelGraphics, RulePanelState } from "./RulePanel";
import { SymbolFactory } from "./SymbolFactory";
import { StringPanelGraphics, StringPanelState, StringState } from "./StringPanel";
import { TransformationRule } from "./StringTransformation";

export class TaskTrialStringTransformation {

    private stringPanelGraphics: StringPanelGraphics;
    private stringPanelState: StringPanelState;
    rulePanelGraphics: RulePanelGraphics;
    rulePanelState: RulePanelState;

    constructor(private scene: Phaser.Scene, private rules: TransformationRule[], private startState: StringState, private symbolFactory: SymbolFactory) {

        this.stringPanelGraphics = new StringPanelGraphics(this.scene, this.symbolFactory, 0, 0, GAME_WIDTH, GAME_HEIGHT / 2, 10)
        this.stringPanelState = new StringPanelState(this.startState, (newState) => {this.stringPanelGraphics.setSymbolString(newState.currentString); this.stringPanelGraphics.setActiveSymbolIndex(newState.currentActiveIndex)})

        this.stringPanelGraphics.setOnSymbolPress((i) => {this.stringPanelState.activateSymbol(i); this.tryApplyCurrentRule()})

        this.rulePanelGraphics = new RulePanelGraphics(this.scene, this.symbolFactory, 0, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT/2, 10, this.rules)
        this.rulePanelState = new RulePanelState((ruleIndex) => this.rulePanelGraphics.setActiveSubpanel(ruleIndex))

        this.rulePanelGraphics.setOnRulePress((i) => {this.rulePanelState.activateRule(i); this.tryApplyCurrentRule()})
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
    }

}
