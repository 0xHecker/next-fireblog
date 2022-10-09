import Link from 'next/link';

const Custom404 = () => {
  return (
    <main>
      <h1>404 - That page does not seems to exist..</h1>
      <Link href={'/'}>
        <button className='btn-blue'>Go Home</button>
      </Link>
    </main>
  );
};

export default Custom404;
