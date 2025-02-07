import { StringState } from "./StringPanel";
import { v4 as uuidv4 } from 'uuid';
import { Symbol, TransformationRule } from "./StringTransformation";
import { mapArrayToIndexedObject, replaceUndefinedWithUnknown } from "../utils/Utilities";

export enum RewritingTaskEventType {
    SELECT_RULE = "rule:select",
    DESELECT_RULE = "rule:deselect",
    SELECT_SYMBOL = "symbol:select",
    DESELECT_SYMBOL = "symbol:deselect",

    SUCCESSFUL_RULE_APPLICATION = "rule:apply:success",
    INVALID_RULE_APPLICATION = "rule:apply:invalid",
    FORBIDDEN_RULE_APPLICATION = "rule:apply:forbidden",
    UNDO_RULE_APPLICATION = "rule:apply:undo",

    TRIAL_RESET = "trial:reset",

    GOAL_ACHIEVED = "goal:achieved",
    START_TRIAL = "trial:start",
    END_TRIAL = "trial:end"
}

export enum RunningMemorySpanTaskEventType {
    START_TRIAL = "memory_trial:start",
    START_RECITE_DIGITS = "memory_trial:recite:start",
    END_RECITE_DIGITS = "memory_trial:recite:end",
    RESPONSE_KEY_PRESSED = "memory_trial:input",
    RESPONSE_SUBMITTED = "memory_trial:submitted",
    END_TRIAL = "memory_trial:end"
}

abstract class Event {
    constructor(protected type: RewritingTaskEventType | RunningMemorySpanTaskEventType, protected timestamp?: number) { }
    abstract toObject(): Object

    setTimestamp(timestamp: number) {
        this.timestamp = timestamp
    }
}


export class EventTaskStatus extends Event {
    toObject(): Object {
        return {
            eventType: this.type.valueOf(),
            timestamp: this.timestamp
        }
    }
}

export class EventMemoryTaskCompleted extends Event {

    constructor(type: RunningMemorySpanTaskEventType.RESPONSE_SUBMITTED, private targetString: string, private responseString: string, timestamp?: number) {
        super(type, timestamp)
    }

    toObject(): Object {
        return {
            eventType: this.type.valueOf(),
            timestamp: this.timestamp,
            targetString: this.targetString,
            responseString: this.responseString,
        }
    }
}

export class EventMemoryTaskResponseKeyPressed extends Event {

    constructor(type: RunningMemorySpanTaskEventType.RESPONSE_KEY_PRESSED, private keycode: string, timestamp?: number) {
        super(type, timestamp)
    }

    toObject(): Object {
        return {
            eventType: this.type.valueOf(),
            timestamp: this.timestamp,
            keycode: this.keycode
        }
    }
}


export class EventRewritingTaskReset extends Event {

    constructor(type: RewritingTaskEventType.TRIAL_RESET, private startString: Symbol[], timestamp?: number) {
        super(type, timestamp)
    }

    toObject(): Object {
        return {
            eventType: this.type.valueOf(),
            timestamp: this.timestamp,
            startString: mapArrayToIndexedObject(this.startString?.map(s => s.id)),
        }
    }
}



export class EventRewritingTaskUndo extends Event {

    constructor(type: RewritingTaskEventType.UNDO_RULE_APPLICATION, private startString: Symbol[], private resultString: Symbol[], timestamp?: number) {
        super(type, timestamp)
    }

    toObject(): Object {
        return {
            eventType: this.type.valueOf(),
            timestamp: this.timestamp,
            startString: mapArrayToIndexedObject(this.startString.map(s => s.id)),
            resultString: mapArrayToIndexedObject(this.resultString.map(s => s.id)),
        }
    }
}


export class EventRewritingTaskRuleApply extends Event {

    constructor(type: RewritingTaskEventType.SUCCESSFUL_RULE_APPLICATION | RewritingTaskEventType.INVALID_RULE_APPLICATION | RewritingTaskEventType.FORBIDDEN_RULE_APPLICATION, private ruleIndex: integer | null, private symbolIndex: integer | null, private startString: Symbol[], private resultString?: Symbol[], timestamp?: number, private forbiddenStringMatchIndex?: integer) {
        super(type, timestamp)
    }

