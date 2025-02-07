import Phaser from 'phaser';
import { HideableItem } from './HideableItem';
import { GameEvent } from '../constants/GameConstants';

export type HideableObjectDict = {
    [key: string]: HideableItem[];
};

export type PositionSizeDict = {
    [key: string]: {
        "size": Phaser.Geom.Point
        "position": Phaser.Geom.Point
    };
};


export class InstructionSpec {
    constructor(public text: string, public positionSpecKey: string, public hiddenObjectsKey: string, public progressionEvents: GameEvent[], public goBackEvents?: GameEvent[], public disableInteractivity?: boolean, public delayBeforeNext?: number) { }
}


export class Instructions {
    private scene: Phaser.Scene;
    private text: Phaser.GameObjects.Text;
    private currentIndex: number;
    private waitingToMoveToNext: boolean;
    private afterFinalInstructionCalled: boolean;

    constructor(scene: Phaser.Scene, private hiddenObjectConfig: HideableObjectDict, private layouts: PositionSizeDict, private instructions: InstructionSpec[], private afterFinalInstruction: () => void) {
        this.scene = scene;
        this.currentIndex = 0;

        // Create a transparent black background

        // Create the text object
        this.text = this.scene.add.text(400, 300, this.instructions[this.currentIndex].text, {
            fontSize: '64px',
            color: '#ffffff',
            align: 'center',
            padding: { x: 20, y: 40 },
            lineSpacing: 15,
            wordWrap: { width: 580, useAdvancedWrap: true }
        });
        this.text.setOrigin(0.5, 0);

        this.setCurrentDisplay()

        for (const event of Object.values(GameEvent)) {
            this.scene.events.on(event, () => this.onEvent(event))
        }

        this.waitingToMoveToNext = false
        this.afterFinalInstructionCalled = false

    }

    private onEvent(event: GameEvent) {
        if (this.instructions[this.currentIndex].progressionEvents.includes(event)) {
            const delay = this.instructions[this.currentIndex].delayBeforeNext
            if (!this.waitingToMoveToNext) {
                if (delay != undefined) {
                    this.waitingToMoveToNext = true
                    this.scene.time.delayedCall(delay, () => {
                        this.next()
                        this.waitingToMoveToNext = false
                    }, [], this);
                } else {
                    this.next()
                    this.waitingToMoveToNext = false
                }
            }
        } else if (this.instructions[this.currentIndex].goBackEvents?.includes(event)) {
            this.previous()
        }
    }

    public next(): void {
        if (this.currentIndex < this.instructions.length - 1) {
            this.currentIndex += 1
            this.setCurrentDisplay()
        } else {
            if (!this.afterFinalInstructionCalled) {
                this.afterFinalInstruction()
                this.afterFinalInstructionCalled = true
            }
        }
    }

    public previous(): void {
        if (this.currentIndex > 0) {
            this.currentIndex -= 1
            this.setCurrentDisplay()
        } else {
            this.afterFinalInstruction()
        }
    }

    private setCurrentDisplay() {
        this.text.setText(this.instructions[this.currentIndex].text);

        let pos = this.layouts[this.instructions[this.currentIndex].positionSpecKey]["position"]
        let size = this.layouts[this.instructions[this.currentIndex].positionSpecKey]["size"]

        let hiddenObjects = this.hiddenObjectConfig[this.instructions[this.currentIndex].hiddenObjectsKey]

        this.setPosition(pos.x, pos.y)
        this.setSize(size.x, size.y)

        // Unhide everything
        Object.entries(this.hiddenObjectConfig).forEach(([_, objectList]) => {
            objectList.forEach((object) => {
                object.setVisible(true, this.instructions[this.currentIndex].disableInteractivity)
            })
        })

        // Hide only what needs to be hidden currently
        hiddenObjects.forEach(object => {
            object.setVisible(false, this.instructions[this.currentIndex].disableInteractivity)
        })

    }


    private setPosition(x: number, y: number): void {
        this.text.setPosition(x, y);
    }

    private setSize(w: number, h: number): void {
        this.text.setSize(w, h);
        this.text.setWordWrapWidth(w);
    }

    public destroy(): void {
        this.text.destroy();
    }
}