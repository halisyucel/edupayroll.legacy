import React from 'react';
import { Input, InputPicker } from 'rsuite';
import { MonthData } from '../utils/toolbar';
import DownloadDocument from './download-document';

// TODO bu elemanu absolute yap ki yukarıda kalsın

const Toolbar = () => {
	return (
		<div className={'w-full border-b-2 pb-2 flex'}>
			<label className={'w-80 mr-2.5'}>
				<Input size={'sm'} placeholder={'Belge Adı'} />
			</label>
			<div className={'flex-1'} />
			<DownloadDocument />
			<label className={'w-40'}>
				<InputPicker
					size={'sm'}
					data={MonthData}
					placeholder={'Ay seç'}
					cleanable={false}
					defaultValue={new Date().getMonth()} // TODO bunu sonra veriden getirecez
				/>
			</label>
		</div>
	);
};

export default Toolbar;
