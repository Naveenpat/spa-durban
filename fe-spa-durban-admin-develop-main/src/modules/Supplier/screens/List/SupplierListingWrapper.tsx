import { useNavigate } from 'react-router-dom';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useFetchData } from 'src/hooks/useFetchData';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { showToast } from 'src/utils/showToaster';
import { Supplier } from '../../models/Supplier.model';
import {
  useDeleteSupplierMutation,
  useGetSupplierListingQuery,
  useSupplierStatusMutation,
} from '../../service/SupplierServices';
import SupplierListing from './SupplierListing';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import ShowConfirmation from 'src/utils/ShowConfirmation';
import { format } from 'date-fns';
import { formatZonedDate } from 'src/utils/formatZonedDate';

const SupplierListingWrapper = () => {
  const navigate = useNavigate();
  const [deleteSupplier] = useDeleteSupplierMutation();
  const [status] = useSupplierStatusMutation();
  const { searchQuery, limit, page } = useFilterPagination();

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetSupplierListingQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['supplierName', 'phone']),
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
  const tableHeaders: TableHeader<Supplier>[] = [
    {
      fieldName: 'supplierName',
      headerName: 'Name',

      sortKey: 'name',
      highlight: true,
      flex: 'flex-[1_1_0%]',
      stopPropagation: true,
    },
    {
      fieldName: 'phone',
      headerName: 'Phone',

      sortKey: 'phone',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'email',
      headerName: 'Email',

      sortKey: 'email',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'address',
      headerName: 'Address',
      extraClasses: () => 'min-w-[100px]',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'city',
      headerName: 'City',

      sortKey: 'city',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'country',
      headerName: 'Country',

      sortKey: 'country',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'region',
      headerName: 'Region',

      sortKey: 'region',
      flex: 'flex-[1_0_0%]',
    },

    {
      fieldName: 'taxId',
      headerName: 'Tax No.',

      sortKey: 'taxID',
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
      headerName: 'Active',
      extraClasses: () => 'min-w-[100px]',
      flex: 'flex-[1_0_0%]',
      permissions: ['SUPPLIER_ACTIVE_DEACTIVE'],
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
    deleteSupplier(item?._id).then((res: any) => {
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
      <SupplierListing
        tableHeaders={tableHeaders}
        rowData={data as Supplier[]}
        onAddNew={() => navigate('/supplier/add')}
        onEdit={(item) => navigate(`/supplier/edit/${item?._id}`)}
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

export default SupplierListingWrapper;
