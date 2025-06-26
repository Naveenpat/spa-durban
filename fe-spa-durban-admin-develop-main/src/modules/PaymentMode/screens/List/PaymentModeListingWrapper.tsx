import React, { useState } from 'react';
import PaymentModeListing from './PaymentModeListing';
import { PaymentMode } from '../../models/PaymentMode.model';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import {
  setIsOpenAddDialog,
  setIsOpenEditDialog,
} from '../../slice/PaymentModeSlice';
import AddPaymentModeFormWrapper from '../Add/AddPaymentModeFormWrapper';
import EditPaymentModeFormWrapper from '../Edit/EditPaymentModeFormWrapper';
import { useFetchData } from 'src/hooks/useFetchData';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import {
  useDeletePaymentModeMutation,
  useGetPaymntModesQuery,
  usePaymentModeStatusMutation,
} from '../../service/PaymentModeServices';
import { showToast } from 'src/utils/showToaster';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import ShowConfirmation from 'src/utils/ShowConfirmation';
import { format } from 'date-fns';
import { formatZonedDate } from 'src/utils/formatZonedDate';

type Props = {};

const PaymentModeListingWrapper = (props: Props) => {
  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.paymentmode,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [paymetModeId, setPaymenetModeId] = useState('');
  const [deletepaymentMode] = useDeletePaymentModeMutation();
  const [status] = usePaymentModeStatusMutation();
  const { searchQuery, limit, page } = useFilterPagination();
  const { data, isLoading, totalPages, totalData } = useFetchData(
    useGetPaymntModesQuery,
    {
      body: {
        searchValue: searchQuery,
        limit,
        page,
        searchIn: JSON.stringify(['modeName']),
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
  const tableHeaders: TableHeader<PaymentMode>[] = [
    {
      fieldName: 'modeName',
      headerName: 'Name',
      flex: 'flex-[1_1_0%]',
      stopPropagation: true,
      renderCell: (row: any) => {
        return row?.modeName || '-';
      },
    },
    {
      fieldName: 'type',
      headerName: 'Type',
      flex: 'flex-[1_1_0%]',
      extraClasses: () => 'capitalize',
      stopPropagation: true,
    },
    {
      fieldName: 'createdAt',
      headerName: 'Date',
      flex: 'flex-[1_1_0%]',
      extraClasses: () => '',
      stopPropagation: true,
      render: (row: any) => {
        const date = row.createdAt ? new Date(row.createdAt) : null;
        // return date ? format(date, 'dd-MM-yyyy') : '-';
        return date ? formatZonedDate(date) : '-';
      },
    },
    {
      fieldName: 'status',
      headerName: 'Active',
      extraClasses: () => 'min-w-[100px]',
      flex: 'flex-[1_0_0%]',
      permissions: ['PAYMENT_MODE_ACTIVE_DEACTIVE'],
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
  const handleDelete = (item: any, closeDialog: () => void) => {
    deletepaymentMode(item?._id).then((res: any) => {
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
      <PaymentModeListing
        tableHeaders={tableHeaders}
        rowData={data as any[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        onEdit={(item) => {
          dispatch(setIsOpenEditDialog(true));
          setPaymenetModeId(item?._id);
        }}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        onDelete={handleDelete}
        isTableLoading={isLoading}
      />

      {isOpenAddDialog && (
        <AddPaymentModeFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )}
      {isOpenEditDialog && (
        <EditPaymentModeFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          paymetModeId={paymetModeId}
        />
      )}
    </>
  );
};

export default PaymentModeListingWrapper;
