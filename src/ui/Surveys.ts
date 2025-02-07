export const DEMOGRAPHIC_SURVEY = {
  "showCompletedPage": false,
  "logoPosition": "right",
  "pages": [
    {
      "name": "intro_page_1",
      "elements": [
        {
          "type": "html",
          "name": "intro_1",
          "html": {
            "default": "<p><b>CypherSpace</b> is a puzzle game designed by researchers at the University of Leeds.</p><p>By playing <b>CypherSpace</b>, you will contribute to scientific understanding of how people learn complex problem-solving skills.</p><p>Before continuing, please read the <a href=''>participant information sheet</a> for full details of the project goals and how your anonymous gameplay data will be used.</p>",
          }
        }
      ]
    },
    {
      "name": "intro_page_2",
      "elements": [
        {
          "type": "html",
          "name": "intro_2",
          "html": {
            "default": "<p><b>CypherSpace</b> is suitable for all adults and children aged 7 years and older.</p><p>If you are under 13 years old, you must have permission from a parent or guardian before playing the game.</p><p>By continuing, you consent to the use of your data as described in the participant information sheet.</p>"
          }
        },
        {
          "type": "boolean",
          "name": "consent",
          "title": {
            "default": "I consent to the use of my/my child's data for the purposes listed in the participant information sheet",
          },
          "isRequired": true,
          "validators": [
            {
              "type": "expression",
              "text": {
                "default": "You must consent to the conditions in the information sheet to participate in this study",
              },
              "expression": "{consent} = true"
            }
          ]
        }
      ]
    },
    {
      "name": "demographic_info_page",
      "elements": [
        {
          "type": "html",
          "name": "demographic_info_intro",
          "html": {
            "default": "<p>Before beginning the game, we will collect some brief demographic information.</p><p>Please answer all questions honestly and accurately.</p><p><i>Estimated completion time: 2 minutes</i></p>",
          }
        },
        {
          "type": "text",
          "name": "age_years",
          "title": "Age",
          "description": {
            "default": "Your current age in whole years",
            "es": "Years"
          },
          "isRequired": true,
          "validators": [
            {
              "type": "expression"
            }
          ],
          "inputType": "number",
          "min": 0,
          "max": 120,
          "step": 1
        },
        {
          "type": "text",
          "name": "year-of-birth",
          "title": {
            "default": "Year of Birth",
            "es": "Year of birth"
          },
          "description": "The year in which you were born",
          "isRequired": true,
          "validators": [
            {
              "type": "expression"
            }
          ],
          "inputType": "number",
          "min": 1900,
          "max": new Date().getFullYear(),
          "step": 1
        },
        {
          "type": "dropdown",
          "name": "sex",
          "title": "Sex",
          "description": "Your biological sex",
          "isRequired": true,
          "choices": [
            {
              "value": "female",
              "text": "Female"
            },
            {
              "value": "male",
              "text": "Male"
            }
          ]
        },
        {
          "type": "dropdown",
          "name": "education",
          "title": "Education",
          "description": "Your highest level of formal education",
          "isRequired": true,
          "choices": [{
            "value": "none",
            "text": "No formal education"
          },
          {
            "value": "some-primary",
            "text": "Some primary education (primary, elementary, or middle school)"
          },
          {
            "value": "completed-primary",
            "text": "Completed primary education (primary, elementary, or middle school)"
          },
          {
            "value": "some-secondary",
            "text": "Some secondary education (some high school)"
          },
          {
            "value": "completed-secondary",
            "text": "Completed secondary education (graduated high school)"
          },
          {
            "value": "vocational",
            "text": "Completed trade / technical / vocational training"
          },
          {
            "value": "some-undergraduate",
            "text": "Some undergraduate study (some college/university)"
          },
          {
            "value": "completed-undergraduate",
            "text": "Completed undergraduate degree"
          },
          {
            "value": "some-postgraduate",
            "text": "Some postgraduate study (some master's/PhD study, or equivalent)"
          },
          {
            "value": "completed-postgraduate",
            "text": "Completed postgraduate degree"
          }
          ]
        },
        {
          "type": "dropdown",
          "name": "country",
          "title": "Country of Residence",
          "description": "The country in which you currently live",
          "isRequired": true,
          "choices": [
            "Afghanistan",
            "Albania",
            "Algeria",
            "Andorra",
            "Angola",
            "Antigua and Barbuda",
            "Argentina",
            "Armenia",
            "Australia",
            "Austria",
            "Azerbaijan",
            "Bahrain",
            "Bangladesh",
            "Barbados",
            "Belarus",
            "Belgium",
            "Belize",
            "Benin",
            "Bhutan",
            "Bolivia",
            "Bosnia and Herzegovina",
            "Botswana",
            "Brazil",
            "Brunei",
            "Bulgaria",
            "Burkina Faso",
            "Burundi",
            "Cambodia",
            "Cameroon",
            "Canada",
            "Cape Verde",
            "Central African Republic",
            "Chad",
            "Chile",
            "China",
            "Colombia",
            "Comoros",
            "Congo",
            "Congo (Democratic Republic)",
            "Costa Rica",
            "Croatia",
            "Cuba",
            "Cyprus",
            "Czechia",
            "Denmark",
            "Djibouti",
            "Dominica",
            "Dominican Republic",
            "East Timor",
            "Ecuador",
            "Egypt",
            "El Salvador",
            "Equatorial Guinea",
            "Eritrea",
            "Estonia",
            "Eswatini",
            "Ethiopia",
            "Fiji",
            "Finland",
            "France",
            "Gabon",
            "Georgia",
            "Germany",
            "Ghana",
            "Greece",
            "Grenada",
            "Guatemala",
            "Guinea",
            "Guinea-Bissau",
            "Guyana",
            "Haiti",
            "Honduras",
            "Hungary",
            "Iceland",
            "India",
            "Indonesia",
            "Iran",
            "Iraq",
            "Ireland",
            "Israel",
            "Italy",
            "Ivory Coast",
            "Jamaica",
            "Japan",
            "Jordan",
            "Kazakhstan",
            "Kenya",
            "Kiribati",
            "Kosovo",
            "Kuwait",
            "Kyrgyzstan",
            "Laos",
            "Latvia",
            "Lebanon",
            "Lesotho",
            "Liberia",
            "Libya",
            "Liechtenstein",
            "Lithuania",
            "Luxembourg",
            "Madagascar",
            "Malawi",
            "Malaysia",
            "Maldives",
            "Mali",
            "Malta",
            "Marshall Islands",
            "Mauritania",
            "Mauritius",
            "Mexico",
            "Federated States of Micronesia",
            "Moldova",
            "Monaco",
            "Mongolia",
            "Montenegro",
            "Morocco",
            "Mozambique",
            "Myanmar (Burma)",
            "Namibia",
            "Nauru",
            "Nepal",
            "Netherlands",
            "New Zealand",
            "Nicaragua",
            "Niger",
            "Nigeria",
            "North Korea",
            "North Macedonia",
            "Norway",
            "Oman",
            "Pakistan",
            "Palau",
            "Panama",
            "Papua New Guinea",
            "Paraguay",
            "Peru",
            "Philippines",
            "Poland",
            "Portugal",
            "Qatar",
            "Romania",
            "Russia",
            "Rwanda",
            "St Kitts and Nevis",
            "St Lucia",
            "St Vincent",
            "Samoa",
            "San Marino",
            "Sao Tome and Principe",
            "Saudi Arabia",
            "Senegal",
            "Serbia",
            "Seychelles",
            "Sierra Leone",
            "Singapore",
            "Slovakia",
            "Slovenia",
            "Solomon Islands",
            "Somalia",
            "South Africa",
            "South Korea",
            "South Sudan",
            "Spain",
            "Sri Lanka",
            "Sudan",
            "Suriname",
            "Sweden",
            "Switzerland",
            "Syria",
            "Tajikistan",
            "Tanzania",
            "Thailand",
            "The Bahamas",
            "The Gambia",
            "Togo",
            "Tonga",
            "Trinidad and Tobago",
            "Tunisia",
            "Turkey",
            "Turkmenistan",
            "Tuvalu",
            "Uganda",
            "Ukraine",
            "United Arab Emirates",
            "United Kingdom",
            "United States",
            "Uruguay",
            "Uzbekistan",
            "Vanuatu",
            "Vatican City",
            "Venezuela",
            "Vietnam",
            "Yemen",
            "Zambia",
            "Zimbabwe"
          ]
        },
        {
          "type": "dropdown",
          "name": "self-report-cognitive-impairment",
          "title": {
            "default": "Your cognition and learning abilities",
          },
          "description": "Do you have any cognitive impairments or learning disabilities that you know of?",
          "isRequired": true,
          "choices": [{
            "value": "no",
            "text": "No"
          },
          {
            "value": "yes",
            "text": "Yes"
          },
          {
            "value": "prefer-not-to-say",
            "text": "Prefer not to say"
          }
          ]
        },
        {
          "type": "dropdown",
          "name": "games",
          "title": "Your gaming history",
          "description": "What is the most frequently you have ever played video games (including console, PC, or mobile games)?",
          "isRequired": true,
          "choices": [{
            "value": "never",
            "text": "Never"
          },
          {
            "value": "yearly",
            "text": "A few times per year"
          },
          {
            "value": "monthly",
            "text": "A few times per month"
          },
          {
            "value": "weekly",
            "text": "A few times per week"
          },
          {
            "value": "most-days",
            "text": "Most days"
          },
          {
            "value": "every-day",
            "text": "Every day"
          }
          ]
        },
        {
          "type": "boolean",
          "name": "played-before",
          "title": {
            "default": "Have you played CypherSpace before?",
          },
          "description": "You can play as many times as you like, but please let us know if you have played before",
          "isRequired": true,
        }
      ]
    },
    {
      "name": "final_page",
      "elements": [
        {
          "type": "html",
          "name": "intro_1",
          "html": {
            "default": "<p>Thank you for completing the form.</p><p>You may now play <b>CypherSpace</b></p><p>(Remember to <b>complete the full session before closing the browser</b>, or your progress will be lost)</p>",
          }
        }
      ]
    },
  ]
}

