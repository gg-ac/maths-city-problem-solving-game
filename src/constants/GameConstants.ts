import { ITheme } from "survey-core"

export const DEBUG_MODE = false

export const COMPATIBLE_OS = ["windows", "mac os", "linux", "ubuntu"]

export const GAME_WIDTH = 1080
export const GAME_HEIGHT = 1920

export const MAX_SYMBOL_SIZE = 125

export const PANEL_SECTION_HEIGHTS = {
    "forbiddenStringPanel": GAME_HEIGHT / 9,
    "stringPanel": 200,
    "targetStringPanel": GAME_HEIGHT / 9,
    "rulePanel": 4 * GAME_HEIGHT / 9,
    "uiPanel": GAME_HEIGHT / 9,
}

export const CURRENT_STRING_PANEL_Y = 440
export const CURRENT_STRING_PANEL_WIDTH = 875
export const CURRENT_STRING_PANEL_HEIGHT = 200

export const RULE_PANEL_Y = 750
export const RULE_PANEL_WIDTH = 900
export const RULE_PANEL_HEIGHT = 700
export const RULE_PANEL_SIDE_MARGIN = 90
export const RULE_PANEL_SIDE_PAD = 10

export const TARGET_STRING_PANEL_Y = 1375
export const TARGET_STRING_PANEL_WIDTH = 875
export const TARGET_STRING_PANEL_HEIGHT = 120

export const FORBIDDEN_STRING_PANEL_Y = 1525
export const FORBIDDEN_STRING_PANEL_WIDTH = 850
export const FORBIDDEN_STRING_PANEL_HEIGHT = 120

export const FORBIDDEN_TARGET_SYMBOL_PAD = 10

export const BUTTON_PANEL_Y = 200
export const BUTTON_PANEL_WIDTH = 875
export const BUTTON_PANEL_HEIGHT = 200
export const BUTTON_PANEL_SIDE_MARGIN = 100

export const UI_PANEL_SIDE_MARGIN = 20
export const UI_PANEL_SIDE_PAD = 10


export const INSTRUCTION_PANEL_Y = 750
export const INSTRUCTION_PANEL_WIDTH = 900
export const INSTRUCTION_PANEL_HEIGHT = 700


export const GOAL_ICON_ALPHA = 0.3


// Vertical spacing at the top and bottom of individual rule graphics
export const RULE_VERTICAL_MARGIN = 20
// Vertical spacing at the left and right of individual rule graphics
export const RULE_HORIZONTAL_MARGIN = 5

// Vertical padding inside the top and bottom of individual rule graphics
export const RULE_VERTICAL_PAD = 20
// Vertical padding inside the left and right of individual rule graphics
export const RULE_HORIZONTAL_PAD = 20


// Vertical offset for state symbols when they are pressed (active)
export const STATE_SYMBOL_PRESS_OFFSET = 20

// Padding inside state symbol boxes
export const STATE_SYMBOL_PAD = 10

export const STATE_SYMBOL_HORIZONTAL_MARGIN = 6
export const STATE_SYMBOL_VERTICAL_MARGIN = 10
export const STATE_AREA_MARGIN = 100

export const EXTRA_OVERLAP_HEIGHT = 300
export const STATE_SUBPANEL_EXTRA_MARGIN = 30
export const STATE_SYMBOL_PAD_TARGET = 20

export const ICON_SIZE = 100


export const OVERLAY_ALPHA = 0.75


// Functionality constants

// An upper limit on interaction events per trial, to prevent abuse
export const MAX_INTERACTIONS_PER_TRIAL = 100

// Main game events
export enum GameEvent {
    INSTRUCTIONS_NEXT = "instructions_next",
    INSTRUCTIONS_PREVIOUS = "instructions_previous",
    RULE_ACTIVATE = "rule_activate",
    RULE_DEACTIVATE = "rule_deactivate",
    SYMBOL_ACTIVATE = "symbol_activate",
    SYMBOL_DEACTIVATE = "symbol_deactivate"
}


// Graphics

