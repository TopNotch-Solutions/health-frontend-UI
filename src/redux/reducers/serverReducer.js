import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  serverToken: null
};

const serverSlice = createSlice({
    name: "server",
    initialState,
    reducers: {
      updateServerToken: (state, action) => {
        state.serverToken = action.payload.serverToken;
      },
    },
  });
  export const {updateServerToken } = serverSlice.actions;
  export default serverSlice.reducer;
  