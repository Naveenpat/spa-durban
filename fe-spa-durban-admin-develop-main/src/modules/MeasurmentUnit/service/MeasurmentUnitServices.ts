import apiSlice from 'src/services/ApiSlice';

export const measurmentUnitApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMeasurementUnits: builder.query({
      providesTags: ['measurementUnits'],
      query: (body) => {
        return {
          url: '/measurement-unit/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getMeasurementUnit: builder.query({
      providesTags: ['measurementUnits'],
      query: (measurementUnitId) => {
        return {
          url: `/measurement-unit/${measurementUnitId}`,
          method: 'GET',
        };
      },
    }),
    addMeasurementUnit: builder.mutation({
      invalidatesTags: ['measurementUnits'],
      query: (body) => {
        return {
          url: '/measurement-unit/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateMeasurementUnit: builder.mutation({
      invalidatesTags: ['measurementUnits'],
      query: ({ body, measurementUnitId }) => {
        return {
          url: `/measurement-unit/${measurementUnitId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    deleteMeasurementUnit: builder.mutation({
      invalidatesTags: ['measurementUnits'],
      query: (measurementUnitId) => {
        return {
          url: `/measurement-unit/${measurementUnitId}`,
          method: 'DELETE',
        };
      },
    }),
  }),
});

export const {
  useGetMeasurementUnitsQuery,
  useAddMeasurementUnitMutation,
  useGetMeasurementUnitQuery,
  useUpdateMeasurementUnitMutation,
  useDeleteMeasurementUnitMutation,
} = measurmentUnitApi;
