import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import { UserContext } from '../lib/context';
import { auth } from '../lib/firebase';

type Props = {};

const Navbar = (props: Props) => {
	const { user, username } = useContext(UserContext);
	const router = useRouter();

	const signOutNow = () => {
		signOut(auth);
		router.reload();
	};

	return (
		<nav className="navbar">
			<ul>
				<li>
					<Link href={'/'}>
						<button className="btn-logo">FEED</button>
					</Link>
				</li>
				{username && (
					<>
						<li className="push-left">
							<button onClick={signOutNow}>Sign Out</button>
						</li>
						<li>
							<Link href={`/admin`}>
								<button className="btn-blue">
									Write Posts
								</button>
							</Link>
						</li>
						<li>
							<Link href={`/${username}`}>
								<img src={user?.photoURL} />
							</Link>
						</li>
					</>
				)}
				{!username && (
					<li>
						<Link href="/auth">
							<button className="btn-blue">Log in</button>
						</Link>
					</li>
				)}
			</ul>
		</nav>
	);
};

export default Navbar;
