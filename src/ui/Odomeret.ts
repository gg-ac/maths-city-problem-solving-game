export class Odometer {
    textDigits: Phaser.GameObjects.Text[][];
    digitMasks: Phaser.Display.Masks.BitmapMask[];

    constructor(private scene: Phaser.Scene, private digits: integer, private value: integer, private x: number, private y: number, private digitWidth: number, private digitHeight: number) {
        this.textDigits = [];
        this.digitMasks = []

        for (let i = 0; i < this.digits; i++) {

            const bgImage = this.scene.add.image(this.x + i * this.digitWidth, this.y, "odometer-dial").setDisplaySize(digitWidth, digitHeight).setOrigin(0.5)

            let digitList = []
            for (let j = 0; j < 10; j++) {
                const digit = this.scene.add.text(this.x + i * this.digitWidth, this.y - j * this.digitHeight, `${j}`, {
                    fontSize: '42px',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    align:"center",
                    lineSpacing: 0,
                    baselineY: 0
                }).setOrigin(0.5, 0.25);
                digit.setFixedSize(this.digitWidth, this.digitHeight)
                digitList.push(digit);
            }
            this.textDigits.push(digitList)

            
            const maskTexture = this.scene.add.image(this.x + i * this.digitWidth, this.y, "odometer-dial").setVisible(false)
            maskTexture.setDisplaySize(digitWidth, digitHeight)
            const mask = this.scene.add.bitmapMask(maskTexture, this.x + i * this.digitWidth, this.y);
            this.digitMasks.push(mask)
            digitList.forEach((txt) => {
                txt.setMask(mask)
            })
        }


        this.scene.time.addEvent({
            delay: 2000, // Time in milliseconds (3000 ms = 3 seconds)
            callback: this.onTimedEvent,
            callbackScope: this, // Set the context for the callback
            loop: true // Set to true if you want the event to repeat
        });

        for(let i = 0; i < digits; i++){
            this.setDigitColumnPositions(i, 0)
        }

        this.setValue(this.value)
    }

    onTimedEvent(){
        
       this.setValue(this.value - 1)
    }

    private splitIntegerIntoDigits(num: number): number[] {
        return num.toString().split('').map(digit => parseInt(digit, 10));
    }

    setDigitColumnPositions(columnIndex: integer, valueIndex: integer) {

        this.textDigits[columnIndex].forEach((txt, j) => {
            //txt.setY(this.y + (valueIndex - j) * this.digitHeight)

            let offset = (j - valueIndex)
            
            if(offset >= 6){
                 offset = offset - 10
            }
            if(offset < -3){
                offset = offset + 10                
            }
            const newY = this.y -  offset* this.digitHeight
          
            if((newY < txt.y - this.digitHeight) || (newY > txt.y + this.digitHeight)){
                txt.setY(newY)
            }else{
                this.scene.tweens.add({
                    targets: txt,
                    y: newY,
                    duration: 500,
                    ease:"Power2",
                    onComplete: () => {
                        console.log("DONE")
                    }
                });
            }

            
            

            

            // let offset = 0
            // if(j < valueIndex - 2){
            //     offset = 9 - (valueIndex - 1)
            //     txt.setY(this.y - (offset + j) * this.digitHeight)
            // }else{

            //     txt.setY(this.y + (valueIndex - j) * this.digitHeight,)

            //     // this.scene.tweens.add({
            //     //     targets: txt,
            //     //     y: this.y + (valueIndex - j) * this.digitHeight,
            //     //     duration: 500,
            //     //     onComplete: () => {
            //     //         console.log("DONE")
            //     //     }
            //     // });
            // }
        })

    }

    setValue(value: integer) {
        this.value = value
        const digitIndexes = this.splitIntegerIntoDigits(value)
        const offset = this.digits - digitIndexes.length

        // for (let i = 0; i + offset < digitIndexes.length; i++) {
        //     this.setDigitColumnPositions(i + offset, 0)
        // }

        digitIndexes.forEach((val, i) => {
            this.setDigitColumnPositions(i + offset, val)
        })

    }

}