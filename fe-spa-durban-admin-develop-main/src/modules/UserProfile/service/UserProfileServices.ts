import apiSlice from 'src/services/ApiSlice';

export const userProfileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserById: builder.query({
      query: (userId) => {
        return {
          url: `/user/${userId}`,
          method: 'GET',
        };
      },
    }),
  }),
});

export const { useGetUserByIdQuery } = userProfileApi;
