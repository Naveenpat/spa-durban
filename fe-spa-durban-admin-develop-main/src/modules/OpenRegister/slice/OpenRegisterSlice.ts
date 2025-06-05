import { Slice, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { SliceStateType } from 'src/models/SliceStateType';

const initialState: SliceStateType = {
  isOpenAddDialog: false,
  isOpenEditDialog: false,
  isCloseAddDialog: false,
};

const registerSlice: Slice<SliceStateType> = createSlice({
  name: 'register',
  initialState,
  reducers: {
    setIsOpenAddDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenAddDialog = action.payload;
    },
    setIsOpenEditDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenEditDialog = action.payload;
    },
    setIsCloseAddDialog: (state, action: PayloadAction<boolean>) => {
      state.isCloseAddDialog = action.payload;
    },
  },
});

export const { setIsOpenAddDialog, setIsOpenEditDialog, setIsCloseAddDialog } =
  registerSlice.actions;
export default registerSlice.reducer;
