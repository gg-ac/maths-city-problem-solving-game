import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/GameConstants';
import { DataStore, EventMemoryTaskCompleted, EventMemoryTaskResponseKeyPressed, EventTaskStatus, RunningMemorySpanTaskEventType } from './DataStorage';

export class RunningMemorySpanTask {
    private digits: string[] = [];
    private inputText: Phaser.GameObjects.Text;
    private userInput: string = '';

    doneButton: Phaser.GameObjects.Text;
    instructionText: Phaser.GameObjects.Text;
    fixationCross: Phaser.GameObjects.Text;

    private EVENTS_CAP: integer = 40;
    private event_count = 0
    private trail_ended = false

    constructor(private scene: Phaser.Scene, private sequenceLength: integer, private maxRecallLength: integer, private dataStore: DataStore, private onTrialComplete: () => void) {

        this.inputText = this.scene.add.text(GAME_WIDTH / 2, 2 * GAME_HEIGHT / 4, '', {
            fontSize: '124px', color: '#fff',
            lineSpacing: 10,
            wordWrap: {
                width: GAME_WIDTH * 0.8,
                useAdvancedWrap: true
            }
        }).setOrigin(0.5);

        // Create a start button
        this.fixationCross = this.scene.add.text(GAME_WIDTH / 2, 2 * GAME_HEIGHT / 4, '+', { fontSize: '72px', color: '#0f0' }).setOrigin(0.5);

        this.instructionText = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 4, 'Done',
            {
                fontSize: '56px',
                color: '#0f0',
                align: 'center',
                wordWrap: {
                    width: GAME_WIDTH * 0.8,
                    useAdvancedWrap: true
                }
            }).setOrigin(0.5).setVisible(false)

        this.doneButton = this.scene.add.text(GAME_WIDTH / 2, 3 * GAME_HEIGHT / 4, 'Done', { fontSize: '72px', color: '#0f0', align: 'center' }).setOrigin(0.5).setInteractive().setVisible(false)

        // startButton.on('pointerdown', () => {
        //     startButton.destroy(); // Remove the button
        //     this.startMemoryTask(); // Start the memory task
        // });

