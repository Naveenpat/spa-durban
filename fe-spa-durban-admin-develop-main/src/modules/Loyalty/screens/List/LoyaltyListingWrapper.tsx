import { useDispatch } from 'react-redux';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { AppDispatch } from 'src/store';
import { Loyalty } from '../../models/Loyalty.model';
import { setIsOpenAddDialog } from '../../slice/LoyaltySlice';
import LoyaltyListing from './LoyaltyListing';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useGetLoyaltysQuery,
  useLoyaltyStatusMutation,
} from '../../service/LoyaltyServices';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import { useNavigate, useParams } from 'react-router-dom';
import { showToast } from 'src/utils/showToaster';
import ShowConfirmation from 'src/utils/ShowConfirmation';
import { format } from 'date-fns';
import { formatZonedDate } from 'src/utils/formatZonedDate';

type Props = {};

const LoyaltyListingWrapper = (props: Props) => {
  const navigate = useNavigate();
  const [status] = useLoyaltyStatusMutation();
  const dispatch = useDispatch<AppDispatch>();
  const { searchQuery, limit, page } = useFilterPagination();
  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetLoyaltysQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['loyaltyProgramName']),
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
  const tableHeaders: TableHeader<Loyalty>[] = [
    {
      fieldName: 'loyaltyProgramName',
      headerName: 'Title',
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
      permissions: ['LOYALTY_ACTIVE_DEACTIVE'],
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
      <LoyaltyListing
        tableHeaders={tableHeaders}
        rowData={data as Loyalty[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        onEdit={(item) => navigate(`/loyalty/edit/${item?._id}`)}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
      />

      {/* {isOpenAddDialog && (
        <AddLoyaltyFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )} */}
    </>
  );
};

export default LoyaltyListingWrapper;
