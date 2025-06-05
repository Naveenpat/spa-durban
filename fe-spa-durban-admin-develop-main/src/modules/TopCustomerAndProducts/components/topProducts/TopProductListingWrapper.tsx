import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { TopCustomerAndProducts } from '../../models/TopCustomerAndProducts.model';
import TopProductListing from './TopProductListing';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetTopProductsQuery } from '../../service/TopCustomerAndProductsServices';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import { format } from 'date-fns';
import { FilterType } from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

type Props = {};
const itemData = [
  {
    label: 'Product',
    value: 'PRODUCT',
  },
  {
    label: 'Service',
    value: 'SERVICE',
  },
];

const TopProductListingWrapper = (props: Props) => {
  const { limit, page, dateFilter, appliedFilters } = useFilterPagination(
    ['top_product_outletId', 'top_product_itemType'],
    { preFixer: 'top_product' },
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const { outlets } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, totalPages, totalData } = useFetchData(
    useGetTopProductsQuery,
    {
      body: {
        limit: 10,
        page: 1,
        dateFilterKey: 'createdAt',
        startDate: dateFilter?.start_date || format(new Date(), 'yyyy-MM-dd'),
        endDate: dateFilter?.end_date || format(new Date(), 'yyyy-MM-dd'),
        outletId: appliedFilters?.[0]?.value,
        itemType: appliedFilters?.[1]?.value,
      },
    },
  );
  const tableHeaders: TableHeader<TopCustomerAndProducts>[] = [
    {
      fieldName: 'itemName',
      headerName: `${appliedFilters?.[1]?.value?.[0] === 'PRODUCT' ? 'Product' : 'Service'} NAme`,
      flex: 'flex-[1_1_0%]',
      stopPropagation: true,
    },

    {
      fieldName: 'totalQuantity',
      headerName: 'Count',
      flex: 'flex-[1_0_0%]',
      align: 'end',
    },
  ];

  const filters: FilterType[] = [
    {
      filterType: 'single-select',
      label: 'Outlet',
      fieldName: 'top_product_outletId',
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
    {
      filterType: 'single-select',
      label: 'item',
      fieldName: 'top_product_itemType',
      options: itemData || [],
      renderOption: (option) => option.label,
      isOptionEqualToSearchValue: (option, value) => {
        return option?.label.includes(value);
      },
    },
    {
      filterType: 'date',
      fieldName: 'createdAt',
      dateFilterKeyOptions: [
        {
          label: 'top_product_startDate',
          value: dateFilter?.start_date || '',
        },
        {
          label: 'top_product_endDate',
          value: dateFilter?.end_date || '',
        },
      ],
    },
  ];
  useEffect(() => {
    if (!dateFilter?.start_date && !dateFilter?.end_date) {
      searchParams.set(
        'top_product_startDate',
        format(new Date(), 'yyyy-MM-dd') || '',
      );
      searchParams.set(
        'top_product_endDate',
        format(new Date(), 'yyyy-MM-dd') || '',
      );
      searchParams.set('top_product_itemType', 'PRODUCT');
      setSearchParams(searchParams);
    }
  }, [dateFilter]);
  return (
    <>
      <TopProductListing
        tableHeaders={tableHeaders}
        rowData={data as any}
        filter={filters}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
      />
    </>
  );
};

export default TopProductListingWrapper;
