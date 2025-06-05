import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { TopCustomerAndProducts } from '../../models/TopCustomerAndProducts.model';
import TopCustomersListing from './TopCustomersListing';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetTopCustomersQuery } from '../../service/TopCustomerAndProductsServices';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { FilterType } from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

type Props = {};

const tableHeaders: TableHeader<TopCustomerAndProducts>[] = [
  {
    fieldName: 'customerName',
    headerName: 'Customer Name',
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
    extraClasses: () => 'min-w-[200px]',
  },

  {
    fieldName: 'totalSellingPrice',
    headerName: 'Total Amount Spend',
    flex: 'flex-[1_0_0%]',
    extraClasses: () => 'min-w-[200px] text-center',
    align: 'end',
    renderCell: (row) => {
      return <div>{row?.totalSellingPrice.toFixed(2)}</div>;
    },
  },
];

const TopCustomersListingWrapper = (props: Props) => {
  const { limit, page, dateFilter, appliedFilters } = useFilterPagination(
    ['top_customer_outletId'],
    { preFixer: 'top_customer' },
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const { outlets } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, totalPages, totalData } = useFetchData(
    useGetTopCustomersQuery,
    {
      body: {
        limit: 10,
        page: 1,
        dateFilterKey: 'createdAt',
        startDate: dateFilter?.start_date || format(new Date(), 'yyyy-MM-dd'),
        endDate: dateFilter?.end_date || format(new Date(), 'yyyy-MM-dd'),
        outletId: appliedFilters?.[0]?.value,
      },
    },
  );
  const filters: FilterType[] = [
    {
      filterType: 'single-select',
      label: 'Outlet',
      fieldName: 'top_customer_outletId',
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
      filterType: 'date',
      fieldName: 'createdAt',
      dateFilterKeyOptions: [
        {
          label: 'top_customer_startDate',
          value: dateFilter?.start_date || '',
        },
        {
          label: 'top_customer_endDate',
          value: dateFilter?.end_date || '',
        },
      ],
    },
  ];
  useEffect(() => {
    if (!dateFilter?.start_date && !dateFilter?.end_date) {
      searchParams.set(
        'top_customer_startDate',
        format(new Date(), 'yyyy-MM-dd') || '',
      );
      searchParams.set(
        'top_customer_endDate',
        format(new Date(), 'yyyy-MM-dd') || '',
      );
      setSearchParams(searchParams);
    }
  }, [dateFilter]);
  return (
    <>
      <TopCustomersListing
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

export default TopCustomersListingWrapper;
