import { SymbolFactory } from "./SymbolFactory";
import { TransformationRule } from "./StringTransformation";
import { MAX_SYMBOL_SIZE } from "../constants/GameConstants";

export class RulePanelState {
    private _activeRuleIndex: integer | null
    constructor(private onUpdateActiveRule: (ruleIndex: integer | null) => void) {
        this._activeRuleIndex = null
    }

    public activateRule(ruleIndex: integer | null) {
        if (this._activeRuleIndex === ruleIndex) {
            this._activeRuleIndex = null
        } else {
            this._activeRuleIndex = ruleIndex
        }
        this.onUpdateActiveRule(ruleIndex)
    }

    public get activeRuleIndex():integer|null{
        return this._activeRuleIndex
    }

}

class RuleSubpanelGraphics {
    private maxSymbolSize: number;
    private interactionArea: Phaser.GameObjects.Rectangle;
    private activeIndicator: Phaser.GameObjects.Rectangle;

    constructor(private scene: Phaser.Scene, private symbolFactory: SymbolFactory, private x: number, private y: number, private width: number, private height: number, private maxStringLength: integer, private rule: TransformationRule, onPress: () => void, private _isActive: boolean) {
        this.activeIndicator = this.scene.add.rectangle(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height, 0xff0000, 0.5);
        this.activeIndicator.setVisible(false)

        const maxSymbolWidth = this.width / this.maxStringLength
        const maxSymbolHeight = this.height
        this.maxSymbolSize = Math.min(maxSymbolWidth, maxSymbolHeight, MAX_SYMBOL_SIZE)
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

    public get isActive(): boolean {
        return this._isActive;
    }
    public set isActive(value: boolean) {
        this._isActive = value;
        if (this._isActive) {
            this.activeIndicator.setVisible(true)
        } else {
            this.activeIndicator.setVisible(false)
        }
    }
}

export class RulePanelGraphics {
    private maxSymbolSize: number;
    private onRulePress: (ruleIndex: integer) => void
    private interactionArea: Phaser.GameObjects.Rectangle;
    ruleSubpanelGraphics: RuleSubpanelGraphics[];

    constructor(private scene: Phaser.Scene, private symbolFactory: SymbolFactory, private x: number, private y: number, private width: number, private height: number, private maxStringLength: integer, private rules: TransformationRule[]) {
        this.interactionArea = this.scene.add.rectangle(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height, 0x000000, 0.5);

        const maxSymbolWidth = this.width / this.maxStringLength
        const maxSymbolHeight = this.height / this.maxStringLength
        this.maxSymbolSize = Math.min(maxSymbolWidth, maxSymbolHeight)

        this.ruleSubpanelGraphics = []

        this.rules.forEach((r, i) => {
            const subpanel = new RuleSubpanelGraphics(this.scene, this.symbolFactory, this.x, this.y + i * this.maxSymbolSize, this.width, this.maxSymbolSize, this.maxStringLength, r, () => this.onPress(i), false)
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

    public setActiveSubpanel(ruleIndex: integer | null) {
        this.ruleSubpanelGraphics.forEach((rsp, i) => {
            if (i === ruleIndex) {
                if (!rsp.isActive) {
                    rsp.isActive = true
                } else {
                    rsp.isActive = false
                }
            } else {
                rsp.isActive = false
            }
        })
    }

}