import Layout from '../../../components/layout';
import { openSnackbar } from '../../../redux/features/snackbar';
import { RootState } from '../../../redux/store';
import { getYearData, MonthData } from '../../../utils/documents';
import axios from 'axios';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, InputPicker, Loader } from 'rsuite';

const DocumentEditor: NextPage = () => {
	const router = useRouter();
	const dispatch = useDispatch();
	const { token } = useSelector((state: RootState) => state.account);
	const [isFullLoading, setIsFullLoading] = useState<boolean>(true);
	const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
	const [id, setId] = useState<number | null>(null);
	const [name, setName] = useState<string>('');
	const [month, setMonth] = useState<number>(new Date().getMonth());
	const [year, setYear] = useState<number>(new Date().getFullYear());
	const handleSubmit = useCallback(() => {
		if (!name.trim()) {
			dispatch(
				openSnackbar({
					message: 'Lütfen belgenize bir ad verin.',
					variant: 'error',
				}),
			);
			return;
		}
		setIsSubmitLoading(true);
		axios
			.post(
				'/api/documents/edit',
				{
					id,
					name,
					month,
					year,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			)
			.then(() => {
				dispatch(
					openSnackbar({
						message: 'Belge başarıyla güncellendi.',
						variant: 'success',
					}),
				);
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Belge güncellenirken bir hata oluştu.',
						variant: 'error',
					}),
				);
			})
			.finally(() => {
				setIsSubmitLoading(false);
			});
	}, [id, name, year, month, dispatch, token]);
	// get document data
	useEffect(() => {
		if (id)
			axios
				.get(`/api/documents/one?id=${id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				.then((res) => {
					setName(res.data.name);
					setMonth(res.data.month);
					setYear(res.data.year);
					setIsFullLoading(false);
				})
				.catch(() => {
					dispatch(
						openSnackbar({
							message: 'Belge bulunamadı.',
							variant: 'error',
						}),
					);
				});
	}, [id, dispatch, token]);
	useEffect(() => {
		if (router.query.id) setId(parseInt(router.query.id as string));
	}, [router]);
	return (
		<Layout>
			<div
				className={`absolute inset-0 w-full h-full bg-gray-100 z-10 rounded-2xl justify-center items-center ${
					isFullLoading ? 'flex' : 'hidden'
				}`}
			>
				<Loader size={'lg'} />
			</div>
			<div className={'w-full border-b-2 pb-2 mb-2 flex'}>
				<label className={'w-80 mr-2.5'}>
					<Input
						size={'sm'}
						placeholder={'Belge Adı'}
						value={name}
						onChange={(value) => setName(value)}
					/>
				</label>
				<div className={'flex-1'} />
				<label className={'w-32 mr-2'}>
					<InputPicker
						size={'sm'}
						data={MonthData}
						placeholder={'Ay seç'}
						cleanable={false}
						value={month}
						onChange={(value) => setMonth(value)}
					/>
				</label>
				<label className={'w-32 mr-2'}>
					<InputPicker
						size={'sm'}
						data={[...getYearData()]}
						placeholder={'Yıl seç'}
						cleanable={false}
						value={year}
						onChange={(value) => setYear(value)}
					/>
				</label>
				<span className={'ml-2 mr-4 my-2 border-r-2'} />
				<span className={'h-[30px] flex items-center mr-2'}>
					<Button
						size={'xs'}
						color={'green'}
						appearance={'primary'}
						onClick={handleSubmit}
						loading={isSubmitLoading}
						disabled={isSubmitLoading}
					>
						Kaydet
					</Button>
				</span>
			</div>
			<iframe
				className={'w-full flex-1 h-[calc(100%-48px)]'}
				src={`/panel/belgeler/iframe/${id}/${month}/${year}`}
			/>
		</Layout>
	);
};

export default DocumentEditor;
