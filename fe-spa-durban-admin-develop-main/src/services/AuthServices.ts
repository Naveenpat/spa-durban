import apiSlice from './ApiSlice';
import { v4 as uuid } from 'uuid';

const deviceId = localStorage.getItem('deviceId') || uuid();

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    login: builder.mutation({
      query: (body: { email: string; password: string }) => {
        return {
          url: '/auth/login',
          method: 'POST',
          headers: {
            'device-id': deviceId,
          },
          body,
        };
      },
      transformResponse: (response: any) => {
        return { ...response, data: { ...response?.data, deviceId } };
      },
    }),
    loginAuto: builder.mutation({
      query: (body: { bookingUserId: string }) => {
        return {
          url: '/auth/login/auto',
          method: 'POST',
          headers: {
            'device-id': deviceId,
          },
          body,
        };
      },
      transformResponse: (response: any) => {
        return { ...response, data: { ...response?.data, deviceId } };
      },
    }),

    // Get Access Token
    getAccessToken: builder.mutation({
      query: (body) => {
        return {
          url: '/admin/refresh',
          method: 'POST',
          headers: {
            'device-id': deviceId,
          },
          body,
        };
      },
    }),

    // Change Password
    changePassword: builder.mutation({
      query: (body) => {
        return {
          url: '/auth/changePassword',
          method: 'POST',
          headers: {
            'device-id': deviceId,
          },
          body,
        };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useGetAccessTokenMutation,
  useChangePasswordMutation,
  useLoginAutoMutation,
} = authApi;
