import { configureStore } from '@reduxjs/toolkit';
import documentReducer from './features/document';
import snackbarReducer from './features/snackbar';

export const store = configureStore({
	reducer: {
		document: documentReducer,
		snackbar: snackbarReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
