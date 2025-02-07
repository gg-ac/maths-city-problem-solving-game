import { HideableItem } from "./HideableItem";

export class DigitalPanel implements HideableItem {

    private text: Phaser.GameObjects.Text;

    constructor(private scene: Phaser.Scene, private value: string, private x: number, private y: number, private width: number, private height: number) {
        this.text = this.scene.add.text(this.x, this.y, `${this.value}`, {
            fontSize: this.height,
            color: '#ffffff',
            fontFamily: 'Segment7',
            align: "center",
            lineSpacing: 0,
            baselineY: 0,
            //backgroundColor:"#010101"
        }).setOrigin(0, 0.35).setAlpha(0.7);
        this.text.setFixedSize(this.width, this.height)
    }
    setVisible(visible: boolean): void {
        this.text.setVisible(visible)
    }

    setValue(value: string) {
        this.value = value
        this.text.setText(`${this.value}`)
    }

}