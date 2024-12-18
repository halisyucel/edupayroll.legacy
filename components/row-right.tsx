import { openSnackbar } from '../redux/features/snackbar';
import { RootState } from '../redux/store';
import { getDaysInMonth, isWeekend } from '../utils/documents';
import Cell from './cell';
import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface RowRightProps {
	id: number;
	days: number[];
	month: number;
	year: number;
}

const RowRight: React.FC<RowRightProps> = ({ id, days, month, year }) => {
	const dispatch = useDispatch();
	const { token } = useSelector((state: RootState) => state.account);
	const [_days, setDays] = useState<number[]>(days);
	const [isDirty, setIsDirty] = useState(false);

	const handleChange = useCallback(
		(value: number, day: number) => {
			const newDays = [..._days.slice(0, day - 1), value, ..._days.slice(day)];
			setDays(newDays);
			setIsDirty(true);
		},
		[_days],
	);
	const cells = useMemo(() => {
		const c: any[] = [];
		const daysCount = getDaysInMonth(month, year);
		for (let i = 1; i <= daysCount; i++) c.push(i);
		return c;
	}, [month, year]);
	// auto update
	useEffect(() => {
		if (!isDirty) return;

		axios
			.post(
				'/api/rows/edit/right',
				{
					id,
					days: _days,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			)
			.finally(() => {
				setIsDirty(false);
			});
	}, [_days, id, dispatch, token, isDirty]);
	return (
		<div className={'pl-2 flex'}>
			{cells.map((day) => (
				<label key={day} className={`m-1`}>
					<Cell
						isWeekend={isWeekend(day, month, year)}
						defaultValue={days[day - 1]}
						onChange={(value) => handleChange(value, day)}
					/>
				</label>
			))}
		</div>
	);
};

export default RowRight;
