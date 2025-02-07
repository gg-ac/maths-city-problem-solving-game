import { ComicPanelConfig } from "../../ui/comics/ComicPage";
import { ComicPageRegister } from "../../ui/comics/ComicPageRegister";

const panels1: ComicPanelConfig[] = [
    { filepath:'comic_panels/test_comic_panel.png', row: 1, col: 0, rowSpan: 2, colSpan: 1, delay: 500 },
    { filepath:'comic_panels/test_comic_panel.png', row: 0, col: 1, rowSpan: 2, colSpan: 1, delay: 2500 },
];
const panels2: ComicPanelConfig[] = [
    { filepath:'comic_panels/test_comic_panel.png', row: 0, col: 0, rowSpan: 1, colSpan: 2, delay: 500 },
    { filepath:'comic_panels/test_comic_panel.png', row: 1, col: 0, rowSpan: 2, colSpan: 2, delay: 2500 },
];


const IntroComicConfig_s0 = [panels1, panels2]
const OutroComicConfig_s0 = [panels2]
const IntroComicConfig_s1 = [panels1, panels2]
const OutroComicConfig_s1 = [panels2]
const IntroComicConfig_s2 = [panels1, panels2]
const OutroComicConfig_s2 = [panels2]
const IntroComicConfig_s3 = [panels1, panels2]
const OutroComicConfig_s3 = [panels2]


export const COMIC_PAGE_REGISTER = new ComicPageRegister()
COMIC_PAGE_REGISTER.registerKey("session_0_intro_comic", IntroComicConfig_s0)
COMIC_PAGE_REGISTER.registerKey("session_0_outro_comic", OutroComicConfig_s0)
COMIC_PAGE_REGISTER.registerKey("session_1_intro_comic", IntroComicConfig_s1)
COMIC_PAGE_REGISTER.registerKey("session_1_outro_comic", OutroComicConfig_s1)
COMIC_PAGE_REGISTER.registerKey("session_2_intro_comic", IntroComicConfig_s2)
COMIC_PAGE_REGISTER.registerKey("session_2_outro_comic", OutroComicConfig_s2)
COMIC_PAGE_REGISTER.registerKey("session_3_intro_comic", IntroComicConfig_s3)
COMIC_PAGE_REGISTER.registerKey("session_3_outro_comic", OutroComicConfig_s3)