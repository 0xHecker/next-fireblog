import styles from '../../styles/Post.module.css';
import PostContent from '../../components/PostContent';
import {
  firestore,
  getUserWithUsername,
  postToJSON,
} from '../../lib/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
} from 'firebase/firestore';
import { UserContext } from '../../lib/context';
import { useContext } from 'react';
import AuthCheck from '../../components/AuthCheck';
import LikeButton from '../../components/LikeButton';
import Link from 'next/link';
export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const userDoc = await getUserWithUsername(username);

  let post = null;
  let path = null;

  if (userDoc) {
    // const postRef = userDoc.ref.collection('posts').doc(slug);
    const postRef = doc(
      getFirestore(),
      userDoc.ref.path,
      'posts',
      slug
    );

    // post = postToJSON(await postRef.get());
    post = postToJSON(await getDoc(postRef));

    path = postRef.path;
  }

  return {
    props: { post, path },
    revalidate: 100,
  };
}

export async function getStaticPaths() {
  const q = query(
    collectionGroup(getFirestore(), 'posts'),
    limit(20)
  );
  const snapshot = await getDocs(q);

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
}

const Post = (props) => {
  const postRef = doc(getFirestore(), props.path);
  const [realtimePost] = useDocumentData(postRef);

  const post = realtimePost || props.post;

  const { user: currentUser } = useContext(UserContext);

  return (
    <main className={styles.container}>
      <section>
        <PostContent post={post} />
      </section>
      <aside className='card'>
        <p>
          <strong>{post.heartCount || 0} 💗</strong>
        </p>

        <AuthCheck
          fallback={
            <Link href={'/auth'}>
              <button>💗 Signup</button>
            </Link>
          }>
          <LikeButton postRef={postRef} />
        </AuthCheck>
      </aside>
    </main>
  );
};

export default Post;
