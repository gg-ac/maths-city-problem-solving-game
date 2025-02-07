import { ScheduleTrial, StudySchedule } from "../constants/studySchedule";

interface StudiesMap {
    studies: {
        [studyName: string]: {
            groupID: {
                [index: string]: {
                    session: {
                        [index: string]: string
                    }
                };
            };
        };
    };
}

interface LoadedStudyScheduleData {
    schedule: StudySchedule | null
    requestedInvalidSession: boolean
    studyTotalSessions: integer | null
    groupID: string
    orderedSessionIDs: string[]
}

async function loadJsonFile(url: string) {
    try {
        const response = await fetch(url);

        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON from the response
        const data = await response.json()
        return data;
    } catch (error) {
        console.error('Error loading JSON file:', error);
    }
}

async function loadStudyToScheduleMap() {
    try {
        const response = await fetch("assets/studies/study_to_schedule_map.json");

        if (!response.ok) {
            throw new Error(`Unable to load study-to-schedule map: ${response.status}`);
        }

        const data = await response.json() as StudiesMap
        return data;
    } catch (error) {
        console.error('Error loading study-to-schedule file:', error);
    }
}

export async function loadStudySchedule(studyID: string, groupID: string, sessionNumber: integer | string, shuffleNonPracticeTrials: boolean): Promise<LoadedStudyScheduleData | null> {

    let selectedGroupID = groupID
    let totalSessions: integer | null = null
    let requestedInvalidSession = false

    const map = await loadStudyToScheduleMap()

    let sessionIDs:string[] = []
    if (map != undefined) {
        if (studyID in map.studies) {
            const study = map.studies[studyID]
            let scheduleFile = "none"
            let sessions = null

            if (groupID === "random") {
                const groupIDs = Object.values(study.groupID);
                const randomIndex = Math.floor(Math.random() * groupIDs.length);
                sessions = groupIDs[randomIndex].session
                selectedGroupID = Object.keys(study.groupID)[randomIndex]
            }
            else if (groupID in study.groupID) {
                sessions = study.groupID[groupID].session
            }

            if (sessions != null) {
                sessionIDs = Object.keys(sessions)
                totalSessions = sessionIDs.length
                if (!sessionIDs.includes(sessionNumber.toString())) {
                        requestedInvalidSession = true
                        scheduleFile = sessions[sessionIDs[sessionIDs.length - 1]]
                } else {
                    scheduleFile = sessions[sessionNumber.toString()]
                }
            } else {
                requestedInvalidSession = true
                return { "orderedSessionIDs": sessionIDs, "schedule": null, "groupID": selectedGroupID, "requestedInvalidSession": requestedInvalidSession, "studyTotalSessions": totalSessions } as LoadedStudyScheduleData
            }

            const scheduleJson = loadJsonFile("assets/studies/" + scheduleFile)
            return scheduleJson.then((value) => {
                if (value != undefined) {
                    // Randomise the order of the non-practice trials
                    if (shuffleNonPracticeTrials) {
                        let shuffledTrials = getShuffledTrials(value.trials)
                        value.trials = shuffledTrials
                        console.log(shuffledTrials)
                    }
                    return { "orderedSessionIDs": sessionIDs, "schedule": value, "groupID": selectedGroupID, "requestedInvalidSession": requestedInvalidSession, "studyTotalSessions": totalSessions } as LoadedStudyScheduleData
                }
                return { "orderedSessionIDs": sessionIDs, "schedule": null, "groupID": selectedGroupID, "requestedInvalidSession": requestedInvalidSession, "studyTotalSessions": totalSessions } as LoadedStudyScheduleData
            })
        }
    }
    return { "orderedSessionIDs": sessionIDs, "schedule": null, "groupID": selectedGroupID, "requestedInvalidSession": requestedInvalidSession, "studyTotalSessions": totalSessions } as LoadedStudyScheduleData

}

function shuffleArray(a: any[]) {
    a = a.slice(0)
    for (var i = a.length - 1; i >= 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
    return a
}

function getShuffledTrials(trials: ScheduleTrial[]) {
    // Return a copy of the trials array from the given study schedule with the order 
    // of the non-practice trials randomised
    const allTrials = trials.slice(0)
    let trialsToShuffle: ScheduleTrial[] = []

    for (let i = 0; i < allTrials.length; i++) {
        const t = allTrials[i]
        if (!t.isPractice) {
            trialsToShuffle.push(t)
        }
    }

    const shuffledNonPracticeTrials = shuffleArray(trialsToShuffle)

    let allTrialsShuffled: ScheduleTrial[] = []
    for (let i = 0; i < allTrials.length; i++) {
        const t = allTrials[i]
        if (!t.isPractice) {
            const nextTrial = shuffledNonPracticeTrials.pop()
            if (nextTrial !== undefined) {
                allTrialsShuffled[i] = nextTrial
            }
        } else {
            allTrialsShuffled[i] = t
        }
    }

    return allTrialsShuffled
}