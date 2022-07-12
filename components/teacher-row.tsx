import React, { useCallback, useState } from 'react';
import { Teacher } from '../pages/panel/ogretmenler';
import { Button, IconButton, Input } from 'rsuite';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { openSnackbar } from '../redux/features/snackbar';
import axios from 'axios';
import { fillTeacherRows } from '../lib/teachers';

const TeacherRow: React.FC<Teacher> = ({ id, name, branch, information, identity_number }) => {
	const dispatch = useDispatch();
	const [isEditMode, setIsEditMode] = useState<boolean>(false);
	const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
	const [isDeleted, setIsDeleted] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [nameInput, setNameInput] = useState<string>(name);
	const [branchInput, setBranchInput] = useState<string>(branch);
	const [identityNumberInput, setIdentityNumberInput] = useState<string>(identity_number);
	const [informationInput, setInformationInput] = useState<string>(information);
	const resetEditMode = useCallback(() => {
		setIsEditMode(false);
		setNameInput(name);
		setBranchInput(branch);
		setIdentityNumberInput(identity_number);
		setInformationInput(information);
	}, [name, branch, identity_number, information]);
	const handleUpdate = useCallback(() => {
		if (!nameInput.trim()) {
			dispatch(
				openSnackbar({
					message: 'Lütfen öğretmenin ad-soyadını giriniz.',
					variant: 'error',
				}),
			);
			return;
		}
		setIsLoading(true);
		axios
			.put(`/api/teachers/edit`, {
				id: id,
				name: nameInput,
				branch: branchInput,
				identity_number: identityNumberInput,
				information: informationInput,
			})
			.then(() => {
				dispatch(
					openSnackbar({
						message: 'Öğretmen başarıyla güncellendi.',
						variant: 'success',
					}),
				);
				setIsEditMode(false);
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Öğretmen güncellenirken bir hata oluştu.',
						variant: 'error',
					}),
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [id, nameInput, branchInput, identityNumberInput, informationInput, dispatch]);
	const handleDelete = useCallback(() => {
		setIsLoading(true);
		axios
			.delete(`/api/teachers/delete?id=${id}`)
			.then(() => {
				dispatch(
					openSnackbar({
						message: 'Öğretmen başarıyla silindi.',
						variant: 'success',
					}),
				);
				setIsDeleted(true);
				fillTeacherRows();
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Öğretmen silinirken bir hata oluştu.',
						variant: 'error',
					}),
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [id, dispatch]);
	return (
		<div
			data-hidden={isDeleted}
			className={`teacher-row w-full pl-1.5 ${isDeleted ? 'hidden' : 'flex'}`}
		>
			<div
				className={`min-w-[12rem] max-w-[12rem] h-12 mr-2 border-r-2 flex justify-start items-center ${
					isEditMode ? 'pl-0 pr-2' : 'px-2'
				}`}
			>
				{isEditMode ? (
					<Input
						size={'sm'}
						value={nameInput}
						readOnly={isLoading}
						spellCheck={false}
						maxLength={256}
						onChange={(value) => setNameInput(value)}
					/>
				) : (
					<div className={'w-full overflow-hidden'}>
						<div className={'w-[1000px]'}>{nameInput}</div>
					</div>
				)}
			</div>
			<div
				className={`min-w-[12rem] max-w-[12rem] h-12 mr-2 border-r-2 flex justify-start items-center ${
					isEditMode ? 'pl-0 pr-2' : 'px-2'
				}`}
			>
				{isEditMode ? (
					<Input
						size={'sm'}
						value={branchInput}
						readOnly={isLoading}
						spellCheck={false}
						maxLength={256}
						onChange={(value) => setBranchInput(value)}
					/>
				) : (
					<div className={'w-full overflow-hidden'}>
						<div className={'w-[1000px]'}>{branchInput}</div>
					</div>
				)}
			</div>
			<div
				className={`min-w-[12rem] max-w-[12rem] h-12 mr-2 border-r-2 flex justify-start items-center ${
					isEditMode ? 'pl-0 pr-2' : 'px-2'
				}`}
			>
				{isEditMode ? (
					<Input
						size={'sm'}
						value={identityNumberInput}
						readOnly={isLoading}
						spellCheck={false}
						maxLength={11}
						onChange={(value) => setIdentityNumberInput(value)}
					/>
				) : (
					<div className={'w-full overflow-hidden'}>
						<div className={'w-[1000px]'}>{identityNumberInput}</div>
					</div>
				)}
			</div>
			<div
				className={`min-w-[12rem] max-w-[12rem] h-12 mr-2 border-r-2 flex justify-start items-center ${
					isEditMode ? 'pl-0 pr-2' : 'px-2'
				}`}
			>
				{isEditMode ? (
					<Input
						size={'sm'}
						value={informationInput}
						readOnly={isLoading}
						spellCheck={false}
						maxLength={256}
						onChange={(value) => setInformationInput(value)}
					/>
				) : (
					<div className={'w-full overflow-hidden'}>
						<div className={'w-[1000px]'}>{informationInput}</div>
					</div>
				)}
			</div>
			<div className={'flex-1 h-12 flex justify-end items-center pr-3'}>
				{isEditMode && (
					<React.Fragment>
						<span className={'mr-2'}>
							<Button
								size={'xs'}
								onClick={() => resetEditMode()}
								disabled={isLoading}
							>
								İptal
							</Button>
						</span>
						<Button
							size={'xs'}
							appearance={'primary'}
							color={'green'}
							loading={isLoading}
							onClick={() => handleUpdate()}
						>
							Kaydet
						</Button>
					</React.Fragment>
				)}
				{isDeleteMode && (
					<React.Fragment>
						<span className={'mr-2'}>
							<Button
								size={'xs'}
								onClick={() => setIsDeleteMode(false)}
								disabled={isLoading}
							>
								İptal
							</Button>
						</span>
						<Button
							size={'xs'}
							appearance={'primary'}
							color={'red'}
							loading={isLoading}
							onClick={() => handleDelete()}
						>
							Sil
						</Button>
					</React.Fragment>
				)}
				{!isEditMode && !isDeleteMode && (
					<React.Fragment>
						<span className={'mr-2'}>
							<IconButton
								size={'sm'}
								title={'Düzenle'}
								appearance={'primary'}
								icon={<AiFillEdit />}
								onClick={() => setIsEditMode(true)}
							/>
						</span>
						<IconButton
							size={'sm'}
							color={'red'}
							title={'Sil'}
							appearance={'primary'}
							icon={<AiFillDelete />}
							onClick={() => setIsDeleteMode(true)}
						/>
					</React.Fragment>
				)}
			</div>
		</div>
	);
};

export default TeacherRow;
