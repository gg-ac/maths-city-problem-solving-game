export const GAME_WIDTH = 1080
export const GAME_HEIGHT = 1920

export const MAX_SYMBOL_SIZE = 125

export const PANEL_SECTION_HEIGHTS = {
    "forbiddenStringPanel": GAME_HEIGHT/9,
    "stringPanel": 2*GAME_HEIGHT/9,
    "targetStringPanel":  GAME_HEIGHT/9,
    "rulePanel": 4*GAME_HEIGHT/9,
    "uiPanel": GAME_HEIGHT/9,
}



export const UI_PANEL_SIDE_MARGIN = 20
export const UI_PANEL_SIDE_PAD = 10


export const RULE_PANEL_SIDE_MARGIN = 20
export const RULE_PANEL_SIDE_PAD = 10

// Vertical spacing at the top and bottom of individual rule graphics
export const RULE_VERTICAL_MARGIN = 20
// Vertical spacing at the left and right of individual rule graphics
export const RULE_HORIZONTAL_MARGIN = 30

// Vertical padding inside the top and bottom of individual rule graphics
export const RULE_VERTICAL_PAD = 20
// Vertical padding inside the left and right of individual rule graphics
export const RULE_HORIZONTAL_PAD = 20


// Vertical offset for state symbols when they are pressed (active)
export const STATE_SYMBOL_PRESS_OFFSET = 20

// Padding inside state symbol boxes
export const STATE_SYMBOL_PAD = 25

export const STATE_SYMBOL_HORIZONTAL_MARGIN = 5
export const STATE_SYMBOL_VERTICAL_MARGIN = 10
export const STATE_AREA_MARGIN = 20

export const EXTRA_OVERLAP_HEIGHT = 300
export const STATE_SUBPANEL_EXTRA_MARGIN = 30
export const STATE_SYMBOL_PAD_TARGET = 20

export const ICON_SIZE = 150


export const OVERLAY_ALPHA = 0.75


// Functionality constants

// An upper limit on interaction events per trial, to prevent abuse
export const MAX_INTERACTIONS_PER_TRIAL = 100