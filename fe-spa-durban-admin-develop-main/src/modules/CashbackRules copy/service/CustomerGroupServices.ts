import apiSlice from 'src/services/ApiSlice';

export const customerGroupApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerGroups: builder.query({
      providesTags: ['customer-group'],
      query: (body) => {
        return {
          url: '/customer-group/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getCustomerGroup: builder.query({
      providesTags: ['customer-group'],
      query: (cashBackId) => {
        return {
          url: `/customer-group/${cashBackId}`,
          method: 'GET',
        };
      },
    }),
    addCustomerGroup: builder.mutation({
      invalidatesTags: ['customer-group'],
      query: (body) => {
        return {
          url: '/customer-group/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateCustomerGroup: builder.mutation({
      invalidatesTags: ['customer-group'],
      query: ({ body, cashBackId }) => {
        return {
          url: `/customer-group/${cashBackId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    customerGroupStatus: builder.mutation({
      invalidatesTags: ['customer-group'],
      query: (cashBackId) => {
        return {
          url: `/customer-group/toggle-status/${cashBackId}`,
          method: 'PUT',
        };
      },
    }),
    deleteCustomerGroup: builder.mutation({
      invalidatesTags: ['customer-group'],
      query: (cashBackId) => {
        return {
          url: `/customer-group/${cashBackId}`,
          method: 'DELETE',
        };
      },
    }),
  }),
});

export const {
  useGetCustomerGroupsQuery,
  useAddCustomerGroupMutation,
  useGetCustomerGroupQuery,
  useUpdateCustomerGroupMutation,
  useCustomerGroupStatusMutation,
  useDeleteCustomerGroupMutation,
} = customerGroupApi;
