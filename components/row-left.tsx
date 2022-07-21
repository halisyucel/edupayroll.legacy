import { Teacher } from '../pages/panel/ogretmenler';
import { refresh } from '../redux/features/document';
import { openSnackbar } from '../redux/features/snackbar';
import { RootState } from '../redux/store';
import { CourseCodes } from '../utils/documents';
import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { Button, IconButton, InputPicker, Popover, Whisper } from 'rsuite';

interface RowLeftProps {
	id: number;
	index: number;
	teacherID: number | null;
	courseCode: number | null;
	onNewRow: () => void;
}

const RowLeft: React.FC<RowLeftProps> = ({ id, index, teacherID, courseCode, onNewRow }) => {
	const dispatch = useDispatch();
	const { token } = useSelector((state: RootState) => state.account);
	const { teachersData, appendNewRowButtonIsLoading } = useSelector(
		(state: RootState) => state.document,
	);
	const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
	const [_teacherID, setTeacherID] = useState<number | null>(teacherID);
	const [_courseCode, setCourseCode] = useState<number | null>(courseCode);
	const courseData = useMemo(() => (_teacherID ? CourseCodes : []), [_teacherID]);
	const handleDelete = useCallback(() => {
		setIsDeleteLoading(true);
		axios
			.delete(`/api/rows/delete?id=${id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then(() => {
				dispatch(refresh());
				dispatch(
					openSnackbar({
						message: 'Satır başarıyla silindi.',
						variant: 'success',
					}),
				);
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Satır silinirken bir hata oluştu.',
						variant: 'error',
					}),
				);
			})
			.finally(() => {
				setIsDeleteLoading(false);
			});
	}, [id, dispatch, token]);
	// auto update
	useEffect(() => {
		axios
			.post(
				'/api/rows/edit/left',
				{
					id,
					teacherID: _teacherID,
					courseCode: _courseCode,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			)
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Satır güncellenirken bir hata oluştu.',
						variant: 'error',
					}),
				);
			});
	}, [id, _teacherID, _courseCode, dispatch, token]);
	return (
		<div className={'flex py-1'}>
			<div className={'w-[28px] border-r-2 mr-2 flex justify-left items-center'}>{index}</div>
			<label className={'w-40 mr-2'}>
				<InputPicker
					size={'sm'}
					cleanable={false}
					value={_teacherID}
					data={teachersData}
					placeholder={'Öğretmen seç'}
					placement={'autoVerticalEnd'}
					onChange={(value) => setTeacherID(value)}
				/>
			</label>
			<label className={'w-40 mr-2'}>
				<InputPicker
					size={'sm'}
					data={courseData}
					cleanable={false}
					value={_courseCode}
					placement={'autoVerticalEnd'}
					placeholder={'Ek Ders Tipi Seç'}
					onChange={(value) => setCourseCode(value)}
					locale={{ noResultsText: 'Tip bulunamadı.' }}
				/>
			</label>
			<Whisper
				trigger={'click'}
				placement={'autoVerticalEnd'}
				speaker={
					<Popover className={'w-40 block'}>
						<label className={'block mb-2 w-full'}>
							<Button
								size={'xs'}
								block={true}
								color={'red'}
								appearance={'primary'}
								onClick={handleDelete}
								loading={isDeleteLoading}
								disabled={isDeleteLoading}
							>
								Sil
							</Button>
						</label>
						<label className={'block w-full'}>
							<Button
								size={'xs'}
								block={true}
								color={'green'}
								appearance={'primary'}
								onClick={() => onNewRow()}
								loading={
									appendNewRowButtonIsLoading.rowID === id &&
									appendNewRowButtonIsLoading.isLoading
								}
								disabled={
									appendNewRowButtonIsLoading.rowID === id &&
									appendNewRowButtonIsLoading.isLoading
								}
							>
								Altına yeni satır ekle
							</Button>
						</label>
					</Popover>
				}
			>
				<IconButton size={'sm'} icon={<BsThreeDotsVertical />} />
			</Whisper>
			<span className={'ml-2 my-2 border-r-2'} />
		</div>
	);
};

export default RowLeft;
