import apiSlice from 'src/services/ApiSlice';

export const cashBackApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCashBacks: builder.query({
      providesTags: ['cashBacks'],
      query: (body) => {
        return {
          url: '/cashback/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getCashBack: builder.query({
      providesTags: ['cashBacks'],
      query: (cashBackId) => {
        return {
          url: `/cashback/${cashBackId}`,
          method: 'GET',
        };
      },
    }),
    addCashBack: builder.mutation({
      invalidatesTags: ['cashBacks'],
      query: (body) => {
        return {
          url: '/cashback/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateCashBack: builder.mutation({
      invalidatesTags: ['cashBacks'],
      query: ({ body, cashBackId }) => {
        return {
          url: `/cashback/${cashBackId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    cashBackStatus: builder.mutation({
      invalidatesTags: ['cashBacks'],
      query: (cashBackId) => {
        return {
          url: `/cashback/toggle-status/${cashBackId}`,
          method: 'PUT',
        };
      },
    }),
    deleteCashBack: builder.mutation({
      invalidatesTags: ['cashBacks'],
      query: (cashBackId) => {
        return {
          url: `/cashback/${cashBackId}`,
          method: 'DELETE',
        };
      },
    }),
  }),
});

export const {
  useGetCashBacksQuery,
  useAddCashBackMutation,
  useGetCashBackQuery,
  useUpdateCashBackMutation,
  useCashBackStatusMutation,
  useDeleteCashBackMutation,
} = cashBackApi;
