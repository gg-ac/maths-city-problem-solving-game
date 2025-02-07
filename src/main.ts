import { COMPATIBLE_OS, GAME_HEIGHT, GAME_WIDTH } from './constants/GameConstants';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";
import { MainGameScene } from './scenes/MainGameScene';

import * as Survey from "survey-js-ui"
import { MainMenu } from './scenes/MainMenu';

import 'survey-core/defaultV2.min.css';
import { END_OF_DEMO, END_OF_SESSION_STRATEGY_SURVEY, END_OF_SESSION_SURVEY, END_OF_STUDY_SURVEY_BLANK, INTRODUCTION_CONSENT_STUDY, INTRODUCTION_FULL_STUDY, INTRODUCTION_SURVEY_MAIN_TASK, INTRODUCTION_SURVEY_MEMORY_TASK } from './ui/Surveys';
import UAParser from 'ua-parser-js';
import { DataStore } from './task/DataStorage';
import { getBrowserLanguage, getBrowserTimezone, replaceUndefinedWithUnknown } from './utils/Utilities';
import { StudySchedule } from './constants/studySchedule';
import { loadStudySchedule } from './utils/StudyLoader';
import { ComicPanelConfig } from './ui/comics/ComicPage';
import { SurveyScene } from './scenes/SurveyScene';
import { COMIC_PAGE_REGISTER } from './constants/comicConfig/ComicConfigConstants';
import { ComeBackLaterScene } from './scenes/ComeBackLaterScene';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { CognitiveAssessmentsScene } from './scenes/CognitiveAssessmentsScene';
import { TotalFeedbackScene } from './scenes/TotalFeedbackScene';




setupGame("demo_user")

