import styles from '../styles/Home.module.css';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import {
  collectionGroup,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
} from 'firebase/firestore';
import { postToJSON } from '../lib/firebase';
import { useState } from 'react';
import PostFeed from '../components/PostFeed';
import Metatags from '../components/Metatags';

const LIMIT = 10;

export async function getServerSideProps(context) {
  const ref = collectionGroup(getFirestore(), 'posts');
  const postsQuery = query(
    ref,
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(LIMIT)
  );

  const posts = (await getDocs(postsQuery)).docs.map(postToJSON);

  return {
    props: { posts },
  };
}

export default function Home({ posts: _posts }) {
  const [posts, setPosts] = useState(_posts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const fetchMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const cursor =
      typeof last.createdAt === 'number'
        ? Timestamp.fromMillis(last.createdAt)
        : last.createdAt;

    const ref = collectionGroup(getFirestore(), 'posts');
    const postsQuery = query(
      ref,
      where('published', '==', 'true'),
      orderBy('createdAt', 'desc'),
      startAfter(cursor),
      limit(LIMIT)
    );

    const newPosts = (await getDocs(postsQuery)).docs.map(
      (doc) => doc.data
    );

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <Metatags
        title='Home Page'
        description='Get the latest posts on our site'
      />

      <PostFeed posts={posts} admin={false} />

      {!loading && !postsEnd && (
        <button onClick={fetchMorePosts}>Load more</button>
      )}

      <Loader show={loading} />

      {postsEnd && 'You have reached the end!'}
    </main>
  );
}
