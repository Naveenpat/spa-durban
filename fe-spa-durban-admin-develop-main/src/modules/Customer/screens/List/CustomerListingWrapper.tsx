import { useNavigate } from 'react-router-dom';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useFetchData } from 'src/hooks/useFetchData';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { showToast } from 'src/utils/showToaster';
import { Customer } from '../../models/Customer.model';
import {
  useCustomerStatusMutation,
  useDeleteCustomerMutation,
  useGetCustomersQuery,
} from '../../service/CustomerServices';
import CustomerListing from './CustomerListing';
import { format } from 'date-fns';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import ShowConfirmation from 'src/utils/ShowConfirmation';

type Props = {};

const CustomerListingWrapper = (props: Props) => {
  const navigate = useNavigate();
  const [deleteCustomer] = useDeleteCustomerMutation();
  const [status] = useCustomerStatusMutation();
  const { searchQuery, limit, page } = useFilterPagination();

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetCustomersQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['customerName']),
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

  const tableHeaders: TableHeader<Customer>[] = [
    {
      fieldName: 'customerName',
      headerName: 'Name',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'phone',
      headerName: 'Phone No.',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'email',
      headerName: 'Email',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'gender',
      headerName: 'Gender',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'dateOfBirth',
      headerName: 'DOB',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return (
          <div>
            {item?.dateOfBirth
              ? format(new Date(item?.dateOfBirth), 'dd MMM yyyy')
              : '-'}
          </div>
        );
      },
    },
    {
      fieldName: 'address',
      headerName: 'Address',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return <div>{item?.address || '-'}</div>;
      },
    },
    {
      fieldName: 'city',
      headerName: 'City',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return <div>{item?.city || '-'}</div>;
      },
    },
    {
      fieldName: 'region',
      headerName: 'Region',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return <div>{item?.region || '-'}</div>;
      },
    },
    {
      fieldName: 'country',
      headerName: 'Country',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return <div>{item?.country || '-'}</div>;
      },
    },
    {
      fieldName: 'taxNo',
      headerName: 'Tax No.',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return <div>{item?.taxNo || '-'}</div>;
      },
    },
    {
      fieldName: 'loyaltyPoints',
      headerName: 'Loyalty',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return (
          <div>
            {item?.loyaltyPoints
              ? Number(item?.loyaltyPoints)?.toFixed(2)
              : '-'}
          </div>
        );
      },
    },
    {
      fieldName: 'status',
      headerName: 'Active',
      extraClasses: () => 'min-w-[100px]',
      flex: 'flex-[1_0_0%]',
      permissions: ['CUSTOMER_ACTIVE_DEACTIVE'],
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
    deleteCustomer(item?._id).then((res: any) => {
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
      <CustomerListing
        tableHeaders={tableHeaders}
        rowData={data as Customer[]}
        onAddNew={() => navigate('/customer/add')}
        onEdit={(item) => navigate(`/customer/edit/${item?._id}`)}
        onDelete={handleDelete}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
      />
    </>
  );
};

export default CustomerListingWrapper;
