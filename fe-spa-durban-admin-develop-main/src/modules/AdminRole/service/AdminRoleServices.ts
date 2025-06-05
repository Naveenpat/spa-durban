import apiSlice from '../../../services/ApiSlice';

export const adminRoleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET
    getAdminRoles: builder.query({
      providesTags: ['admin-roles'],
      query: (body) => {
        return {
          url: '/role/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),

    // GET Roles Of an Admin
    getRolesOfAnAdmin: builder.query({
      providesTags: ['admin-roles'],
      query: () => {
        return {
          url: '/employee/get-employee-roles',
          method: 'GET',
        };
      },
    }),

    // ADD
    addAdminRole: builder.mutation({
      invalidatesTags: ['admin-roles'],
      query: (body) => {
        return {
          url: '/role/add',
          method: 'POST',
          body,
        };
      },
    }),
    // Update Admin role
    updateAdminRole: builder.mutation({
      invalidatesTags: ['admin-role', 'admin-roles'],
      query: ({ body, adminRoleId }) => {
        return {
          url: `/role/${adminRoleId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    // Get Admin Role
    getAdminRoleById: builder.query({
      providesTags: ['admin-role'],
      query: (adminRoleId) => {
        return {
          url: `/role/${adminRoleId}`,
          method: 'GET',
        };
      },
    }),
    // Get Admin Role
    deleteRole: builder.mutation({
      invalidatesTags: ['admin-roles'],
      query: (adminRoleId) => {
        return {
          url: `/role/${adminRoleId}`,
          method: 'DELETE',
        };
      },
    }),
  }),
});

export const {
  useGetAdminRolesQuery,
  useAddAdminRoleMutation,
  useGetRolesOfAnAdminQuery,
  useUpdateAdminRoleMutation,
  useGetAdminRoleByIdQuery,
  useDeleteRoleMutation,
} = adminRoleApi;
