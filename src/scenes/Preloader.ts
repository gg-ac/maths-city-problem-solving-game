import { Scene } from 'phaser';
import { FontFile } from '../utils/FontFile';

export class Preloader extends Scene
{
    orientation_warning_text: Phaser.GameObjects.Text;
    constructor (private nextSceneKey:string, private additionalFilepathsForPreload?:string[])
    {
        super('Preloader');
    }

    init ()
    {
        
        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        // Use the 'progress' event emitted by the LoaderPlugin to update the loading bar.
        // Note: the progress event fires once per loaded asset, not regularly in proportion to amount of data downloaded.
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        // Make sure the font files are loaded
        this.load.addFile(new FontFile(this.load, "font1", "Segment7", "fonts/Segment7Standard.woff"))
        this.load.addFile(new FontFile(this.load, "font1", "Segment7", "fonts/Segment7Standard.woff2"))

        // Symbols
        this.load.image('arrow', 'symbols/arrow.png');
        this.load.image('ellipsis-symbol', 'symbols/ellipsis_symbol.png');
        this.load.image('a', 'symbols/symbol1.png');
        this.load.image('b', 'symbols/symbol2.png');
        this.load.image('c', 'symbols/symbol3.png');
        this.load.image('d', 'symbols/symbol4.png');
        this.load.image('x', 'symbols/symbol_generic1.png');
        this.load.image('y', 'symbols/symbol_generic2.png');

        // User Interface
        this.load.image('bg-console', "new_ui/console_background.png")
        this.load.image('button-reset-up', "new_ui/button_reset_up.png")
        this.load.image('button-reset-down', "new_ui/button_reset_down.png")
        this.load.image('button-undo-up', "new_ui/button_undo_up.png")
        this.load.image('button-undo-down', "new_ui/button_undo_down.png")
        this.load.image('icon-cross-large', "new_ui/icon_cross_large.png")
        this.load.image('icon-tick-large', "new_ui/icon_tick_large.png")
        this.load.image('icon-tick', "new_ui/icon_tick.png")
        this.load.image('icon-warning', "new_ui/icon_warning.png")
        this.load.image('selection-outline', "new_ui/selection_outline.png")
        this.load.image('odometer-dial', "new_ui/odometer_dial.png")
        // this.load.image('bg-rule-button-up', "ui/rule_button_bg_up.png")
        // this.load.image('bg-rule-button-down', "ui/rule_button_bg_down.png")
        // this.load.image('bg-rule-button-up-light', "ui/rule_button_bg_up_light.png")
        // this.load.image('bg-rule-button-down-light', "ui/rule_button_bg_down_light.png")
        // this.load.image('bg-rule-button-up-light-transparent', "ui/rule_button_bg_up_light_transparent.png")
        // this.load.image('bg-rule-button-down-light-transparent', "ui/rule_button_bg_down_light_transparent.png")
        this.load.image('bg-unused-symbol-space', "ui/unused_symbol_space.png")
        this.load.image('bg-unused-symbol-space-light', "ui/unused_symbol_space_light.png")
        // this.load.image('bg-area-l', "ui/panel_light.png")
        // this.load.image('bg-area-m', "ui/panel_mid.png")
        // this.load.image('bg-area-d', "ui/panel_dark.png")
        // this.load.image('bg-area-outline', "ui/panel_outline.png")
        // this.load.image('icon-forbidden', "ui/icon_forbidden.png")
        // this.load.image('icon-target', "ui/icon_target.png")
        // this.load.image('icon-undo', "ui/icon_undo.png")

        // Load additional files
        if(this.additionalFilepathsForPreload != undefined){
            this.additionalFilepathsForPreload.forEach((f) => {
                this.load.image(f, f);
            })
        }

    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.

        this.cameras.main.fadeOut(1000, 0, 0, 0)

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(this.nextSceneKey);
        })
        
    }

}
