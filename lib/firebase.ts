import { initializeApp, getApp, FirebaseOptions } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  where,
  getDocs,
  query,
  limit,
  DocumentData,
  DocumentSnapshot,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_apiKey,
  authDomain: process.env.NEXT_PUBLIC_authDomain,
  projectId: process.env.NEXT_PUBLIC_projectId,
  storageBucket: process.env.NEXT_PUBLIC_storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
  appId: process.env.NEXT_PUBLIC_appId,
  measurementId: process.env.NEXT_PUBLIC_measurementId,
};

function createFirebaseApp(config: FirebaseOptions) {
  try {
    return getApp();
  } catch {
    return initializeApp(config);
  }
}

const app = createFirebaseApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const STATE_CHANGED = 'state_changed';

export async function getUserWithUsername(username) {
  const q = query(
    collection(firestore, 'users'),
    where('username', '==', username),
    limit(1)
  );
  const userDoc = (await getDocs(q)).docs[0];
  return userDoc;
}

export function postToJSON(doc: DocumentSnapshot<DocumentData>) {
  const data = doc.data();
  return {
    ...data,
    createdAt: data?.createdAt.toMillis() || 0,
    updatedAt: data?.updatedAt.toMillis() || 0,
  };
}
