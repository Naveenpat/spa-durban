import apiSlice from 'src/services/ApiSlice';

export const giftCardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGiftCards: builder.query({
      providesTags: ['gift-card'],
      query: (body) => {
        return {
          url: '/gift-card/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getGiftCard: builder.query({
      providesTags: ['gift-card'],
      query: (giftCardId) => {
        return {
          url: `/gift-card/${giftCardId}`,
          method: 'GET',
        };
      },
    }),
    addGiftCard: builder.mutation({
      invalidatesTags: ['gift-card'],
      query: (body) => {
        return {
          url: '/gift-card/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateGiftCard: builder.mutation({
      invalidatesTags: ['gift-card'],
      query: ({ body, giftCardId }) => {
        return {
          url: `/gift-card/${giftCardId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    deleteGiftCard: builder.mutation({
      invalidatesTags: ['gift-card'],
      query: (giftCardId) => {
        return {
          url: `/gift-card/${giftCardId}`,
          method: 'DELETE',
        };
      },
    }),
    giftCardStatus: builder.mutation({
      invalidatesTags: ['gift-card'],
      query: (giftCardId) => {
        return {
          url: `/gift-card/toggle-status/${giftCardId}`,
          method: 'PUT',
        };
      },
    }),
  }),
});

export const {
  useGetGiftCardsQuery,
  useGetGiftCardQuery,
  useAddGiftCardMutation,
  useDeleteGiftCardMutation,
  useUpdateGiftCardMutation,
  useGiftCardStatusMutation,
} = giftCardApi;
