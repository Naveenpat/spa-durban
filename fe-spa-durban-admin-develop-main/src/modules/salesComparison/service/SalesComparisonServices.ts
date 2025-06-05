import apiSlice from 'src/services/ApiSlice';

export const salesComparisonApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query({
      query: (body) => {
        return {
          url: '/analytics/outlet/sales-report',
          method: 'GET',
          params: body,
        };
      },
    }),
    getSalesReportDaily: builder.query({
      query: (body) => {
        return {
          url: '/analytics/outlet/sales-report-daily',
          method: 'GET',
          params: body,
        };
      },
    }),
  }),
});

export const { useGetSalesReportQuery, useGetSalesReportDailyQuery } =
  salesComparisonApi;
