import { SURVEY_JS_THEME } from "../constants/GameConstants";
import { DataStore } from "../task/DataStorage";
import { computePercentile } from "../utils/Utilities";
import BaseScene from "./BaseScene";
import * as Survey from "survey-js-ui"

export class TotalFeedbackScene extends BaseScene {


    constructor(sceneKey: string, private dataStore: DataStore, private nextSceneKey: string | null, private onSurveyCompleted?: (s: Survey.Model) => void) {
        super(sceneKey);

    }

    create() {
        super.create()

        let totalScore = this.dataStore.localTotalScore
        let totalScorePercent = Math.round(100*totalScore / 750)
        totalScorePercent = totalScorePercent > 100 ? 100 : totalScorePercent

        let message = `<p>Your total score was <b>${this.dataStore.localTotalScore} points</b>!</p><p>That's ${totalScorePercent}% of the maximum number of points!</p>`

        if (totalScorePercent > 50){
            message += `<p>Well done!</p>`
        }

        message += `<p>It usually takes lots of practice to get good at problem-solving skills. Researchers at the University of Leeds want to find out how to help people learn this kind of skill more quickly</p>`
        message += `<p>If you'd like to help with our research by playing more games, you can submit your email address at <u>bit.ly/puzzlestudyleeds</u></p><p>We'll send you a link when our study goes live.</p>`
        message += `<p></p><p>Thanks for playing!</p>`
        


        let surveyModel = new Survey.Model({
            "showCompletedPage": false,
            "pages": [
          
              {
                "name": "end_of_demo",
                "elements": [
                  {
                    "type": "html",
                    "name": "end_of_demo_html",
                    "html": {
                      "default": message,
                    }
                  }
                ]
              },
            ],
            "showNavigationButtons": false,
            "showQuestionNumbers": "off"
          })


        document.getElementById("surveyModal")!.style.display = "block";

        surveyModel.clear(false, true)
        surveyModel.applyTheme(SURVEY_JS_THEME);
        surveyModel.render(document.getElementById("surveyContainer"));
        surveyModel.onComplete.add(() => {
            let delay = 0
            if (surveyModel.showCompletedPage) {
                delay = 3000
            }
            this.time.delayedCall(delay, () => {
                // Hide the survey HTML element
                document.getElementById("surveyModal")!.style.display = "none";

                // Run the optional completion callback
                // Can be used to save the survey data, for example
                if (this.onSurveyCompleted != undefined) {
                    this.onSurveyCompleted(surveyModel)
                }

                // Start the next scene, if there is one
                if (this.nextSceneKey != null) {
                    this.scene.start(this.nextSceneKey)
                }
            })
        })
    }

}