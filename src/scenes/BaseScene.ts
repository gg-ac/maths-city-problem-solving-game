import Phaser from 'phaser';
import { UAParser } from 'ua-parser-js';

export default class BaseScene extends Phaser.Scene {

    constructor(key: string) {
        super(key);
    }

    create() {
        this.checkDeviceAndOrientation();
        window.addEventListener('resize', this.checkDeviceAndOrientation.bind(this));
    }

    private checkDeviceAndOrientation() {
        const isMobile = this.isMobileDevice();
        const isLandscape = window.innerWidth > window.innerHeight;

        if (isMobile && isLandscape) {
            this.showWarning();
        } else {
            this.hideWarning();
        }
    }

    private isMobileDevice(): boolean {
        // Use UAParser to guess the device type
        const parser = new UAParser();
        const result = parser.getResult();
        return result.device.type === "mobile"
    }

    private showWarning() {
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
        this.scene.pause();
    }

    private hideWarning() {
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        this.scene.resume();
    }

    // Clean up the event listener when the scene is destroyed
    shutdown() {
        window.removeEventListener('resize', this.checkDeviceAndOrientation.bind(this));
    }
}



// import Phaser from 'phaser';

// export default class BaseScene extends Phaser.Scene {
//     private startText: Phaser.GameObjects.Text;

//     constructor(key:string) {
//         super(key);
//     }

//     preload() {
//         // Load any assets if needed
//     }

//     create() {
//         // Display the "press to start" message
//         this.startText = this.add.text(
//             this.cameras.main.centerX,
//             this.cameras.main.centerY,
//             'Press to Start',
//             { fontSize: '32px', color: '#ffffff' }
//         ).setOrigin(0.5, 0.5);

//         // Add an input listener for the pointer down event
//         this.input.on('pointerdown', this.enterFullscreen, this);

//         // Listen for fullscreen change events
//         this.scale.on('fullscreenchange', this.onFullscreenChange, this);
//     }

//     private async enterFullscreen() {
//         if (!this.scale.isFullscreen) {
//             // Start fullscreen mode
//             await this.scale.startFullscreen();

//             // Lock the orientation to portrait
//             if (screen.orientation && screen.orientation.lock) {
//                 try {
//                     await screen.orientation.lock('portrait');
//                 } catch (err) {
//                     console.error('Failed to lock orientation:', err);
//                 }
//             }
//         }
//     }

//     private onFullscreenChange() {
//         if (!this.scale.isFullscreen) {
//             // If exiting fullscreen, show the "press to start" message again
//             this.startText.setVisible(true);
//         } else {
//             // If entering fullscreen, hide the message
//             this.startText.setVisible(false);
//         }
//     }
// }