import { Slice, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type SideNavLayoutSliceStateType = {
  isNavBarExpanded: boolean;
  customized: boolean;
};

const initialState: SideNavLayoutSliceStateType = {
  isNavBarExpanded: true,
  customized: false,
};

const sideNavLayoutSlice: Slice<SideNavLayoutSliceStateType> = createSlice({
  name: 'sideNavLayoutSlice',
  initialState,
  reducers: {
    setIsNavBarExpanded: (state, action: PayloadAction<boolean>) => {
      state.isNavBarExpanded = action.payload;
    },
    setFieldCustomized: (state, action: PayloadAction<boolean>) => {
      state.customized = action.payload;
    },
  },
});

export const { setIsNavBarExpanded, setFieldCustomized } =
  sideNavLayoutSlice.actions;
export default sideNavLayoutSlice.reducer;
