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
    exportCustomerExcel: builder.query<Blob, void>({
      query: () => ({
        url: '/customer/new/export-csv',
        method: 'GET',
        responseHandler: (response) => response.blob(), // this is key
        responseType: 'blob',
      }),
    }),


    importCustomerExcel: builder.mutation({
      invalidatesTags: ['customer'],
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);

        return {
          url: 'customer/new/import-csv',
          method: 'POST',
          body: formData,
        };
      },
    })
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useAddCustomerMutation,
  useCustomerStatusMutation,
  useExportCustomerExcelQuery,
  useImportCustomerExcelMutation
} = customerApi;
