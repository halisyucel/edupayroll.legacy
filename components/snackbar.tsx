import { closeSnackbar } from '../redux/features/snackbar';
import { RootState } from '../redux/store';
import React, { useCallback, useEffect, useState } from 'react';
import { RiCloseFill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';

const variantColors = {
	success: 'bg-green-200',
	error: 'bg-red-200',
};

const Snackbar = () => {
	const dispatch = useDispatch();
	const { open, message, variant } = useSelector((state: RootState) => state.snackbar);
	const [timer, setTimer] = useState<any>(null);
	const handleClose = useCallback(() => {
		dispatch(closeSnackbar());
		if (timer) clearTimeout(timer);
	}, [timer, dispatch]);
	useEffect(() => {
		if (!open) return;
		const _timer = setTimeout(() => {
			dispatch(closeSnackbar());
		}, 4000);
		setTimer(_timer);
		return () => clearTimeout(_timer);
	}, [open, dispatch]);
	return (
		<div
			className={`fixed z-50 flex justify-center items-center transition-all duration-300 rounded left-4 p-2 pr-3 ${
				variantColors[variant]
			} ${open ? 'bottom-4' : 'bottom-[-4rem]'}`}
		>
			<span className={'ml-2 text-sm'}>{message}</span>
			<span onClick={handleClose} className={'mt-0.5 ml-2 cursor-pointer'}>
				<RiCloseFill />
			</span>
		</div>
	);
};

export default Snackbar;
