import React, { useState } from 'react';
import AccountListing from './AccountListing';
import { Account } from '../../models/Account.model';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import {
  setIsOpenAddDialog,
  setIsOpenEditDialog,
} from '../../slice/AccountSlice';
import AddAccountFormWrapper from '../Add/AddAccountFormWrapper';
import EditAccountFormWrapper from '../Edit/EditAccountFormWrapper';
import {
  useAccountStatusMutation,
  useDeleteAccountMutation,
  useGetAccountsQuery,
} from '../../service/AccountServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { showToast } from 'src/utils/showToaster';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import ShowConfirmation from 'src/utils/ShowConfirmation';

type Props = {};

const AccountListingWrapper = (props: Props) => {
  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.account,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [accountId, setAccountId] = useState('');
  const [deleteAccount] = useDeleteAccountMutation();
  const [status] = useAccountStatusMutation();
  const { searchQuery, limit, page } = useFilterPagination();
  const { data, isLoading, totalPages, totalData } = useFetchData(
    useGetAccountsQuery,
    {
      body: {
        searchValue: searchQuery,
        limit,
        page,
        searchIn: JSON.stringify(['accountName']),
      },
    },
  );

  const handleStatusChanges = (
    item: any,
    closeDialog: () => void,
    setIsLoading: any,
  ) => {
    status(item?._id).then((res: any) => {
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
      setIsLoading(false);
    });
  };
  const tableHeaders: TableHeader<Account>[] = [
    {
      fieldName: 'accountName',
      headerName: 'name',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'accountNumber',
      headerName: 'account number',
      flex: 'flex-[1_1_0%]',
      stopPropagation: true,
    },
    {
      fieldName: 'note',
      headerName: 'Note',
      flex: 'flex-[1_0_0%]',
      renderCell: (row: any) => {
        return <div>{row?.note || '-'} </div>;
      },
    },
    {
      fieldName: 'status',
      headerName: 'Active',
      extraClasses: () => 'min-w-[100px]',
      flex: 'flex-[1_0_0%]',
      permissions: ['ACCOUNT_ACTIVE_DEACTIVE'],
      renderCell(item) {
        return (
          <div className="">
            <ATMSwitch
              checked={item?.isActive}
              onChange={(checked) => {
                ShowConfirmation({
                  type: 'INFO',
                  confirmationText: 'Yes',
                  title: 'Are you sure ?',
                  message: 'You really  want to be change Status',
                  onConfirm: (closeDialog, setIsLoading) =>
                    handleStatusChanges(item, closeDialog, setIsLoading),
                });
              }}
              activeLabel="Yes"
              deactiveLabel="No"
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <AccountListing
        tableHeaders={tableHeaders}
        rowData={data as any[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isTableLoading={isLoading}
        onEdit={(item) => {
          dispatch(setIsOpenEditDialog(true));
          setAccountId(item?._id);
        }}
        onDelete={(item, closeDialog, setIsLoading) => {
          deleteAccount(item?._id).then((res: any) => {
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

            setIsLoading(false);
          });
        }}
      />

      {isOpenAddDialog && (
        <AddAccountFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )}
      {isOpenEditDialog && (
        <EditAccountFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          accountId={accountId}
        />
      )}
    </>
  );
};

export default AccountListingWrapper;