export const RESUME_SLEEP_SURVEY = {
  "showCompletedPage": false,
  "pages": [
    {
      "name": "main_page",
      "elements": [
        {
          "type": "html",
          "name": "intro_1",
          "html": {
            "default": "<p>Welcome back to <b>CypherSpace</b>!</p><p>Before continuing, please answer the following questions.</p>",
          }
        },
        {
          "type": "boolean",
          "name": "slept-before-session",
          "title": {
            "default": "Your sleep",
          },
          "description": "Have you slept since the last time you played CypherSpace?",
          "isRequired": true,
        },
        {
          "type": "dropdown",
          "name": "alertness",
          "title": {
            "default": "Your alertness",
          },
          "description": "How alert have you felt in the last 10 minutes?",
          "isRequired": true,
          "choices": [{
            "value": "1",
            "text": "Extremely alert"
          },
          {
            "value": "2",
            "text": "Very alert"
          },
          {
            "value": "3",
            "text": "Alert"
          },
          {
            "value": "4",
            "text": "Rather alert"
          },
          {
            "value": "5",
            "text": "Neither alert nor sleepy"
          },
          {
            "value": "6",
            "text": "Some signs of sleepiness"
          },
          {
            "value": "7",
            "text": "Sleepy, but no effort to keep awake"
          },
          {
            "value": "8",
            "text": "Sleepy, but some effort to keep awake"
          },
          {
            "value": "9",
            "text": "Very sleepy, great effort to keep awake, fighting sleep"
          },
          {
            "value": "10",
            "text": "Extremely sleepy, can't keep awake"
          }
          ]
        }
      ]
    }]
}

