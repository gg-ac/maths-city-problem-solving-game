import Phaser from 'phaser';
import { UAParser } from 'ua-parser-js';

export default class BaseScene extends Phaser.Scene {

    constructor(key: string) {
        super(key);
    }

    create() {
        this.checkDeviceAndOrientation();
        this.scale.on('orientationchange', () => { this.checkDeviceAndOrientation; this.scale.refresh() }, this);
        this.scale.on('resize', this.checkDeviceAndOrientation, this);
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
        if (!this.scene.isPaused()) {
            this.scene.pause();
        }
    }

    private hideWarning() {
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        if (this.scene.isPaused()) {
            this.scene.resume();
        }
    }
}