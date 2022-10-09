import Link from 'next/link';
import React from 'react';

const Home = () => {
	return (
		<div>
			<Link
				prefetch={true}
				href={{
					pathname: '/[username]',
					query: { username: 'shanmukh' },
				}}
			></Link>
		</div>
	);
};

export default Home;