export const SIGNUP_EMAIL_SURVEY = {
  "showCompletedPage": false,
  "pages": [
    {
      "name": "main_page",
      "elements": [
        {
          "type": "html",
          "name": "thanks_and_subscribe",
          "html": {
            "default": "<p>Thank you for playing <b>CypherSpace</b>!</p><p>There are more sessions to left to play.</p><p>To save your progress and resume the next session later, please create an account below.</p><p>If you don't want to play again later, you can close this browser tab.</p>",
          }
        }
      ]
    },
    {
      "name": "email_page",
      "elements": [
        {
          "type": "html",
          "name": "email_info",
          "html": {
            "default": "<p>Please enter an email address to create your account</p><p>We will send you a one-time confirmation email with a login link</p><p><i>Make sure you open the link before you close this browser tab, or your game progress may be lost!</i></p>",
          }
        },
        {
          "name": "email",
          "type": "text",
          "title": {
            "default": "Email",
          },
          "description": "Please enter your email address",
          "isRequired": true,
          "validators": [
            { "type": "email", "text": "Must be a valid email address" }
          ]
        }
      ]
    }
  ],
  "showQuestionNumbers": "off"
}


export const INTRODUCTION_SURVEY_MEMORY_TASK = {
  "showCompletedPage": false,
  "pages": [
    {
      "name": "main_page",
      "elements": [
        {
          "type": "html",
          "name": "main_task_intro",
          "html": {
            "default": "<p>We will now begin the memory task</p><p>You will need sound for this part of the study</p><p>You will be able to test your sound levels before the task begins.</p>",
          }
        }
      ]
    },{
      "name": "main_page",
      "elements": [
        {
          "type": "html",
          "name": "memory_task_instructions",
          "html": {
            "default": "<p>In this task, you will hear a long sequence of numerical digits (1-9) rapidly read out by the computer.</p><p>The sequence will end after a random number of digits.</p><p>You will then be asked to recall as many digits as you can from the end of the sequence.</p><p>You will type these digits using the keyboard, and press the 'done' button when you cannot recall any more.</p><p>You do not need to remember the entire sequence. Instead, focus on remembering as many digits as possible from the end of the sequence.</p><p>You will receive feedback about how many of your typed digits matched the digits at the end of the sequence.</p>",
          }
        }
      ]
    },
  ],
  "showQuestionNumbers": "off",
  "completeText":"OK"
}


