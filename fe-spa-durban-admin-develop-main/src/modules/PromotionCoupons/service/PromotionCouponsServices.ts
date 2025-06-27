import apiSlice from 'src/services/ApiSlice';

type GetCouponsParams = {
  customerId: string;
  items: string[];
};

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
    getAllTypeCoupons: builder.query({
      providesTags: ['promotionCoupons'],
      query: ({ customerId, items }) => {
        const queryParams = new URLSearchParams();
        queryParams.append('customerId', customerId);
        items.forEach((id: string) => queryParams.append('items', id)); // <-- repeat `items` param

        return {
          url: `/promotioncoupon/new/all-type-coupon?${queryParams.toString()}`,
          method: 'GET',
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
  useGetAllTypeCouponsQuery
} = promotionCouponApi;
