import React from 'react';
import Link from 'next/link';

// TODO en tepede yeni belge oluştur veya belge yükle seçenekleri olacak
// TODO yine en tepede bütün veriyi indirme seçeneği olacak

const navigation = [
	{
		title: 'Hesap',
		href: '/panel/',
	},
	{
		title: 'Öğretmenler',
		href: '/panel/ogretmenler',
	},
	{
		title: 'Belgeler',
		href: '/panel/belgeler',
	},
	{
		title: 'Ayarlar',
		href: '/panel/ayarlar',
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
				Çizelgesi
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
