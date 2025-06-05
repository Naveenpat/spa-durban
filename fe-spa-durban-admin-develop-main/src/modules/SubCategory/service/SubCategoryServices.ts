import apiSlice from 'src/services/ApiSlice';

export const subCategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get sub Categories
    getSubCategories: builder.query({
      providesTags: ['sub-categories'],
      query: (body) => {
        return {
          url: '/subcategory/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),

    // Add sub Category
    addSubCategory: builder.mutation({
      invalidatesTags: ['sub-categories'],
      query: (body) => {
        return {
          url: '/subcategory/add',
          method: 'POST',
          body,
        };
      },
    }),

    getSubCategoryById: builder.query({
      providesTags: ['sub-categories'],
      query: (subCategoryId) => {
        return {
          url: `/subcategory/${subCategoryId}`,
          method: 'GET',
        };
      },
    }),

    // Edit sub Category
    updateSubCategory: builder.mutation({
      invalidatesTags: ['sub-categories'],
      query: ({ subCategoryId, body }) => {
        return {
          url: `/subcategory/${subCategoryId}`,
          method: 'PUT',
          body,
        };
      },
    }),

    deleteSubCategory: builder.mutation({
      invalidatesTags: ['sub-categories'],
      query: (subCategoryId) => {
        return {
          url: `/subcategory/${subCategoryId}`,
          method: 'DELETE',
        };
      },
    }),
  }),
});

export const {
  useGetSubCategoriesQuery,
  useAddSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useGetSubCategoryByIdQuery,
  useDeleteSubCategoryMutation,
} = subCategoryApi;
