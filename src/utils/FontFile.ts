import Phaser from 'phaser';

export class FontFile extends Phaser.Loader.File {
    fontName: string;

    constructor(loader: Phaser.Loader.LoaderPlugin, key: string, fontName: string, url: string) {
        super(loader, {
            type: "font",
            key: key,
            url: url
        });

        this.fontName = fontName;
    }

    load(): void {
        const newFontFace = new FontFace(this.fontName, `url(${this.url})`);
        document.fonts.add(newFontFace);

        newFontFace.load().then(() => {
            this.loader.emit('fileprogress', this, 1);
            this.loader.nextFile(this, true);
        }).catch((error: Error) => {
            console.error(`Failed to load ${this.fontName}`, error);
            this.loader.nextFile(this, false);
        });
    }
}
