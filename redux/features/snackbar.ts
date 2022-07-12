import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type variant = 'success' | 'error';

export interface SnackbarState {
	open: boolean;
	message: string;
	variant: variant;
}

const initialState: SnackbarState = {
	open: false,
	message: '',
	variant: 'success',
};

export const snackbarSlice = createSlice({
	name: 'snackbar',
	initialState,
	reducers: {
		openSnackbar: (state, action: PayloadAction<{ message: string; variant: variant }>) => {
			state.open = true;
			state.message = action.payload.message;
			state.variant = action.payload.variant;
		},
		closeSnackbar: (state) => {
			state.open = false;
		},
	},
});

export const { openSnackbar, closeSnackbar } = snackbarSlice.actions;

export default snackbarSlice.reducer;
