import { initFirestore } from '@auth/firebase-adapter';
import { cert } from 'firebase-admin/app';

declare global {
  var firestore: FirebaseFirestore.Firestore | undefined;
}

const firestore =
  global.firestore ||
  initFirestore({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    }),
  });

if (process.env.NODE_ENV === 'development') global.firestore = firestore;

export default firestore;
