 
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAfEx2c47rdzuVTQzyrzBcCeJgVd3YLhnI",
    authDomain: "meu-estudo-creci.firebaseapp.com",
    projectId: "meu-estudo-creci",
    storageBucket: "meu-estudo-creci.firebasestorage.app",
    messagingSenderId: "452317302360",
    appId: "1:452317302360:web:67646d5a217cdeeb19042d"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
