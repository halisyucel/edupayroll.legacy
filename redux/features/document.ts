import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface DocumentState {
	refreshValue: number;
	appendNewRowButtonIsLoading: {
		rowID: number | null;
		isLoading: boolean;
	};
	teachersData: { value: number; label: string }[];
}

const initialState: DocumentState = {
	refreshValue: 0,
	appendNewRowButtonIsLoading: {
		rowID: null,
		isLoading: false,
	},
	teachersData: [],
};

export const documentSlice = createSlice({
	name: 'document',
	initialState,
	reducers: {
		refresh: (state) => {
			state.refreshValue++;
		},
		setAppendNewRowButtonIsLoading: (
			state,
			action: PayloadAction<{ rowID: number | null; isLoading: boolean }>,
		) => {
			state.appendNewRowButtonIsLoading = action.payload;
		},
		setTeachers: (state, action: PayloadAction<{ value: number; label: string }[]>) => {
			state.teachersData = action.payload;
		},
	},
});

export const { refresh, setAppendNewRowButtonIsLoading, setTeachers } = documentSlice.actions;

export default documentSlice.reducer;
