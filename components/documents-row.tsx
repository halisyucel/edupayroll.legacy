import { Document } from '../pages/panel/belgeler';
import { openSnackbar } from '../redux/features/snackbar';
import { RootState } from '../redux/store';
import { fillDocumentRows } from '../utils/documents';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { Button, IconButton } from 'rsuite';

const DocumentsRow: React.FC<Document> = ({ id, name, month, year }) => {
	const router = useRouter();
	const dispatch = useDispatch();
	const { token } = useSelector((state: RootState) => state.account);
	const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
	const [isDeleted, setIsDeleted] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [monthText, setMonthText] = useState<string>('-');
	const handleDelete = useCallback(() => {
		setIsLoading(true);
		axios
			.delete(`/api/documents/delete?id=${id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then(() => {
				dispatch(
					openSnackbar({
						message: 'Belge başarıyla silindi.',
						variant: 'success',
					}),
				);
				setIsDeleted(true);
				fillDocumentRows();
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Belge silinirken bir hata oluştu.',
						variant: 'error',
					}),
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [id, dispatch, token]);
	useEffect(() => {
		const date = new Date();
		date.setMonth(month);
		setMonthText(date.toLocaleString('tr-TR', { month: 'long' }));
	}, [month]);
	return (
		<div
			data-hidden={isDeleted}
			className={`document-row w-full pl-1.5 ${isDeleted ? 'hidden' : 'flex'}`}
		>
			<div
				className={`min-w-[18rem] max-w-[18rem] h-12 mr-2 px-2 border-r-2 flex justify-start items-center`}
			>
				<div className={'w-full overflow-hidden'}>
					<div className={'w-[1000px]'}>{name}</div>
				</div>
			</div>
			<div
				className={`min-w-[12rem] max-w-[12rem] h-12 mr-2 px-2 border-r-2 flex justify-start items-center`}
			>
				<div className={'w-full overflow-hidden'}>
					<div className={'w-[1000px]'}>{monthText}</div>
				</div>
			</div>
			<div
				className={`min-w-[12rem] max-w-[12rem] h-12 mr-2 px-2 border-r-2 flex justify-start items-center`}
			>
				<div className={'w-full overflow-hidden'}>
					<div className={'w-[1000px]'}>{year}</div>
				</div>
			</div>
			<div className={'flex-1 h-12 flex justify-end items-center pr-3'}>
				{isDeleteMode ? (
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
							disabled={isLoading}
							onClick={() => handleDelete()}
						>
							Sil
						</Button>
					</React.Fragment>
				) : (
					<React.Fragment>
						<span className={'mr-2'}>
							<IconButton
								size={'sm'}
								title={'Düzenle'}
								appearance={'primary'}
								icon={<AiFillEdit />}
								onClick={() => router.push(`/panel/belgeler/${id}`)}
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

export default DocumentsRow;
