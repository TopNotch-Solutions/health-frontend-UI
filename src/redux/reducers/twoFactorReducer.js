import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
};

  export const authenticationSlice = createSlice({
    name: "twoFactorAuthentication",
    initialState,
    reducers: {
        toggleAuthenticationTrue: (state) => {
            state.isAuthenticated = true;
        },
        toggleAuthenticationfalse: (state) => {
          state.isAuthenticated = false;
      },
    },
  });
  export const { toggleAuthenticationTrue, toggleAuthenticationfalse} = authenticationSlice.actions

  export default authenticationSlice.reducer