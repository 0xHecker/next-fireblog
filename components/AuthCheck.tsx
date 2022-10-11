import Link from 'next/link';
import { useContext } from 'react';
import { UserContext } from '../lib/context';

const AuthCheck = (props) => {
  const { username } = useContext(UserContext);

  return username
    ? props.children
    : props.fallback || (
        <Link href={'/auth'}>You must be signed in</Link>
      );
};

export default AuthCheck;
