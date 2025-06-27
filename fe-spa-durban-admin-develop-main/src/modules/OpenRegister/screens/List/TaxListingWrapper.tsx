import React, { useState } from 'react';
import RegisterListing from './OpenRegisterListing';
import { Register } from '../../models/OpenRegister.model';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import {
  setIsOpenAddDialog,
  setIsOpenEditDialog,
} from '../../slice/OpenRegisterSlice';
import AddRegisterFormWrapper from '../Add/AddOpenRegisterFormWrapper';
import EditRegisterFormWrapper from '../Edit/EditOpenRegisterFormWrapper';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useDeleteRegisterMutation,
  useGetRegisterQuery,
} from '../../service/OpenRegisterServices';
import { showToast } from 'src/utils/showToaster';

type Props = {};

const tableHeaders: TableHeader<Register>[] = [
  {
    fieldName: 'openingBalance',
    headerName: 'Register Name',
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
  },
  // {
  //   fieldName: 'registerStatus',
  //   headerName: 'Status',
  //   flex: 'flex-[1_1_0%]',
  //   stopPropagation: true,
  // },
];

const RegisterListingWrapper = (props: Props) => {
  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.register,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [registerId, setRegisterId] = useState('');
  const { page, limit, searchQuery } = useFilterPagination();
  const [deleteRegister] = useDeleteRegisterMutation();
  const { data, isLoading, totalPages, totalData } = useFetchData(
    useGetRegisterQuery,
    {
      body: {
        searchValue: searchQuery,
        page,
        limit,
        searchIn: JSON.stringify(['registerName']),
      },
    },
  );
  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteRegister(item?._id).then((res: any) => {
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
      <RegisterListing
        tableHeaders={tableHeaders}
        rowData={data as any[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        onEdit={(item) => {
          dispatch(setIsOpenEditDialog(true));
          setRegisterId(item?._id);
        }}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isTableLoading={isLoading}
        onDelete={handleDelete}
      />

      {isOpenAddDialog && (
        <AddRegisterFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
          opningData={null}
        />
      )}
      {isOpenEditDialog && (
        <EditRegisterFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          registerId={registerId}
        />
      )}
    </>
  );
};

export default RegisterListingWrapper;
