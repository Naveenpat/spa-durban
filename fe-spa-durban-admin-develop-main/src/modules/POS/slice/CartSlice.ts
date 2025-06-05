import { Slice, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { SliceStateType } from 'src/models/SliceStateType';

const initialState: SliceStateType = {
  isOpenAddDialog: false,
  isOpenEditDialog: false,
  isOpenDraftListDialog: false,
  isOpenCustomerDialog: false,
  previewData: [],
  previewNewCustomerId: {},
};

const cartSlice: Slice<SliceStateType> = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setIsOpenDraftListDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenDraftListDialog = action.payload;
    },
    setIsOpenCustomerDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenCustomerDialog = action.payload;
    },
    setIsOpenAddDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenAddDialog = action.payload;
    },
    setIsOpenEditDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenEditDialog = action.payload;
    },
    setPreviewData: (state, action: PayloadAction<any>) => {
      state.previewData = action.payload;
    },
    setPreviewNewCustomerId: (state, action: PayloadAction<any>) => {
      state.previewNewCustomerId = action.payload;
    },
  },
});

export const {
  setIsOpenAddDialog,
  setIsOpenEditDialog,
  setIsOpenDraftListDialog,
  setIsOpenCustomerDialog,
  setPreviewData,
  setPreviewNewCustomerId,
} = cartSlice.actions;
export default cartSlice.reducer;
