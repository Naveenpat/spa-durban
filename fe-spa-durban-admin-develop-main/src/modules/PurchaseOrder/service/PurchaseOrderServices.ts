import apiSlice from 'src/services/ApiSlice';

export const purchaseOrderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Purchase Orders
    getPurchaseOrders: builder.query({
      providesTags: ['purchase-order'],
      query: (body) => {
        return {
          url: '/purchase-order/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),

    // Get Purchase Order By Id
    getPurchaseOrderbyId: builder.query({
      providesTags: ['purchase-order'],
      query: (purchaseOrderId: string) => {
        return {
          url: `/purchase-order/${purchaseOrderId}`,
          method: 'GET',
        };
      },
    }),

    // Add Purchase Order
    addPurchaseOrder: builder.mutation({
      invalidatesTags: ['purchase-order'],
      query: (body) => {
        return {
          url: '/purchase-order/add',
          method: 'POST',
          body,
        };
      },
    }),

    // Update Purchase Order
    updatePurchaseOrder: builder.mutation({
      invalidatesTags: ['purchase-order'],
      query: ({
        purchaseOrderId,
        body,
      }: {
        purchaseOrderId: string;
        body: any;
      }) => {
        return {
          url: `/purchase-order/${purchaseOrderId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    // Update Po Payment
    updatePoPayment: builder.mutation({
      invalidatesTags: ['purchase-order'],
      query: ({
        purchaseOrderId,
        body,
      }: {
        purchaseOrderId: string;
        body: any;
      }) => {
        return {
          url: `/purchase-order/po-payment/${purchaseOrderId}`,
          method: 'PUT',
          body,
        };
      },
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderbyIdQuery,
  useAddPurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useUpdatePoPaymentMutation,
} = purchaseOrderApi;