export const SURVEY_JS_THEME : ITheme = {
    "themeName": "default",
    "colorPalette": "dark",
    "isPanelless": true,
    "backgroundImage": "",
    "backgroundOpacity": 1,
    "backgroundImageAttachment": "scroll",
    "backgroundImageFit": "cover",
    "cssVariables": {
        "--sjs-font-family": "Courier New, monospace",
        "--sjs-font-size": "21.6px",
        "--sjs-corner-radius": "15px",
        "--sjs-base-unit": "8px",
        "--sjs-shadow-small": "0px 1px 2px 0px rgba(0, 0, 0, 0.35)",
        "--sjs-shadow-inner": "inset 0px 1px 2px 0px rgba(0, 0, 0, 0.2)",
        "--sjs-border-default": "rgba(255, 255, 255, 0.12)",
        "--sjs-border-light": "rgba(255, 255, 255, 0.08)",
        "--sjs-general-backcolor": "rgba(48, 48, 48, 1)",
        "--sjs-general-backcolor-dark": "rgba(52, 52, 52, 1)",
        "--sjs-general-backcolor-dim-light": "rgba(43, 43, 43, 1)",
        "--sjs-general-backcolor-dim-dark": "rgba(46, 46, 46, 1)",
        "--sjs-general-forecolor": "rgba(255, 255, 255, 0.78)",
        "--sjs-general-forecolor-light": "rgba(255, 255, 255, 0.42)",
        "--sjs-general-dim-forecolor": "rgba(255, 255, 255, 0.79)",
        "--sjs-general-dim-forecolor-light": "rgba(255, 255, 255, 0.45)",
        "--sjs-secondary-backcolor": "rgba(255, 152, 20, 1)",
        "--sjs-secondary-backcolor-light": "rgba(255, 152, 20, 0.1)",
        "--sjs-secondary-backcolor-semi-light": "rgba(255, 152, 20, 0.25)",
        "--sjs-secondary-forecolor": "rgba(48, 48, 48, 1)",
        "--sjs-secondary-forecolor-light": "rgba(48, 48, 48, 0.25)",
        "--sjs-shadow-small-reset": "0px 0px 0px 0px rgba(0, 0, 0, 0.35)",
        "--sjs-shadow-medium": "0px 2px 6px 0px rgba(0, 0, 0, 0.2)",
        "--sjs-shadow-large": "0px 8px 16px 0px rgba(0, 0, 0, 0.2)",
        "--sjs-shadow-inner-reset": "inset 0px 0px 0px 0px rgba(0, 0, 0, 0.2)",
        "--sjs-border-inside": "rgba(255, 255, 255, 0.08)",
        "--sjs-special-red-forecolor": "rgba(48, 48, 48, 1)",
        "--sjs-special-green": "rgba(36, 197, 164, 1)",
        "--sjs-special-green-light": "rgba(36, 197, 164, 0.1)",
        "--sjs-special-green-forecolor": "rgba(48, 48, 48, 1)",
        "--sjs-special-blue": "rgba(91, 151, 242, 1)",
        "--sjs-special-blue-light": "rgba(91, 151, 242, 0.1)",
        "--sjs-special-blue-forecolor": "rgba(48, 48, 48, 1)",
        "--sjs-special-yellow": "rgba(255, 152, 20, 1)",
        "--sjs-special-yellow-light": "rgba(255, 152, 20, 0.1)",
        "--sjs-special-yellow-forecolor": "rgba(48, 48, 48, 1)",
        "--sjs-article-font-xx-large-textDecoration": "none",
        "--sjs-article-font-xx-large-fontWeight": "700",
        "--sjs-article-font-xx-large-fontStyle": "normal",
        "--sjs-article-font-xx-large-fontStretch": "normal",
        "--sjs-article-font-xx-large-letterSpacing": "0",
        "--sjs-article-font-xx-large-lineHeight": "64px",
        "--sjs-article-font-xx-large-paragraphIndent": "0px",
        "--sjs-article-font-xx-large-textCase": "none",
        "--sjs-article-font-x-large-textDecoration": "none",
        "--sjs-article-font-x-large-fontWeight": "700",
        "--sjs-article-font-x-large-fontStyle": "normal",
        "--sjs-article-font-x-large-fontStretch": "normal",
        "--sjs-article-font-x-large-letterSpacing": "0",
        "--sjs-article-font-x-large-lineHeight": "56px",
        "--sjs-article-font-x-large-paragraphIndent": "0px",
        "--sjs-article-font-x-large-textCase": "none",
        "--sjs-article-font-large-textDecoration": "none",
        "--sjs-article-font-large-fontWeight": "700",
        "--sjs-article-font-large-fontStyle": "normal",
        "--sjs-article-font-large-fontStretch": "normal",
        "--sjs-article-font-large-letterSpacing": "0",
        "--sjs-article-font-large-lineHeight": "40px",
        "--sjs-article-font-large-paragraphIndent": "0px",
        "--sjs-article-font-large-textCase": "none",
        "--sjs-article-font-medium-textDecoration": "none",
        "--sjs-article-font-medium-fontWeight": "700",
        "--sjs-article-font-medium-fontStyle": "normal",
        "--sjs-article-font-medium-fontStretch": "normal",
        "--sjs-article-font-medium-letterSpacing": "0",
        "--sjs-article-font-medium-lineHeight": "32px",
        "--sjs-article-font-medium-paragraphIndent": "0px",
        "--sjs-article-font-medium-textCase": "none",
        "--sjs-article-font-default-textDecoration": "none",
        "--sjs-article-font-default-fontWeight": "400",
        "--sjs-article-font-default-fontStyle": "normal",
        "--sjs-article-font-default-fontStretch": "normal",
        "--sjs-article-font-default-letterSpacing": "0",
        "--sjs-article-font-default-lineHeight": "28px",
        "--sjs-article-font-default-paragraphIndent": "0px",
        "--sjs-article-font-default-textCase": "none",
        "--sjs-general-backcolor-dim": "rgba(14, 14, 14, 1)",
        "--sjs-primary-backcolor": "#c4b9ec",
        "--sjs-primary-backcolor-dark": "rgba(196, 185, 236, 1)",
        "--sjs-primary-backcolor-light": "rgba(196, 185, 236, 0.07)",
        "--sjs-primary-forecolor": "rgba(32, 32, 32, 1)",
        "--sjs-primary-forecolor-light": "rgba(32, 32, 32, 0.25)",
        "--sjs-special-red": "rgba(254, 76, 108, 1)",
        "--sjs-special-red-light": "rgba(254, 76, 108, 0.1)"
    },
    "headerView": "basic"
}