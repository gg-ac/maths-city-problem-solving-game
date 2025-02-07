import { StringState } from "./StringPanel";
import { v4 as uuidv4 } from 'uuid';
import { Symbol, TransformationRule } from "./StringTransformation";
import { addDoc, arrayUnion, collection, CollectionReference, doc, DocumentReference, FieldValue, Firestore, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch } from "firebase/firestore";
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


interface SessionCompletionData {
    lastCompleteSessionServerTime: Timestamp
    mostRecentSessionStartTimestamp: Timestamp
    lastCompleteSessionNumber: integer | string
    studyID: string
    groupID: string
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
    private startTimestamp: number;
    private trials: (RewritingTaskTrialDataStore | RunningMemorySpanTaskTrialDataStore)[];
    private sessionUUID: string;
    private participantDataRef;
    private participantRewritingTaskTrialCollectionRef: CollectionReference;
    private participantMemoryTaskTrialCollectionRef: CollectionReference;
    private participantSessionDocRef: DocumentReference;
    private participantDocRef: DocumentReference;
    private allParticipantsRef: CollectionReference;
    private db: Firestore;
    private dbInitialised: boolean = false

    public localTotalScore: integer = 0

    constructor(public participantUUID: string, public demoMode: boolean) {
        this.trials = []
        this.startTimestamp = Date.now()
        this.sessionUUID = uuidv4()

        this.db = getFirestore()
        this.participantDataRef = doc(this.db, "participants", this.participantUUID, "sessions", this.sessionUUID);
        this.participantRewritingTaskTrialCollectionRef = collection(this.db, "participants", this.participantUUID, "sessions", this.sessionUUID, "tasks", "rewriting", "trials");
        this.participantMemoryTaskTrialCollectionRef = collection(this.db, "participants", this.participantUUID, "sessions", this.sessionUUID, "tasks", "memoryspan", "trials");
        this.participantSessionDocRef = doc(this.db, "participants", this.participantUUID, "sessions", this.sessionUUID);
        this.participantDocRef = doc(this.db, "participants", this.participantUUID);
        this.allParticipantsRef = collection(this.db, "participants")

    }

    async initialiseDB() {
        if (!this.demoMode) {
            if (!this.dbInitialised) {
                setDoc(this.participantDataRef, {
                    "startEpochTimestamp": this.startTimestamp
                })
                this.dbInitialised = true
            }
            await this.dbUpdateSessionStartTimestamp()
        }
    }

    startNewRunningMemorySpanTaskTrial() {
        this.trials.push(new RunningMemorySpanTaskTrialDataStore())
    }

    startNewMainTaskTrial(rules: TransformationRule[], startString: Symbol[], targetString: Symbol[], forbiddenStrings: Symbol[][], forbiddenStringIsPrefix: boolean, isPracticeTrial: boolean) {
        this.trials.push(new RewritingTaskTrialDataStore(rules, startString, targetString, forbiddenStrings, forbiddenStringIsPrefix, isPracticeTrial))
    }

    getCurrentTrialLocalDataStore() {
        return this.trials[this.trials.length - 1]
    }

    addEvent(event: Event) {
        this.getCurrentTrialLocalDataStore().addEvent(event)
    }



    async dbUpdateLastSessionCompletionData(currentSessionNumber: integer, studyID: string, groupID: string) {
        if (!this.demoMode) {
            const completionData = { "lastCompleteSessionServerTime": serverTimestamp(), "lastCompleteSessionNumber": currentSessionNumber, "studyID": studyID, "groupID": groupID } as SessionCompletionData
            setDoc(this.participantDocRef, completionData, { merge: true })
        }
    }

    async dbSetSessionInfoData(currentSessionNumber: integer, studyID: string, groupID: string) {
        if (!this.demoMode) {
            // Save the session parameters in the session object, as it could change between sessions
            console.log("Storing session info data")
            const sessionData = { "scheduleSessionNumber": currentSessionNumber, "studyID": studyID, "groupID": groupID }
            setDoc(this.participantSessionDocRef, sessionData, { merge: true })
        }
    }

    async dbUpdateSessionStartTimestamp() {
        if (!this.demoMode) {
            await setDoc(this.participantDocRef, { "mostRecentSessionStartTimestamp": serverTimestamp() }, { merge: true })
        }
    }

    async dbUpdateFutureContactConsent(consent: boolean) {
        if (!this.demoMode) {
            setDoc(this.participantDocRef, { "constentFutureContact": consent }, { merge: true })
        }
    }

    async dbSaveStrategyReportData(responseData: any) {
        if (!this.demoMode) {
            console.log(responseData)
            const strategyOther = responseData["strategy-other"]
            const strategyIntuition = responseData["strategy-rating-intuition"]
            const strategyTryAndSee = responseData["strategy-rating-try-and-see"]
            const strategyWorkOut = responseData["strategy-rating-work-out"]

            setDoc(this.participantDocRef, replaceUndefinedWithUnknown({
                "strategyReport": {
                    "strategyOther": strategyOther,
                    "strategyIntuition": strategyIntuition,
                    "strategyTryAndSee": strategyTryAndSee,
                    "strategyWorkOut": strategyWorkOut
                }
            }), { merge: true })
        }
    }

    async dbSetSessionComplete() {
        if (!this.demoMode) {
            setDoc(this.participantSessionDocRef, { "sessionComplete": true }, { merge: true })
        }
    }

