import apiSlice from 'src/services/ApiSlice';
import { CategoryFormValues } from '../models/Category.model';

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Categories
    getCategories: builder.query({
      providesTags: ['categories'],
      query: (body) => {
        return {
          url: '/category/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),

    // Add Category
    addCategory: builder.mutation({
      invalidatesTags: ['categories'],
      query: (body) => {
        return {
          url: '/category/add',
          method: 'POST',
          body,
        };
      },
    }),

    //  Category by id
    getCategoryById: builder.query({
      providesTags: ['categories'],
      query: (categoryId) => {
        return {
          url: `/category/${categoryId}`,
          method: 'GET',
        };
      },
    }),

    // Edit Category
    updateCategory: builder.mutation({
      invalidatesTags: ['categories'],
      query: ({
        categoryId,
        body,
      }: {
        categoryId: string;
        body: CategoryFormValues;
      }) => {
        return {
          url: `/category/${categoryId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    // delete Categroy
    deleteCategory: builder.mutation({
      invalidatesTags: ['categories'],
      query: (categoryId) => {
        return {
          url: `/category/${categoryId}`,
          method: 'DELETE',
        };
      },
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
