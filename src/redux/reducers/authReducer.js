import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { user} = action.payload;
      state.user = user;
    },
    logout: (state) => {
      state.user = {};
    },
    updateProfileImage: (state, action) => {
      state.user.profileImage = action.payload.profileImage;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload.user };
    },
    updateToken: (state, action) => {
      state.user.token = action.payload.token;
    },
  },
});

export const { login, logout, updateProfileImage, updateUser, updateToken } = authSlice.actions;
export default authSlice.reducer;
