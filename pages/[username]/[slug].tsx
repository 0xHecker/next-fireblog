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

export async function getStaticProps({ params }) {
  const { username, slug } = params;
  let post;
  let path;
  const userDoc = await getUserWithUsername(username);
  if (userDoc) {
    const postRef = doc(
      getFirestore(),
      userDoc.ref.path,
      'posts',
      slug
    );
    post = postToJSON(await getDoc(postRef));
  }
  return {
    props: { post, path },
    revalidate: 5000,
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
          <strong>{post.heartCount || 0} 💙</strong>
        </p>
      </aside>
    </main>
  );
};

export default Post;
