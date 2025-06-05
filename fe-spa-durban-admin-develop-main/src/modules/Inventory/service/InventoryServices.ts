import apiSlice from 'src/services/ApiSlice';

export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInventories: builder.query({
      query: (body) => {
        return {
          url: '/inventory/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),

    addInventory: builder.mutation({
      // invalidatesTags=['']
      query: (body) => {
        return {
          url: '/inventory/add',
          method: 'POST',
          body,
        };
      },
    }),
  }),
});

export const { useGetInventoriesQuery, useAddInventoryMutation } = inventoryApi;
