import { auth, provider } from '../lib/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { useContext, useState, useEffect, useCallback } from 'react';
import { UserContext } from '../lib/context';
import {
  doc,
  getDoc,
  getFirestore,
  writeBatch,
} from 'firebase/firestore';
import debounce from 'lodash.debounce';

const Auth = () => {
  const { user, username } = useContext(UserContext);

  return (
    <main>
      {user ? (
        !username ? (
          <UsernameForm />
        ) : (
          <SignOutButton />
        )
      ) : (
        <SignInButton />
      )}
      <h3>Sign Up</h3>
    </main>
  );
};

const SignInButton = () => {
  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential =
          GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.email;
        const credential =
          GoogleAuthProvider.credentialFromError(error);
      });
  };

  return (
    <button className='btn-google' onClick={signInWithGoogle}>
      <img src='/google.png' /> Sign in with Google
    </button>
  );
};
const SignOutButton = () => {
  const signOutCallback = () => {
    signOut(auth)
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <button className='btn' onClick={() => signOutCallback()}>
      Sign Out
    </button>
  );
};

const UsernameForm = () => {
  const [formValue, setFormValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, username } = useContext(UserContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const ref = doc(getFirestore(), 'usernames', username);
        const snap = await getDoc(ref);
        console.log('Firestore read executed!', snap.exists());
        setIsValid(!snap.exists());
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    checkUsername(formValue);
  }, [checkUsername, formValue]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    if (val.length < 3) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }

    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create refs for both documents
    const userDoc = doc(getFirestore(), 'users', user.uid);
    const usernameDoc = doc(getFirestore(), 'usernames', formValue);

    // Commit both docs together as a batch write.
    const batch = writeBatch(getFirestore());
    batch.set(userDoc, {
      username: formValue,
      photoURL: user.photoURL,
      displayName: user.displayName,
    });
    batch.set(usernameDoc, { uid: user.uid });

    await batch.commit();
  };

  return (
    !username && (
      <section>
        <h3>Choose Username</h3>
        <form onSubmit={onSubmit}>
          <input
            type='text'
            name='username'
            placeholder='username'
            value={formValue}
            onChange={onChange}
          />
          <UsernameMessage
            username={formValue}
            isValid={isValid}
            loading={loading}
          />
          <button
            type='submit'
            className='btn-green'
            disabled={!isValid}
          >
            Choose
          </button>
          <h3>Debug State</h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username Valid: {isValid.toString()}
          </div>
        </form>
      </section>
    )
  );
};

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className='text-success'>{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className='text-danger'>That username is taken!</p>;
  } else {
    return <p></p>;
  }
}

export default Auth;
