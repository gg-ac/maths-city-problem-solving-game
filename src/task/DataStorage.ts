import { StringState } from "./StringPanel";
import { v4 as uuidv4 } from 'uuid';
import { Symbol, TransformationRule } from "./StringTransformation";

export enum EventType {
    SELECT_RULE = "rule:select",
    SELECT_SYMBOL = "symbol:select",

    SUCCESSFUL_RULE_APPLICATION = "rule:apply:success",
    INVALID_RULE_APPLICATION = "rule:apply:invalid",
    FORBIDDEN_RULE_APPLICATION = "rule:apply:forbidden",

    GOAL_ACHIEVED = "goal:achieved",
    START_TRIAL = "trial:start",
    END_TRIAL = "trial:end"
}

abstract class Event {
    constructor(protected type: EventType, protected timestamp?: number) { }
    abstract toObject(): Object

    setTimestamp(timestamp:number){
        this.timestamp = timestamp
    }
}


export class EventTaskStatus extends Event {
    toObject(): Object {
        return {
            "eventType": this.type.valueOf(),
            "timestamp": this.timestamp
        }
    }
}

export class EventRuleApply extends Event {

    constructor(type: EventType.SUCCESSFUL_RULE_APPLICATION | EventType.INVALID_RULE_APPLICATION | EventType.FORBIDDEN_RULE_APPLICATION, private ruleIndex: integer | null, private symbolIndex: integer | null, private startString: Symbol[], private resultString?: Symbol[], timestamp?: number, private forbiddenStringMatchIndex?:integer) {
        super(type, timestamp)
    }

    toObject(): Object {
        if(this.type === EventType.FORBIDDEN_RULE_APPLICATION){            
            return {
                "eventType": this.type.valueOf(),
                "timestamp": this.timestamp,
                "ruleIndex": this.ruleIndex,
                "symbolIndex": this.symbolIndex,
                "startString": this.startString?.map(s=>s.id),
                "forbiddenStringMatchIndex": this.forbiddenStringMatchIndex
            }
        }else if(this.type === EventType.INVALID_RULE_APPLICATION){
            return {
                "eventType": this.type.valueOf(),
                "timestamp": this.timestamp,
                "ruleIndex": this.ruleIndex,
                "symbolIndex": this.symbolIndex,
                "startString": this.startString?.map(s=>s.id)
            }
        }
        return {
            "eventType": this.type.valueOf(),
            "timestamp": this.timestamp,
            "ruleIndex": this.ruleIndex,
            "symbolIndex": this.symbolIndex,
            "startString": this.startString?.map(s=>s.id),
            "resultString": this.resultString?.map(s=>s.id)
        }
    }
}

export class EventSelect extends Event {

    constructor(type: EventType.SELECT_RULE | EventType.SELECT_SYMBOL, private selectedIndex: integer | null, private manual: boolean, private currentString?: Symbol[], timestamp?: number) {
        super(type, timestamp)
    }

    toObject(): Object {
        if (this.type === EventType.SELECT_RULE) {
            return {
                "eventType": this.type.valueOf(),
                "timestamp": this.timestamp,
                "ruleIndex": this.selectedIndex,
                "manual": this.manual
            }
        } else if (this.type === EventType.SELECT_SYMBOL) {
            return {
                "eventType": this.type.valueOf(),
                "timestamp": this.timestamp,
                "currentString": this.currentString?.map(s=>s.id),
                "symbolIndex": this.selectedIndex,
                "manual": this.manual
            }
        }
        return {}
    }

}


// export class TaskStateData {
//     constructor(private activeRuleIndex: integer | null, private stringState: StringState) { }

//     toObject() {
//         const obj = {
//             "activeRuleIndex": this.activeRuleIndex,
//             "stringState": {
//                 "currentString": this.stringState?.currentString.map((s) => s.id),
//                 "activeSymbolIndex": this.stringState?.currentActiveIndex
//             }
//         }
//         return obj
//     }

// }

export class TrialDataStore {
    private startTimestamp: number;
    private events: Event[];
    private trialUUID: string;

    constructor() {
        this.events = []
        this.startTimestamp = performance.now()
        this.trialUUID = uuidv4()
    }

    addEvent(event:Event) {
        event.setTimestamp(performance.now())
        this.events.push(event)
        console.log(event.toObject())
    }

    toObject() {
        return {
            "trialUUID": this.trialUUID,
            "trialStartTimestamp": this.startTimestamp,
            "events": this.events.map(evt => evt.toObject())
        }
    }
}

export class DataStore {
    private startTimestamp: number;
    private trials: TrialDataStore[];
    private sessionUUID: string;

    constructor(public participantUUID: string, private rules: TransformationRule[], private startString: Symbol[], private targetString: Symbol[], private forbiddenStrings: Symbol[][]) {
        this.trials = []
        this.startTimestamp = Date.now()
        this.sessionUUID = uuidv4()

    }

    startNewTrial() {
        this.trials.push(new TrialDataStore())
    }

    getCurrentTrialDataStore() {
        return this.trials[this.trials.length - 1]
    }

    addEvent(event:Event) {
        this.getCurrentTrialDataStore().addEvent(event)
    }

    toObject() {
        return {
            "participantUUID": this.participantUUID,
            "sessionUUID": this.sessionUUID,
            "sessionStartEpochTimestamp": this.startTimestamp,
            "startString": this.startString.map((s) => s.id),
            "targetString": this.targetString.map((s) => s.id),
            "forbiddenStrings": this.forbiddenStrings.map((string) => { return string.map(s => s.id) }),
            "rules": this.rules.map(rule => rule.toObject()),
            "trials": this.trials.map(trial => trial.toObject())
        }
    }
}