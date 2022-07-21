import accountReducer from './features/account';
import documentReducer from './features/document';
import snackbarReducer from './features/snackbar';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
	reducer: {
		snackbar: snackbarReducer,
		document: documentReducer,
		account: accountReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
