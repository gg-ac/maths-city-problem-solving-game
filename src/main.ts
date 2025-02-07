import { GAME_HEIGHT, GAME_WIDTH } from './constants/GameConstants';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";
import { MainGameScene } from './scenes/MainGameScene';

import 'survey-core/defaultV2.min.css';
import { DataStore } from './task/DataStorage';
import { StudySchedule } from './constants/studySchedule';
import { loadStudySchedule } from './utils/StudyLoader';
import { TotalFeedbackScene } from './scenes/TotalFeedbackScene';




setupGame()

function setupGame() {
    // Load the session settings (study and condition group) from the URL Parameters, if present
    const currentURL = new URL(window.location.href)

    // The user's datastore, to be initialised after the demographic survey or login
    let dataStore: DataStore = new DataStore()

    let studyIDfromURL = "mini_demo_session"
    let studyConditionIDfromURL = "group_1a"
    let sessionIDfromURL = "0"
    document.getElementById("new-game-button")!.style.display = "block";


    try {
        loadStudySchedule(studyIDfromURL, studyConditionIDfromURL!, sessionIDfromURL, false).then((scheduleData) => {

            // Try to start the game
            if (scheduleData?.schedule != undefined) {
                startGame(scheduleData.schedule, studyIDfromURL, scheduleData.groupID)
            } else {
                alert(`Study schedule data undefined for ${studyConditionIDfromURL}, ${studyIDfromURL}, ${sessionIDfromURL}`)
            }
        })
    } catch {
        alert(`Study schedule was not loaded for ${studyConditionIDfromURL}, ${studyIDfromURL}, ${sessionIDfromURL}`)
    }


    function startGame(studySchedule: StudySchedule, currentStudyID: string, currentStudyGroup: string) {

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
                new MainGameScene(dataStore, studySchedule, 0, currentStudyID, currentStudyGroup, "endOfSessionSurvey", 0),
                new TotalFeedbackScene("endOfSessionSurvey", dataStore, null),
            ]
        };

        new Game(demo_config);
    }
}
