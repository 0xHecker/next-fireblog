import {
  collection,
  getFirestore,
  where,
  orderBy,
  limit,
  getDocs,
  query,
} from 'firebase/firestore';
import React from 'react';
import PostFeed from '../../components/PostFeed';
import UserProfile from '../../components/UserProfile';
import { getUserWithUsername, postToJSON } from '../../lib/firebase';

export async function getServerSideProps({ query: urlQuery }) {
  const { username } = urlQuery;

  const userDoc = await getUserWithUsername(username);

  if (!userDoc) {
    return {
      notFound: true,
    };
  }

  let user = null;
  let posts = null;

  if (userDoc) {
    user = userDoc.data();

    const postsQuery = query(
      collection(getFirestore(), userDoc.ref.path, 'posts'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    posts = (await getDocs(postsQuery)).docs.map(postToJSON);
  }

  return {
    props: { user, posts },
  };
}

const UserProfilePage = ({ user, posts }) => {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} admin={undefined} />
    </main>
  );
};

export default UserProfilePage;