        this.scene.time.delayedCall(1500, () => {
            this.fixationCross.destroy()
            this.dataStore.startNewRunningMemorySpanTaskTrial()
            this.startMemoryTask()
        }, [], this);

    }

    startMemoryTask() {
        this.dataStore.addEvent(new EventTaskStatus(RunningMemorySpanTaskEventType.START_TRIAL))
        this.generateSequence(this.sequenceLength);
        this.displayDigits();
    }



    generateSequence(requiredLength: number) {
        // const allDigits: integer[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        // while (this.digits.length < requiredLength) {
        //     const shuffledArray = this.shuffleArray(allDigits)

        //     if (this.digits.length == 0 || this.digits[this.digits.length - 1] != shuffledArray[0]) {
        //         const n = Math.min(10, requiredLength - this.digits.length)
        //         shuffledArray.slice(0, n).forEach((i) => {
        //             this.digits.push(i.toString())
        //         })
        //     }
        // }

        this.digits = this.generateRandomString(requiredLength)
    }


    generateRandomString(n: number): string[] {
        const digits = '123456789';
        const result: string[] = [];
        const digitCount: { [key: string]: number } = {};

        // Helper function to check if the last 6 digits contain the current digit
        const isValidWindow = (digit: string): boolean => {
            const window = result.slice(-6);
            return !window.includes(digit);
        };

        // Helper function to check if the digit can be added
        const canAddDigit = (digit: string): boolean => {
            if (digitCount[digit] >= 3) return false; // No more than 3 occurrences
            if (!isValidWindow(digit)) return false; // No repeats in the last 6 digits
            if (result.length > 0) {
                const lastDigit = result[result.length - 1];
                // Check if the current digit is in forward numerical order with the last digit
                if (parseInt(digit) === parseInt(lastDigit) + 1) return false;

                // Check if the current digit is in reverse numerical order with the last digit
                if (parseInt(digit) === parseInt(lastDigit) - 1) return false;
            }
            return true;
        };

        while (result.length < n) {
            const randomIndex = Math.floor(Math.random() * digits.length);
            const digit = digits[randomIndex];

            if (canAddDigit(digit)) {
                result.push(digit);
                digitCount[digit] = (digitCount[digit] || 0) + 1;
            }

        }
        return result
    }

    async displayDigits() {
        this.dataStore.addEvent(new EventTaskStatus(RunningMemorySpanTaskEventType.START_RECITE_DIGITS))
        for (const digit of this.digits) {
            this.inputText.setText(digit);
            this.scene.sound.play(digit);
            await this.sleep(250); // Wait for 250ms
        }
        this.inputText.setText(''); // Clear the text after displaying all digits
        this.promptUserInput();
    }

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    promptUserInput() {
        this.dataStore.addEvent(new EventTaskStatus(RunningMemorySpanTaskEventType.END_RECITE_DIGITS))

        this.doneButton.setVisible(true)
        this.doneButton.on('pointerdown', () => this.checkInput())

        this.instructionText.setVisible(true)
        this.instructionText.setText("Type as many digits from the end of the list as you can remember in the order they occurred (earliest to latest).\n\nPress backspace to delete.\n\nPress 'Done' when you cannot remember any more")
        this.setResponseText()

        this.scene.input.keyboard?.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.handleInput, this);
    }

    handleInput(event: KeyboardEvent) {
        // if (event.key === 'Enter') {
        //     this.checkInput();
        // }
        if (!this.trail_ended){
        if (this.event_count < this.EVENTS_CAP) {
            if (event.key === 'Backspace') {
                if (this.userInput.length > 0) {
                    this.userInput = this.userInput.slice(0, this.userInput.length - 1);
                    this.dataStore.addEvent(new EventMemoryTaskResponseKeyPressed(RunningMemorySpanTaskEventType.RESPONSE_KEY_PRESSED, event.key))
                    this.event_count += 1
                }

            } else if (event.key.length === 1 && /\d/.test(event.key)) {
                if (this.userInput.length < this.maxRecallLength) {
                    this.userInput += event.key;
                    this.dataStore.addEvent(new EventMemoryTaskResponseKeyPressed(RunningMemorySpanTaskEventType.RESPONSE_KEY_PRESSED, event.key))
                    this.event_count += 1
                }
            }
        }
        this.setResponseText()
    }
    }

    setResponseText() {
        this.inputText.setFontSize("64px")
        this.inputText.setText(this.digits.slice(0, this.sequenceLength - this.maxRecallLength).join(" ") + (" " + this.userInput).split("").join(" ") + " □".repeat(this.maxRecallLength - this.userInput.length));
        
        if(this.userInput.length == 0){
            this.inputText.setText("...")
        }else{
        this.inputText.setText((" " + this.userInput).split("").join(" "))//.repeat(this.maxRecallLength - this.userInput.length));
        }
    }

    checkInput() {
        // console.log(this.userInput)
        // console.log(this.digits.slice(this.digits.length - this.maxRecallLength).join(""))

        const correctEndDigits = this.digits.slice(this.digits.length - this.userInput.length)
        let numberCorrect = 0
        for (let i = 0; i < correctEndDigits.length; i++) {
            if (correctEndDigits[i] == this.userInput[i]) {
                numberCorrect += 1
            }
        }

        this.instructionText.setVisible(false)
        this.doneButton.setVisible(false)
        this.inputText.setText(`${numberCorrect} correct`);
        this.scene.input.keyboard?.off(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.handleInput, this);
        this.dataStore.addEvent(new EventMemoryTaskCompleted(RunningMemorySpanTaskEventType.RESPONSE_SUBMITTED, this.digits.join(""), this.userInput))
        this.dataStore.addEvent(new EventTaskStatus(RunningMemorySpanTaskEventType.END_TRIAL))
        this.dataStore.dbSaveCurrentTrialData()
        this.trail_ended = true
        this.onTrialComplete()
    }

    clearGraphics() {
        this.instructionText.setText("")
        this.inputText.setText("")
        this.doneButton.setText("")
        this.instructionText.setVisible(false)
        this.inputText.setVisible(false)
        this.doneButton.setVisible(false)
    }
}