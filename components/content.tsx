import React from 'react';

interface ContentProps {
	children: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({ children }) => {
	return <div className={'flex-1 bg-gray-100 rounded-2xl p-8'}>{children}</div>;
};

export default Content;
