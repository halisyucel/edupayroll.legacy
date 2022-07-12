import React from 'react';
import Sidebar from './sidebar';
import Content from './content';

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<div className={'flex w-full h-screen bg-white p-10'}>
			<Sidebar />
			<Content>{children}</Content>
		</div>
	);
};

export default Layout;
