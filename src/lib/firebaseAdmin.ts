import admin from 'firebase-admin';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const projectId = getRequiredEnv('FIREBASE_PROJECT_ID');
const clientEmail = getRequiredEnv('FIREBASE_CLIENT_EMAIL');
const privateKey = getRequiredEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');


const credential = admin.credential.cert({
  projectId,
  clientEmail,
  privateKey,
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential,
    projectId,
  });
}

export const adminDb = admin.firestore();
export default admin;
