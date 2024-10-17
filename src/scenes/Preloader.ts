import { Scene } from 'phaser';

export class Preloader extends Scene
{
    orientation_warning_text: Phaser.GameObjects.Text;
    constructor ()
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
            console.log(progress)

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');        
        this.load.image('active_symbol_indicator', 'symbols/symbol_selection_box.png');

        // Symbols
        this.load.image('arrow', 'symbols/arrow.png');
        this.load.image('s1', 'symbols/shape_s1.png');
        this.load.image('s2', 'symbols/shape_s2.png');
        this.load.image('s3', 'symbols/shape_s3.png');
        this.load.image('s4', 'symbols/shape_s4.png');
        this.load.image('sg1', 'symbols/shape_sg1.png');
        this.load.image('sg2', 'symbols/shape_sg2.png');

        // User Interface
        this.load.image('bg-rule-button-up', "ui/rule_button_bg_up.png")
        this.load.image('bg-rule-button-down', "ui/rule_button_bg_down.png")
        this.load.image('bg-rule-button-up-light', "ui/rule_button_bg_up_light.png")
        this.load.image('bg-rule-button-down-light', "ui/rule_button_bg_down_light.png")
        this.load.image('bg-rule-button-up-light-transparent', "ui/rule_button_bg_up_light_transparent.png")
        this.load.image('bg-rule-button-down-light-transparent', "ui/rule_button_bg_down_light_transparent.png")
        this.load.image('bg-unused-symbol-space', "ui/unused_symbol_space.png")
        this.load.image('bg-unused-symbol-space-light', "ui/unused_symbol_space_light.png")
        this.load.image('bg-area-l', "ui/panel_light.png")
        this.load.image('bg-area-m', "ui/panel_mid.png")
        this.load.image('bg-area-d', "ui/panel_dark.png")
        this.load.image('bg-area-outline', "ui/panel_outline.png")
        this.load.image('icon-forbidden', "ui/icon_forbidden.png")
        this.load.image('icon-target', "ui/icon_target.png")
        this.load.image('icon-redo', "ui/icon_redo.png")

        // Study schedule
        this.load.json("studySchedule", "studies/study_schedule_1.json")
       
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('TestScene');
    }

}
