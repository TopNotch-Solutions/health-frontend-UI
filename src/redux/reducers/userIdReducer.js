import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: null,
};

  export const userIdSlice = createSlice({
    name: "userId",
    initialState,
    reducers: {
        setUserId: (state, action) => {
            state.userId = action.payload;
        },
        clearUserId: (state) => {
          state.userId = null;
      },
    },
  });
  export const { setUserId, clearUserId } = userIdSlice.actions

  export default userIdSlice.reducer