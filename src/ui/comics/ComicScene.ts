import { GAME_HEIGHT, GAME_WIDTH } from "../../constants/GameConstants";
import BaseScene from "../../scenes/BaseScene";
import { ComicPage, ComicPanelConfig } from "./ComicPage";

export class ComicScene extends BaseScene {
    private skipButton: Phaser.GameObjects.Text;
    private continueButton: Phaser.GameObjects.Text;
    private currentPageIndex: integer;
    private currentComicPage: ComicPage;
    constructor(sceneKey: string, private pages: ComicPanelConfig[][] | undefined, private rows: integer, private columns: integer, private nextSceneKey: string) {
        super(sceneKey);
    }

    create() {
        super.create()

        this.currentPageIndex = 0

        this.skipButton = this.add.text(50, GAME_HEIGHT * 0.9, 'Skip', {
            fontSize: '64px',
            color: '#ffffff55',
        }).setOrigin(0).setInteractive()
        this.skipButton.on('pointerdown', () => { this.finish() });

        this.continueButton = this.add.text(GAME_WIDTH - 50, GAME_HEIGHT * 0.9, 'Continue', {
            fontSize: '64px',
            color: '#ffffff55',
        }).setOrigin(1, 0).setInteractive()
        this.continueButton.on('pointerdown', () => { this.onContinue() });
        this.continueButton.alpha = 0


        this.cameras.main.fadeIn(1000, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            this.showNextPage()
        })
    }

    private onContinue() {
        if (this.pages === undefined) {
            this.finish()
        } else {
            console.log(this.pages)
            this.currentPageIndex += 1
            // Run the final continue callback when the pages have been exhausted
            if (this.pages.length <= this.currentPageIndex) {
                this.finish()
            } else {
                this.showNextPage()
            }
        }

    }

    private finish() {
        this.scene.start(this.nextSceneKey)
    }

    showNextPage() {
        if (this.pages != undefined) {
            const panels = this.pages[this.currentPageIndex]

            if (this.currentComicPage != undefined) {
                this.currentComicPage.destroy()
            }
            this.currentComicPage = new ComicPage(this, panels, GAME_WIDTH, GAME_HEIGHT * 0.9, this.rows, this.columns);
            this.currentComicPage.create();

            this.continueButton.alpha = 0
            const totalDelay = panels.reduce((accumulator, panel) => accumulator + panel.delay, 0);
            this.tweens.add({
                targets: this.continueButton,
                alpha: 1,
                duration: 1000,
                delay: totalDelay,
                ease: 'Linear'
            });
        }
    }
}