import {
  collection,
  doc,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import AuthCheck from '../../components/AuthCheck';
import PostFeed from '../../components/PostFeed';
import { UserContext } from '../../lib/context';
import { auth } from '../../lib/firebase';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';
import styles from '../../styles/Admin.module.css';

const AdminPostsPage = ({}) => {
  return (
    <main>
      <AuthCheck>
        <PostList />
        <CreateNewPost />
      </AuthCheck>
    </main>
  );
};

const PostList = () => {
  const ref = collection(
    getFirestore(),
    'users',
    auth.currentUser.uid,
    'posts'
  );
  const postQuery = query(ref, orderBy('createdAt'));

  const [querySnapshot] = useCollection(postQuery);

  const posts = querySnapshot?.docs.map((doc) => doc.data());

  return (
    <>
      <h1>Manage your Posts</h1>
      <PostFeed posts={posts} admin />
    </>
  );
};

const CreateNewPost = () => {
  const router = useRouter();
  const { username } = useContext(UserContext);
  const [title, setTitle] = useState('');

  const slug = encodeURI(kebabCase(title));

  const isValid = title.length > 3 && title.length < 100;
  const createPost = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;
    const ref = doc(getFirestore(), 'users', uid, 'posts', slug);

    // Tip: give all fields a default value here
    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: '# hello world!',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
    };

    await setDoc(ref, data);

    toast.success('Post created!');

    // Imperative navigation after doc is set
    router.push(`/admin/${slug}`);
  };
  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder='My Awesome Article!'
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type='submit' disabled={!isValid} className='btn-green'>
        Create New Post
      </button>
    </form>
  );
};

export default AdminPostsPage;
