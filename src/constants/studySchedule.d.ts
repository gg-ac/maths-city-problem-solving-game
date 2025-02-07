
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
    isPractice: boolean
    instructionsKey: string | undefined
    trialDurationSeconds: number
    postTrialRest: number
    rules: ScheduleRule[]
    startString: string[]
    targetString: string[]
    forbiddenStrings: string[][]
    forbiddenIsPrefix: boolean | undefined
}

export interface StudySchedule {
    minHoursBetweenSessions: float;
    symbols: ScheduleSymbol[];
    introComicKey: string | null
    outroComicKey: string | null
    trials: ScheduleTrial[];
    endOfSessionRedirect: string | undefined,
    incompatibleDeviceRedirectURL: string | undefined
}
