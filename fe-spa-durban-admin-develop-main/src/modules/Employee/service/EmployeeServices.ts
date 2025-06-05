import apiSlice from 'src/services/ApiSlice';
import { EmployeeFormValues } from '../models/Employee.model';

export const employeeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get-Employies
    getEmployies: builder.query({
      providesTags: ['employee'],
      query: (body) => {
        return {
          url: '/employee/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),

    // Add Employies
    addEmployee: builder.mutation({
      invalidatesTags: ['employee'],
      query: (body) => {
        return {
          url: '/employee/add',
          method: 'POST',
          body,
        };
      },
    }),

    // Edit Employies By Id
    getEmployeeById: builder.query({
      providesTags: ['employee'],
      query: (employeeId) => {
        return {
          url: `/employee/${employeeId}`,
          method: 'GET',
        };
      },
    }),

    // Edit Employies
    updateEmployee: builder.mutation({
      invalidatesTags: ['employee'],
      query: ({
        employeeId,
        body,
      }: {
        employeeId: any;
        body: EmployeeFormValues;
      }) => {
        return {
          url: `/employee/${employeeId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    // Delete Employies
    deleteEmployee: builder.mutation({
      invalidatesTags: ['employee'],
      query: (employeeId) => {
        return {
          url: `employee/${employeeId}`,
          method: 'DELETE',
        };
      },
    }),
    employeeStatus: builder.mutation({
      invalidatesTags: ['employee'],
      query: (employeeId) => {
        return {
          url: `employee/toggle-status/${employeeId}`,
          method: 'PUT',
        };
      },
    }),
  }),
});

export const {
  useGetEmployiesQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useGetEmployeeByIdQuery,
  useDeleteEmployeeMutation,
  useEmployeeStatusMutation,
} = employeeApi;
