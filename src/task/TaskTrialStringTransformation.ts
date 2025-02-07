import { BUTTON_PANEL_HEIGHT, BUTTON_PANEL_WIDTH, BUTTON_PANEL_Y, CURRENT_STRING_PANEL_HEIGHT, CURRENT_STRING_PANEL_WIDTH, CURRENT_STRING_PANEL_Y, DEBUG_MODE, FORBIDDEN_STRING_PANEL_HEIGHT, FORBIDDEN_STRING_PANEL_WIDTH, FORBIDDEN_STRING_PANEL_Y, GAME_WIDTH, GameEvent, INSTRUCTION_PANEL_HEIGHT, INSTRUCTION_PANEL_WIDTH, INSTRUCTION_PANEL_Y, MAX_INTERACTIONS_PER_TRIAL, PANEL_SECTION_HEIGHTS, RULE_PANEL_HEIGHT, RULE_PANEL_SIDE_MARGIN, RULE_PANEL_WIDTH, RULE_PANEL_Y, TARGET_STRING_PANEL_HEIGHT, TARGET_STRING_PANEL_WIDTH, TARGET_STRING_PANEL_Y } from "../constants/GameConstants";
import { RulePanelGraphics, RulePanelState } from "./RulePanel";
import { SymbolFactory } from "./SymbolFactory";
import { StringPanelGraphics, StringPanelState, StringState } from "./StringPanel";
import { TransformationRule, Symbol } from "./StringTransformation";
import { TargetStringGraphics } from "./TargetStringGraphics";
import { ForbiddenStringGraphics } from "./ForbiddenStringGraphics";
import { OverlayCamera } from "./OverlayCamera";
import { DataStore, EventRewritingTaskRuleApply, EventRewritingTaskSelect, EventRewritingTaskReset, EventTaskStatus, RewritingTaskEventType, EventRewritingTaskUndo } from "./DataStorage";
import { UIPanelGraphics } from "./UIPanel";
import Arrow from "../ui/Arrow";
import { HideableObjectDict, Instructions, InstructionSpec, PositionSizeDict } from "../ui/Instructions";
import { TriangleButton } from "../ui/TriangleButton";

enum MainGameStage {
    Instructions = "Instructions",
    MainTask = "Main Task"
}

enum TrialState {
    Initialising = "Initialising",
    InProgress = "In Progress",
    Completed = "Completed",
    Ended = "Ended",
    Paused = "Paused",
    Failed = "Failed"
}

export class TaskTrialStringTransformation {



    private stringPanelGraphics: StringPanelGraphics;
    private stringPanelState: StringPanelState;
    private rulePanelGraphics: RulePanelGraphics;
    private rulePanelState: RulePanelState;
    private targetStringGraphics: TargetStringGraphics;
    private forbiddenStringGraphics: ForbiddenStringGraphics[];

    private mainGameStage: MainGameStage
    private trialState: TrialState
    actionCounter: number;
    overlayCamera: OverlayCamera;
    uiPanelGraphics: UIPanelGraphics;

    private undoStateHistory: Symbol[][]

    private startTime: number
    private currentTime: number
    instructions: Instructions;
    private solved: boolean;
    private score: number;
    private timeRemaining: number;
    private stepCounter: number;
    private feedbackIcon: Phaser.GameObjects.Image | null;
    feedbackDisplayedTime: number;
    feedbackStartTime: number;

    private skipped:boolean = false


