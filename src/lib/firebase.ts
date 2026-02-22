import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  Auth,
} from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

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