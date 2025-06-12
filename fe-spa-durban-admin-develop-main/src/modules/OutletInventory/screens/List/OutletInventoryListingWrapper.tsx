import { FilterType } from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { OutletInventory } from '../../models/OutletInventory.model';
import OutletInventoryListing from './OutletInventoryListing';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetInventoriesQuery } from 'src/modules/Inventory/service/InventoryServices';
import { CURRENCY } from 'src/utils/constants';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import { useGetProductsQuery } from 'src/modules/Product/service/ProductServices';
import { format } from 'date-fns';

type Props = {};

const tableHeaders: TableHeader<OutletInventory>[] = [
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
      return date ? format(date, 'dd-MM-yyyy') : '-';
    },
  }
];

const OutletInventoryListingWrapper = (props: Props) => {
  const { outlet }: { outlet: any } = useSelector(
    (state: RootState) => state.auth,
  );
  const { searchQuery, limit, page, appliedFilters } = useFilterPagination([
    'productId',
  ]);

  const { data: products } = useFetchData(useGetProductsQuery, {
    body: {
      isPaginationRequired: false,
    },
  });

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetInventoriesQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['ProductName']),
        filterBy: JSON.stringify([
          ...(appliedFilters || []),
          {
            fieldName: 'outletId',
            value: (outlet as any)?._id,
          },
        ]),
      },
      options: {
        skip: !outlet?._id,
      },
    },
  );
  const filters: FilterType[] = [
    {
      filterType: 'multi-select',
      label: 'Products',
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
  ];

  return (
    <>
      <OutletInventoryListing
        tableHeaders={tableHeaders}
        rowData={data as OutletInventory[]}
        filters={filters}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
      />
    </>
  );
};

export default OutletInventoryListingWrapper;
