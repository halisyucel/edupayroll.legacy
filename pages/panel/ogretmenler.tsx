import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import Layout from '../../components/layout';
import { Button, Input, Loader } from 'rsuite';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from '../../redux/features/snackbar';
import TeacherRow from '../../components/teacher-row';
import { fillTeacherRows } from '../../lib/teachers';

export interface Teacher {
	id: number;
	name: string;
	branch: string;
	information: string;
	identity_number: string;
}

const Teachers: NextPage = () => {
	const dispatch = useDispatch();
	const [refreshData, setRefreshData] = useState<number>(0);
	// append new teacher
	const [isNewTeacherFormOpen, setIsNewTeacherFormOpen] = useState<boolean>(false);
	const [isLoadingNewTeacherForm, setIsLoadingNewTeacherForm] = useState<boolean>(false);
	const [newTeacherName, setNewTeacherName] = useState<string>('');
	const [newTeacherBranch, setNewTeacherBranch] = useState<string>('');
	const [newTeacherIdentityNumber, setNewTeacherIdentityNumber] = useState<string>('');
	const [newTeacherInformation, setNewTeacherInformation] = useState<string>('');
	const resetNewTeacherForm = useCallback(() => {
		setNewTeacherName('');
		setNewTeacherBranch('');
		setNewTeacherIdentityNumber('');
		setNewTeacherInformation('');
		setIsNewTeacherFormOpen(false);
	}, []);
	const handleNewTeacherForm = useCallback(() => {
		if (!newTeacherName.trim()) {
			dispatch(
				openSnackbar({
					message: 'Lütfen öğretmenin ad-soyadını giriniz.',
					variant: 'error',
				}),
			);
			return;
		}
		setIsLoadingNewTeacherForm(true);
		axios
			.post('/api/teachers/new', {
				name: newTeacherName,
				branch: newTeacherBranch,
				identity_number: newTeacherIdentityNumber,
				information: newTeacherInformation,
			})
			.then(() => {
				dispatch(
					openSnackbar({
						message: 'Öğretmen başarıyla eklendi.',
						variant: 'success',
					}),
				);
				setRefreshData(refreshData + 1);
				resetNewTeacherForm();
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Öğretmen eklenirken bir hata oluştu.',
						variant: 'error',
					}),
				);
			})
			.finally(() => {
				setIsLoadingNewTeacherForm(false);
			});
	}, [
		newTeacherName,
		newTeacherBranch,
		newTeacherIdentityNumber,
		newTeacherInformation,
		refreshData,
		resetNewTeacherForm,
		dispatch,
	]);
	// get all teachers
	const [teachers, setTeachers] = useState<Teacher[]>([]);
	const [isLoadingTeachers, setIsLoadingTeachers] = useState<boolean>(false);
	useEffect(() => {
		setIsLoadingTeachers(true);
		axios
			.get('/api/teachers/all')
			.then((res) => {
				setTeachers(res.data);
				fillTeacherRows();
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Öğretmenleri alırken bir hata oluştu.',
						variant: 'error',
					}),
				);
			})
			.finally(() => {
				setIsLoadingTeachers(false);
			});
	}, [refreshData, dispatch]);
	return (
		<Layout>
			<div className={'w-full border-b-2 pb-2 flex'}>
				<h2 className={'text-2xl font-extrabold font-source-sans m-0 p-0'}>Öğretmenler</h2>
			</div>
			<div className={'w-full border-b-2 py-4 flex'}>
				{isNewTeacherFormOpen ? (
					<React.Fragment>
						<label className={'block min-w-[12rem] mr-2'}>
							<Input
								size={'sm'}
								placeholder={'Ad Soyad*'}
								spellCheck={false}
								value={newTeacherName}
								onChange={(value) => setNewTeacherName(value)}
								readOnly={isLoadingNewTeacherForm}
								maxLength={256}
							/>
						</label>
						<label className={'block min-w-[12rem] mr-2'}>
							<Input
								size={'sm'}
								placeholder={'Branş'}
								spellCheck={false}
								value={newTeacherBranch}
								onChange={(value) => setNewTeacherBranch(value)}
								readOnly={isLoadingNewTeacherForm}
								maxLength={256}
							/>
						</label>
						<label className={'block min-w-[12rem] mr-2'}>
							<Input
								size={'sm'}
								placeholder={'TC Kimlik No'}
								spellCheck={false}
								value={newTeacherIdentityNumber}
								onChange={(value) => setNewTeacherIdentityNumber(value)}
								readOnly={isLoadingNewTeacherForm}
								maxLength={11}
							/>
						</label>
						<label className={'block min-w-[12rem] mr-2'}>
							<Input
								size={'sm'}
								placeholder={'Açıklama'}
								spellCheck={false}
								value={newTeacherInformation}
								onChange={(value) => setNewTeacherInformation(value)}
								readOnly={isLoadingNewTeacherForm}
								maxLength={256}
							/>
						</label>
						<span className={'flex-1'} />
						<Button
							size={'sm'}
							className={'mr-2'}
							disabled={isLoadingNewTeacherForm}
							onClick={() => resetNewTeacherForm()}
						>
							İptal
						</Button>
						<Button
							size={'sm'}
							color={'green'}
							appearance={'primary'}
							loading={isLoadingNewTeacherForm}
							onClick={() => handleNewTeacherForm()}
						>
							Kaydet
						</Button>
					</React.Fragment>
				) : (
					<React.Fragment>
						<Button
							size={'sm'}
							appearance={'primary'}
							onClick={() => setIsNewTeacherFormOpen(true)}
						>
							Yeni Öğretmen Ekle
						</Button>
					</React.Fragment>
				)}
			</div>
			<div className={'w-full border-b-2 py-2 pl-1.5 pt-6 flex'}>
				<div className={'min-w-[12rem] mr-2 px-2 font-bold border-r-2'}>Ad Soyad</div>
				<div className={'min-w-[12rem] mr-2 px-2 font-bold border-r-2'}>Branş</div>
				<div className={'min-w-[12rem] mr-2 px-2 font-bold border-r-2'}>TC Kimlik No</div>
				<div className={'min-w-[12rem] mr-2 px-2 font-bold border-r-2'}>Açıklama</div>
			</div>
			<div className={'w-full relative h-[calc(100%-156px)] overflow-auto'}>
				<div
					className={`w-full h-full absolute inset-0 bg-gray-100/70 pt-6 justify-center items-start ${
						isLoadingTeachers ? 'flex' : 'hidden'
					}`}
				>
					<Loader />
				</div>
				{teachers.map((teacher) => (
					<TeacherRow
						key={teacher.id}
						id={teacher.id}
						name={teacher.name}
						branch={teacher.branch}
						identity_number={teacher.identity_number}
						information={teacher.information}
					/>
				))}
			</div>
		</Layout>
	);
};

export default Teachers;
