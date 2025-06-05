import apiSlice from 'src/services/ApiSlice';

export const taskApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query({
      providesTags: ['task'],
      query: (body) => {
        return {
          url: '/task/pagination',
          method: 'GET',
          params: body,
        };
      },
    }),
    getTask: builder.query({
      providesTags: ['task'],
      query: (taskId) => {
        return {
          url: `/task/${taskId}`,
          method: 'GET',
        };
      },
    }),
    addTask: builder.mutation({
      invalidatesTags: ['task'],
      query: (body) => {
        return {
          url: '/task/add',
          method: 'POST',
          body,
        };
      },
    }),
    updateTask: builder.mutation({
      invalidatesTags: ['task'],
      query: ({ body, taskId }) => {
        return {
          url: `/task/${taskId}`,
          method: 'PUT',
          body,
        };
      },
    }),
    deleteTask: builder.mutation({
      invalidatesTags: ['task'],
      query: (taskId) => {
        return {
          url: `/task/${taskId}`,
          method: 'DELETE',
        };
      },
    }),
  }),
});

export const {
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useGetTaskQuery,
  useDeleteTaskMutation,
} = taskApi;
