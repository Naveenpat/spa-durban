import apiSlice from 'src/services/ApiSlice';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRecentInvoices: builder.query({
      query: () => {
        return {
          url: '/dashboard/recent-invoice',
          method: 'GET',
        };
      },
    }),
    getMonthlyReport: builder.query({
      query: (params) => {
        return {
          url: '/dashboard/get-monthly-report',
          method: 'GET',
          params,
        };
      },
    }),
    getRecentBuyers: builder.query({
      query: () => {
        return {
          url: '/dashboard/recent-buyers',
          method: 'GET',
        };
      },
    }),
    getCounts: builder.query({
      query: () => {
        return {
          url: '/dashboard/counts',
          method: 'GET',
        };
      },
    }),
  }),
});

export const {
  useGetRecentInvoicesQuery,
  useGetRecentBuyersQuery,
  useGetCountsQuery,
  useGetMonthlyReportQuery,
} = dashboardApi;
