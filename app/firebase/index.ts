import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD_pdGXww0r4_0oIRMqe0Rnuucio8u3Ris",
  authDomain: "app.menowithyou.com",
  projectId: "meno-2287c",
  storageBucket: "meno-2287c.firebasestorage.app",
  messagingSenderId: "796659160806",
  appId: "1:796659160806:web:54f125cda07313d68fcd27",
  measurementId: "G-06W0Z67MVG"
};

const app = initializeApp(firebaseConfig);
export { app };
export const auth = getAuth(app); 
