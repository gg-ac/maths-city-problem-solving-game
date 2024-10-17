
export interface ScheduleSymbol {
    symbolID: string;
    graphicKey: string;
    isGeneric: boolean;
}

export interface ScheduleRule {
    input: string[];
    output: string[];
}

export interface ScheduleTrial {
    postTrialRest: number;
    rules: ScheduleRule[];
    startString: string[];
    targetString: string[];
    forbiddenStrings: string[][];
}

export interface StudySchedule {
    symbols: ScheduleSymbol[];
    trials: ScheduleTrial[];
}
