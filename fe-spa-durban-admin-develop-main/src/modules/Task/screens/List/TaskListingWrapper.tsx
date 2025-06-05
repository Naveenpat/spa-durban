import React, { useState } from 'react';
import TaskListing from './TaskListing';
import { Task } from '../../models/Task.model';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import { setIsOpenAddDialog, setIsOpenEditDialog } from '../../slice/TaskSlice';
import AddTaskFormWrapper from '../Add/AddTaskFormWrapper';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useDeleteTaskMutation,
  useGetTasksQuery,
} from '../../service/TaskServices';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import EditTaskFormWrapper from '../Edit/EditTaskFormWrapper';
import { showToast } from 'src/utils/showToaster';

type Props = {};

const tableHeaders: TableHeader<Task>[] = [
  {
    fieldName: 'task',
    headerName: 'Task',
    flex: 'flex-[1_1_0%]',
  },
  {
    fieldName: 'description',
    headerName: 'Description',
    flex: 'flex-[1_0_0%]',
  },
];

const TaskListingWrapper = (props: Props) => {
  const [taskId, setTaskId] = useState('');
  const [deleteTask] = useDeleteTaskMutation();
  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.task,
  );
  const dispatch = useDispatch<AppDispatch>();

  const { searchQuery, limit, page } = useFilterPagination();
  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetTasksQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['task']),
      },
    },
  );
  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteTask(item?._id).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          closeDialog();
        } else {
          showToast('error', res?.data?.message);
        }
      }
    });
  };
  return (
    <>
      <TaskListing
        tableHeaders={tableHeaders}
        rowData={data as Task[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        onEdit={(item) => {
          dispatch(setIsOpenEditDialog(true)), setTaskId(item?._id);
        }}
        onDelete={handleDelete}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
      />

      {isOpenAddDialog && (
        <AddTaskFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )}
      {isOpenEditDialog && (
        <EditTaskFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          taskId={taskId}
        />
      )}
    </>
  );
};

export default TaskListingWrapper;
