import { useDispatch, useSelector } from 'react-redux';
import { FilterType } from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useFetchData } from 'src/hooks/useFetchData';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import { useGetProductsQuery } from 'src/modules/Product/service/ProductServices';
import { AppDispatch, RootState } from 'src/store';
import { CURRENCY } from 'src/utils/constants';
import { Inventory } from '../../models/Inventory.model';
import { useGetInventoriesQuery } from '../../service/InventoryServices';
import InventoryListing from './InventoryListing';
import { format } from 'date-fns';
import { formatZonedDate } from 'src/utils/formatZonedDate';

const tableHeaders: TableHeader<Inventory>[] = [
  {
    fieldName: 'productName',
    headerName: 'Product',
    highlight: true,
    flex: 'flex-[1_1_0%]',
  },

  {
    fieldName: 'availableQunatity',
    headerName: 'Available Qty.',
    flex: 'flex-[1_0_0%]',
  },
  {
    fieldName: 'totalPrice',
    headerName: 'STOCK VALUE',
    flex: 'flex-[1_0_0%]',
    renderCell: (item) => (
      <div>
        {CURRENCY} {Number(item?.totalPrice).toFixed(2)}
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
      // return date ? format(date, 'dd-MM-yyyy') : '-';
      return date ? formatZonedDate(date) : '-';
    },
  }
];

const InventoryListingWrapper = () => {
  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.inventory,
  );

  const { outlets } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const { data: products } = useFetchData(useGetProductsQuery, {
    body: {
      isPaginationRequired: false,
    },
  });
  const { appliedFilters } = useFilterPagination(['productId', 'outletId']);

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetInventoriesQuery,
    {
      body: {
        isPaginationRequired: false,
        searchIn: JSON.stringify(['productName']),
        filterBy: JSON.stringify(appliedFilters),
      },
    },
  );
  const filters: FilterType[] = [
    {
      filterType: 'multi-select',
      label: 'Product',
      fieldName: 'productId',
      options:
        products?.map((el) => {
          return {
            label: el?.productName,
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
      fieldName: 'outletId',
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
  return (
    <>
      <InventoryListing
        tableHeaders={tableHeaders}
        rowData={data as Inventory[]}
        filters={filters}
        isLoading={isLoading}
      />
    </>
  );
};

export default InventoryListingWrapper;
