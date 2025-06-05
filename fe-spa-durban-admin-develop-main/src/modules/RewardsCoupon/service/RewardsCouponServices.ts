import apiSlice from 'src/services/ApiSlice';

export const rewardsCouponApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRewardsCoupons: builder.query({
      providesTags: ['rewardsCoupons'],
      query: (body) => {
        return {
          url: '/rewardscoupon/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getRewardsCoupon: builder.query({
      providesTags: ['rewardsCoupons'],
      query: (rewardsCouponId) => {
        return {
          url: `/rewardscoupon/${rewardsCouponId}`,
          method: 'GET',
        };
      },
    }),
    addRewardsCoupon: builder.mutation({
      invalidatesTags: ['rewardsCoupons'],
      query: (body) => {
        return {
          url: '/rewardscoupon/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateRewardsCoupon: builder.mutation({
      invalidatesTags: ['rewardsCoupons'],
      query: ({ body, rewardsCouponId }) => {
        return {
          url: `/rewardscoupon/${rewardsCouponId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    rewardsCouponStatus: builder.mutation({
      invalidatesTags: ['rewardsCoupons'],
      query: (rewardsCouponId) => {
        return {
          url: `/rewardscoupon/toggle-status/${rewardsCouponId}`,
          method: 'PUT',
        };
      },
    }),
    deleteRewardsCoupon: builder.mutation({
      invalidatesTags: ['rewardsCoupons'],
      query: (rewardsCouponId) => {
        return {
          url: `/rewardscoupon/${rewardsCouponId}`,
          method: 'DELETE',
        };
      },
    }),
  }),
});

export const {
  useGetRewardsCouponsQuery,
  useAddRewardsCouponMutation,
  useGetRewardsCouponQuery,
  useUpdateRewardsCouponMutation,
  useRewardsCouponStatusMutation,
  useDeleteRewardsCouponMutation,
} = rewardsCouponApi;
