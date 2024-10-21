import { GAME_HEIGHT, GAME_WIDTH } from './constants/GameConstants';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";
import { TestScene } from './scenes/TestScene';

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator, signInAnonymously } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

export const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

// Firebase configuration (not-secret)
const firebaseConfig = {
    apiKey: "AIzaSyAD_ETowpoSfzmutu2H2WfaIllE_C__poA",
    authDomain: "problem-solving-study-1.firebaseapp.com",
    projectId: "problem-solving-study-1",
    storageBucket: "problem-solving-study-1.appspot.com",
    messagingSenderId: "957053609630",
    appId: "1:957053609630:web:13fc9e961f1e8242cd7d8f",
    measurementId: "G-PB2K1DMBX5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();

// Initialise Firebase emulators for local testing
if (isLocalhost) {    
    connectAuthEmulator(auth, "http://127.0.0.1:9099");    
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

export const authorisedUser = await signInAnonymously(auth)

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
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
        Preloader,
        TestScene
    ]
};

export default new Game(config);
