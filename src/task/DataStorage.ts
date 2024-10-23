import { StringState } from "./StringPanel";
import { v4 as uuidv4 } from 'uuid';
import { Symbol, TransformationRule } from "./StringTransformation";
import { addDoc, arrayUnion, collection, CollectionReference, doc, Firestore, getFirestore, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { mapArrayToIndexedObject } from "../utils/Utilities";

export enum RewritingTaskEventType {
    SELECT_RULE = "rule:select",
    SELECT_SYMBOL = "symbol:select",

    SUCCESSFUL_RULE_APPLICATION = "rule:apply:success",
    INVALID_RULE_APPLICATION = "rule:apply:invalid",
    FORBIDDEN_RULE_APPLICATION = "rule:apply:forbidden",
    UNDO_RULE_APPLICATION = "rule:apply:undo",

    TRIAL_RESET = "trial:reset",

    GOAL_ACHIEVED = "goal:achieved",
    START_TRIAL = "trial:start",
    END_TRIAL = "trial:end"
}

export enum NBackTaskEventType {
    START_TRIAL = "trial:start",
    END_TRIAL = "trial:end"
}

abstract class Event {
    constructor(protected type: RewritingTaskEventType | NBackTaskEventType, protected timestamp?: number) { }
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

    constructor(type: RewritingTaskEventType.SELECT_RULE | RewritingTaskEventType.SELECT_SYMBOL, private selectedIndex: integer | null, private manual: boolean, private currentString?: Symbol[], timestamp?: number) {
        super(type, timestamp)
    }

    toObject(): Object {
        if (this.type === RewritingTaskEventType.SELECT_RULE) {
            return {
                eventType: this.type.valueOf(),
                timestamp: this.timestamp,
                ruleIndex: this.selectedIndex,
                manual: this.manual
            }
        } else if (this.type === RewritingTaskEventType.SELECT_SYMBOL) {
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

export class RewritingTaskTrialDataStore {
    private startTimestamp: number;
    private events: Event[];
    private trialUUID: string;

    constructor(private rules: TransformationRule[], private startString: Symbol[], private targetString: Symbol[], private forbiddenStrings: Symbol[][]) {
        this.events = []
        this.startTimestamp = performance.now()
        this.trialUUID = uuidv4()
    }

    addEvent(event: Event) {
        event.setTimestamp(performance.now())
        this.events.push(event)
        console.log(event.toObject())
    }

    toObject() {
        return {
            trialUUID: this.trialUUID,
            trialStartTimestamp: this.startTimestamp,
            startString: this.startString.map((s) => s.id),
            targetString: this.targetString.map((s) => s.id),
            forbiddenStrings: mapArrayToIndexedObject(this.forbiddenStrings.map((string) => { return mapArrayToIndexedObject(string.map(s => s.id)) })),
            rules: mapArrayToIndexedObject(this.rules.map(rule => rule.toObject())),
            events: mapArrayToIndexedObject(this.events.map(evt => evt.toObject()))
        }
    }

    documentObject() {
        return {
            trialUUID: this.trialUUID,
            trialStartTimestamp: this.startTimestamp,
            startString: this.startString.map((s) => s.id),
            targetString: this.targetString.map((s) => s.id),
            forbiddenStrings: mapArrayToIndexedObject(this.forbiddenStrings.map((string) => { return mapArrayToIndexedObject(string.map(s => s.id)) })),
            rules: mapArrayToIndexedObject(this.rules.map(rule => rule.toObject())),
        }
    }

    getEvents(){
        return this.events.map(evt => evt.toObject())
    }
}

export class DataStore {
    private startTimestamp: number;
    private trials: RewritingTaskTrialDataStore[];
    private sessionUUID: string;
    private participantDataRef;
    private participantRewritingTaskTrialCollectionRef: CollectionReference;
    private db: Firestore;

    constructor(public participantUUID: string) {
        this.trials = []
        this.startTimestamp = Date.now()
        this.sessionUUID = uuidv4()

        this.db = getFirestore()
        this.participantDataRef = doc(this.db, "participants", this.participantUUID, "sessions", this.sessionUUID);
        setDoc(this.participantDataRef, {
            "startEpochTimestamp":this.startTimestamp
        })

        this.participantRewritingTaskTrialCollectionRef = collection(this.db, "participants", this.participantUUID, "sessions", this.sessionUUID, "tasks", "rewriting", "trials");
    }

    startNewMainTaskTrial(rules: TransformationRule[], startString: Symbol[], targetString: Symbol[], forbiddenStrings: Symbol[][]) {
        this.trials.push(new RewritingTaskTrialDataStore(rules, startString, targetString, forbiddenStrings))
    }

    getCurrentTrialLocalDataStore() {
        return this.trials[this.trials.length - 1]
    }

    addEvent(event: Event) {
        this.getCurrentTrialLocalDataStore().addEvent(event)
    }

    async dbSaveCurrentTrialData(){
        
        const currentTrialData = this.getCurrentTrialLocalDataStore()
        const trialID = `${this.trials.length}`

        // Write the main metadata for the trial to the trial document
        setDoc(doc(this.participantRewritingTaskTrialCollectionRef, trialID), currentTrialData.documentObject())

        // Create an event subcollection within the trial document, and batch add all event data objects as documents within that subcollection
        const eventsCollection = collection(this.db, "participants", this.participantUUID, "sessions", this.sessionUUID, "tasks", "rewriting", "trials", trialID, "events");
        const batch = writeBatch(this.db)
        currentTrialData.getEvents().forEach((evt, i) => {
            const eventDoc = doc(eventsCollection, `${i}`)
            batch.set(eventDoc, evt)
        })
        batch.commit()
    }

    toObject() {
        return {
            participantUUID: this.participantUUID,
            sessionUUID: this.sessionUUID,
            sessionStartEpochTimestamp: this.startTimestamp,
            trials: this.trials.map(trial => trial.toObject())
        }
    }
}