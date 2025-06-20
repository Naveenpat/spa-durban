import { useDispatch } from 'react-redux';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { AppDispatch } from 'src/store';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import { useNavigate, useParams } from 'react-router-dom';
import { showToast } from 'src/utils/showToaster';
import ShowConfirmation from 'src/utils/ShowConfirmation';
import { format, parse } from 'date-fns';
import { CustomerGroup } from '../../models/CustomerGroup.model';
import CustomerGroupListing from './CustomerGroupListing';
import { setIsOpenAddDialog } from '../../slice/CustomerGroupSlice';
import { useCustomerGroupStatusMutation, useDeleteCustomerGroupMutation, useGetCustomerGroupsQuery } from '../../service/CustomerGroupServices';
type Props = {};

const CustomerGroupListingWrapper = (props: Props) => {
  const navigate = useNavigate();
  const [status] = useCustomerGroupStatusMutation();
  const dispatch = useDispatch<AppDispatch>();
  const { searchQuery, limit, page } = useFilterPagination();
  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetCustomerGroupsQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['cashBackRulesName']),
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

  const formatTo12Hour = (time: string) => {
    try {
      const parsed = parse(time, 'HH:mm', new Date());
      return format(parsed, 'hh:mm a'); // e.g., 01:30 PM
    } catch (error) {
      return time;
    }
  };

  const tableHeaders: TableHeader<CustomerGroup>[] = [
    {
      fieldName: 'customerGroupName',
      headerName: 'Customer Group Name',
      sortKey: 'serialNumber',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'createdAt',
      headerName: 'Created Date',
      // sortKey: 'serialNumber',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return <div>{item?.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy') : '--'}</div>;
      },
    },
    {
      fieldName: 'status',
      headerName: 'status',
      extraClasses: () => 'min-w-[100px]',
      flex: 'flex-[1_0_0%]',
      permissions: ['CASHBACK_ACTIVE_DEACTIVE'],
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
  const [deleteCashBack] = useDeleteCustomerGroupMutation();
  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteCashBack(item?._id).then((res: any) => {
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
      <CustomerGroupListing
        tableHeaders={tableHeaders}
        rowData={data as CustomerGroup[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        onEdit={(item) => navigate(`/customer-group/edit/${item?._id}`)}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
        onDelete={handleDelete}
      />

      {/* {isOpenAddDialog && (
        <AddCashBackFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )} */}
    </>
  );
};

export default CustomerGroupListingWrapper;
