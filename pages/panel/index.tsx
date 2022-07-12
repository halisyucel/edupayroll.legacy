import React from 'react';
import Layout from '../../components/layout';
import { Button, Input } from 'rsuite';

const Account = () => {
	return (
		<Layout>
			<h1 className={'text-4xl font-extrabold font-source-sans border-b-2 pb-2 mb-4'}>
				Hesabınız
			</h1>
			<label className={'block w-[400px] mb-2'}>
				<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
					E-posta adresiniz
				</span>
				<Input
					readOnly={true}
					defaultValue={'isaycel2001@gmail.com'}
					spellCheck={false}
					autoComplete={'off'}
				/>
			</label>
			<label className={'block w-[400px] mb-2'}>
				<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
					Okulunuzun tam ismi
				</span>
				<Input placeholder={'Okulunuz'} spellCheck={false} autoComplete={'off'} />
			</label>
			<label className={'block w-[400px] mb-2'}>
				<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
					Müdür ismi
				</span>
				<Input placeholder={'Müdürünüz'} spellCheck={false} autoComplete={'off'} />
			</label>
			<label className={'block w-[400px] mb-2'}>
				<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
					Müdür yardımcısı ismi
				</span>
				<Input placeholder={'Müdür yardımcınız'} spellCheck={false} autoComplete={'off'} />
			</label>
			<label className={'block w-[400px] mb-2'}>
				<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
					İl Milli Eğitim Müdürü ismi
				</span>
				<Input placeholder={'Müdür yardımcınız'} spellCheck={false} autoComplete={'off'} />
			</label>
			<div>
				<Button appearance={'primary'}>Düzenle</Button>
			</div>
		</Layout>
	);
};

export default Account;
