import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userData: null,
  token: null,
  token2: null,
  isSecondGame: localStorage.getItem('isSecondGame') ? JSON.parse(localStorage.getItem('isSecondGame')) : false,
};

const userAuthSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.userData = null;
      state.token = null;
      state.token2 = null;
      state.isSecondGame = false;
      localStorage.removeItem('isSecondGame');
    },
    setUserData: (state, action) => {
      state.userData = action.payload.userData;
      localStorage.setItem('userData', JSON.stringify(action.payload.userData));
      state.token = action.payload.token;
      state.token2 = action.payload.token2;
    },
    setIsSecondGame: (state, action) => {
      state.isSecondGame = action.payload;
      localStorage.setItem('isSecondGame', JSON.stringify(action.payload));
    },
  },
});

export const { clearUser, setUserData, setIsSecondGame } = userAuthSlice.actions;
export default userAuthSlice.reducer;
