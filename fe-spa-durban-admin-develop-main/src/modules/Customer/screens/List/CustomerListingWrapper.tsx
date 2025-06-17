import { useNavigate } from 'react-router-dom';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useFetchData } from 'src/hooks/useFetchData';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { showToast } from 'src/utils/showToaster';
import { Customer } from '../../models/Customer.model';
import {
  useCustomerStatusMutation,
  useDeleteCustomerMutation,
  useExportCustomerExcelQuery,
  useGetCustomersQuery,
  useImportCustomerExcelMutation,
} from '../../service/CustomerServices';
import CustomerListing from './CustomerListing';
import { format } from 'date-fns';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import ShowConfirmation from 'src/utils/ShowConfirmation';
import { useEffect, useState } from 'react';
import { EmptyPointSettings } from '@syncfusion/ej2-react-charts';
import toast from 'react-hot-toast';

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

  const [startExport, setStartExport] = useState(false)
  const { data: exportData, isLoading: isExporting } = useExportCustomerExcelQuery(undefined, {
    skip: !startExport, // trigger only when needed
  });

  const [importEmployeeExcel, { isLoading: isImporting }] = useImportCustomerExcelMutation();

  const exportEmployeeExcelSheet = () => {
    setStartExport(true); // This will trigger the API call to fetch exportData
  };

  // ⬇️ When exportData is updated by the API call, download the file
  useEffect(() => {
    if (exportData) {
      const url = window.URL.createObjectURL(new Blob([exportData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Customer.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up
    }
  }, [exportData]);

  const importEmployeeExcelSheet = async (file: any) => {
    try {
      await importEmployeeExcel(file).unwrap();
      toast.success('Employees imported successfully!');
    } catch (err) {
      toast.error('Failed to import employees');
    }
  }

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
      fieldName: 'updatedAt',
      headerName: 'Date',
      flex: 'flex-[1_1_0%]',
      extraClasses: () => '',
      stopPropagation: true,
      render: (row: any) => {
        const date = row.updatedAt ? new Date(row.updatedAt) : null;
        return date ? format(date, 'dd-MM-yyyy') : '-';
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
        importEmployeeExcelSheet={importEmployeeExcelSheet}
        exportEmployeeExcelSheet={exportEmployeeExcelSheet}
      />
    </>
  );
};

export default CustomerListingWrapper;
