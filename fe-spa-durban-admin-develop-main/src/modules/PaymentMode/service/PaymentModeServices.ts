import apiSlice from 'src/services/ApiSlice';
import { PaymentModeFormValues } from '../models/PaymentMode.model';

export const paymentModeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get PayementModes with pagination
    getPaymntModes: builder.query({
      providesTags: ['payment-mode'],
      query: (body) => {
        return {
          url: '/payment-mode/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    // Add PayementMode
    addPayemntMode: builder.mutation({
      invalidatesTags: ['payment-mode'],
      query: (body) => {
        return {
          url: '/payment-mode/add',
          method: 'POST',
          body,
        };
      },
    }),
    // GET Signle Data
    getPaymentModebyId: builder.query({
      providesTags: ['payment-mode'],
      query: (paymentModeId) => {
        return {
          url: `payment-mode/${paymentModeId}`,
          method: 'GET',
        };
      },
    }),
    // update PayementMode
    updatePaymentMode: builder.mutation({
      invalidatesTags: ['payment-mode'],
      query: ({
        paymentModeId,
        body,
      }: {
        paymentModeId: string;
        body: PaymentModeFormValues;
      }) => {
        return {
          url: `/payment-mode/${paymentModeId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    // Delete PayementMode
    deletePaymentMode: builder.mutation({
      invalidatesTags: ['payment-mode'],
      query: (paymentModeId) => {
        return {
          url: `payment-mode/${paymentModeId}`,
          method: 'DELETE',
        };
      },
    }),
    paymentModeStatus: builder.mutation({
      invalidatesTags: ['payment-mode'],
      query: (paymentModeId) => {
        return {
          url: `payment-mode/toggle-status/${paymentModeId}`,
          method: 'PUT',
        };
      },
    }),
  }),
});

export const {
  useGetPaymntModesQuery,
  useAddPayemntModeMutation,
  useGetPaymentModebyIdQuery,
  useUpdatePaymentModeMutation,
  useDeletePaymentModeMutation,
  usePaymentModeStatusMutation,
} = paymentModeApi;
