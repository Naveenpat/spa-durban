import apiSlice from 'src/services/ApiSlice';

export const outletApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOutlets: builder.query({
      providesTags: ['outlets'],
      query: (body) => {
        return {
          url: '/outlet/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getOutlet: builder.query({
      providesTags: ['outlets'],
      query: (outletId) => {
        return {
          url: `/outlet/${outletId}`,
          method: 'GET',
        };
      },
    }),
    addOutlet: builder.mutation({
      invalidatesTags: ['outlets'],
      query: (body) => {
        return {
          url: '/outlet/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateOutlet: builder.mutation({
      invalidatesTags: ['outlets'],
      query: ({ body, outletId }) => {
        return {
          url: `/outlet/${outletId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    deleteOutlet: builder.mutation({
      invalidatesTags: ['outlets'],
      query: (outletId) => {
        return {
          url: `/outlet/${outletId}`,
          method: 'DELETE',
        };
      },
    }),
    outletStatus: builder.mutation({
      invalidatesTags: ['outlets'],
      query: (outletId) => {
        return {
          url: `/outlet/toggle-status/${outletId}`,
          method: 'PUT',
        };
      },
    }),
  }),
});

export const {
  useGetOutletsQuery,
  useGetOutletQuery,
  useAddOutletMutation,
  useUpdateOutletMutation,
  useDeleteOutletMutation,
  useOutletStatusMutation,
} = outletApi;
