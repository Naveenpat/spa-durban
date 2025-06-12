import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import { FilterType } from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useFetchData } from 'src/hooks/useFetchData';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useGetCategoriesQuery } from 'src/modules/Category/service/CategoryServices';
import { useGetSubCategoriesQuery } from 'src/modules/SubCategory/service/SubCategoryServices';
import { RootState } from 'src/store';
import { CURRENCY } from 'src/utils/constants';
import ShowConfirmation from 'src/utils/ShowConfirmation';
import { showToast } from 'src/utils/showToaster';
import { Service } from '../../models/Service.model';
import {
  useGetServicesQuery,
  useServiceStatusMutation,
} from '../../service/ServiceServices';
import ServiceListing from './ServiceListing';
import { format } from 'date-fns';

type Props = {};

const ServiceListingWrapper = (props: Props) => {
  const navigate = useNavigate();
  const [status] = useServiceStatusMutation();
  const { outlets } = useSelector((state: RootState) => state.auth);
  const { searchQuery, limit, page, appliedFilters } = useFilterPagination([
    'categoryId',
    'subCategoryId',
    'outletIds',
  ]);
  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetServicesQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['serviceName']),
        filterBy: JSON.stringify(appliedFilters),
      },
    },
  );

  const { data: categoryData } = useFetchData(useGetCategoriesQuery, {
    body: { isPaginationRequired: false },
  });
  const { data: subCategoryData } = useFetchData(useGetSubCategoriesQuery, {
    body: { isPaginationRequired: false },
  });
  const filters: FilterType[] = [
    {
      filterType: 'multi-select',
      label: 'Category',
      fieldName: 'categoryId',
      options:
        categoryData?.map((el) => {
          return {
            label: el?.categoryName,
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
      label: 'Sub Category',
      fieldName: 'subCategoryId',
      options:
        subCategoryData?.map((el) => {
          return {
            label: el?.subCategoryName,
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
      label: 'Outlets',
      fieldName: 'outletIds',
      options:
        outlets?.map((el) => {
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
  const tableHeaders: TableHeader<Service>[] = [
    {
      fieldName: 'serviceName',
      headerName: 'Name',
      flex: 'flex-[1_1_0%]',
      stopPropagation: true,
    },
    {
      fieldName: 'serviceCode',
      headerName: 'Code',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'categoryName',
      headerName: 'Category',
      flex: 'flex-[1_0_0%]',
      align: 'start',
    },
    {
      fieldName: 'subCategoryName',
      headerName: 'Sub Category',
      flex: 'flex-[1_0_0%]',
      renderCell: (item) => item?.subCategoryName || '-',
    },

    {
      fieldName: 'sellingPrice',
      headerName: 'Price',
      flex: 'flex-[1_0_0%]',
      renderCell: (item) => (
        <div>
          {CURRENCY} {Number(item?.sellingPrice).toFixed(2)}
        </div>
      ),
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
      permissions: ['SERVICE_ACTIVE_DEACTIVE'],
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
      <ServiceListing
        tableHeaders={tableHeaders}
        rowData={data as Service[]}
        onAddNew={() => navigate('/service/add')}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        onEdit={(serviceId: string) => navigate(`/service/edit/${serviceId}`)}
        isTableLoading={isLoading}
        filters={filters}
      />
    </>
  );
};

export default ServiceListingWrapper;
