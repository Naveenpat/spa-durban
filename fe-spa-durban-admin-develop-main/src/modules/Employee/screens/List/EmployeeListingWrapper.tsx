import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import { FilterType } from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useFetchData } from 'src/hooks/useFetchData';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useGetAdminRolesQuery } from 'src/modules/AdminRole/service/AdminRoleServices';
import { AppDispatch, RootState } from 'src/store';
import ShowConfirmation from 'src/utils/ShowConfirmation';
import { showToast } from 'src/utils/showToaster';
import { Employee } from '../../models/Employee.model';
import {
  useDeleteEmployeeMutation,
  useEmployeeStatusMutation,
  useExportEmployeeExcelQuery,
  useGetEmployiesQuery,
  useImportEmployeeExcelMutation
} from '../../service/EmployeeServices';
import EmployeeListing from './EmployeeListing';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Props = {};

const EmployeeListingWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { isOpenAddDialog } = useSelector(
    (state: RootState) => state?.employee,
  );
  const { outlets } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const { data: roleData } = useFetchData(useGetAdminRolesQuery, {});
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const [status] = useEmployeeStatusMutation();
  const { page, limit, searchQuery, appliedFilters } = useFilterPagination([
    'userRoleId',
    'outletsId',
  ]);
  const { data, isLoading, totalPages, totalData } = useFetchData(
    useGetEmployiesQuery,
    {
      body: {
        searchValue: searchQuery,
        page,
        limit,
        searchIn: JSON.stringify(['name', 'email']),
        filterBy: JSON.stringify(appliedFilters),
      },
    },
  );

  const [startExport, setStartExport] = useState(false)
  const { data: exportData, isLoading: isExporting } = useExportEmployeeExcelQuery(undefined, {
    skip: !startExport, // trigger only when needed
  });

  const [importEmployeeExcel, { isLoading: isImporting }] = useImportEmployeeExcelMutation();

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
  const tableHeaders: TableHeader<Employee>[] = [
    {
      fieldName: 'name',
      headerName: 'name',
      sortKey: 'age',
      renderCell: (row: any) => {
        return row?.name || '-';
      },
    },
    {
      fieldName: 'email',
      headerName: 'email',
      flex: 'flex-[1_0_0%]',
      renderCell: (row: any) => {
        return row?.email || '-';
      },
    },
    {
      fieldName: 'roleName',
      headerName: 'role',
      sortKey: 'name',
      flex: 'flex-[1_1_0%]',
      renderCell: (row: any) => {
        return row?.roleName || '-';
      },
    },
    {
      fieldName: 'outletNames',
      headerName: 'outlet',
      sortKey: 'age',
      renderCell: (row: any) => {
        return row?.outletNames?.join(', ') || '-';
      },
    },
    {
      fieldName: 'companyName',
      headerName: 'Company Name',
      sortKey: 'age',
      renderCell: (row: any) => {
        return row?.companyName || '-';
      },
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
      permissions: ['EMPLOYEE_ACTIVE_DEACTIVE'],
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
    deleteEmployee(item?._id).then((res: any) => {
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
  const filters: FilterType[] = [
    {
      filterType: 'multi-select',
      label: 'Role',
      fieldName: 'userRoleId',
      options:
        roleData?.map((el) => {
          return {
            label: el?.roleName,
            value: el?._id,
          };
        }) || [],
      renderOption: (option) => option.label,
      isOptionEqualToSearchValue: (option, value) => {
        return option?.label.includes(value);
      },
    },
    {
      filterType: 'multi-select',
      label: 'Outlet',
      fieldName: 'outletsId',
      options:
        outlets?.map((el: any) => {
          return {
            label: el?.name,
            value: el?._id,
          };
        }) || [],
      renderOption: (option) => option.label,
      isOptionEqualToSearchValue: (option, value) => {
        return option?.label.includes(value);
      },
    },
  ];

const exportEmployeeExcelSheet = () => {
  setStartExport(true); // This will trigger the API call to fetch exportData
};

// ⬇️ When exportData is updated by the API call, download the file
useEffect(() => {
  if (exportData) {
    const url = window.URL.createObjectURL(new Blob([exportData]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Employees.xlsx');
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

  return (
    <>
      <EmployeeListing
        tableHeaders={tableHeaders}
        rowData={data as any[]}
        onAddNew={() => navigate('/employee/add')}
        onEdit={(item) => navigate(`/employee/edit/${item?._id}`)}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isTableLoading={isLoading}
        onDelete={handleDelete}
        filter={filters}
        exportEmployeeExcelSheet={exportEmployeeExcelSheet}
        importEmployeeExcelSheet={importEmployeeExcelSheet}
      />
    </>
  );
};

export default EmployeeListingWrapper;
