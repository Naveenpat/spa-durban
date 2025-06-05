import apiSlice from 'src/services/ApiSlice';

export const supplierApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSupplierListing: builder.query({
      providesTags: ['supplier'],
      query: (body) => {
        return {
          url: '/supplier/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getSupplier: builder.query({
      providesTags: ['supplier'],
      query: (supplierId) => {
        return {
          url: `/supplier/${supplierId}`,
          method: 'GET',
        };
      },
    }),
    addSupplier: builder.mutation({
      invalidatesTags: ['supplier'],
      query: (body) => {
        return {
          url: '/supplier/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateSupplier: builder.mutation({
      invalidatesTags: ['supplier'],
      query: ({ body, supllierId }) => {
        return {
          url: `/supplier/${supllierId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    deleteSupplier: builder.mutation({
      invalidatesTags: ['supplier'],
      query: (supplierId) => {
        return {
          url: `/supplier/${supplierId}`,
          method: 'DELETE',
        };
      },
    }),
    supplierStatus: builder.mutation({
      invalidatesTags: ['supplier'],
      query: (supplierId) => {
        return {
          url: `/supplier/toggle-status/${supplierId}`,
          method: 'PUT',
        };
      },
    }),
  }),
});

export const {
  useGetSupplierListingQuery,
  useAddSupplierMutation,
  useGetSupplierQuery,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useSupplierStatusMutation,
} = supplierApi;
