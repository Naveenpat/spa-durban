import apiSlice from 'src/services/ApiSlice';

export const topCustomerAndProductsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTopCustomers: builder.query({
      query: (body) => {
        return {
          url: '/analytics/top-customer',
          method: 'GET',
          params: body,
        };
      },
    }),
    getTopProducts: builder.query({
      query: (body) => {
        return {
          url: '/analytics/top-items',
          method: 'GET',
          params: body,
        };
      },
    }),
  }),
});

export const { useGetTopCustomersQuery, useGetTopProductsQuery } =
  topCustomerAndProductsApi;
