import {
  deleteDoc,
  doc,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import {
  useDocumentData,
  useDocumentDataOnce,
} from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { auth } from '../../lib/firebase';
import styles from '../../styles/Admin.module.css';
import toast from 'react-hot-toast';
import AuthCheck from '../../components/AuthCheck';
import Link from 'next/link';
import ImageUploader from '../../components/ImageUploader';

const AdminPostEdit = () => {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
};

const PostManager = () => {
  const [preview, setPreview] = useState(false);
  const router = useRouter();
  const { slug } = router.query;

  const postRef = doc(
    getFirestore(),
    'users',
    auth.currentUser.uid,
    'posts',
    slug as string
  );

  const [post] = useDocumentData(postRef);
  console.log(post);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>
            <PostForm
              postRef={postRef}
              defaultValues={post}
              preview={preview}
            />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>
              {preview ? 'Edit' : 'Preview'}
            </button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className='btn-blue'>Live view</button>
            </Link>
            <DeletePostButton postRef={postRef} />
          </aside>
        </>
      )}
    </main>
  );
};

const PostForm = ({ defaultValues, postRef, preview }) => {
  const { register, handleSubmit, reset, watch, formState, errors } =
    useForm({
      defaultValues,
      mode: 'onChange',
    });

  const { isValid, isDirty } = formState;

  const updatePost = async ({ content, published }) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, published });

    toast.success('Post updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className='card'>
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}
      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />
        <textarea
          name='content'
          ref={register({
            maxLength: {
              value: 20000,
              message: 'content is too long',
            },
            minLength: { value: 10, message: 'content is too short' },
            required: { value: true, message: 'content is required' },
          })}></textarea>

        {errors.content && (
          <p className='text-danger'>{errors.content.message}</p>
        )}

        <fieldset>
          <input
            className={styles.checkbox}
            name='published'
            type='checkbox'
            ref={register as React.LegacyRef<HTMLInputElement>}
          />
          <label>Published</label>
        </fieldset>

        <button
          type='submit'
          className='btn-green'
          disabled={!isValid}>
          Save Changes
        </button>
      </div>
    </form>
  );
};

function DeletePostButton({ postRef }) {
  const router = useRouter();

  const deletePost = async () => {
    const doIt = confirm('are you sure!');
    if (doIt) {
      await deleteDoc(postRef);
      router.push('/admin');
      toast('post annihilated ', { icon: '???????' });
    }
  };

  return (
    <button className='btn-red' onClick={deletePost}>
      Delete
    </button>
  );
}

export default AdminPostEdit;
