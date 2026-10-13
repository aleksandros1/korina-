import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBm7o3Nuz5IAj7LnW3oHi4eDc5sdcU1vfw",
  authDomain: "korina-77d5f.firebaseapp.com",
  databaseURL: "https://korina-77d5f-default-rtdb.firebaseio.com",
  projectId: "korina-77d5f",
  storageBucket: "korina-77d5f.firebasestorage.app",
  messagingSenderId: "816096752874",
  appId: "1:816096752874:web:287248b91812c3507d9393",
  measurementId: "G-GRKQ1X1PW3"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);