    async dbGetLastSessionCompletionData() {
        if (!this.demoMode) {
            return getDoc(this.participantDocRef).then((docSnap) => {
                if (docSnap.exists()) {
                    const data = {
                        "lastCompleteSessionServerTime": docSnap.get("lastCompleteSessionServerTime"),
                        "lastCompleteSessionNumber": docSnap.get("lastCompleteSessionNumber"),
                        "mostRecentSessionStartTimestamp": docSnap.get("mostRecentSessionStartTimestamp"),
                        "studyID": docSnap.get("studyID"),
                        "groupID": docSnap.get("groupID")
                    } as SessionCompletionData

                    return data
                }
                return null
            })
        }
    }

    async dbGetCompletedSessionMetadata(participantID: string) {
        if (!this.demoMode) {
            const q = query(collection(this.db, "participants"), where("participantRecruitmentID", "==", participantID), where("lastCompleteSessionNumber", "!=", null));
            const completeSessionDataPromise = getDocs(q).then((d) => {

                let completeSessionData: SessionCompletionData[] = []
                d.forEach((doc) => {
                    const data = doc.data()
                    completeSessionData.push({
                        "lastCompleteSessionNumber": data["lastCompleteSessionNumber"],
                        "lastCompleteSessionServerTime": data["lastCompleteSessionServerTime"],
                        "mostRecentSessionStartTimestamp": data["mostRecentSessionStartTimestamp"],
                        "studyID": data["studyID"],
                        "groupID": data["groupID"]
                    })
                });
                return completeSessionData
            })

            return completeSessionDataPromise
        }

    }
    async dbGetAllSessionMetadata(participantID: string) {
        if (!this.demoMode) {
            const q = query(collection(this.db, "participants"), where("participantRecruitmentID", "==", participantID));
            const completeSessionDataPromise = getDocs(q).then((d) => {

                let completeSessionData: SessionCompletionData[] = []
                d.forEach((doc) => {
                    const data = doc.data()
                    completeSessionData.push({
                        "lastCompleteSessionNumber": data["lastCompleteSessionNumber"],
                        "lastCompleteSessionServerTime": data["lastCompleteSessionServerTime"],
                        "mostRecentSessionStartTimestamp": data["mostRecentSessionStartTimestamp"],
                        "studyID": data["studyID"],
                        "groupID": data["groupID"]
                    })
                });
                return completeSessionData
            })

            return completeSessionDataPromise
        }

    }

    async dbSaveCurrentTrialData() {
        if (!this.demoMode) {
            this.checkInitialised()

            const currentTrialData = this.getCurrentTrialLocalDataStore()
            const trialID = `${this.trials.length}`

            if (currentTrialData instanceof RewritingTaskTrialDataStore) {

                // Write the main metadata for the trial to the trial document
                setDoc(doc(this.participantRewritingTaskTrialCollectionRef, trialID), currentTrialData.documentObject(), { merge: true })

                // Create an event subcollection within the trial document, and batch add all event data objects as documents within that subcollection
                const eventsCollection = collection(this.db, "participants", this.participantUUID, "sessions", this.sessionUUID, "tasks", "rewriting", "trials", trialID, "events");
                const batch = writeBatch(this.db)
                currentTrialData.getEvents().forEach((evt, i) => {
                    const eventDoc = doc(eventsCollection, `${i}`)
                    batch.set(eventDoc, evt)
                })
                batch.commit()
            } else if (currentTrialData instanceof RunningMemorySpanTaskTrialDataStore) {
                setDoc(doc(this.participantMemoryTaskTrialCollectionRef, trialID), currentTrialData.documentObject(), { merge: true })

                const eventsCollection = collection(this.db, "participants", this.participantUUID, "sessions", this.sessionUUID, "tasks", "memoryspan", "trials", trialID, "events");
                const batch = writeBatch(this.db)
                currentTrialData.getEvents().forEach((evt, i) => {
                    const eventDoc = doc(eventsCollection, `${i}`)
                    batch.set(eventDoc, evt)
                })
                batch.commit()
            }
        }
    }

    async dbSaveParticipantDemographicFormData(demographicsData: Object) {
        if (!this.demoMode) {
            this.checkInitialised()
            setDoc(this.participantDocRef, demographicsData, { merge: true })
        }
    }

    async dbSaveParticipantSessionBrowserData(browserData: Object) {
        if (!this.demoMode) {
            setDoc(this.participantDocRef, browserData, { merge: true })
        }
    }

    async getHoursSinceLastCompleteSession() {
        if (!this.demoMode) {
            const docSnap = await getDoc(this.participantDocRef)
            if (docSnap.exists()) {
                const lastCompleteSessionServerTime = await docSnap.get("lastCompleteSessionServerTime")
                const mostRecentSessionStartTimestamp = await docSnap.get("mostRecentSessionStartTimestamp")

                if (lastCompleteSessionServerTime != undefined && mostRecentSessionStartTimestamp != undefined) {
                    const previousMs = lastCompleteSessionServerTime.toMillis()
                    const currentMs = mostRecentSessionStartTimestamp.toMillis()
                    const deltaHours = (currentMs - previousMs) / 1000 / 60 / 60
                    return deltaHours
                }
            }
            return null
        }
    }

    private checkInitialised() {
        if (!this.dbInitialised) {
            throw Error("Database not yet initialised. Remember to call initialiseDB before trying to save other data.")
        }
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