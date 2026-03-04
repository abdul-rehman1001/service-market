import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  Auth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

export const getRecaptcha = (containerId: string) => {
  if (typeof window === "undefined") return null;

  if ((window as any).recaptchaVerifier) {
    return (window as any).recaptchaVerifier;
  }

  const verifier = new RecaptchaVerifier(
    auth,                 // ✅ FIRST = auth (correct for your version)
    containerId,          // ✅ SECOND = containerId
    {
      size: "invisible",
    }
  );

  (window as any).recaptchaVerifier = verifier;

  return verifier;
};
export { signInWithPhoneNumber };