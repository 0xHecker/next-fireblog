import { auth } from '../lib/firebase';

import { useDocument } from 'react-firebase-hooks/firestore';
import {
  increment,
  writeBatch,
  doc,
  getFirestore,
} from 'firebase/firestore';

// Allows user to like a post
export default function LikeButton({ postRef }) {
  const likeRef = doc(
    getFirestore(),
    postRef.path,
    'hearts',
    auth.currentUser.uid
  );
  const [heartDoc] = useDocument(likeRef);

  // Create a user-to-post relationship
  const addLike = async () => {
    const uid = auth.currentUser.uid;
    const batch = writeBatch(getFirestore());

    batch.update(postRef, { heartCount: increment(1) });
    batch.set(likeRef, { uid });

    await batch.commit();
  };

  // Remove a user-to-post relationship
  const removeLike = async () => {
    const batch = writeBatch(getFirestore());

    batch.update(postRef, { heartCount: increment(-1) });
    batch.delete(likeRef);

    await batch.commit();
  };

  return heartDoc?.exists() ? (
    <button onClick={removeLike}>💔 Unlike</button>
  ) : (
    <button onClick={addLike}>💗 Like</button>
  );
}
