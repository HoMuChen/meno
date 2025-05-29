import { auth } from "./index";
import {
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signInWithPopup as firebaseSignInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";

export async function signInWithEmailAndPassword(email: string, password: string) {
  return firebaseSignInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return firebaseSignInWithPopup(auth, provider);
}

export async function signOut() {
  return firebaseSignOut(auth);
} 