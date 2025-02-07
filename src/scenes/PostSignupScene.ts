import { GAME_HEIGHT, GAME_WIDTH } from "../constants/GameConstants";
import { ComicPage, ComicPanelConfig } from "../ui/comics/ComicPage";
import BaseScene from "./BaseScene";


export class PostSignupScene extends BaseScene {

    constructor(sceneKey: string, private nextSceneKey:string) {
        super(sceneKey);
    }

    create() {
        super.create()

        const messageText = this.add.text(GAME_WIDTH/2, GAME_HEIGHT * 0.5, 'Check your emails for the signup link!', {
            fontSize: '60px',
            color: '#ffffff',
            align:'center',
            wordWrap: {
                width: GAME_WIDTH*0.8,
                useAdvancedWrap: true
            }
        }).setOrigin(0.5)

        const resendButton = this.add.text(GAME_WIDTH/2, GAME_HEIGHT * 0.8, "[Resend Signup Email]", {
            fontSize: '50px',
            color: '#ffffff',
            align:'center'
        }).setOrigin(0.5).setInteractive()

        resendButton.on('pointerdown', () => { this.scene.start(this.nextSceneKey) });
    }

}