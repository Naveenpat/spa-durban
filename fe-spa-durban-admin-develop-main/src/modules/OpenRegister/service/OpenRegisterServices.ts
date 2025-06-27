import apiSlice from 'src/services/ApiSlice';
import { OpenRegisterFormValues } from '../models/OpenRegister.model';

export const registerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Registers with pagination
    getRegister: builder.query({
      providesTags: ['register'],
      query: (body) => {
        return {
          url: '/register/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    // Add Register
    addRegister: builder.mutation({
      invalidatesTags: ['register'],
      query: (body) => {
        return {
          url: '/register/add',
          method: 'POST',
          body,
        };
      },
    }),
    // GET Single Register Data
    getRegisterById: builder.query({
      providesTags: ['register'],
      query: (registerId) => {
        return {
          url: `register/${registerId}`,
          method: 'GET',
        };
      },
    }),
    // Update Register
    updateRegister: builder.mutation({
      invalidatesTags: ['register'],
      query: ({
        registerId,
        body,
      }: {
        registerId: string;
        body: OpenRegisterFormValues;
      }) => {
        return {
          url: `/register/${registerId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    // Delete Register
    deleteRegister: builder.mutation({
      invalidatesTags: ['register'],
      query: (registerId) => {
        return {
          url: `register/${registerId}`,
          method: 'DELETE',
        };
      },
    }),
    getRegisterByCurrentDate: builder.query({
      providesTags: ['register'],
      query: (outletId) => {
        return {
          url: `register/currentDate/${outletId}`,
          method: 'GET',
        };
      },
    }),
    getRegisterByDate: builder.query({
      providesTags: ['register'],
      query: ({ outletId, date }) => ({
        url: `register/previous-date/${outletId}?date=${date}`,
        method: 'GET',
      }),
    }),
    addCloseRegister: builder.mutation({
      invalidatesTags: ['register'],
      query: (body) => {
        return {
          url: '/register/addClose',
          method: 'POST',
          body,
        };
      },
    }),
    sendPdfBYEmail: builder.mutation({
      query: ({ body, outletId }) => ({
        url: `/email/send/${outletId}`,
        method: 'POST',
        body,
      }),
    }),

  }),
});

export const {
  useGetRegisterQuery,
  useAddRegisterMutation,
  useGetRegisterByIdQuery,
  useUpdateRegisterMutation,
  useDeleteRegisterMutation,
  useGetRegisterByCurrentDateQuery,
  useAddCloseRegisterMutation,
  useGetRegisterByDateQuery,
  useSendPdfBYEmailMutation
} = registerApi;
