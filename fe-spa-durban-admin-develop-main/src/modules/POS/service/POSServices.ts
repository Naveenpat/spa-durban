import apiSlice from 'src/services/ApiSlice';

export const posApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDrafts: builder.query({
      providesTags: ['draft'],
      query: (params) => {
        return {
          url: '/draft/pagination',
          method: 'GET',
          params,
        };
      },
    }),
    getDraftById: builder.mutation({
      invalidatesTags: ['draft'],
      query: (draftId) => {
        return {
          url: `draft/${draftId}`,
          method: 'GET',
        };
      },
    }),
    draftDelete: builder.mutation({
      invalidatesTags: ['draft'],
      query: (draftId) => {
        return {
          url: `draft/${draftId}`,
          method: 'DELETE',
        };
      },
    }),
    addInvoice: builder.mutation({
      invalidatesTags: ['invoice'],
      query: (body) => {
        return {
          url: '/invoice/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateGivenChange: builder.mutation({
      invalidatesTags: ['invoice'],
      query: (body) => {
        return {
          url: `/invoice/update-given-change`,
          method: 'PATCH',
          body,
        };
      },
    }),
    addDraft: builder.mutation({
      invalidatesTags: ['draft'],
      query: (body) => {
        return {
          url: '/draft/add',
          method: 'POST',
          body,
        };
      },
    }),
    getGivenChangeSum: builder.query({
  providesTags: ['register'],
  query: (outletId) => ({
    url: `register/given-change/${outletId}`,
    method: 'GET',
  }),
}),

    previewInvoice: builder.mutation({
      query: (body) => {
        return {
          url: '/invoice/preview',
          method: 'POST',
          body,
        };
      },
    }),
  }),
});

export const {
  useAddInvoiceMutation,
  usePreviewInvoiceMutation,
  useAddDraftMutation,
  useGetDraftsQuery,
  useGetDraftByIdMutation,
  useDraftDeleteMutation,
  useUpdateGivenChangeMutation,
} = posApi;
