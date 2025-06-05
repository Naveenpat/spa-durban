import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../utils/constants/index';

export const apiSlice = createApi({
  reducerPath: 'apiSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}`,

    prepareHeaders: (headers, { getState, endpoint }) => {
      const token = (getState() as any)?.auth?.accessToken;

      if (token && endpoint !== 'getAccessModules') {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'admin-roles',
    'admin-role',
    'categories',
    'account',
    'sub-categories',
    'employee',
    'outlets',
    'tax',
    'measurementUnits',
    'brands',
    'payment-mode',
    'supplier',
    'gift-card',
    'products',
    'coupon',
    'customer',
    'purchase-order',
    'loyaltys',
    'invoice',
    'services',
    'draft',
    'task',
    'ticket',
    'cashBacks',
    'rewardsCoupons',
    'promotionCoupons',
    'register',
  ],
  endpoints: () => ({}),
});

export default apiSlice;
