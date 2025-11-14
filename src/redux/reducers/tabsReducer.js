import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 1
};

  export const tabsSlice = createSlice({
    name: "tabs",
    initialState,
    reducers: {
      toggleActiveTab: (state,action) =>{
        state.activeTab = action.payload.activeTab
      }
    },
  });
  export const {toggleActiveTab } = tabsSlice.actions

  export default tabsSlice.reducer