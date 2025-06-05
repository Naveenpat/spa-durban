import apiSlice from 'src/services/ApiSlice';

export const customerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      providesTags: ['customer'],
      query: (body) => {
        return {
          url: '/customer/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getCustomer: builder.query({
      providesTags: ['customer'],
      query: (customerId) => {
        return {
          url: `/customer/${customerId}`,
          method: 'GET',
        };
      },
    }),
    addCustomer: builder.mutation({
      invalidatesTags: ['customer'],
      query: (body) => {
        return {
          url: '/customer/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateCustomer: builder.mutation({
      invalidatesTags: ['customer'],
      query: ({ body, customerId }) => {
        return {
          url: `/customer/${customerId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    deleteCustomer: builder.mutation({
      invalidatesTags: ['customer'],
      query: (customerId) => {
        return {
          url: `/customer/${customerId}`,
          method: 'DELETE',
        };
      },
    }),
    customerStatus: builder.mutation({
      invalidatesTags: ['customer'],
      query: (customerId) => {
        return {
          url: `/customer/toggle-status/${customerId}`,
          method: 'PUT',
        };
      },
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useAddCustomerMutation,
  useCustomerStatusMutation,
} = customerApi;
