import apiSlice from 'src/services/ApiSlice';

export const invoicesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query({
      providesTags: ['invoice'],
      query: (body) => {
        return {
          url: '/invoice/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getInvoice: builder.query({
      providesTags: ['invoice'],
      query: (invoiceId) => {
        return {
          url: `/invoice/${invoiceId}`,
          method: 'GET',
        };
      },
    }),
    sendPdfViaEmail: builder.mutation({
      query: ({ body, invoiceId }) => {
        return {
          url: `/email/${invoiceId}`,
          method: 'POST',
          body,
        };
      },
    }),
    updateInvoice: builder.mutation({
      invalidatesTags: ['invoice'],
      query: ({ invoiceId, body }) => ({
        url: `/invoice/${invoiceId}`,
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useSendPdfViaEmailMutation,
  useUpdateInvoiceMutation,
} = invoicesApi;
