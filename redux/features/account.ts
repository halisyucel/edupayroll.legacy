import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type variant = 'success' | 'error';

export interface AccountState {
	token: string | null;
}

const initialState: AccountState = {
	token: null,
};

export const accountSlice = createSlice({
	name: 'account',
	initialState,
	reducers: {
		setToken: (state, action: PayloadAction<string | null>) => {
			state.token = action.payload;
		},
	},
});

export const { setToken } = accountSlice.actions;

export default accountSlice.reducer;
