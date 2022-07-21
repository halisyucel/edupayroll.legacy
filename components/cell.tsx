import React, { useCallback, useState } from 'react';
import { InputNumber } from 'rsuite';

interface CellProps {
	defaultValue: number;
	onChange: (value: number) => void;
	isWeekend?: boolean;
}

const Cell: React.FC<CellProps> = ({ defaultValue, onChange, isWeekend = false }) => {
	const [focusValue, setFocusValue] = useState<number>(defaultValue);
	const [value, setValue] = useState<number>(defaultValue);
	const handleChange = useCallback((value: number | string) => {
		let _value = value;
		if (typeof _value === 'string') _value = parseInt(_value);
		if (_value < 0 || _value > 9) return;
		setValue(_value as number);
	}, []);
	return (
		<InputNumber
			min={0}
			max={9}
			step={1}
			size={'sm'}
			value={value === 0 ? '' : value}
			className={`cell-input ${isWeekend ? 'cell-input-weekend' : ''}`.trim()}
			onChange={handleChange}
			onFocus={() => setFocusValue(value)}
			onBlur={() => focusValue !== value && onChange(value)}
		/>
	);
};

export default Cell;