function setupGame(user_id:string) {

    // Load the session settings (study and condition group) from the URL Parameters, if present
    const currentURL = new URL(window.location.href)
    const params = new URLSearchParams(currentURL.search);
    let participantRecruitmentID = params.get('rid'); // Only used to link internal IDs with experiment platform participant IDs
    let studyIDfromURL = params.get('study'); // The study in which to enrol the participant
    let studyConditionIDfromURL = params.get('g'); // The group/condition within the study to enrol the participant in
    let sessionIDfromURL = params.get('s'); // The number of the session
    let exceptionParameter = params.get('exception')
    let resumeTrialParameter = params.get('tres')    
    const isDemo = currentURL.pathname == "/demo"


    // The user's datastore, to be initialised after the demographic survey or login
    let dataStore: DataStore = new DataStore(user_id, isDemo)

    // Utility for saving data about device, browser, language, and timezone
    function saveBrowserSessionData(dataStore: DataStore, recruitmentID: string | null) {
        // Get the user's browser data
        const parser = new UAParser();
        const uaData = parser.getResult();
        let browserData = replaceUndefinedWithUnknown(uaData)


        // Also get the language and timezone
        browserData["browserLanguage"] = getBrowserLanguage()
        browserData["browserTimezone"] = getBrowserTimezone()

        // Save the participant's extra ID info from the URL
        // (We may use this for linking in-game IDs with Prolific IDs)
        if (recruitmentID != null) {
            browserData["participantRecruitmentID"] = recruitmentID
        }

        // Save the current session's browser and device data
        dataStore.dbSaveParticipantSessionBrowserData(browserData)

    }

    function isBrowserCompatible() {
        // Check that the OS of the device is in the compatible list
        const parser = new UAParser();
        const uaData = parser.getResult();
        if (uaData.os.name != undefined) {
            return COMPATIBLE_OS.includes(uaData.os.name.toLowerCase())
        } else {
            return false
        }
    }

    // To be called after the demographic survey is submitted (and consent is gained)
    const completeSurvey = (s: Survey.Model) => {

        // Save the demographic data
        dataStore.dbSaveParticipantDemographicFormData(s.data)

    }




    if (isDemo) {
        participantRecruitmentID = "demo_participant"
        studyIDfromURL = "mini_demo_session"
        studyConditionIDfromURL = "group_1a"
        sessionIDfromURL = "0"
        exceptionParameter = "true"
        document.getElementById("new-game-button")!.style.display = "block";
    }else{
        document.getElementById("new-game-button")!.style.display = "none";
    }

    if ((participantRecruitmentID == null) || (studyIDfromURL == null) || (sessionIDfromURL == null)) {
        alert("The provided study URL is invalid")
    } else {

        // Store the participant ID and browser data in the participant document
        dataStore.initialiseDB().then(() => {
            saveBrowserSessionData(dataStore, participantRecruitmentID)


            // Check what sessions this participant has already completed, and start the game
            let attemptedRepeatSession = false
            let mostRecentCompleteSessionTime: Timestamp = new Timestamp(0, 0)
            let mostRecentStartSessionTime: Timestamp = Timestamp.now()
            const completedSessionMetadataPromise = dataStore.dbGetAllSessionMetadata(participantRecruitmentID)
            completedSessionMetadataPromise.then((data) => {
                let completedSessionIDs: string[] = []
                data?.forEach((d) => {
                    if (d.lastCompleteSessionNumber != undefined) {
                        completedSessionIDs.push(d.lastCompleteSessionNumber.toString())
                        if (d.lastCompleteSessionNumber.toString() == sessionIDfromURL.toString()) {
                            attemptedRepeatSession = true
                        }
                    }
                    if (d.lastCompleteSessionServerTime != undefined) {
                        if (d.lastCompleteSessionServerTime > mostRecentCompleteSessionTime) {
                            mostRecentCompleteSessionTime = d.lastCompleteSessionServerTime
                        }
                    }
                    if (d.mostRecentSessionStartTimestamp != undefined) {
                        if (d.mostRecentSessionStartTimestamp > mostRecentStartSessionTime) {
                            mostRecentStartSessionTime = d.mostRecentSessionStartTimestamp
                        }
                    }

                    if (studyConditionIDfromURL == null) {
                        if (d.groupID != undefined) {
                            studyConditionIDfromURL = d.groupID
                            console.log(`Continuing condition ${studyConditionIDfromURL}`)
                        }
                    }

                })

                if (studyConditionIDfromURL == null) {
                    alert("No condition group was found for this participant")
                    return
                }


                let hoursSinceLastCompleteSession = Infinity
                console.log(mostRecentCompleteSessionTime)
                console.log(mostRecentStartSessionTime)
                const previousS = mostRecentCompleteSessionTime.seconds
                const currentS = mostRecentStartSessionTime.seconds
                if (previousS > 0 && currentS > 0) {
                    hoursSinceLastCompleteSession = (currentS - previousS) / 60 / 60
                }
                console.log(hoursSinceLastCompleteSession)

                try {
                    loadStudySchedule(studyIDfromURL, studyConditionIDfromURL!, sessionIDfromURL, !isDemo).then((scheduleData) => {


                        // Redirect to the incompatible alert webpage if the device is not compatible
                        if (!isBrowserCompatible()) {
                            if (scheduleData?.schedule != undefined) {
                                if (scheduleData.schedule.incompatibleDeviceRedirectURL != undefined) {
                                    let w = window.open(scheduleData.schedule.incompatibleDeviceRedirectURL, '_blank');
                                    if (w == null) {
                                        alert(`Your device is not compatible with this study. Please use a different device or withdraw from the study by visiting ${scheduleData.schedule.incompatibleDeviceRedirectURL}`)
                                    }
                                }
                            }
                        }

                        // Check if the participant has tried to start a later session without completing the preceding session
                        let skippedOneOrMoreSessions = false
                        let sessionIndex = -1

                        if (scheduleData != undefined) {
                            sessionIndex = scheduleData.orderedSessionIDs.indexOf(sessionIDfromURL)
                            if ((sessionIndex > 0) && !(completedSessionIDs.includes(scheduleData.orderedSessionIDs[sessionIndex - 1]))) {
                                skippedOneOrMoreSessions = true
                            }
                        }

                        // Try to start the game
                        if (scheduleData?.schedule != undefined) {
                            startGame(scheduleData.schedule, hoursSinceLastCompleteSession, attemptedRepeatSession, skippedOneOrMoreSessions, sessionIDfromURL, sessionIndex, scheduleData.studyTotalSessions, studyIDfromURL, scheduleData.groupID)
                        } else {
                            alert(`Study schedule data undefined for ${studyConditionIDfromURL}, ${studyIDfromURL}, ${sessionIDfromURL}`)
                        }
                    })
                } catch {
                    alert(`Study schedule was not loaded for ${studyConditionIDfromURL}, ${studyIDfromURL}, ${sessionIDfromURL}`)
                }
            })



            function endOfStudyComsSignupSubmitted(survey: Survey.Model) {
                dataStore.dbUpdateFutureContactConsent(survey["future-contact"])
            }



            function startGame(studySchedule: StudySchedule, hoursSinceLastCompleteSession: number | null, attemptedRepeatSession: boolean, skippedOneOrMoreSessions: boolean, currentSessionID: string, currentSessionNumber: integer, studyTotalSessions: integer | null, currentStudyID: string, currentStudyGroup: string) {

                if (exceptionParameter !== "true") {
                    if (attemptedRepeatSession) {
                        alert(`Session number ${currentSessionNumber + 1} was already completed. Please ensure you are using the correct URL`)
                        return
                    }

                    if (skippedOneOrMoreSessions) {
                        alert(`You are attempting to start start session ${currentSessionNumber + 1} without having completed all preceding sessions. Please ensure you are using the correct URL`)
                        return
                    }
                }

                // Store the participant's group and session data
                dataStore.dbSetSessionInfoData(currentSessionNumber, currentStudyID, currentStudyGroup)

                // If the player tries to start a second or later session sooner than the study allows, we will show a "come back later" message
                // Get the number of hours remaining until the time the next session can start
                let hoursUntilSessionIntervalOk = 0
                if (hoursSinceLastCompleteSession != null && hoursSinceLastCompleteSession < studySchedule.minHoursBetweenSessions) {
                    hoursUntilSessionIntervalOk = studySchedule.minHoursBetweenSessions - hoursSinceLastCompleteSession
                }

                const openCompletionPage = () => {
                    if (studySchedule.endOfSessionRedirect != undefined) {
                        const w = window.open(studySchedule.endOfSessionRedirect, '_blank');
                        if (w == null) {
                            alert(`You have completed the session, but your browser prevented the confirmation URL from loading. To confirm that you have completed the session, please visit ${studySchedule.endOfSessionRedirect}`)
                        }
                    }
                }


                // Get the required intro and outro comic pages as specified by the schedule
                let comicPageImageFilepaths: string[] = []
                let introComicConfig = undefined
                let outroComicConfig = undefined
                if (studySchedule.introComicKey != null) {
                    introComicConfig = COMIC_PAGE_REGISTER.getPanelConfig(studySchedule.introComicKey)
                    comicPageImageFilepaths.push(...COMIC_PAGE_REGISTER.getPanelImagePaths(studySchedule.introComicKey))
                }
                if (studySchedule.outroComicKey != null) {
                    outroComicConfig = COMIC_PAGE_REGISTER.getPanelConfig(studySchedule.outroComicKey)
                    comicPageImageFilepaths.push(...COMIC_PAGE_REGISTER.getPanelImagePaths(studySchedule.outroComicKey))
                }


                let finalSceneKey = "endOfSessionSurvey"
                if (studyTotalSessions != null) {
                    finalSceneKey = currentSessionNumber < studyTotalSessions - 1 ? "endOfSessionSurvey" : "endOfStudySurveyBlank"
                }

                // Get the "come back later" comic page
                const comeBackLaterPage: ComicPanelConfig[] = [{ filepath: 'comic_panels/test_comic_panel.png', row: 0, col: 0, rowSpan: 1, colSpan: 2, delay: 500 }]
                comicPageImageFilepaths.push(...comeBackLaterPage.map((p) => { return p.filepath }))

                // Optionally resume a given trial of the main task
                var firstScene = hoursUntilSessionIntervalOk <= 0 ? "fullStudyIntro" : "comeBackLaterScene"
                var resumeTrialNumber = null
                if (resumeTrialParameter !== null) {
                    firstScene = "MainGameScene"
                    resumeTrialNumber = parseInt(resumeTrialParameter)
                }

                // Configure the Phaser game
                const config: Types.Core.GameConfig = {
                    type: Phaser.WEBGL,
                    width: GAME_WIDTH,
                    height: GAME_HEIGHT,
                    parent: 'game-container',
                    transparent: true,
                    scale: {
                        mode: Phaser.Scale.FIT,
                        autoCenter: Phaser.Scale.CENTER_BOTH
                    },
                    scene: [
                        Boot,
                        new Preloader("MainMenu", comicPageImageFilepaths),
                        new MainMenu(currentSessionNumber, firstScene),
                        new SurveyScene("fullStudyIntro", currentSessionNumber == 0 ? new Survey.Model(INTRODUCTION_CONSENT_STUDY) : new Survey.Model(INTRODUCTION_FULL_STUDY), currentSessionNumber == 0 ? "memoryTaskIntro" : "CognitiveAssessmentsScene"),
                        new SurveyScene("memoryTaskIntro", new Survey.Model(INTRODUCTION_SURVEY_MEMORY_TASK), "CognitiveAssessmentsScene"),
                        new CognitiveAssessmentsScene(dataStore, currentSessionNumber, currentStudyID, currentStudyGroup, "mainTaskIntro"),
                        new SurveyScene("mainTaskIntro", new Survey.Model(INTRODUCTION_SURVEY_MAIN_TASK), "MainGameScene"),
                        new MainGameScene(dataStore, studySchedule, currentSessionNumber, currentStudyID, currentStudyGroup, "strategyDebriefSurvey", resumeTrialNumber),
                        new ComeBackLaterScene("comeBackLaterScene", hoursUntilSessionIntervalOk),


                        new SurveyScene("strategyDebriefSurvey", new Survey.Model(END_OF_SESSION_STRATEGY_SURVEY), finalSceneKey, (s) => {
                            dataStore.dbSaveStrategyReportData(s.data)
                            openCompletionPage()
                        }),
                        new SurveyScene("endOfSessionSurvey", new Survey.Model(END_OF_SESSION_SURVEY), null),
                        new SurveyScene("endOfStudySurveyBlank", new Survey.Model(END_OF_STUDY_SURVEY_BLANK), null),
                    ]
                };

                const demo_config: Types.Core.GameConfig = {
                    type: Phaser.WEBGL,
                    width: GAME_WIDTH,
                    height: GAME_HEIGHT,
                    parent: 'game-container',
                    transparent: true,
                    scale: {
                        mode: Phaser.Scale.FIT,
                        autoCenter: Phaser.Scale.CENTER_BOTH
                    },
                    scene: [
                        Boot,
                        new Preloader("MainGameScene"),
                        new MainGameScene(dataStore, studySchedule, currentSessionNumber, currentStudyID, currentStudyGroup, "endOfSessionSurvey", resumeTrialNumber),
                        new TotalFeedbackScene("endOfSessionSurvey", dataStore, null),
                    ]
                };

                let game_config = config
                if (isDemo) {
                    game_config = demo_config
                }
                new Game(game_config);
            }
        })

    }
}