export const INTRODUCTION_SURVEY_MAIN_TASK = {
  "showCompletedPage": false,
  "pages": [
    {
      "name": "main_page",
      "elements": [
        {
          "type": "html",
          "name": "main_task_intro",
          "html": {
            "default": "<p>We will now move on to the main task</p><p>You will not need sound for this part of the study</p><p>Instructions will be provided when the task begins.</p><p>Please complete all trials in a single session. You will not be able to resume if you close the browser before completing all trials.</p>",
          }
        }
      ]
    },
  ],
  "showQuestionNumbers": "off",
  "completeText":"OK"
}




export const INTRODUCTION_CONSENT_STUDY = {
  "showCompletedPage": false,
  "pages": [
    {
      "name": "consent_page",
      "elements": [
        {
          "type": "html",
          "name": "main_task_consent_intro",
          "html": {
            "default": "<p>Welcome to the first session of the study. Please ensure that you have read the <a target='_blank' rel='noopener noreferrer' href='/assets/information_sheets/participant_information_sheet_rewriting_task_study_1_closed_variant_20241106.pdf'>participant information sheet</a> before continuing.</p><p>By continuing, you consent to participate in this study and to the use of your data as described on participant information sheet.</p>",
          }
        }
      ]
    },
    {
      "name": "main_page",
      "elements": [
        {
          "type": "html",
          "name": "main_task_intro",
          "html": {
            "default": "<p>In this session you will complete two tasks: a short task testing your memory (~5min), and a longer puzzle-solving task (~25min).</p><p>You will need to use a desktop computer with a keyboard and mouse.</p><p>You will also need sound turned on and adjusted to a level comfortable for you.</p><p>Instructions will be provided before each task.</p>",
          }
        }
      ]
    },
  ],
  "showQuestionNumbers": "off",
  "completeText":"Continue"
}

export const INTRODUCTION_FULL_STUDY = {
  "showCompletedPage": false,
  "pages": [
    {
      "name": "main_page",
      "elements": [
        {
          "type": "html",
          "name": "main_task_intro",
          "html": {
            "default": "<p>In this session you will complete two tasks: a short task testing your memory (~5min), and a longer puzzle-solving task (~25min).</p><p>You will need to use a desktop computer with a keyboard and mouse.</p><p>You will also need sound turned on and adjusted to a level comfortable for you.</p><p>Instructions will be provided before each task.</p>",
          }
        }
      ]
    },
  ],
  "showQuestionNumbers": "off",
  "completeText":"OK"
}