    toObject(): Object {
        if (this.type === RewritingTaskEventType.FORBIDDEN_RULE_APPLICATION) {
            return {
                eventType: this.type.valueOf(),
                timestamp: this.timestamp,
                ruleIndex: this.ruleIndex,
                symbolIndex: this.symbolIndex,
                startString: mapArrayToIndexedObject(this.startString?.map(s => s.id)),
                forbiddenStringMatchIndex: this.forbiddenStringMatchIndex
            }
        } else if (this.type === RewritingTaskEventType.INVALID_RULE_APPLICATION) {
            return {
                eventType: this.type.valueOf(),
                timestamp: this.timestamp,
                ruleIndex: this.ruleIndex,
                symbolIndex: this.symbolIndex,
                startString: mapArrayToIndexedObject(this.startString?.map(s => s.id))
            }
        }
        return {
            eventType: this.type.valueOf(),
            timestamp: this.timestamp,
            ruleIndex: this.ruleIndex,
            symbolIndex: this.symbolIndex,
            startString: mapArrayToIndexedObject(this.startString?.map(s => s.id)),
            resultString: mapArrayToIndexedObject(this.resultString!.map(s => s.id))
        }
    }
}

export class EventRewritingTaskSelect extends Event {

    constructor(type: RewritingTaskEventType.SELECT_RULE | RewritingTaskEventType.DESELECT_RULE | RewritingTaskEventType.SELECT_SYMBOL | RewritingTaskEventType.DESELECT_SYMBOL, private selectedIndex: integer | null, private manual: boolean, private currentString?: Symbol[], timestamp?: number) {
        super(type, timestamp)
    }

    toObject(): Object {
        if (this.type === RewritingTaskEventType.SELECT_RULE || this.type === RewritingTaskEventType.DESELECT_RULE) {
            return {
                eventType: this.type.valueOf(),
                timestamp: this.timestamp,
                ruleIndex: this.selectedIndex,
                manual: this.manual
            }
        } else if (this.type === RewritingTaskEventType.SELECT_SYMBOL || this.type === RewritingTaskEventType.DESELECT_SYMBOL) {
            return {
                eventType: this.type.valueOf(),
                timestamp: this.timestamp,
                currentString: mapArrayToIndexedObject(this.currentString!.map(s => s.id)),
                symbolIndex: this.selectedIndex,
                manual: this.manual
            }
        }
        return {}
    }

}

export class RunningMemorySpanTaskTrialDataStore {
    private startTimestamp: number;
    private events: Event[];
    private trialUUID: string;

    constructor() {
        this.events = []
        this.startTimestamp = performance.now()
        this.trialUUID = uuidv4()
    }

    addEvent(event: Event) {
        event.setTimestamp(performance.now())
        this.events.push(event)
    }

    toObject() {
        return {
            trialUUID: this.trialUUID,
            trialStartTimestamp: this.startTimestamp,
            events: mapArrayToIndexedObject(this.events.map(evt => evt.toObject()))
        }
    }

    documentObject() {
        return {
            trialUUID: this.trialUUID,
            trialStartTimestamp: this.startTimestamp
        }
    }

    getEvents() {
        return this.events.map(evt => evt.toObject())
    }
}



export class RewritingTaskTrialDataStore {
    private startTimestamp: number;
    private events: Event[];
    private trialUUID: string;

    constructor(private rules: TransformationRule[], private startString: Symbol[], private targetString: Symbol[], private forbiddenStrings: Symbol[][], private forbiddenStringIsPrefix: boolean, private isPracticeTrial: boolean) {
        this.events = []
        this.startTimestamp = performance.now()
        this.trialUUID = uuidv4()
    }

    addEvent(event: Event) {
        event.setTimestamp(performance.now())
        this.events.push(event)
        //console.log(event.toObject())
    }

    toObject() {
        return {
            trialUUID: this.trialUUID,
            trialStartTimestamp: this.startTimestamp,
            isPractice: this.isPracticeTrial,
            startString: this.startString.map((s) => s.id),
            targetString: this.targetString.map((s) => s.id),
            forbiddenStrings: mapArrayToIndexedObject(this.forbiddenStrings.map((string) => { return mapArrayToIndexedObject(string.map(s => s.id)) })),
            forbiddenStringIsPrefix: this.forbiddenStringIsPrefix,
            //rules: mapArrayToIndexedObject(this.rules.map(rule => rule.toObject())),
            events: mapArrayToIndexedObject(this.events.map(evt => evt.toObject()))
        }
    }

    documentObject() {
        return {
            trialUUID: this.trialUUID,
            trialStartTimestamp: this.startTimestamp,
            isPractice: this.isPracticeTrial,
            startString: this.startString.map((s) => s.id),
            targetString: this.targetString.map((s) => s.id),
            forbiddenStrings: mapArrayToIndexedObject(this.forbiddenStrings.map((string) => { return mapArrayToIndexedObject(string.map(s => s.id)) })),
            forbiddenStringIsPrefix: this.forbiddenStringIsPrefix
            //rules: mapArrayToIndexedObject(this.rules.map(rule => rule.toObject())),
        }
    }

    getEvents() {
        return this.events.map(evt => evt.toObject())
    }
}

export class DataStore {

    public localTotalScore: integer = 0

}