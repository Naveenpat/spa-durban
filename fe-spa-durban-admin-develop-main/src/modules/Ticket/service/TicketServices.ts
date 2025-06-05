import apiSlice from 'src/services/ApiSlice';

export const ticketApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query({
      providesTags: ['ticket'],
      query: (body) => {
        return {
          url: '/ticket/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getTicket: builder.query({
      providesTags: ['ticket'],
      query: (ticketId) => {
        return {
          url: `/ticket/${ticketId}`,
          method: 'GET',
        };
      },
    }),
    addTicket: builder.mutation({
      invalidatesTags: ['ticket'],
      query: (body) => {
        return {
          url: '/ticket/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateTicket: builder.mutation({
      invalidatesTags: ['ticket'],
      query: ({ body, ticketId }) => {
        return {
          url: `/ticket/${ticketId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    deleteTicket: builder.mutation({
      invalidatesTags: ['ticket'],
      query: (ticketId) => {
        return {
          url: `/ticket/${ticketId}`,
          method: 'DELETE',
        };
      },
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useAddTicketMutation,
  useUpdateTicketMutation,
  useGetTicketQuery,
  useDeleteTicketMutation,
} = ticketApi;
