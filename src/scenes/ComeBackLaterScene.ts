import { GAME_HEIGHT, GAME_WIDTH } from "../constants/GameConstants";
import BaseScene from "./BaseScene";


export class ComeBackLaterScene extends BaseScene {

    constructor(sceneKey: string, private hoursUntilNextSession:number) {
        super(sceneKey);
    }

    create() {
        super.create()

        const messageText = this.add.text(GAME_WIDTH/2, GAME_HEIGHT * 0.45, 'This session will be available', {
            fontSize: '60px',
            color: '#ffffff',
            align:'center'
        }).setOrigin(0.5)


        let comeBackSoonMessage = `in ${(this.hoursUntilNextSession * 60).toFixed(0)} minutes`
        if (this.hoursUntilNextSession > 1){
            comeBackSoonMessage = `in ${this.hoursUntilNextSession.toFixed(1)} hours`;
        }

        const returnTimeText = this.add.text(GAME_WIDTH/2, GAME_HEIGHT * 0.52, comeBackSoonMessage, {
            fontSize: '50px',
            color: '#ffffff',
            align:'center'
        }).setOrigin(0.5)


        this.cameras.main.fadeIn(1000, 0, 0, 0)

    }

   
   
}