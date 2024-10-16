import { StringState } from "./StringPanel";
import { v4 as uuidv4 } from 'uuid';
import { Symbol, TransformationRule } from "./StringTransformation";

export enum EventType {
    SELECT_RULE = "rule:select",
    SUCCESSFUL_RULE_APPLICATION = "rule:apply:success",
    INVALID_RULE_APPLICATION = "rule:apply:invalid",
    FORBIDDEN_RULE_APPLICATION = "rule:apply:forbidden",
    SELECT_SYMBOL = "symbol:select",
    GOAL_ACHIEVED = "goal:achieved",
    START_TRIAL = "trial:start",
    END_TRIAL = "trial:end"
}

export class Event {
    constructor(public type: EventType, public manual:boolean, public timestamp: number, public data: Object) { }

    toObject(){
        return {"eventType":this.type.valueOf(),
            "manual":this.manual,
            "timestamp":this.timestamp,
            "data":this.data
        }
    }
}

export class TaskStateData {
    constructor(private activeRuleIndex: integer | null, private stringState: StringState) {}

    toObject() {
        const obj = {
            "activeRuleIndex": this.activeRuleIndex,
            "stringState": {
                "currentString": this.stringState?.currentString.map((s) => s.id),
                "activeSymbolIndex": this.stringState?.currentActiveIndex
            }
        }
        return obj
    }

}

export class TrialDataStore {
    private startTimestamp: number;
    private events: Event[];
    private trialUUID: string;

    constructor() {
        this.events = []
        this.startTimestamp = performance.now()
        this.trialUUID = uuidv4()
    }

    addEvent(type: EventType, manual:boolean, data: TaskStateData) {
        const e = new Event(type, manual, performance.now(), data.toObject())
        this.events.push(e)
        console.log(e.toObject())
    }

    toObject(){
        return {
            "trialUUID":this.trialUUID,
            "trialStartTimestamp":this.startTimestamp,
            "events":this.events.map(evt => evt.toObject())
        }
    }
}

export class DataStore {
    private startTimestamp: number;
    private trials: TrialDataStore[];
    private sessionUUID: string;

    constructor(public participantUUID:string, private rules:TransformationRule[], private startString:Symbol[], private targetString:Symbol[], private forbiddenStrings:Symbol[][]) {
        this.trials = []
        this.startTimestamp = Date.now()
        this.sessionUUID = uuidv4()

    }

    startNewTrial(){
        this.trials.push(new TrialDataStore())
    }

    getCurrentTrialDataStore(){
        return this.trials[this.trials.length - 1]
    }

    addEvent(type: EventType, manual:boolean, data: TaskStateData) {
        this.getCurrentTrialDataStore().addEvent(type, manual, data)
    }

    toObject(){
        return {
            "participantUUID": this.participantUUID,
            "sessionUUID":this.sessionUUID,
            "SessionStartEpochTimestamp":this.startTimestamp,
            "startString":this.startString.map((s) => s.id),
            "targetString":this.targetString.map((s) => s.id),
            "forbiddenStrings":this.forbiddenStrings.map((string) => {return string.map(s => s.id)}),
            "rules":this.rules.map(rule => rule.toObject()),
            "trials":this.trials.map(trial => trial.toObject())
        }
    }
}