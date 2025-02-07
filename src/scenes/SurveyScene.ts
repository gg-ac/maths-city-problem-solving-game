import { SURVEY_JS_THEME } from "../constants/GameConstants";
import BaseScene from "./BaseScene";
import * as Survey from "survey-js-ui"

export class SurveyScene extends BaseScene {

    constructor(sceneKey: string, private surveyModel: Survey.Model, private nextSceneKey: string | null, private onSurveyCompleted?: (s: Survey.Model) => void) {
        super(sceneKey);
    }

    create() {
        super.create()

        document.getElementById("surveyModal")!.style.display = "block";

        this.surveyModel.clear(false, true)
        this.surveyModel.applyTheme(SURVEY_JS_THEME);
        this.surveyModel.render(document.getElementById("surveyContainer"));
        this.surveyModel.onComplete.add(() => {
            let delay = 0
            if (this.surveyModel.showCompletedPage) {
                delay = 3000
            }
            this.time.delayedCall(delay, () => {
                // Hide the survey HTML element
                document.getElementById("surveyModal")!.style.display = "none";

                // Run the optional completion callback
                // Can be used to save the survey data, for example
                if (this.onSurveyCompleted != undefined) {
                    this.onSurveyCompleted(this.surveyModel)
                }

                // Start the next scene, if there is one
                if (this.nextSceneKey != null) {
                    this.scene.start(this.nextSceneKey)
                }
            })
        })
    }

}