import { GameObjects } from 'phaser';
import BaseScene from './BaseScene';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/GameConstants';

export class MainMenu extends BaseScene
{
    background: GameObjects.Image;
    title: GameObjects.Text;
    orientation_warning_text: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(GAME_WIDTH/2, GAME_HEIGHT/2, 'background');
        this.background.setDisplaySize(GAME_WIDTH, GAME_HEIGHT)

        this.title = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, 'PLAY', {
            fontFamily: 'Arial Black', fontSize: 46, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        this.title.on('pointerdown', () => {
            this.scene.start('Game');
        });

        super.create()
    }
}
