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
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDlpZ80MXzeSMCcXJ1gK3_9L1vKdTam6Sc',
  authDomain: 'next-firebase-blog-151a9.firebaseapp.com',
  projectId: 'next-firebase-blog-151a9',
  storageBucket: 'next-firebase-blog-151a9.appspot.com',
  messagingSenderId: '449309626847',
  appId: '1:449309626847:web:cfa734b4754dd5cd95f46a',
  measurementId: 'G-MM3ZNQ4TVN',
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

export async function getUserWithUsername(username) {
  const q = query(
    collection(firestore, 'users'),
    where('username', '==', username),
    limit(1)
  );
  const userDoc = (await getDocs(q)).docs[0];
  return userDoc;
}

export function postToJSON(doc) {
  const data = doc.data();
  return {
    ...data,
    createdAt: data?.createdAt.toMillis() || 0,
    updatedAt: data?.updatedAt.toMillis() || 0,
  };
}
