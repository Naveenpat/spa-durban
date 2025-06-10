import apiSlice from '../../../services/ApiSlice';

export const companyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET companies with pagination / filters
   getCompanies: builder.query({
  providesTags: ['companies'],
  query: (body) => ({
    url: '/company/pagination',
    method: 'GET',
    params:body // ✅ move body to params
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
  }),
});

export const {
  useGetCompaniesQuery,
  useGetCompanyByIdQuery,
  useAddCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useToggleCompanyStatusMutation,
} = companyApi;
