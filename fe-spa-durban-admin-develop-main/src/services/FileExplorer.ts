import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { FILE_MANAGER_URL } from '../utils/constants';

export const fileExplorerSlice = createApi({
  reducerPath: 'fileExplorerSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: `${FILE_MANAGER_URL}`,
  }),
  endpoints: (builder) => ({
    // ADD
    addFileUrl: builder.mutation({
      query: (body) => ({
        url: '/upload',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useAddFileUrlMutation } = fileExplorerSlice;
