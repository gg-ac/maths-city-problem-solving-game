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

        this.stringPanelGraphics.setOnSymbolPress((i) => this.updateSelectedSymbolState(i))

        this.rulePanelGraphics = new RulePanelGraphics(this.scene, this.symbolFactory, 0, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT/2, 10, this.rules)
        this.rulePanelState = new RulePanelState(this.rules)

        this.rulePanelGraphics.setOnRulePress((r) => this.applyRule(r))
    }

    private updateSelectedSymbolState(i: integer | null) {
        console.log(i);
        if (this.stringPanelState.currentState.currentActiveIndex !== i) {
            this.stringPanelState.currentState = new StringState(this.stringPanelState.currentState.currentString, i)
        } else {
            this.stringPanelState.currentState = new StringState(this.stringPanelState.currentState.currentString, null)
        }
    }

    private applyRule(ruleIndex:integer){
        const targetIndex = this.stringPanelState.currentState.currentActiveIndex
        if(targetIndex !== null){
            const result = this.rulePanelState.applyRule(ruleIndex, this.stringPanelState.currentState.currentString, targetIndex)
            if(result !== null){
                this.stringPanelState.currentState = new StringState(result, null)
                console.log("Rule application: Succeeded")
            }else{
                this.stringPanelState.currentState = new StringState(this.stringPanelState.currentState.currentString, null)
                console.log("Rule application: Failed")
            }
        }
        
        console.log(this.rulePanelState.getActionHistoryData())
    }

}
