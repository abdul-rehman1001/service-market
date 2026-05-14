function requirePublicEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const firebaseMeasurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

// Firebase web config (public values, still sourced from env for deployments)
export const firebaseConfig = {
  apiKey: requirePublicEnv('NEXT_PUBLIC_FIREBASE_API_KEY', firebaseApiKey),
  authDomain: requirePublicEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', firebaseAuthDomain),
  projectId: requirePublicEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', firebaseProjectId),
  storageBucket: requirePublicEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', firebaseStorageBucket),
  messagingSenderId: requirePublicEnv(
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    firebaseMessagingSenderId
  ),
  appId: requirePublicEnv('NEXT_PUBLIC_FIREBASE_APP_ID', firebaseAppId),
  ...(firebaseMeasurementId ? { measurementId: firebaseMeasurementId } : {}),
};


