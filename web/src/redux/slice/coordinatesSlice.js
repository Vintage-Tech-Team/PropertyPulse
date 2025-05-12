import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	latitude: null,
	longitude: null,
};

const coordinatesSlice = createSlice({
	name: 'coordinates',
	initialState,
	reducers: {
		setCoordinates: (state, action) => {
			state.latitude = action.payload.latitude;
			state.longitude = action.payload.longitude;
		},
	},
});

export const { setCoordinates } = coordinatesSlice.actions;
export default coordinatesSlice.reducer;
