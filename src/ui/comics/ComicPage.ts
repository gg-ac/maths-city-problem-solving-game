import Phaser from 'phaser';

export interface ComicPanelConfig {
    filepath: string; // Filepath of the image asset, also used as the phaser image key
    row: number; // Row index for positioning
    col: number; // Column index for positioning
    rowSpan: number; // Number of rows the panel spans
    colSpan: number; // Number of columns the panel spans
    delay: number; // Delay before the panel fades in
}

export class ComicPage {
    private rowHeight: number;
    private columnWidth: number;
    private panelImages: Phaser.GameObjects.Image[]

    constructor(private scene: Phaser.Scene, private panels: ComicPanelConfig[], private width: number, private height:number, private rows:integer, private columns:integer) {
        this.rowHeight = this.height/this.rows
        this.columnWidth = this.width/this.columns
        this.panelImages = []
    }

    public create() {        
        this.panels.forEach(panel => {
            const panelImage = this.scene.add.image(0, 0, panel.filepath).setOrigin(0);
            this.panelImages.push(panelImage)
            panelImage.setAlpha(0); // Start fully transparent

            // Calculate position based on row and column
            const panelWidth = panel.colSpan * this.columnWidth;
            const panelHeight = panel.rowSpan * this.rowHeight;
            const x = panel.col * this.columnWidth;
            const y = panel.row * this.rowHeight;

            // Set the position of the panel
            panelImage.setPosition(x, y);
            panelImage.setDisplaySize(panelWidth, panelHeight)

            // Fade in the panel after the specified delay
            this.scene.tweens.add({
                targets: panelImage,
                alpha: 1,
                duration: 1000, // Duration of the fade-in effect
                delay: panel.delay,
                ease: 'Linear'
            });
        });
    }

    public destroy() {
        this.panelImages.forEach(panelImage => {
            // Fade in the panel after the specified delay
            this.scene.tweens.add({
                targets: panelImage,
                alpha: 0,
                duration: 100,
                ease: 'Linear',
                onComplete: () => {panelImage.destroy()}
            });
        })
        this.panelImages = []

    }
}