import { ComicPanelConfig } from "./ComicPage";

export class ComicPageRegister {
    keyToPanelConfig: Map<string, ComicPanelConfig[][]>;
    constructor() {
        this.keyToPanelConfig = new Map()
    }

    registerKey(key: string, panelConfig: ComicPanelConfig[][]) {
        this.keyToPanelConfig.set(key, panelConfig)
    }

    getPanelConfig(key: string) {
        return this.keyToPanelConfig.get(key)
    }

    getPanelImagePaths(key: string) {
        const panelConfig = this.keyToPanelConfig.get(key)
        let filepaths:string[] = []
        if (panelConfig != undefined) {
            panelConfig.forEach((pl) => {
                pl.forEach((p) => {
                    filepaths.push(p.filepath)
                })
            })
        }
        return filepaths
    }
}