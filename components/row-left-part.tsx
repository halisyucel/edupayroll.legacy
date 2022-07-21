import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconButton, Input, InputPicker } from 'rsuite';
import { Teacher } from '../pages/panel/ogretmenler';
import axios from 'axios';
import { CourseCodes, getDaysInMonth, isWeekend } from '../utils/documents';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setScroll } from '../redux/features/document';
import { openSnackbar } from '../redux/features/snackbar';

// TODO çıktı alırken sadece cell lere bakılmayacak fazla olan celler alınmayacak
// TODO elemanları yazdırırken son hanelerini at

export interface Row {
	id:	number;
	documentID: number;
	teacherID: number | null;
	courseCode: number | null;
	days: number[];
}

interface DocumentRowProps {
	id: number;
	documentID: number;
	teacherID: number | null;
	courseCode: number | null;
	days: number[];
	month: number;
	year: number;
}

const DocumentRow: React.FC<DocumentRowProps> = ({
	id,
	documentID,
	teacherID,
	courseCode,
	days,
	month,
	year
}) => {
	const dispatch = useDispatch();
	const scrollArea = useRef<HTMLDivElement>(null);
	const { scroll } = useSelector((state: RootState) => state.document);
	const [teachers, setTeachers] = useState<Teacher[]>([]);
	const [_teacherID, setTeacherID] = useState<number | null>(teacherID);
	const [_courseCode, setCourseCode] = useState<number | null>(courseCode);
	const [_days, setDays] = useState<number[]>(days);
	const cells = useMemo(() => {
		const _cells: any[] = [];
		const daysCount = getDaysInMonth(month, year);
		for (let i = 1; i <= daysCount; i++) {
			_cells.push(i);
		}
		return _cells;
	}, [month, year]);
	const courseData = useMemo(() => {
		if (!_teacherID)
			return [];
		return CourseCodes;
	}, [_teacherID]);
	const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		dispatch(
			setScroll(e.currentTarget.scrollLeft)
		);
	}, [dispatch]);
	useEffect(() => {
		axios
			.get('/api/teachers/all')
			.then(res => {
				setTeachers(res.data.map((teacher: Teacher) => ({
					value: teacher.id,
					label: teacher.name,
				})));
			})
	}, []);
	useEffect(() => {
		if (scrollArea.current) {
			scrollArea.current.scrollLeft = scroll;
		}
	}, [scroll, scrollArea]);
	// auto save
	useEffect(() => {
		/*axios.put(`/api/rows/edit`, {
			id,
			teacherID: _teacherID,
			courseCode: _courseCode,
			days: _days,
		})
			.then(() => {
				console.log('saved');
			})
			.catch(() => {
				dispatch(
					openSnackbar({
						message: 'Satır kaydedilemedi',
						variant: 'error',
					})
				);
			});*/
	}, [
		id,
		_teacherID,
		_courseCode,
		_days,
		dispatch,
	]);
	return (
		<div className={'flex w-full'}>
			<div className={'flex py-1'}>
				<label className={'w-40 mr-2'}>
					<InputPicker
						size={'sm'}
						data={teachers}
						cleanable={false}
						placeholder={'Öğretmen seç'}
						value={_teacherID}
						onChange={(value) => setTeacherID(value)}
					/>
				</label>
				<label className={'w-40 mr-2'}>
					<InputPicker
						size={'sm'}
						data={courseData}
						cleanable={false}
						value={_courseCode}
						placeholder={'Ek Ders Tipi Seç'}
						onChange={(value) => setCourseCode(value)}
						locale={{ noResultsText: 'Tip bulunamadı.' }}
					/>
				</label>
				<IconButton
					size={'sm'}
					icon={<BsThreeDotsVertical />}
				/>
				<span className={'ml-2 my-2 border-r-2'} />
			</div>
			<div
				ref={scrollArea}
				onScroll={handleScroll}
				className={'scroll-area w-[calc(100%-382px)] pl-2 flex overflow-y-invisible overflow-x-scroll scroll-invisible'}
			>
				{/* TODO buraya rakam sınırlayıcı ekle */}
				{cells.map((day) => (
					<label
						key={day}
						className={`w-8 min-w-[2rem] mr-1 py-1 ${isWeekend(day, month, year) ? '' : ''}`}
					>
						<Input
							size={'sm'}
							defaultValue={_days[(day - 1)] || ''}
							onChangeCapture={(e) => {
							}}
						/>
					</label>
				))}
			</div>
		</div>
	);
};

export default DocumentRow;
