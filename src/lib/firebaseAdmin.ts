import admin from 'firebase-admin';
import serviceAccount from './firebase-adminsdk.json';

const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || serviceAccount.client_email;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || serviceAccount.private_key).replace(/\\n/g, '\n');


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
