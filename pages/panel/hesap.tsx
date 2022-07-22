import Layout from '../../components/layout';
import { openSnackbar } from '../../redux/features/snackbar';
import { RootState } from '../../redux/store';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, Loader } from 'rsuite';

const Account = () => {
	const dispatch = useDispatch();
	const { token } = useSelector((state: RootState) => state.account);
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [isEditLoading, setIsEditLoading] = useState(false);
	const [isPasswordLoading, setIsPasswordLoading] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [email, setEmail] = useState('');
	const [emailForEdit, setEmailForEdit] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const resetEditForm = useCallback(() => {
		setIsEditMode(false);
		setEmailForEdit(email);
	}, [email]);
	const handleEditSubmit = useCallback(() => {
		setIsEditLoading(true);
		axios
			.post(
				'/api/account/edit',
				{
					email: emailForEdit,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			)
			.then(() => {
				setEmail(emailForEdit);
				setIsEditMode(false);
				dispatch(
					openSnackbar({
						message: 'E-posta adresiniz başarıyla güncellendi.',
						variant: 'success',
					}),
				);
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'E-posta adresiniz güncellenirken bir hata oluştu.',
						variant: 'error',
					}),
				);
			})
			.finally(() => {
				setIsEditLoading(false);
			});
	}, [emailForEdit, dispatch, token]);
	const resetPasswordForm = useCallback(() => {
		setCurrentPassword('');
		setNewPassword('');
	}, []);
	const handlePasswordSubmit = useCallback(() => {
		if (newPassword.length < 8) {
			dispatch(
				openSnackbar({
					message: 'Yeni parolanız en az 8 karakterden oluşmalıdır.',
					variant: 'error',
				}),
			);
			return;
		}
		setIsPasswordLoading(true);
		axios
			.post(
				'/api/account/password',
				{
					current: currentPassword,
					new: newPassword,
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
						message: 'Şifreniz başarıyla güncellendi.',
						variant: 'success',
					}),
				);
				resetPasswordForm();
			})
			.catch((error) => {
				if (error.code === 'ERR_BAD_REQUEST') {
					dispatch(
						openSnackbar({
							message: 'Mevcut şifreniz hatalı.',
							variant: 'error',
						}),
					);
					return;
				}
				dispatch(
					openSnackbar({
						message: 'Şifreniz güncellenirken bir hata oluştu.',
						variant: 'error',
					}),
				);
			})
			.finally(() => {
				setIsPasswordLoading(false);
			});
	}, [currentPassword, newPassword, dispatch, resetPasswordForm, token]);
	useEffect(() => {
		axios
			.get('/api/account/get', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((res) => {
				setEmail(res.data.email);
				setEmailForEdit(res.data.email);
				setIsPageLoading(false);
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Hesap bilgileri alınamadı.',
						variant: 'error',
					}),
				);
			});
	}, [dispatch, token]);
	return (
		<Layout>
			<h1 className={'text-4xl font-extrabold font-source-sans border-b-2 pb-2 mb-4'}>
				Hesabınız
			</h1>
			{isPageLoading ? (
				<div className={'w-full px-4 py-8 flex justify-center items-center'}>
					<Loader size={'md'} />
				</div>
			) : (
				<React.Fragment>
					<label className={'block w-[400px] mb-4'}>
						<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
							E-posta adresiniz
						</span>
						<Input
							readOnly={!isEditMode}
							spellCheck={false}
							autoComplete={'off'}
							value={emailForEdit}
							onChange={(value) => setEmailForEdit(value)}
							maxLength={256}
						/>
					</label>
					<label className={'block w-[400px] mb-4 border-b-2 pb-4'}>
						{isEditMode ? (
							<React.Fragment>
								<Button
									size={'sm'}
									appearance={'primary'}
									className={'mr-2'}
									onClick={() => resetEditForm()}
									disabled={isEditLoading}
								>
									İptal
								</Button>
								<Button
									size={'sm'}
									color={'green'}
									appearance={'primary'}
									onClick={() => handleEditSubmit()}
									loading={isEditLoading}
									disabled={isEditLoading}
								>
									Kaydet
								</Button>
							</React.Fragment>
						) : (
							<Button
								size={'sm'}
								appearance={'primary'}
								onClick={() => setIsEditMode(true)}
							>
								Düzenle
							</Button>
						)}
					</label>
					<label className={'block w-[400px] mb-4'}>
						<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
							Mevcut şifreniz
						</span>
						<Input
							type={'password'}
							autoComplete={'off'}
							maxLength={256}
							value={currentPassword}
							onChange={(value) => setCurrentPassword(value)}
						/>
					</label>
					<label className={'block w-[400px] mb-4'}>
						<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
							Yeni şifreniz
						</span>
						<Input
							type={'password'}
							autoComplete={'off'}
							maxLength={256}
							value={newPassword}
							onChange={(value) => setNewPassword(value)}
						/>
					</label>
					<label className={'block w-[400px] '}>
						<Button
							size={'sm'}
							appearance={'primary'}
							loading={isPasswordLoading}
							disabled={isPasswordLoading}
							onClick={() => handlePasswordSubmit()}
						>
							Şifre Değiştir
						</Button>
					</label>
				</React.Fragment>
			)}
		</Layout>
	);
};

export default Account;
