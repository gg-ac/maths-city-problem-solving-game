import { SymbolFactory } from "./SymbolFactory";
import { TransformationRule } from "./StringTransformation";
import { MAX_SYMBOL_SIZE, RULE_HORIZONTAL_MARGIN, RULE_HORIZONTAL_PAD, RULE_PANEL_SIDE_MARGIN, RULE_VERTICAL_MARGIN, RULE_VERTICAL_PAD, STATE_SYMBOL_HORIZONTAL_MARGIN } from "../constants/GameConstants";
import { OverlayCamera } from "./OverlayCamera";
import ShineEffect from "../ui/ShineEffect";
import { HideableItem } from "../ui/HideableItem";

export class RulePanelState {
    private _activeRuleIndex: integer | null
    constructor(private onUpdateActiveRule: (ruleIndex: integer | null, manualChange: boolean, activating:boolean) => void) {
        this._activeRuleIndex = null
    }

    public activateRule(ruleIndex: integer | null, manualChange: boolean) {
        this.onUpdateActiveRule(ruleIndex, manualChange, this._activeRuleIndex != ruleIndex)
        if (this._activeRuleIndex === ruleIndex) {
            this._activeRuleIndex = null
            return null
        } else {
            this._activeRuleIndex = ruleIndex
            return ruleIndex
        }

    }

    public get activeRuleIndex(): integer | null {
        return this._activeRuleIndex
    }

}

class RuleSubpanelGraphics implements HideableItem {
    private maxSymbolSize: number;
    private interactionArea: Phaser.GameObjects.Rectangle;
    // private activeIndicator: Phaser.GameObjects.Rectangle;
    private bgUp: Phaser.GameObjects.NineSlice;
    private bgDown: Phaser.GameObjects.NineSlice;
    private symbolImages: Phaser.GameObjects.Image[]
    private startX: number;
    private startY: number;
    private pressVerticalOffset: number = 20
    private bgUpOverlay: Phaser.GameObjects.NineSlice;
    private bgDownOverlay: Phaser.GameObjects.NineSlice;
    activeBorder: Phaser.GameObjects.NineSlice;
    shine: ShineEffect;

    constructor(private scene: Phaser.Scene, private symbolFactory: SymbolFactory, private x: number, private y: number, private width: number, private height: number, private rule: TransformationRule, onPress: () => void, private _isActive: boolean, private overlayCamera: OverlayCamera) {
        this.symbolImages = []

        // this.activeIndicator = this.scene.add.rectangle(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height, 0xff0000, 0.5);
        // this.activeIndicator.setVisible(false)

        // this.bgUpOverlay = this.scene.add.nineslice(this.x, this.y, "bg-rule-button-up-light-transparent", 0, 256, 256, 32, 32, 32, 64).setOrigin(0)
        // this.bgUpOverlay.setSize(this.width, this.height)
        // this.bgDownOverlay = this.scene.add.nineslice(this.x, this.y, "bg-rule-button-down-light-transparent", 0, 256, 256, 32, 32, 64, 32).setOrigin(0)
        // this.bgDownOverlay.setSize(this.width, this.height).setVisible(false)
        // this.overlayCamera.registerOverlayObjects([this.bgDownOverlay, this.bgUpOverlay])

        // this.bgUp = this.scene.add.nineslice(this.x, this.y, "bg-rule-button-up", 0, 256, 256, 32, 32, 32, 64).setOrigin(0)
        // this.bgUp.setSize(this.width, this.height)

        // this.bgDown = this.scene.add.nineslice(this.x, this.y, "bg-rule-button-down", 0, 256, 256, 32, 32, 64, 32).setOrigin(0)
        // this.bgDown.setSize(this.width, this.height).setVisible(false)

        this.shine = new ShineEffect(this.scene)

        this.activeBorder = this.scene.add.nineslice(this.x, this.y, "selection-outline", 0, 105, 105, 40, 40, 40, 40).setOrigin(0)
        this.activeBorder.setSize(this.width, this.height).setAlpha(0.5)
        this.activeBorder.setVisible(false)

        const maxSymbolWidth = (this.width - RULE_HORIZONTAL_PAD * 2) / (this.rule.input.length + this.rule.output.length + 1)
        const maxSymbolHeight = this.height - RULE_VERTICAL_PAD * 2
        this.maxSymbolSize = Math.min(maxSymbolWidth, maxSymbolHeight, MAX_SYMBOL_SIZE)
        this.startX = this.x + (this.width - (rule.input.length + rule.output.length + 1) * this.maxSymbolSize) / 2
        this.startY = this.y + (this.height - this.maxSymbolSize) / 2
        this.createImages(this.rule)

        this.interactionArea = this.scene.add.rectangle(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height, 0x000000, 0);
        this.interactionArea.setInteractive();
        this.interactionArea.on(Phaser.Input.Events.POINTER_DOWN, () => onPress());
    }

    setVisible(visible: boolean, disableInteractivity: boolean): void {
        this.symbolImages.forEach(img => {
            img.setVisible(visible)
        })
        this.interactionArea.setVisible(visible)
        this.activeBorder.setVisible(false)
        if (visible) {
            this.isActive = this.isActive //Reset to ensure the active border visibility is correct
        }
        if (disableInteractivity) {
            this.interactionArea.disableInteractive()
        } else {
            this.interactionArea.setInteractive()
        }
    }

