import apiSlice from 'src/services/ApiSlice';
import { BrandFormValues } from '../models/Brand.model';

export const brandApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Brands
    getBrands: builder.query({
      providesTags: ['brands'],
      query: (body) => {
        return {
          url: '/brand/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),

    // Add Brand
    addBrand: builder.mutation({
      invalidatesTags: ['brands'],
      query: (body) => {
        return {
          url: '/brand/add',
          method: 'POST',
          body,
        };
      },
    }),

    // Get Brand By Id
    getBrandById: builder.query({
      providesTags: ['brands'],
      query: (brandId) => {
        return {
          url: `/brand/${brandId}`,
          method: 'GET',
        };
      },
    }),

    // Edit Brand
    updateBrand: builder.mutation({
      invalidatesTags: ['brands'],
      query: ({
        brandId,
        body,
      }: {
        brandId: string;
        body: BrandFormValues;
      }) => {
        return {
          url: `/brand/${brandId}`,
          method: 'PUT',
          body,
        };
      },
    }),

    // Delete Brand By Id
    deleteBrand: builder.mutation({
      invalidatesTags: ['brands'],
      query: (brandId) => {
        return {
          url: `/brand/${brandId}`,
          method: 'DELETE',
        };
      },
    }),
  }),
});

// eslint-disable-next-line no-empty-pattern
export const {
  useGetBrandsQuery,
  useGetBrandByIdQuery,
  useAddBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi;
