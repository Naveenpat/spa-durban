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
    // Get Inventory by Purchase Order Id
getInventoryByPurchaseOrderId: builder.query({
  query: (purchaseOrderId) => {
    return {
      url: `/inventory/by-purchase-order/${purchaseOrderId}`,
      method: 'GET',
    };
  },
  // providesTags: ['inventory'],
}),
updateInventory: builder.mutation({
  query: (body) => ({
    url: `/inventory`, // no inventoryId here
    method: 'PUT',
    body, // { inventoryData: [...] }
  }),
  // invalidatesTags: ['Inventory'],
}),
  }),
});

export const { useGetInventoriesQuery, useAddInventoryMutation,useGetInventoryByPurchaseOrderIdQuery,useUpdateInventoryMutation } = inventoryApi;
