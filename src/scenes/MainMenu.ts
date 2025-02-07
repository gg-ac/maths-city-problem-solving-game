import { GameObjects } from 'phaser';
import BaseScene from './BaseScene';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/GameConstants';

export class MainMenu extends BaseScene {
    background: GameObjects.Image;
    continueButton: GameObjects.Text;
    signOutButton: GameObjects.Text;
    orientation_warning_text: GameObjects.Text;
    newGameButton: GameObjects.Text;
    signInButton: GameObjects.Text;
    signUpButton: GameObjects.Text;

    constructor(private sessionNumber: integer, private mainGameSceneKey: string) {
        super('MainMenu');
    }

    create() {

        this.continueButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Start Session ${this.sessionNumber + 1}`, {
            fontFamily: 'Arial Black', fontSize: 46, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        this.continueButton.on('pointerdown', () => {
            this.scene.start(this.mainGameSceneKey)
        });

        super.create()
    }
}
