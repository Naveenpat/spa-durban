import apiSlice from 'src/services/ApiSlice';
import { AccountFormValues } from '../models/Account.model';

export const accountApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Accounts with pagination
    getAccounts: builder.query({
      providesTags: ['account'],
      query: (body) => {
        return {
          url: '/account/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    // Add Account
    addAccount: builder.mutation({
      invalidatesTags: ['account'],
      query: (body) => {
        return {
          url: '/account/add',
          method: 'POST',
          body,
        };
      },
    }),
    // GET Signle Data
    getAccountbyId: builder.query({
      providesTags: ['account'],
      query: (accountId) => {
        return {
          url: `account/${accountId}`,
          method: 'GET',
        };
      },
    }),
    // update account
    updateAccount: builder.mutation({
      invalidatesTags: ['account'],
      query: ({
        accountId,
        body,
      }: {
        accountId: string;
        body: AccountFormValues;
      }) => {
        return {
          url: `/account/${accountId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    // Delete account
    deleteAccount: builder.mutation({
      invalidatesTags: ['account'],
      query: (accountId) => {
        return {
          url: `account/${accountId}`,
          method: 'DELETE',
        };
      },
    }),
    accountStatus: builder.mutation({
      invalidatesTags: ['account'],
      query: (accountId) => {
        return {
          url: `account/toggle-status/${accountId}`,
          method: 'PUT',
        };
      },
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useAddAccountMutation,
  useUpdateAccountMutation,
  useGetAccountbyIdQuery,
  useDeleteAccountMutation,
  useAccountStatusMutation,
} = accountApi;
