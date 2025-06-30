import apiSlice from '../../../services/ApiSlice';

export const companyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET companies with pagination / filters
    getCompanies: builder.query({
      providesTags: ['companies'],
      query: (body) => ({
        url: '/company/pagination',
        method: 'GET',
        params: body // ✅ move body to params
      }),
    }),


    // GET company by ID
    getCompanyById: builder.query({
      providesTags: ['company'],
      query: (companyId) => ({
        url: `/company/${companyId}`,
        method: 'GET',
      }),
    }),

    // ADD company
    addCompany: builder.mutation({
      invalidatesTags: ['companies'],
      query: (body) => ({
        url: '/company/add',
        method: 'POST',
        body,
      }),
    }),

    // UPDATE company by ID
    updateCompany: builder.mutation({
      invalidatesTags: ['company', 'companies'],
      query: ({ companyId, body }) => ({
        url: `/company/${companyId}`,
        method: 'PUT',
        body,
      }),
    }),

    // DELETE company by ID
    deleteCompany: builder.mutation({
      invalidatesTags: ['companies'],
      query: (companyId) => ({
        url: `/company/${companyId}`,
        method: 'DELETE',
      }),
    }),

    // TOGGLE company status (if you have a separate endpoint)
    toggleCompanyStatus: builder.mutation({
      invalidatesTags: ['company', 'companies'],
      query: (companyId) => ({
        url: `/company/toggle-status/${companyId}`,
        method: 'PATCH',
      }),
    }),
    getCompanySalesReportPaginated: builder.query({
      query: ({ companyId, outletId, startDate, endDate, page = 1, limit = 10, sortBy, sortOrder }) => {
        const params = new URLSearchParams({
          companyId,
          outletId,
          startDate,
          endDate,
          page: String(page),
          limit: String(limit),
          sortBy,
          sortOrder
        });

        return {
          url: `/company/company-sales-report/pagination?${params.toString()}`,
          method: 'GET',
        };
      },
    }),
    getCompanySalesSummary: builder.query({
      providesTags: ['company'],
      query: (companyId) => ({
        url: `/company/${companyId}/sales-summary`,
        method: 'GET',
      }),
    }),
    // getCompanySalesChartData: builder.query({
    //   providesTags: ['company'],
    //   query: (companyId) => ({
    //     url: `/company/${companyId}/sales-chart-data`,
    //     method: 'GET',
    //   }),
    // }),
    getCompanySalesChartData: builder.query({
      providesTags: ['company'],
      query: ({ companyId, outletId, startDate, endDate, reportDuration }) => {
        const params = new URLSearchParams();

        if (outletId) params.append('outletId', outletId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (reportDuration) params.append('reportDuration', reportDuration);

        return {
          url: `/company/${companyId}/sales-chart-data?${params.toString()}`,
          method: 'GET',
        };
      },
    }),


  }),
});

export const {
  useGetCompaniesQuery,
  useGetCompanyByIdQuery,
  useAddCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useToggleCompanyStatusMutation,
  useGetCompanySalesReportPaginatedQuery,
  useGetCompanySalesSummaryQuery,
  useGetCompanySalesChartDataQuery
} = companyApi;
