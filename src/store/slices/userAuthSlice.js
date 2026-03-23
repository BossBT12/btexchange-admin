import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userData: null,
  userData2: null,
  token: null,
  token2: null,
};

const userAuthSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.userData = null;
      state.userData2 = null;
      state.token = null;
      state.token2 = null;
    },
    setUserData: (state, action) => {
      state.userData = action.payload.userData;
      state.token = action.payload.token;
    },
    setUserData2: (state, action) => {
      state.userData2 = action.payload.userData2;
      state.token2 = action.payload.token2;
    },
  },
});

export const { clearUser, setUserData, setUserData2 } = userAuthSlice.actions;
export default userAuthSlice.reducer;
