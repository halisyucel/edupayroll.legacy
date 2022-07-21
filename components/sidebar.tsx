import Link from 'next/link';
import React from 'react';

const navigation = [
	{
		title: 'Hesap',
		href: '/panel/',
	},
	{
		title: 'Okul',
		href: '/panel/okul',
	},
	{
		title: 'Öğretmenler',
		href: '/panel/ogretmenler',
	},
	{
		title: 'Belgeler',
		href: '/panel/belgeler',
	},
];

const Sidebar = () => {
	return (
		<div className={'w-[320px] h-full bg-gray-100 p-5 mr-10 rounded-2xl'}>
			<div
				className={
					'font-source-sans text-blue-500 text-5xl font-extrabold mb-8 pb-8 pt-4 border-b-2'
				}
			>
				Ek
				<br />
				Ders
				<br />
				Çizelge
				<br />
				Uygulaması
			</div>
			<nav>
				<ul>
					{navigation.map((item, index) => (
						<li key={index} className={'h-10'}>
							<Link href={item.href}>
								<a
									className={
										'block w-full font-source-sans text-gray-600 text-2xl font-extrabold hover:text-blue-500'
									}
								>
									{item.title}
								</a>
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
};

export default Sidebar;