export const END_OF_SESSION_STRATEGY_SURVEY = {
  "showCompletedPage": false,
  "pages": [
    {
      "name": "debrief_page",
      "elements": [
        {
          "type": "html",
          "name": "instructions",
          "html": {
            "default": "<p>You have completed the main task. Before exiting the study, please answer the following questions.</p><p>Think about how you solved the puzzles in the main task. How did you choose which rules to use and when to use them? Did you: <ul><li>Imagine or work out the result of using a rule before you chose it</li><li>Follow your intuition or feelings about which rules would be good to choose in certain contexts</li><li>Try different rules by clicking them and seeing what happened</li></p>",
          }
        },
        {
          "type": "rating",
          "name": "strategy-rating-work-out",
          "title": "How often did you use the 'Work it Out' strategy?",
          "minRateDescription": "Never",
          "maxRateDescription": "On Every Trial",
          "autoGenerate": false,
          "rateCount": 5,
          "rateValues": [ 1, 2, 3, 4, 5],
          "isRequired": true,
        },
        {
          "type": "rating",
          "name": "strategy-rating-intuition",
          "title": "How often did you use the 'Feeling / Intuition' strategy?",
          "minRateDescription": "Never",
          "maxRateDescription": "On Every Trial",
          "autoGenerate": false,
          "rateCount": 5,
          "rateValues": [ 1, 2, 3, 4, 5],
          "isRequired": true,
        },
        {
          "type": "rating",
          "name": "strategy-rating-try-and-see",
          "title": "How often did you use the 'Try it and See' strategy?",
          "minRateDescription": "Never",
          "maxRateDescription": "On Every Trial",
          "autoGenerate": false,
          "rateCount": 5,
          "rateValues": [ 1, 2, 3, 4, 5],
          "isRequired": true,
        },
        {
          "type": "comment",
          "name": "strategy-other",
          "title": "Did you use any other strategies?",
          "description": "If so, please briefly describe them below (optional)",
          "maxLength": 300,
          "isRequired": false,
        }
        
      ]
    }
  ],
  "showQuestionNumbers": "off"
}


export const END_OF_SESSION_SURVEY = {
  "showCompletedPage": false,
  "pages": [

    {
      "name": "main_page",
      "elements": [
        {
          "type": "html",
          "name": "thanks_and_subscribe",
          "html": {
            "default": "<p>Thank you for completing the session!</p><p>There are more sessions to left to play</p><p>Remember to come back tomorrow to complete the next session</p>",
          }
        }
      ]
    },
  ],
  "showNavigationButtons": false,
  "showQuestionNumbers": "off"
}

export const END_OF_DEMO = {
  "showCompletedPage": false,
  "pages": [

    {
      "name": "end_of_demo",
      "elements": [
        {
          "type": "html",
          "name": "end_of_demo_html",
          "html": {
            "default": "<p>Thank you for playing!</p>",
          }
        }
      ]
    },
  ],
  "showNavigationButtons": false,
  "showQuestionNumbers": "off"
}



export const END_OF_STUDY_SURVEY = {
  "completedHtml": "<p>Your response has been recorded.</p><p>Thanks again for playing CypherSpace!</p>",
  "showCompletedPage": true,
  "pages": [
    
    {
      "name": "main_page",
      "elements": [
        {
          "type": "html",
          "name": "thanks_end_of_survey",
          "html": {
            "default": "<p>Thank you for completing this study!</p><p>You have finished all sessions of the study.</p><p>The data from this study will be used by researchers at the University of Leeds to explain how people solve problems and how their problem-solving abilities change with practice.</p><p>If you would like to be contacted via email with opportunities to participate in future studies by the same researchers, please sign up below.</p>",
          }
        },
        {
          "type": "boolean",
          "name": "future-contact",
          "title": {
            "default": "Would you like to be contacted via email in future?",
          },
          "description": "We will only use your email address to invite you to participate in future studies by the same researchers",
          "isRequired": true,
        }
      ]
    }
  ],
  "showQuestionNumbers": "off"
}


export const END_OF_STUDY_SURVEY_BLANK = {
  "pages": [
    
    {
      "name": "main_page",
      "elements": [
        {
          "type": "html",
          "name": "thanks_end_of_survey",
          "html": {
            "default": "<p>Thank you for completing this study!</p><p>You have finished all sessions of the study.</p><p>The data from this study will be used by researchers at the University of Leeds to explain how people solve problems and how their problem-solving abilities change with practice.</p><p>For more information on the study goals and how your data will be used, please view the <a target='_blank' rel='noopener noreferrer' href='/assets/information_sheets/participant_debrief_sheet_rewriting_task_study_1_closed_variant_20241204.pdf'>debriefing information sheet</a>.</p><p>Thanks again for your participation in this study!</p>",
          }
        },
      ]
    }
  ],
  "showNavigationButtons": false
}