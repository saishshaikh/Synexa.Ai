import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Data Save karne ka function
    setUserData: (state, action) => {
      state.user = action.payload; // <-- Yahan data save hota hai!
    },
    // Data hatane ka function
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { setUserData, logout } = userSlice.actions;
export default userSlice.reducer;