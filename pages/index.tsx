import { setToken } from '../redux/features/account';
import { openSnackbar } from '../redux/features/snackbar';
import axios from 'axios';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Input } from 'rsuite';

// TODO useState lere ts şeysi ekle

const Home: NextPage = () => {
	const router = useRouter();
	const dispatch = useDispatch();
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
	const handleSubmit = useCallback(() => {
		if (email.length === 0 || password.length === 0) {
			dispatch(
				openSnackbar({
					message: 'E-posta adresi ve parola boş bırakılamaz.',
					variant: 'error',
				}),
			);
			return;
		}
		setIsSubmitLoading(true);
		axios
			.post('/api/account/login', {
				email,
				password,
			})
			.then((res) => {
				dispatch(setToken(res.data.token));
				dispatch(
					openSnackbar({
						message: 'Giriş başarılı.',
						variant: 'success',
					}),
				);
				window.localStorage.setItem('token', res.data.token);
				router.push('/panel');
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'E-posta adresi veya parola hatalı.',
						variant: 'error',
					}),
				);
			})
			.finally(() => {
				setIsSubmitLoading(false);
			});
	}, [email, password, dispatch, router]);
	return (
		<div className={'w-full h-screen p-8 flex justify-center items-center'}>
			<div className={'w-[320px] p-8 bg-gray-100 rounded-2xl'}>
				<div
					className={
						'font-source-sans text-blue-500 text-3xl font-extrabold mb-4 pb-4 border-b-2'
					}
				>
					Ek Ders Çizelge
					<br />
					Uygulaması
				</div>
				<label className={'block mb-2'}>
					<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
						E-posta adresiniz
					</span>
					<Input
						spellCheck={false}
						autoComplete={'off'}
						maxLength={256}
						value={email}
						onChange={(value) => setEmail(value)}
					/>
				</label>
				<label className={'block mb-4'}>
					<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
						Şifreniz
					</span>
					<Input
						type={'password'}
						spellCheck={false}
						autoComplete={'off'}
						maxLength={256}
						value={password}
						onChange={(value) => setPassword(value)}
						onPressEnter={() => handleSubmit()}
					/>
				</label>
				<label className={'block'}>
					<Button
						size={'sm'}
						appearance={'primary'}
						loading={isSubmitLoading}
						disabled={isSubmitLoading}
						onClick={() => handleSubmit()}
					>
						Giriş yap
					</Button>
				</label>
			</div>
		</div>
	);
};

export default Home;