    private createImages(rule: TransformationRule) {

        let j = 0
        for (const symbol of rule.input) {
            this.symbolImages.push(this.symbolFactory.createSymbolImage(this.scene, symbol, this.startX + j * this.maxSymbolSize, this.startY, this.maxSymbolSize, true))
            j += 1
        }

        this.symbolImages.push(this.scene.add.image(this.startX + j * this.maxSymbolSize, this.startY, "arrow").setOrigin(0).setDisplaySize(this.maxSymbolSize, this.maxSymbolSize))
        j += 1

        for (const symbol of rule.output) {
            this.symbolImages.push(this.symbolFactory.createSymbolImage(this.scene, symbol, this.startX + j * this.maxSymbolSize, this.startY, this.maxSymbolSize, true))
            j += 1
        }
    }

    public get isActive(): boolean {
        return this._isActive;
    }
    public set isActive(value: boolean) {
        this._isActive = value;
        if (this._isActive) {
            // this.activeIndicator.setVisible(true)
            // this.bgUp.setVisible(false)
            // this.bgDown.setVisible(true)
            // this.bgUpOverlay.setVisible(false)
            // this.bgDownOverlay.setVisible(true)
            this.activeBorder.setVisible(true)
            //this.symbolImages.forEach((img) => { img.setY(this.startY) })
        } else {
            // this.activeIndicator.setVisible(false)
            // this.bgUp.setVisible(true)
            // this.bgDown.setVisible(false)
            // this.bgUpOverlay.setVisible(true)
            // this.bgDownOverlay.setVisible(false)
            this.activeBorder.setVisible(false)
            //this.symbolImages.forEach((img) => { img.setY(this.startY) })
        }
    }

    public shake() {
        // Create a shake animation using tweens
        [...this.symbolImages].forEach((object) => {
            this.scene.tweens.add({
                targets: object,
                x: { value: object.x + 10, duration: 50, ease: 'Sine.easeInOut', yoyo: true, repeat: 5 },
                y: { value: object.y, duration: 50, ease: 'Sine.easeInOut', yoyo: true, repeat: 5 },
            });
        })
    }

    public animateSuccess() {
        this.shine.trigger(this.activeBorder)
    }
}

export class RulePanelGraphics implements HideableItem {
    private maxSymbolSize: number;
    private onRulePress: (ruleIndex: integer) => void
    private background: Phaser.GameObjects.NineSlice;
    ruleSubpanelGraphics: RuleSubpanelGraphics[];
    private outline: Phaser.GameObjects.NineSlice;

    constructor(private scene: Phaser.Scene, private symbolFactory: SymbolFactory, private x: number, private y: number, private width: number, private height: number, private maxStringLength: integer, private rules: TransformationRule[], private overlayCamera: OverlayCamera) {

        // this.background = this.scene.add.nineslice(this.x + RULE_PANEL_SIDE_MARGIN, this.y, "bg-area-l", 0, 256, 256, 24, 24, 24, 24).setOrigin(0);
        // this.background.setSize(clippedWidth, this.height)

        // this.outline = this.scene.add.nineslice(this.x + RULE_PANEL_SIDE_MARGIN, this.y, "bg-area-outline", 0, 256, 256, 24, 24, 24, 24).setOrigin(0);
        // this.outline.setSize(clippedWidth, this.height)
        // this.overlayCamera.registerOverlayObjects([this.outline])

        const maxSymbolWidth = this.width / this.maxStringLength
        const maxSymbolHeight = this.height / this.rules.length
        this.maxSymbolSize = Math.min(maxSymbolWidth, maxSymbolHeight, MAX_SYMBOL_SIZE)
        console.log(maxSymbolWidth, maxSymbolHeight, MAX_SYMBOL_SIZE)

        const centredX = this.x + RULE_PANEL_SIDE_MARGIN + (this.width - (this.maxSymbolSize * this.maxStringLength)) / 2

        const actualWidth = this.maxSymbolSize * this.maxStringLength
        //const bg = this.scene.add.rectangle(centredX + actualWidth/2, this.y+this.height/2, actualWidth, this.height, 0xffffff, 0.5);   


        this.ruleSubpanelGraphics = []

        this.rules.forEach((r, i) => {
            const subpanel = new RuleSubpanelGraphics(this.scene, this.symbolFactory, centredX, this.y + RULE_VERTICAL_MARGIN + i * (this.maxSymbolSize + RULE_VERTICAL_MARGIN), actualWidth, this.maxSymbolSize, r, () => this.onPress(i), false, this.overlayCamera)
            this.ruleSubpanelGraphics.push(subpanel)
        })
    }
    setVisible(visible: boolean, disableInteractive:boolean): void {
        this.ruleSubpanelGraphics.forEach(panel => {
            panel.setVisible(visible, disableInteractive)
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

    public animateRuleShake(index: integer) {
        this.ruleSubpanelGraphics[index].shake()
    }

    public animateRuleSuccess(index: integer) {
        this.ruleSubpanelGraphics[index].animateSuccess()
    }

}