    constructor(private scene: Phaser.Scene, isInstructionsStage: boolean, instructionsKey: string | undefined, private level: integer, private levelsRemaining: integer, private durationMS: number, private rules: TransformationRule[], private startState: StringState, private targetString: Symbol[], private forbiddenStrings: Symbol[][], private forbiddenStringIsPrefix: boolean, private symbolFactory: SymbolFactory, private dataStore: DataStore, private onTrialComplete: (lastTrialScore: number) => void) {

        // List for storing past states which can be revisited using undo functionality
        this.undoStateHistory = []

        // State for the task instance and the whole scene
        if (isInstructionsStage) {
            this.setMainGameStage(MainGameStage.Instructions)
        } else {
            this.setMainGameStage(MainGameStage.MainTask)
        }
        this.trialState = TrialState.Initialising

        // How long has the feedback been displayed
        this.feedbackDisplayedTime = 0
        this.feedbackStartTime = 0


        // A counter for interaction events, used to put a cap on the number of actions
        this.actionCounter = 0

        // Performance feedback state
        this.stepCounter = 0
        this.solved = false
        this.score = 0
        this.timeRemaining = 0

        this.overlayCamera = new OverlayCamera(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height)
        this.scene.cameras.addExisting(this.overlayCamera)
        this.overlayCamera.setScene(this.scene)

        const consoleBackground = this.scene.add.image(0, 0, "bg-console").setOrigin(0)

        this.stringPanelGraphics = new StringPanelGraphics(this.scene, this.symbolFactory, 0, CURRENT_STRING_PANEL_Y, CURRENT_STRING_PANEL_WIDTH, CURRENT_STRING_PANEL_HEIGHT, 8, this.overlayCamera)
        this.stringPanelState = new StringPanelState(this.startState, (newState, oldState, manualChange) => this.onStringPanelStateChange(newState, oldState, manualChange))
        this.stringPanelGraphics.setOnSymbolPress((index) => this.onStringPanelSymbolPressed(index))

        this.rulePanelGraphics = new RulePanelGraphics(this.scene, this.symbolFactory, 0, RULE_PANEL_Y, RULE_PANEL_WIDTH, RULE_PANEL_HEIGHT, 8, this.rules, this.overlayCamera)
        this.rulePanelState = new RulePanelState((index, manualChange, activating) => this.onActiveRuleChange(index, manualChange, activating))
        this.rulePanelGraphics.setOnRulePress((index) => this.onRulePanelRulePressed(index))

        this.targetStringGraphics = new TargetStringGraphics(this.scene, this.targetString, this.symbolFactory, 8, 0, TARGET_STRING_PANEL_Y, TARGET_STRING_PANEL_WIDTH, TARGET_STRING_PANEL_HEIGHT, this.overlayCamera)
        this.targetStringGraphics.positionBelow(this.stringPanelGraphics.background)

        this.uiPanelGraphics = new UIPanelGraphics(this.scene, 0, BUTTON_PANEL_Y, BUTTON_PANEL_WIDTH, BUTTON_PANEL_HEIGHT, () => this.undoRuleApplication(), () => this.resetTrial(), this.overlayCamera)
        this.uiPanelGraphics.updateStageText(this.levelsRemaining)

        this.forbiddenStringGraphics = []
        const forbiddenStringRowHeight = PANEL_SECTION_HEIGHTS.forbiddenStringPanel / this.forbiddenStrings.length
        this.forbiddenStrings.forEach((string, index) => {
            const newForbiddenStringGraphics = new ForbiddenStringGraphics(this.scene, string, this.forbiddenStringIsPrefix, this.symbolFactory, 8, 0, FORBIDDEN_STRING_PANEL_Y, FORBIDDEN_STRING_PANEL_WIDTH, FORBIDDEN_STRING_PANEL_HEIGHT, this.overlayCamera)
            this.forbiddenStringGraphics.push(newForbiddenStringGraphics)
            newForbiddenStringGraphics.positionBelow(this.stringPanelGraphics.background)
        })

        this.feedbackIcon = null

        if (this.mainGameStage === MainGameStage.Instructions) {

            const nextButton = new TriangleButton(this.scene, RULE_PANEL_WIDTH, FORBIDDEN_STRING_PANEL_Y + 150, 100, true, () => this.scene.events.emit(GameEvent.INSTRUCTIONS_NEXT))
            const previousButton = new TriangleButton(this.scene, 180, FORBIDDEN_STRING_PANEL_Y + 150, 100, false, () => this.scene.events.emit(GameEvent.INSTRUCTIONS_PREVIOUS))

            let arrow_1 = new Arrow(this.scene, (GAME_WIDTH / 2), INSTRUCTION_PANEL_Y + INSTRUCTION_PANEL_HEIGHT / 2 - 20, (GAME_WIDTH / 2), INSTRUCTION_PANEL_Y - 40, 0xffffff, 60, 20)
            let arrow_2 = new Arrow(this.scene, (GAME_WIDTH / 2), INSTRUCTION_PANEL_Y + INSTRUCTION_PANEL_HEIGHT / 2 + 75, (GAME_WIDTH / 2), TARGET_STRING_PANEL_Y + 75, 0xffffff, 60, 20)

            let hideConfig: HideableObjectDict = {
                "all_hidden": [this.uiPanelGraphics, this.stringPanelGraphics, this.targetStringGraphics, this.rulePanelGraphics, this.forbiddenStringGraphics[0], arrow_1, arrow_2],
                "all_hidden_back_hidden": [previousButton, this.uiPanelGraphics, this.stringPanelGraphics, this.targetStringGraphics, this.rulePanelGraphics, this.forbiddenStringGraphics[0], arrow_1, arrow_2],
                "show_arrow_to_task_screen": [this.uiPanelGraphics, this.stringPanelGraphics, this.targetStringGraphics, this.rulePanelGraphics, this.forbiddenStringGraphics[0], arrow_2],
                "show_arrow_to_task_screen_and_task_screen": [this.uiPanelGraphics, this.targetStringGraphics, this.rulePanelGraphics, this.forbiddenStringGraphics[0], arrow_2],
                "show_task_screen_and_rule_panel": [this.uiPanelGraphics, this.targetStringGraphics, this.forbiddenStringGraphics[0], arrow_1, arrow_2],
                "show_task_screen_and_rule_panel_hide_arrow_buttons": [nextButton, previousButton, this.uiPanelGraphics, this.targetStringGraphics, this.forbiddenStringGraphics[0], arrow_1, arrow_2],
                "show_rule_panel": [this.uiPanelGraphics, this.stringPanelGraphics, this.targetStringGraphics, this.forbiddenStringGraphics[0], arrow_1, arrow_2],
                "show_rule_panel_hide_arrow_buttons": [nextButton, previousButton, this.uiPanelGraphics, this.stringPanelGraphics, this.targetStringGraphics, this.forbiddenStringGraphics[0], arrow_1, arrow_2],
                "show_task_screen": [this.uiPanelGraphics, this.targetStringGraphics, this.rulePanelGraphics, this.forbiddenStringGraphics[0], arrow_1, arrow_2],
                "show_arrow_to_target_string": [this.uiPanelGraphics, this.stringPanelGraphics, this.rulePanelGraphics, this.forbiddenStringGraphics[0], arrow_1],
                "show_arrow_to_forbidden_string": [previousButton, this.uiPanelGraphics, this.stringPanelGraphics, this.targetStringGraphics, this.rulePanelGraphics, arrow_1],
                "full_task_no_forbidden": [nextButton, previousButton, this.uiPanelGraphics, this.forbiddenStringGraphics[0], arrow_1, arrow_2],
            }

            let posSizeConfig: PositionSizeDict = {
                "full": {
                    "position": new Phaser.Geom.Point(GAME_WIDTH / 2, INSTRUCTION_PANEL_Y),
                    "size": new Phaser.Geom.Point(INSTRUCTION_PANEL_WIDTH, INSTRUCTION_PANEL_HEIGHT)
                },
                "top_half": {
                    "position": new Phaser.Geom.Point(GAME_WIDTH / 2, INSTRUCTION_PANEL_Y),
                    "size": new Phaser.Geom.Point(INSTRUCTION_PANEL_WIDTH, INSTRUCTION_PANEL_HEIGHT / 2)
                },
                "bottom_half": {
                    "position": new Phaser.Geom.Point(GAME_WIDTH / 2, INSTRUCTION_PANEL_Y + INSTRUCTION_PANEL_HEIGHT / 2),
                    "size": new Phaser.Geom.Point(INSTRUCTION_PANEL_WIDTH, INSTRUCTION_PANEL_HEIGHT / 2)
                },
                "below_rules": {
                    "position": new Phaser.Geom.Point(GAME_WIDTH / 2, INSTRUCTION_PANEL_Y + RULE_PANEL_HEIGHT),
                    "size": new Phaser.Geom.Point(INSTRUCTION_PANEL_WIDTH, INSTRUCTION_PANEL_HEIGHT - RULE_PANEL_HEIGHT)
                },
            }

            if (instructionsKey === "session-1-instructions-intro") {
                this.instructions = new Instructions(this.scene,
                    hideConfig, posSizeConfig,
                    [
                        new InstructionSpec("In this game you will solve a series of puzzles involving scrambled codes", "full", "all_hidden_back_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                        new InstructionSpec("The scrambled codes will appear here, on the Task Screen", "bottom_half", "show_arrow_to_task_screen", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], true),
                        new InstructionSpec("They're made of symbols like these", "bottom_half", "show_arrow_to_task_screen_and_task_screen", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], true),
                        new InstructionSpec("You'll need to change the symbols so that they match the Target Pattern", "top_half", "show_arrow_to_target_string", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], true),
                        new InstructionSpec("You can do this by using Decoding Rules", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], true),
                        new InstructionSpec("Decoding Rules change some patterns of symbols (on the left side of the arrow) into others (on the right side)", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], true),
                        //new InstructionSpec("Rules change patterns of symbols into different ones", "below_rules", "show_rule_panel", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], true),
                        //new InstructionSpec("The Input to a Rule is the pattern of symbols before the arrow", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], false),
                        //new InstructionSpec("The Output of a Rule is the pattern of symbols after the arrow", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], false),
                        //new InstructionSpec("A Rule can be used if part of the writing on the Task Screen is the same as the Rule's Input", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS]),
                        new InstructionSpec("Click on a Decoding Rule to activate it", "below_rules", "show_rule_panel_hide_arrow_buttons", [GameEvent.RULE_ACTIVATE], [GameEvent.INSTRUCTIONS_PREVIOUS], false),
                        new InstructionSpec("Now click on a symbol on the Task Screen", "below_rules", "show_task_screen_and_rule_panel_hide_arrow_buttons", [GameEvent.SYMBOL_ACTIVATE], [GameEvent.RULE_DEACTIVATE, GameEvent.INSTRUCTIONS_PREVIOUS], false, 2000),
                        new InstructionSpec("If the chosen rule's input matches part of the code starting at the chosen symbol, the code will change", "full", "show_task_screen", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], true),
                        new InstructionSpec("If not, the code will stay the same", "full", "show_task_screen", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], true),
                        new InstructionSpec("'X' is a special symbol that matches with any other symbol, but can only match one symbol at a time", "full", "show_task_screen", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], true),
                        new InstructionSpec("Try selecting another Decoding Rule", "below_rules", "show_rule_panel_hide_arrow_buttons", [GameEvent.RULE_ACTIVATE], [GameEvent.INSTRUCTIONS_PREVIOUS], false),
                        new InstructionSpec("Now select another symbol on the Task Screen", "below_rules", "show_task_screen_and_rule_panel_hide_arrow_buttons", [GameEvent.SYMBOL_ACTIVATE], [GameEvent.RULE_DEACTIVATE, GameEvent.INSTRUCTIONS_PREVIOUS], false, 2000),
                        new InstructionSpec("You can keep using the rules to get to the Target Pattern", "top_half", "show_arrow_to_target_string", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], true),
                        new InstructionSpec("If you want to undo the last action, press the square undo button at the top right", "full", "show_task_screen", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS]),
                        new InstructionSpec("If you want to reset the code to the beginning, press the circular reset button at the top right", "full", "show_task_screen", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS]),
                        new InstructionSpec("Let's practice unscrambling some codes!", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], true),
                        new InstructionSpec("See if you can use the rules to make the scrambled code match the Target Pattern", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], [GameEvent.INSTRUCTIONS_PREVIOUS], true)],
                    () => this.endInstructions())
            } else if (instructionsKey === "session-1-instructions-ending") {
                this.instructions = new Instructions(this.scene,
                    hideConfig, posSizeConfig,
                    [new InstructionSpec("Good work!\n\nYou've attempted lots of scrambled codes, but there are still more left", "full", "all_hidden_back_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                    new InstructionSpec("Remember to come back and fix more scrambled codes tomorrow!", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true)],
                    () => this.endInstructions())
            } else if (instructionsKey === "session-1-instructions-pt2") {
                this.instructions = new Instructions(this.scene,
                    hideConfig, posSizeConfig,
                    [new InstructionSpec("You're doing well!\n\nJust one extra complication:", "full", "all_hidden_back_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                    new InstructionSpec("Sometimes, certain symbols are not allowed at the start of the code", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                    new InstructionSpec("If you make the start of the code match one of these 'Forbidden Prefixes', you won't be able to progress any further", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                    new InstructionSpec("You'll have to reset the code or undo the last action", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                    new InstructionSpec("The Forbidden Prefixes will be shown down here with a red warning icon", "full", "show_arrow_to_forbidden_string", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                    new InstructionSpec("The Forbidden Prefixes might change for different codes, and some codes don't have any Forbidden Prefixes", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                    new InstructionSpec("Remember to avoid the Forbidden Prefixes, while trying to get to the Target Pattern!", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                    new InstructionSpec("That's enough practice. Let's move on to the real codes now", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                    new InstructionSpec("You'll have a limited time to solve each one", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                    new InstructionSpec("Try to solve them quickly and in as few steps as possible", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                    new InstructionSpec("You may find some puzzles harder than others. That's normal! Just keep trying to solve them quickly and efficiently", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                    new InstructionSpec("The number of codes remaining to fix, and the time remaining for each code are shown at the top left", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, true),
                    new InstructionSpec("Good luck!", "full", "all_hidden", [GameEvent.INSTRUCTIONS_NEXT], undefined, false)],
                    () => this.endInstructions())
            } else {
                this.instructions = new Instructions(this.scene,
                    hideConfig, posSizeConfig,
                    [new InstructionSpec("", "full", "full_task_no_forbidden", [], undefined, false)],
                    () => this.endInstructions())
            }

        }

        this.overlayCamera.updateOverlay()

        this.trialState = TrialState.InProgress


        this.dataStore.startNewMainTaskTrial(this.rules, this.startState.currentString, this.targetString, this.forbiddenStrings, this.forbiddenStringIsPrefix, isInstructionsStage)
        this.dataStore.addEvent(new EventTaskStatus(RewritingTaskEventType.START_TRIAL))


        this.startTime = performance.now()
        this.currentTime = 0


        // debug level skipping
        this.scene.input.keyboard?.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.handleDebugSkipLevelInput, this);
    }


    handleDebugSkipLevelInput(event: KeyboardEvent) {
        if (DEBUG_MODE) {
            if (event.key == "Enter" && this.skipped == false) {
                console.log("Skipping trial")
                console.log(`${this.startState.currentString.map((s) => {return s.id})};${this.targetString.map((s) => {return s.id})}`)
                this.completeTrial()
                this.endTrial()
                this.skipped = true
            }
        }

    }


    setMainGameStage(newStage: MainGameStage) {
        switch (newStage) {
            case MainGameStage.Instructions:
                this.mainGameStage = MainGameStage.Instructions
                break
            case MainGameStage.MainTask:
                this.mainGameStage = MainGameStage.MainTask
                break
        }
    }

    endInstructions() {
        console.log("End instructions")
        if (this.trialState !== TrialState.Completed) {
            console.log("Ending instructions")
            this.completeTrial()
            this.endTrial()
        }
    }

    update() {
        if (this.mainGameStage === MainGameStage.MainTask) {
            if (this.trialState === TrialState.InProgress) {
                if (this.startTime !== undefined) {
                    this.currentTime = performance.now() - this.startTime
                    const newTime = Math.ceil((this.durationMS - this.currentTime) / 1000)
                    this.timeRemaining = Math.max(newTime, 0)
                    this.uiPanelGraphics.updateTimeRemaining(Math.max(newTime, 0))
                }
                if (this.currentTime >= this.durationMS) {
                    this.completeTrial()
                    this.endTrial()
                }
            }
        }
    }

    private onStringPanelStateChange(newState: StringState, oldState: StringState, manualChange: boolean) {
        if (this.trialState === TrialState.Initialising || this.trialState === TrialState.InProgress) {

            this.stringPanelGraphics.setSymbolString(newState.currentString)
            this.stringPanelGraphics.setActiveSymbolIndex(newState.currentActiveIndex)

            if (this.trialState === TrialState.InProgress) {

                if (newState.currentActiveIndex == null) {
                    this.dataStore.addEvent(new EventRewritingTaskSelect(RewritingTaskEventType.DESELECT_SYMBOL, null, manualChange, this.stringPanelState?.getCurrentState().currentString))
                } else {
                    this.dataStore.addEvent(new EventRewritingTaskSelect(RewritingTaskEventType.SELECT_SYMBOL, this.stringPanelState?.getCurrentState().currentActiveIndex, manualChange, this.stringPanelState?.getCurrentState().currentString))
                }

            }
        }
    }

    private onStringPanelSymbolPressed(index: integer) {
        if (this.actionCounter < MAX_INTERACTIONS_PER_TRIAL) {
            if (this.trialState == TrialState.InProgress) {
                const activeSymbolIndex = this.stringPanelState.activateSymbol(index, true);
                if (activeSymbolIndex !== null) {
                    this.scene.events.emit(GameEvent.SYMBOL_ACTIVATE)
                } else {
                    this.scene.events.emit(GameEvent.SYMBOL_DEACTIVATE)
                }
                this.actionCounter++
                this.tryApplyCurrentRule()
            }
        }
    }

    private onActiveRuleChange(index: integer | null, manualChange: boolean, activating: boolean) {
        if (this.trialState == TrialState.InProgress) {
            this.rulePanelGraphics.setActiveSubpanel(index)
            if (!activating || index == null) {
                this.dataStore.addEvent(new EventRewritingTaskSelect(RewritingTaskEventType.DESELECT_RULE, index, manualChange))
            } else {
                this.dataStore.addEvent(new EventRewritingTaskSelect(RewritingTaskEventType.SELECT_RULE, index, manualChange))
            }

        }
    }

    private onRulePanelRulePressed(index: integer) {

        const inProgress = this.trialState == TrialState.InProgress
        const okInteractions = this.actionCounter < MAX_INTERACTIONS_PER_TRIAL
        const mainTask = this.mainGameStage === MainGameStage.MainTask
        const instructionsStage = this.mainGameStage === MainGameStage.Instructions

        if ((mainTask && inProgress && okInteractions) || (instructionsStage)) {
            const activeRuleIndex = this.rulePanelState.activateRule(index, true)
            if (activeRuleIndex !== null) {
                this.scene.events.emit(GameEvent.RULE_ACTIVATE)
            } else {
                this.scene.events.emit(GameEvent.RULE_DEACTIVATE)
            }
            if (mainTask) {
                this.actionCounter++
            }
            this.tryApplyCurrentRule()
        }

    }

    private resetTrial() {
        if (this.trialState == TrialState.InProgress) {
            this.dataStore.addEvent(new EventRewritingTaskReset(RewritingTaskEventType.TRIAL_RESET, this.startState.currentString))
            this.stringPanelState.setCurrentState(new StringState(this.startState.currentString, null), false)
            this.rulePanelState.activateRule(null, false)
            this.stringPanelState.getCurrentState().currentString.forEach((_, i) => { this.stringPanelGraphics.jumpSymbol(i, i * 10) })
            this.undoStateHistory = []
            this.stepCounter += 1
        }
    }

    private undoRuleApplication() {
        if (this.trialState == TrialState.InProgress) {
            if (this.undoStateHistory.length > 0) {
                const previousString = this.undoStateHistory.pop()
                this.dataStore.addEvent(new EventRewritingTaskUndo(RewritingTaskEventType.UNDO_RULE_APPLICATION, this.stringPanelState.getCurrentState().currentString, previousString!))
                this.stringPanelState.setCurrentState(new StringState(previousString!, null), false)
                this.rulePanelState.activateRule(null, false)
                this.stepCounter += 1
            }
        }
    }

    private storeUndoStateHistory(currentString: Symbol[]) {
        this.undoStateHistory.push(currentString)
    }

    private tryApplyCurrentRule() {
        const targetIndex = this.stringPanelState.getCurrentState().currentActiveIndex
        const ruleIndex = this.rulePanelState.activeRuleIndex
        let rule: TransformationRule | null = null
        if (ruleIndex !== null) {
            rule = this.rules[ruleIndex]
        }

        if (rule !== null && targetIndex !== null) {
            this.stepCounter += 1

            const startString = this.stringPanelState.getCurrentState().currentString
            const result = rule.apply(this.stringPanelState.getCurrentState().currentString, targetIndex)


            if (result !== null) {
                // Indices of the symbols which "came out" of the rule application
                const changedIndices = rule.output.map((_, i) => { return targetIndex + i })

                const forbiddenStringMatchIndex = this.isStringForbidden(result)
                if (forbiddenStringMatchIndex !== -1) {

                    this.dataStore.addEvent(new EventRewritingTaskRuleApply(RewritingTaskEventType.FORBIDDEN_RULE_APPLICATION, this.rulePanelState?.activeRuleIndex, this.stringPanelState?.getCurrentState().currentActiveIndex, startString, undefined, undefined, forbiddenStringMatchIndex))

                    // If the resulting state would be a forbidden state, don't update current state
                    console.log(`Cannot apply rule: resulting state would be forbidden state ${forbiddenStringMatchIndex}`)
                    this.stringPanelState.setCurrentState(new StringState(this.stringPanelState.getCurrentState().currentString, null), false)
                    this.rulePanelState.activateRule(null, false)
                    if (ruleIndex !== null) {
                        this.rulePanelGraphics.animateRuleShake(ruleIndex)
                        this.forbiddenStringGraphics[forbiddenStringMatchIndex].animateStringShake()
                    }
                } else {
                    // Otherwise, update the current state                           
                    this.dataStore.addEvent(new EventRewritingTaskRuleApply(RewritingTaskEventType.SUCCESSFUL_RULE_APPLICATION, this.rulePanelState?.activeRuleIndex, this.stringPanelState?.getCurrentState().currentActiveIndex, startString, result))

                    // Add the current state string to the undo history list
                    this.storeUndoStateHistory(this.stringPanelState.getCurrentState().currentString)

                    // Update the current string state
                    this.stringPanelState.setCurrentState(new StringState(result, null), false)

                    // Update the UI graphics
                    console.log("Rule application: Succeeded")
                    this.rulePanelState.activateRule(null, false)
                    changedIndices.forEach((index, i) => { this.stringPanelGraphics.jumpSymbol(index, i * 50) })
                    if (ruleIndex !== null) {
                        this.rulePanelGraphics.animateRuleSuccess(ruleIndex)
                    }
                }
            } else {

                this.dataStore.addEvent(new EventRewritingTaskRuleApply(RewritingTaskEventType.INVALID_RULE_APPLICATION, this.rulePanelState?.activeRuleIndex, this.stringPanelState?.getCurrentState().currentActiveIndex, startString, undefined))

                this.stringPanelState.setCurrentState(new StringState(this.stringPanelState.getCurrentState().currentString, null), false)
                this.rulePanelState.activateRule(null, false)
                if (ruleIndex !== null) {
                    this.rulePanelGraphics.animateRuleShake(ruleIndex)
                }
                console.log("Rule application: Failed")
            }
        }

        if (this.checkTargetAcheived()) {
            this.solved = true
            console.log("Trial completed!")
            if (this.trialState !== TrialState.Completed) {
                this.score = Math.floor(10 * this.timeRemaining / this.stepCounter)
                this.targetStringGraphics.jumpSymbols()
            }
            if (this.trialState !== TrialState.Completed) {
                this.dataStore.addEvent(new EventTaskStatus(RewritingTaskEventType.GOAL_ACHIEVED))
                this.completeTrial()
                this.endTrial()
            }

        }
    }

    public completeTrial() {
        if (this.trialState !== TrialState.Completed) {
            this.trialState = TrialState.Completed
            this.onTrialComplete(this.score)


        }
    }

    public endTrial() {
        if (this.trialState !== TrialState.Ended) {
            this.trialState = TrialState.Ended
            this.dataStore.addEvent(new EventTaskStatus(RewritingTaskEventType.END_TRIAL))
            this.dataStore.dbSaveCurrentTrialData()
            this.scene.cameras.remove(this.overlayCamera)
        }
    }

    private checkTargetAcheived() {
        const currentString = this.stringPanelState.getCurrentState().currentString
        return this.symbolArraysMatch(currentString, this.targetString)
    }

    private isStringForbidden(inputString: Symbol[]) {
        if (!this.forbiddenStringIsPrefix) {
            return this.forbiddenStrings.findIndex((forbiddenString) => { return this.symbolArraysMatch(inputString, forbiddenString) })
        } else {
            return this.forbiddenStrings.findIndex((forbiddenString) => { return this.symbolArrayHasPrefix(inputString, forbiddenString) })
        }
    }

    private symbolArraysMatch(s1: Symbol[], s2: Symbol[]) {
        if (s1.length !== s2.length) {
            return false;
        }

        for (let i = 0; i < s1.length; i++) {
            if (s1[i].id !== s2[i].id) {
                return false;
            }
        }

        return true;
    }

    private symbolArrayHasPrefix(array: Symbol[], prefix: Symbol[]) {
        if (prefix.length == 0) {
            return false
        }

        if (prefix.length > array.length) {
            return false;
        }

        for (let i = 0; i < prefix.length; i++) {
            if (array[i].id !== prefix[i].id) {
                return false;
            }
        }

        return true;
    }

    public displayFeedback(onContinueClicked: () => void, minFeedbackTimeMs: number, totalScore?: number) {


        if (this.mainGameStage != MainGameStage.Instructions) {

            this.feedbackStartTime = performance.now()

            // Start the next scene only upon the first click (after a delay)
            this.scene.time.delayedCall(minFeedbackTimeMs, () => {
                this.scene.input.once('pointerdown', onContinueClicked);
            }, [], this);


            let iconKey = "icon-cross-large"
            this.rulePanelGraphics.setVisible(false, false)
            this.forbiddenStringGraphics[0].setVisible(false)
            this.targetStringGraphics.setVisible(false)

            let message = `Solved in ${this.stepCounter} steps\n Trial Score: ${this.score.toFixed(0)}`
            if (totalScore != undefined) {
                message = `Solved in ${this.stepCounter} steps\n\n Trial Score: ${this.score.toFixed(0)}\n Total Score: ${totalScore.toFixed(0)}`
            }

            if (this.solved) {
                iconKey = "icon-tick-large"
                const text = this.scene.add.text(GAME_WIDTH / 2, RULE_PANEL_Y + RULE_PANEL_HEIGHT / 2 + RULE_PANEL_WIDTH * 0.8 * 0.3, message, {
                    fontSize: '52px',
                    color: '#ffffff',
                    align: 'center',
                    padding: { x: 20, y: 40 },
                    lineSpacing: 15,
                    wordWrap: { width: 580, useAdvancedWrap: true }
                });
                text.setOrigin(0.5, 0);
            }

            const continueText = this.scene.add.text(GAME_WIDTH / 2, FORBIDDEN_STRING_PANEL_Y + FORBIDDEN_STRING_PANEL_HEIGHT / 2, "[Click to Continue]", {
                fontSize: '62px',
                color: '#ffffff',
                align: 'center',
                padding: { x: 20, y: 40 },
                lineSpacing: 15,
                wordWrap: { width: RULE_PANEL_WIDTH * 0.8, useAdvancedWrap: true }
            });
            continueText.setOrigin(0.5, 0);

            this.feedbackIcon = this.scene.add.image(GAME_WIDTH / 2, RULE_PANEL_Y + RULE_PANEL_HEIGHT / 2, iconKey).setOrigin(0.5).setDisplaySize(RULE_PANEL_WIDTH * 0.5, RULE_PANEL_WIDTH * 0.5)
        } else {
            this.scene.time.delayedCall(minFeedbackTimeMs, () => { onContinueClicked() }, [], this);
        }
    }

}
