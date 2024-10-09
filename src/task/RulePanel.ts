import { SymbolFactory } from "./SymbolFactory";
import { TransformationRule } from "./StringTransformation";
import { Symbol } from "./StringTransformation";

export class RuleAction {
    constructor(public rule: TransformationRule, public targetString: Symbol[], public targetIndex: integer, public successful: boolean) { }
}

export class RulePanelState {
    private actionHistory: RuleAction[];
    constructor(private rules: TransformationRule[], private onApplyRuleAction?: (rule: TransformationRule) => void) {
        this.actionHistory = []
    }

    public applyRule(ruleIndex: integer, targetString: Symbol[], targetIndex: integer): Symbol[] | null {
        const rule = this.rules[ruleIndex]
        const result = rule.apply(targetString, targetIndex)
        this.actionHistory.push(new RuleAction(rule, targetString, targetIndex, result !== null))
        if (this.onApplyRuleAction !== undefined) {
            this.onApplyRuleAction(rule)
        }
        return result
    }

    public getActionHistoryData() {
        const symbolToString = (sym: Symbol) => {
            return sym.id
        }
        return this.actionHistory.map((ra) => {
            const inputSymbols = ra.rule.input.map(symbolToString)
            const outputSymbols = ra.rule.input.map(symbolToString)
            const targetString = ra.targetString.map(symbolToString)
            return { "rule": { "input": inputSymbols, "output": outputSymbols }, "targetString": targetString, "targetIndex": ra.targetIndex, "successful": ra.successful }
        })
    }

}

class RuleSubpanelGraphics {
    private maxSymbolSize: number;
    private interactionArea: Phaser.GameObjects.Rectangle;

    constructor(private scene: Phaser.Scene, private symbolFactory: SymbolFactory, private x: number, private y: number, private width: number, private height: number, private maxStringLength: integer, private rule: TransformationRule, onPress: () => void) {
        
        const maxSymbolWidth = this.width / this.maxStringLength
        const maxSymbolHeight = this.height
        this.maxSymbolSize = Math.min(maxSymbolWidth, maxSymbolHeight)
        this.createImages(this.rule)

        this.interactionArea = this.scene.add.rectangle(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height, 0x000000, 0);
        this.interactionArea.setInteractive();
        this.interactionArea.on(Phaser.Input.Events.POINTER_DOWN, () => onPress());
    }

    private createImages(rule: TransformationRule) {
        let j = 0
        for (const symbol of rule.input) {
            this.symbolFactory.createSymbolImage(this.scene, symbol, this.x + j * this.maxSymbolSize, this.y, this.maxSymbolSize, true)
            j += 1
        }

        this.scene.add.image(this.x + j * this.maxSymbolSize, this.y, "arrow").setOrigin(0).setDisplaySize(this.maxSymbolSize, this.maxSymbolSize)
        j += 1

        for (const symbol of rule.output) {
            this.symbolFactory.createSymbolImage(this.scene, symbol, this.x + j * this.maxSymbolSize, this.y, this.maxSymbolSize, true)
            j += 1
        }

    }
}

export class RulePanelGraphics {
    private maxSymbolSize: number;
    private onRulePress: (ruleIndex:integer) => void
    private interactionArea: Phaser.GameObjects.Rectangle;
    ruleSubpanelGraphics: RuleSubpanelGraphics[];

    constructor(private scene: Phaser.Scene, private symbolFactory: SymbolFactory, private x: number, private y: number, private width: number, private height: number, private maxStringLength: integer, private rules: TransformationRule[]) {
        this.interactionArea = this.scene.add.rectangle(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height, 0x000000, 0.5);

        const maxSymbolWidth = this.width / this.maxStringLength
        const maxSymbolHeight = this.height / this.maxStringLength
        this.maxSymbolSize = Math.min(maxSymbolWidth, maxSymbolHeight)

        this.ruleSubpanelGraphics = []

        this.rules.forEach((r, i) => {
            const subpanel = new RuleSubpanelGraphics(this.scene, this.symbolFactory, this.x, this.y + i * this.maxSymbolSize, this.width, this.maxSymbolSize, this.maxStringLength, r, () => this.onPress(i))
            this.ruleSubpanelGraphics.push(subpanel)
        })
    }

    setOnRulePress(callback: (ruleIndex: integer) => void) {
        this.onRulePress = callback
    }

    private onPress(ruleIndex: integer) {
        if (this.onRulePress !== undefined) {
            this.onRulePress(ruleIndex)
        }
    }


}