import apiSlice from 'src/services/ApiSlice';

export const loyaltyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLoyaltys: builder.query({
      providesTags: ['loyaltys'],
      query: (body) => {
        return {
          url: '/loyalty/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getLoyalty: builder.query({
      providesTags: ['loyaltys'],
      query: (loyaltyId) => {
        return {
          url: `/loyalty/${loyaltyId}`,
          method: 'GET',
        };
      },
    }),
    addLoyalty: builder.mutation({
      invalidatesTags: ['loyaltys'],
      query: (body) => {
        return {
          url: '/loyalty/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateLoyalty: builder.mutation({
      invalidatesTags: ['loyaltys'],
      query: ({ body, loyaltyId }) => {
        return {
          url: `/loyalty/${loyaltyId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    loyaltyStatus: builder.mutation({
      invalidatesTags: ['loyaltys'],
      query: (loyaltyId) => {
        return {
          url: `/loyalty/toggle-status/${loyaltyId}`,
          method: 'PUT',
        };
      },
    }),
  }),
});

export const {
  useGetLoyaltysQuery,
  useAddLoyaltyMutation,
  useGetLoyaltyQuery,
  useUpdateLoyaltyMutation,
  useLoyaltyStatusMutation,
} = loyaltyApi;
