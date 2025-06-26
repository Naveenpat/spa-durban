import { useDispatch } from 'react-redux';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { AppDispatch } from 'src/store';
import { RewardsCoupon } from '../../models/RewardsCoupon.model';
import { setIsOpenAddDialog } from '../../slice/RewardsCouponSlice';
import RewardsCouponListing from './RewardsCouponListing';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useGetRewardsCouponsQuery,
  useRewardsCouponStatusMutation,
  useDeleteRewardsCouponMutation,
} from '../../service/RewardsCouponServices';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import { useNavigate, useParams } from 'react-router-dom';
import { showToast } from 'src/utils/showToaster';
import ShowConfirmation from 'src/utils/ShowConfirmation';
import { format } from 'date-fns';
import { formatZonedDate } from 'src/utils/formatZonedDate';

type Props = {};

const RewardsCouponListingWrapper = (props: Props) => {
  const navigate = useNavigate();
  const [status] = useRewardsCouponStatusMutation();
  const dispatch = useDispatch<AppDispatch>();
  const { searchQuery, limit, page } = useFilterPagination();
  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetRewardsCouponsQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['rewardsPoint']),
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
  const tableHeaders: TableHeader<RewardsCoupon>[] = [
    {
      fieldName: 'rewardsPoint',
      headerName: 'Title',
      sortKey: 'serialNumber',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'couponCode',
      headerName: 'Coupon Code',
      sortKey: 'serialNumber',
      flex: 'flex-[1_0_0%]',
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
      headerName: 'status',
      extraClasses: () => 'min-w-[100px]',
      flex: 'flex-[1_0_0%]',
      permissions: ['REWARDSCOUPON_ACTIVE_DEACTIVE'],
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
                  message: 'You really want to change Status',
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

  const [deleteRewardsCoupon] = useDeleteRewardsCouponMutation();
  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteRewardsCoupon(item?._id).then((res: any) => {
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
      <RewardsCouponListing
        tableHeaders={tableHeaders}
        rowData={data as RewardsCoupon[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        onEdit={(item) => navigate(`/rewards-coupon/edit/${item?._id}`)}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
        onDelete={handleDelete}
      />

      {/* {isOpenAddDialog && (
        <AddRewardsCouponFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )} */}
    </>
  );
};

export default RewardsCouponListingWrapper;
