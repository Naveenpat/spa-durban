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
import { isAuthorized } from 'src/utils/authorization';
import ATMExportDialog from 'src/components/atoms/ATMExportDialog/ATMExportDialog';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMDialog from 'src/components/atoms/ATMDialog/ATMDialog';

type Props = {};

const CustomerListingWrapper = (props: Props) => {
  const navigate = useNavigate();
  const [deleteCustomer] = useDeleteCustomerMutation();
  const [status] = useCustomerStatusMutation();
  const { searchQuery, limit, page } = useFilterPagination();
  // console.log('------searchQuery', searchQuery)
  // const { data, isLoading, totalData, totalPages } = useFetchData(
  //   useGetCustomersQuery,
  //   {
  //     body: {
  //       limit,
  //       page,
  //       searchValue: searchQuery,
  //       searchIn: JSON.stringify(['customerName','email','phone']),
  //     },
  //   },
  // );

  const query = searchQuery.trim();
  let filterBy: any[] = [];

  const isEmail = query.includes('@'); // ✅ Check email first
  const isNumber = /^\d+$/.test(query);

  if (isEmail) {
    filterBy = [{ fieldName: 'email', value: query }];
  } else if (isNumber) {
    filterBy = [{ fieldName: 'phone', value: query }];
  } else {
    filterBy = [{ fieldName: 'customerName', value: query }];
  }

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetCustomersQuery,
    {
      params: {
        limit,
        page,
        isPaginationRequired: true,
        filterBy: JSON.stringify(filterBy),
      },
    }
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
  const [loading, setLoading] = useState(false);
  const [startExport, setStartExport] = useState(false)
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [includeCustomerDetails, setIncludeCustomerDetails] = useState<'yes' | 'no'>('yes');
  const { data: exportData, isLoading: isExporting } = useExportCustomerExcelQuery(
    { includeContact: includeCustomerDetails === 'yes' },
    { skip: !startExport }
  );


  const [importEmployeeExcel, { isLoading: isImporting }] = useImportCustomerExcelMutation();

  const exportEmployeeExcelSheet = () => {
    // setStartExport(true); // This will trigger the API call to fetch exportData
    setShowExportPreview(true)
  };

  const handleExport = (status: any) => {
    setStartExport(true);
  }

  // ⬇️ When exportData is updated by the API call, download the file
  useEffect(() => {
    if (exportData) {
      const url = window.URL.createObjectURL(new Blob([exportData], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Customer.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up
    }
  }, [exportData]);

  const importCustomerExcelSheet = async (file: any) => {
    try {
      setLoading(true)
      await importEmployeeExcel(file).unwrap();
      setLoading(false)
      toast.success('Customer imported successfully!');
    } catch (err) {
      setLoading(false)
      toast.error('Failed to import employees');
    }
  }

  const handleViewSalesReport = (row: any) => {
    navigate(`/customer/sales-report/${row._id}`);
  }

  const tableHeaders: TableHeader<Customer>[] = [
    {
      fieldName: 'customerName',
      headerName: 'Name',
      flex: 'flex-[2_0_0%]',
      renderCell: (row) => (
        <span
          className="text-black-600 cursor-pointer"
          onClick={() => navigate(`/customer/view/${row._id}`)}
        >
          {row.customerName}
        </span>
      ),
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
    // {
    //   fieldName: 'dateOfBirth',
    //   headerName: 'dateOfBirth',
    //   flex: 'flex-[1_0_0%]',
    //   renderCell(item) {
    //     return (
    //       <div>
    //         {item?.dateOfBirth
    //           ? format(new Date(item?.dateOfBirth), 'dd MMM yyyy')
    //           : '-'}
    //       </div>
    //     );
    //   },
    // },
    {
      fieldName: 'dateOfBirth',
      headerName: 'dateOfBirth',
      flex: 'flex-[1_0_0%]',
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
      fieldName: 'customerGroup',
      headerName: 'Group',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return <div>{item?.customerGroup || '-'}</div>;
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
      fieldName: 'viewSalesReport',
      headerName: 'Sales Report',
      flex: 'flex-[0_0_150px]',
      renderCell: (row: any) => (
        <button
          onClick={() => {
            if (!isAuthorized('CUSTOMER_SALES_REPORT')) {
              showToast('error', 'You are not authorized to access this page.')
            } else { handleViewSalesReport(row) }
          }}
          className="text-white px-3 py-1 rounded hover:opacity-90"
          style={{ backgroundColor: '#006972' }}
        >
          View Report
        </button>

      ),
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
        importEmployeeExcelSheet={importCustomerExcelSheet}
        exportEmployeeExcelSheet={exportEmployeeExcelSheet}
      />

      {showExportPreview && (
        <ATMDialog onClose={() => setShowExportPreview(false)}>
          <div className="bg-white w-full max-w-sm p-5 rounded-md shadow-md space-y-5">
            {/* Main Heading */}
            <h2 className="text-lg font-bold text-gray-900 text-center">
              Export Customers
            </h2>

            {/* Subheading */}
            <div className="text-sm font-medium text-gray-700">
              Do you want to include customer contact details in the export?
            </div>

            {/* Radio Buttons */}
            <div className="flex gap-6 items-center text-sm text-gray-800">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="includeCustomer"
                  value="yes"
                  checked={includeCustomerDetails === 'yes'}
                  onChange={() => setIncludeCustomerDetails('yes')}
                />
                Yes
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="includeCustomer"
                  value="no"
                  checked={includeCustomerDetails === 'no'}
                  onChange={() => setIncludeCustomerDetails('no')}
                />
                No
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <ATMButton variant='outlined' onClick={() => setShowExportPreview(false)}>
                Cancel
              </ATMButton>
              <ATMButton
                onClick={() => {
                  setShowExportPreview(false);
                  handleExport(includeCustomerDetails === 'no'); // Pass boolean
                }}
              >
                Export Start
              </ATMButton>
            </div>
          </div>
        </ATMDialog>
      )}





    </>
  );
};

export default CustomerListingWrapper;
