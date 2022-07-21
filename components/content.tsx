import React from 'react';

interface ContentProps {
	children: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({ children }) => {
	return (
		<div className={'w-[calc(100%-335.175px)] bg-gray-100 rounded-2xl p-8 pb-4 relative'}>
			{children}
		</div>
	);
};

export default Content;
