import Layout from '../../components/layout';
import { openSnackbar } from '../../redux/features/snackbar';
import { RootState } from '../../redux/store';
import axios from 'axios';
import { NextPage } from 'next';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, Loader } from 'rsuite';

const Okul: NextPage = () => {
	const dispatch = useDispatch();
	const { token } = useSelector((state: RootState) => state.account);
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [isSubmitLoading, setIsSubmitLoading] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [schoolName, setSchoolName] = useState('');
	const [directorName, setDirectorName] = useState('');
	const [editorName, setEditorName] = useState('');
	const [editorTitle, setEditorTitle] = useState('');
	const [schoolNameForEdit, setSchoolNameForEdit] = useState('');
	const [directorNameForEdit, setDirectorNameForEdit] = useState('');
	const [editorNameForEdit, setEditorNameForEdit] = useState('');
	const [editorTitleForEdit, setEditorTitleForEdit] = useState('');
	const resetSchoolInformation = useCallback(() => {
		setIsEditMode(false);
		setSchoolNameForEdit(schoolName);
		setDirectorNameForEdit(directorName);
		setEditorNameForEdit(editorName);
		setEditorTitleForEdit(editorTitle);
	}, [schoolName, directorName, editorName, editorTitle]);
	const handleSubmit = useCallback(() => {
		setIsSubmitLoading(true);
		axios
			.post(
				'/api/school/edit',
				{
					name: schoolNameForEdit,
					director: directorNameForEdit,
					editor: editorNameForEdit,
					editorTitle: editorTitleForEdit,
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
						message: 'Okul bilgileri başarıyla güncellendi.',
						variant: 'success',
					}),
				);
				setSchoolName(schoolNameForEdit);
				setDirectorName(directorNameForEdit);
				setEditorName(editorNameForEdit);
				setEditorTitle(editorTitleForEdit);
				setIsEditMode(false);
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Okul bilgileri güncellenirken bir hata oluştu.',
						variant: 'error',
					}),
				);
			})
			.finally(() => {
				setIsSubmitLoading(false);
			});
	}, [
		schoolNameForEdit,
		directorNameForEdit,
		editorNameForEdit,
		editorTitleForEdit,
		dispatch,
		token,
	]);
	// get school data
	useEffect(() => {
		axios
			.get('/api/school/get', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((res) => {
				setIsPageLoading(false);
				setSchoolName(res.data.name);
				setDirectorName(res.data.director);
				setEditorName(res.data.editor);
				setEditorTitle(res.data.editorTitle);
				setSchoolNameForEdit(res.data.name);
				setDirectorNameForEdit(res.data.director);
				setEditorNameForEdit(res.data.editor);
				setEditorTitleForEdit(res.data.editorTitle);
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Okul bilgileri alınamadı.',
						variant: 'error',
					}),
				);
			});
	}, [dispatch, token]);
	return (
		<Layout>
			<h1 className={'text-4xl font-extrabold font-source-sans border-b-2 pb-2 mb-4'}>
				Okulunuz
			</h1>
			{isPageLoading ? (
				<div className={'w-full px-4 py-8 flex justify-center items-center'}>
					<Loader size={'md'} />
				</div>
			) : (
				<React.Fragment>
					<label className={'block w-[400px] mb-2'}>
						<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
							Okulunuzun İsmi
						</span>
						<Input
							spellCheck={false}
							autoComplete={'off'}
							value={schoolNameForEdit}
							readOnly={!isEditMode}
							onChange={(value) => setSchoolNameForEdit(value)}
							maxLength={256}
						/>
					</label>
					<label className={'block w-[400px] mb-2'}>
						<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
							Müdürün Adı Soyadı
						</span>
						<Input
							spellCheck={false}
							autoComplete={'off'}
							value={directorNameForEdit}
							readOnly={!isEditMode}
							onChange={(value) => setDirectorNameForEdit(value)}
							maxLength={256}
						/>
					</label>
					<label className={'block w-[400px] mb-2'}>
						<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
							Düzenleyen Kişinin Adı Soyadı
						</span>
						<Input
							spellCheck={false}
							autoComplete={'off'}
							value={editorNameForEdit}
							readOnly={!isEditMode}
							onChange={(value) => setEditorNameForEdit(value)}
							maxLength={256}
						/>
					</label>
					<label className={'block w-[400px] mb-2'}>
						<span className={'inline-block font-source-sans font-bold pl-0.5 mb-1'}>
							Düzenleyen Kişinin Ünvanı
						</span>
						<Input
							spellCheck={false}
							autoComplete={'off'}
							value={editorTitleForEdit}
							readOnly={!isEditMode}
							onChange={(value) => setEditorTitleForEdit(value)}
							maxLength={256}
						/>
					</label>
					<label className={'block w-[400px] mt-6'}>
						{isEditMode ? (
							<React.Fragment>
								<Button
									size={'sm'}
									appearance={'primary'}
									className={'mr-2'}
									disabled={isSubmitLoading}
									onClick={() => resetSchoolInformation()}
								>
									İptal
								</Button>
								<Button
									size={'sm'}
									color={'green'}
									appearance={'primary'}
									loading={isSubmitLoading}
									disabled={isSubmitLoading}
									onClick={() => handleSubmit()}
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
				</React.Fragment>
			)}
		</Layout>
	);
};

export default Okul;
