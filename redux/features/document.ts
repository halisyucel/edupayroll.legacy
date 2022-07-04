import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface DocumentState {
	value: number
}

const initialState: DocumentState = {
	value: 0,
}

export const documentSlice = createSlice({
	name: 'document',
	initialState,
	reducers: {
		increment: (state) => {
			state.value += 1
		},
		decrement: (state) => {
			state.value -= 1
		},
	},
})

export const { increment, decrement } = documentSlice.actions;

export default documentSlice.reducer;