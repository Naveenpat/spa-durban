import apiSlice from 'src/services/ApiSlice';

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Product By Barcode

    getProductByBarcode: builder.mutation({
      query: (barcode) => {
        return {
          url: `/product/${barcode}/details`,
          method: 'GET',
        };
      },
    }),

    // GET Products on search
    getProducts: builder.query({
      providesTags: ['products'],
      query: (body) => {
        return {
          url: '/product/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),

    getProduct: builder.query({
      providesTags: ['products'],
      query: (productId) => {
        return {
          url: `/product/${productId}`,
          method: 'GET',
        };
      },
    }),
    addProduct: builder.mutation({
      invalidatesTags: ['products'],
      query: (body) => {
        return {
          url: '/product/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateProduct: builder.mutation({
      invalidatesTags: ['products'],
      query: ({ body, productId }) => {
        return {
          url: `/product/${productId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    deleteProduct: builder.mutation({
      invalidatesTags: ['products'],
      query: (productId) => {
        return {
          url: `/product/${productId}`,
          method: 'DELETE',
        };
      },
    }),

    // Get Items
    getItems: builder.query({
      query: (body) => {
        return {
          url: '/product/service-search',
          method: 'GET',
          params: body,
        };
      },
    }),
    getItemsAll: builder.query({
      query: (body) => {
        return {
          url: '/product/service-search-all',
          method: 'GET',
          params: body,
        };
      },
    }),
    productStatus: builder.mutation({
      invalidatesTags: ['products'],
      query: (productId) => {
        return {
          url: `/product/toggle-status/${productId}`,
          method: 'PUT',
        };
      },
    }),
    addFileUrl: builder.mutation({
      query: (body) => ({
        url: '/product/upload',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetProductByBarcodeMutation,
  useGetProductsQuery,
  useAddProductMutation,
  useGetProductQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetItemsQuery,
  useGetItemsAllQuery,
  useProductStatusMutation,
  useAddFileUrlMutation
} = productApi;
