import { format } from 'date-fns';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useFetchData } from 'src/hooks/useFetchData';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { AppDispatch, RootState } from 'src/store';
import ShowConfirmation from 'src/utils/ShowConfirmation';
import { CURRENCY } from 'src/utils/constants';
import { showToast } from 'src/utils/showToaster';
import { Coupon } from '../../models/Coupon.model';
import {
  useCouponStatusMutation,
  useDeleteCouponMutation,
  useGetCouponsQuery,
} from '../../service/CouponServices';
import {
  setIsOpenAddDialog,
  setIsOpenEditDialog,
} from '../../slice/CouponSlice';
import AddCouponFormWrapper from '../Add/AddCouponFormWrapper';
import EditCouponFormWrapper from '../Edit/EditCouponFormWrapper';
import CouponListing from './CouponListing';

type Props = {};

const CouponListingWrapper = (props: Props) => {
  const [couponId, setCouponId] = useState('');
  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.coupon,
  );
  const dispatch = useDispatch<AppDispatch>();
  const { searchQuery, limit, page } = useFilterPagination();

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetCouponsQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['referralCode']),
      },
    },
  );
  const [deleteCoupon] = useDeleteCouponMutation();
  const [status] = useCouponStatusMutation();
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

  const tableHeaders: TableHeader<Coupon>[] = [
    {
      fieldName: 'type',
      headerName: 'Type',
      flex: 'flex-[1_1_0%]',
      stopPropagation: true,
      renderCell(item) {
        return (
          <div>
            {item?.type === 'REFERRAL_CODE'
              ? 'Referral Code'
              : item?.type === 'COUPON_CODE'
                ? 'Coupon Code'
                : '-'}
          </div>
        );
      },
    },
    // {
    //   fieldName: 'userName',
    //   headerName: 'User',
    //   flex: 'flex-[1_1_0%]',
    //   stopPropagation: true,
    //   renderCell(item) {
    //     return <div>{item?.userName || '-'}</div>;
    //   },
    // },
    // {
    //   fieldName: 'earnPoint',
    //   headerName: 'Earn Point',
    //   flex: 'flex-[1_1_0%]',
    //   stopPropagation: true,
    //   renderCell(item) {
    //     return <div>{item?.earnPoint || '-'}</div>;
    //   },
    // },
    {
      fieldName: 'referralCode',
      headerName: 'Referral Code',
      flex: 'flex-[1_1_0%]',
      stopPropagation: true,
    },
    {
      fieldName: 'discountAmount',
      headerName: 'Discount(in %)',

      highlight: false,
      flex: 'flex-[1_1_0%]',
      stopPropagation: true,
      renderCell(item) {
        return <div>{item?.discountAmount || '-'}</div>;
      },
    },
    {
      fieldName: 'quantity',
      headerName: 'Quantity',
      highlight: false,
      flex: 'flex-[1_1_0%]',
      stopPropagation: true,
    },
    {
      fieldName: 'valid',
      headerName: 'Valid Until',
      highlight: false,
      flex: 'flex-[1_1_0%]',
      stopPropagation: true,
      renderCell(item) {
        return (
          <div>
            {item?.valid ? format(new Date(item?.valid), 'dd MMM yyyy') : '-'}
          </div>
        );
      },
    },
    {
      fieldName: 'note',
      headerName: 'Note',
      highlight: false,
      flex: 'flex-[1_1_0%]',
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
      return date ? format(date, 'dd-MM-yyyy') : '-';
    },
  },
    {
      fieldName: 'status',
      headerName: 'Active',
      extraClasses: () => 'min-w-[100px]',
      flex: 'flex-[1_0_0%]',
      permissions: ['COUPONS_REFERRAL_ACTIVE_DEACTIVE'],
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
    deleteCoupon(item?._id).then((res: any) => {
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
      <CouponListing
        tableHeaders={tableHeaders}
        rowData={data as Coupon[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        onEdit={(item) => {
          dispatch(setIsOpenEditDialog(true)), setCouponId(item?._id);
        }}
        onDelete={handleDelete}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
      />

      {isOpenAddDialog && (
        <AddCouponFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )}
      {isOpenEditDialog && (
        <EditCouponFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          couponId={couponId}
        />
      )}
    </>
  );
};

export default CouponListingWrapper;
