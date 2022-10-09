import Image from 'next/image';

const Loader: React.FC<{ show: boolean }> = ({ show }) => {
	return show ? (
		<div>
			<Image
				src={'/loading.gif'}
				width={'40px'}
				height={'40px'}
				alt={'loading...'}
			/>
		</div>
	) : undefined;
};

export default Loader;
