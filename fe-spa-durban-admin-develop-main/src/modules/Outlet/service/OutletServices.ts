import apiSlice from 'src/services/ApiSlice';

export const outletApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOutlets: builder.query({
      providesTags: ['outlets'],
      query: (body) => {
        return {
          url: '/outlet/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getOutlet: builder.query({
      providesTags: ['outlets'],
      query: (outletId) => {
        return {
          url: `/outlet/${outletId}`,
          method: 'GET',
        };
      },
    }),
    getOutletsByCompanyId: builder.query({
      providesTags: ['outlets'],
      query: (companyId) => {
        return {
          url: `/outlet/get-componys/${companyId}`,
          method: 'GET',
        };
      },
    }),
    addOutlet: builder.mutation({
      invalidatesTags: ['outlets'],
      query: (body) => {
        return {
          url: '/outlet/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateOutlet: builder.mutation({
      invalidatesTags: ['outlets'],
      query: ({ body, outletId }) => {
        return {
          url: `/outlet/${outletId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    deleteOutlet: builder.mutation({
      invalidatesTags: ['outlets'],
      query: (outletId) => {
        return {
          url: `/outlet/${outletId}`,
          method: 'DELETE',
        };
      },
    }),
    outletStatus: builder.mutation({
      invalidatesTags: ['outlets'],
      query: (outletId) => {
        return {
          url: `/outlet/toggle-status/${outletId}`,
          method: 'PUT',
        };
      },
    }),
    getSalesReportByOutlet: builder.query({
      query: ({ outletId, startDate, endDate, page = 1, limit = 10, sortBy, sortOrder }) => {
        const params = new URLSearchParams({
          outletId,
          startDate,
          endDate,
          page: String(page),
          limit: String(limit),
          sortBy,
          sortOrder
        });

        return {
          url: `/analytics/new/outlet/sales-report?${params.toString()}`,
          method: 'GET',
        };
      },
    }),
    GetSalesChartDataReportByOutlet: builder.query({
      query: ({ outletId, startDate, endDate, page = 1, limit = 10 }) => {
        const params = new URLSearchParams({
          outletId,
          startDate,
          endDate,
          page: String(page),
          limit: String(limit)
        });

        return {
          url: `/analytics/new/outlet/sales-chart-data?${params.toString()}`,
          method: 'GET',
        };
      },
    }),
    getSalesReportByCustomer: builder.query({
      query: ({ customerId, startDate, endDate, page = 1, limit = 10, sortBy, sortOrder }) => {
        const params = new URLSearchParams({
          customerId,
          startDate,
          endDate,
          page: String(page),
          limit: String(limit),
          sortBy,
          sortOrder
        });

        return {
          url: `/analytics/new/customer/sales-report?${params.toString()}`,
          method: 'GET',
        };
      },
    }),
    getSalesChartDataReportByCustomer: builder.query({
      query: ({ customerId, startDate, endDate, page = 1, limit = 10 }) => {
        const params = new URLSearchParams({
          customerId,
          startDate,
          endDate,
          page: String(page),
          limit: String(limit)
        });

        return {
          url: `/analytics/new/customer/sales-chart-data?${params.toString()}`,
          method: 'GET',
        };
      },
    }),
    getSalesByOutletCsvData: builder.query({
      query: (outletId) => ({
        url: '/analytics/new/outlet/sales-csv-data',
        method: 'POST',
        body:outletId, // sends { outletId: '...' } in JSON body
        responseHandler: (response) => response.blob(), // for CSV
      }),
    }),

  }),
});

export const {
  useGetOutletsQuery,
  useGetOutletQuery,
  useAddOutletMutation,
  useUpdateOutletMutation,
  useDeleteOutletMutation,
  useOutletStatusMutation,
  useGetOutletsByCompanyIdQuery,
  useGetSalesReportByOutletQuery,
  useGetSalesReportByCustomerQuery,
  useGetSalesChartDataReportByOutletQuery,
  useGetSalesChartDataReportByCustomerQuery,
  useGetSalesByOutletCsvDataQuery
} = outletApi;
