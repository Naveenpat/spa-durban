import apiSlice from 'src/services/ApiSlice';

export const serviceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Services
    getServices: builder.query({
      providesTags: ['services'],
      query: (body) => {
        return {
          url: '/service/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),

    // Add Service
    addService: builder.mutation({
      invalidatesTags: ['services'],
      query: (body) => {
        return {
          url: '/service/add',
          method: 'POST',
          body,
        };
      },
    }),

    // Update Service
    updateService: builder.mutation({
      invalidatesTags: ['services'],
      query: ({ serviceId, body }: { serviceId: string; body: any }) => {
        return {
          url: `/service/${serviceId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    updateServiceToTop: builder.mutation({
      invalidatesTags: ['services'],
      query: ({ serviceId, body }: { serviceId: string; body: any }) => {
        return {
          url: `/service/ToTop/${serviceId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    // Get Service by Id
    getServiceById: builder.query({
      providesTags: ['services'],
      query: (serviceId) => {
        return {
          url: `/service/${serviceId}`,
          method: 'GET',
        };
      },
    }),

    serviceStatus: builder.mutation({
      invalidatesTags: ['services'],
      query: (serviceId) => {
        return {
          url: `/service/toggle-status/${serviceId}`,
          method: 'PUT',
        };
      },
    }),
  }),
});

export const {
  useGetServicesQuery,
  useAddServiceMutation,
  useUpdateServiceMutation,
  useGetServiceByIdQuery,
  useServiceStatusMutation,
  useUpdateServiceToTopMutation,
} = serviceApi;
