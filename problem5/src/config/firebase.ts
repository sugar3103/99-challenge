import firebaseAdmin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
};

if (!firebaseAdmin.apps.length) {
  const firebaseConfig: firebaseAdmin.AppOptions = {
    credential: firebaseAdmin.credential.cert(serviceAccount),
  };

  // Only add databaseURL if it's defined
  if (process.env.FIREBASE_DATABASE_URL) {
    firebaseConfig.databaseURL = process.env.FIREBASE_DATABASE_URL;
  }

  firebaseAdmin.initializeApp(firebaseConfig);
}

export const firebaseDB = firebaseAdmin.firestore();
export const firebaseAuth = firebaseAdmin.auth();

export default firebaseAdmin;
