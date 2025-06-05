import apiSlice from 'src/services/ApiSlice';
import { TaxFormValues } from '../models/Tax.model';

export const taxApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Tax with pagination
    getTax: builder.query({
      providesTags: ["tax"],
      query: (body) => {
        return {
          url: "/tax/pagination",
          method: "GET",
          params: body,
        };
      },
    }),
    // Add Tax
    addTax: builder.mutation({
      invalidatesTags: ["tax"],
      query: (body) => {
        return {
          url: "/tax/add",
          method: "POST",
          body,
        };
      },
    }),
    // GET Signle Data
    getTaxbyId: builder.query({
      providesTags: ["tax"],
      query: (taxId) => {
        return {
          url: `tax/${taxId}`,
          method: "GET",
        };
      },
    }),
    // update Tax
    updateTax: builder.mutation({
      invalidatesTags: ["tax"],
      query: ({
        taxId,
        body,
      }: {
        taxId: string;
        body: TaxFormValues;
      }) => {
        return {
          url: `/tax/${taxId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    // Delete Tax
    deleteTax: builder.mutation({
      invalidatesTags: ["tax"],
      query: (taxId) => {
        return {
          url: `tax/${taxId}`,
          method: "DELETE",
        };
      },
    }),
  }),
});

export const { 
  useGetTaxQuery,
  useAddTaxMutation,
  useGetTaxbyIdQuery,
  useUpdateTaxMutation,
  useDeleteTaxMutation
  } = taxApi;
