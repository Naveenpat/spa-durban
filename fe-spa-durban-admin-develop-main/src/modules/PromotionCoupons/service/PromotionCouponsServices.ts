import apiSlice from 'src/services/ApiSlice';

export const promotionCouponApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPromotionCoupons: builder.query({
      providesTags: ['promotionCoupons'],
      query: (body) => {
        return {
          url: '/promotioncoupon/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getPromotionCoupon: builder.query({
      providesTags: ['promotionCoupons'],
      query: (promotionCouponId) => {
        return {
          url: `/promotioncoupon/${promotionCouponId}`,
          method: 'GET',
        };
      },
    }),
    addPromotionCoupon: builder.mutation({
      invalidatesTags: ['promotionCoupons'],
      query: (body) => {
        return {
          url: '/promotioncoupon/add',
          method: 'POST',
          body,
        };
      },
    }),
    updatePromotionCoupon: builder.mutation({
      invalidatesTags: ['promotionCoupons'],
      query: ({ body, promotionCouponId }) => {
        return {
          url: `/promotioncoupon/${promotionCouponId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    promotionCouponStatus: builder.mutation({
      invalidatesTags: ['promotionCoupons'],
      query: (promotionCouponId) => {
        return {
          url: `/promotioncoupon/toggle-status/${promotionCouponId}`,
          method: 'PUT',
        };
      },
    }),
    deletePromotionCoupon: builder.mutation({
      invalidatesTags: ['promotionCoupons'],
      query: (promotionCouponId) => {
        return {
          url: `/promotioncoupon/${promotionCouponId}`,
          method: 'DELETE',
        };
      },
    }),
  }),
});

export const {
  useGetPromotionCouponsQuery,
  useAddPromotionCouponMutation,
  useGetPromotionCouponQuery,
  useUpdatePromotionCouponMutation,
  usePromotionCouponStatusMutation,
  useDeletePromotionCouponMutation,
} = promotionCouponApi;
