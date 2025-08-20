import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { SalesComparisonList } from '../../models/SalesComparison.model';
import SalesComparisonListing from './SalesComparisonListing';
import { FilterType } from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import { useGetSalesReportQuery } from '../../service/SalesComparisonServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, subMonths } from 'date-fns';

type Props = {};
const salesData = [
  {
    label: 'Monthly',
    value: 'MONTHLY',
  },
  {
    label: 'Weekly',
    value: 'WEEKLY',
  },
  {
    label: 'Daily',
    value: 'DAILY',
  },
];

const SalesComparisonListingWrapper = (props: Props) => {
  const { appliedFilters, dateFilter } = useFilterPagination(['reportDuration']);
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, totalPages, totalData } = useFetchData(
    useGetSalesReportQuery,
    {
      body: {
        reportDuration: appliedFilters?.[0]?.value,
        startDate:dateFilter?.start_date,
        endDate:dateFilter?.end_date
      },
    },
  );
  const safeData = data ?? [];

  const today = new Date();
  const oneMonthAgo = subMonths(today, 1);
  useEffect(() => {
    if (!dateFilter?.start_date && !dateFilter?.end_date) {
      const newSearchParams = new URLSearchParams(searchParams); // Clone existing searchParams
      newSearchParams.set('startDate', format(oneMonthAgo, 'yyyy-MM-dd') || '');
      newSearchParams.set('endDate', format(new Date(), 'yyyy-MM-dd') || '')
      setSearchParams(newSearchParams)
    }
  }, [dateFilter]);


  const yearMonths = Array.from(
    new Set(
      safeData?.flatMap((outlet: any) =>
        outlet?.sales.map(
          (sale: any) => sale?.yearMonth || sale?.week || sale?.date,
        ),
      ),
    ),
  );
  const tableHeaders: TableHeader<any>[] = [
    {
      fieldName: 'outletName',
      headerName: 'Name',
      flex: 'flex-[1_1_0%]',
      extraClasses: () => ' capitalize',
    },
    ...yearMonths?.map((yearMonth: string) => ({
      fieldName: yearMonth,
      headerName: yearMonth,
      flex: 'flex-[1_0_0%]',
      extraClasses: () => 'min-w-[210px]',
      renderCell: (row: any) => {
        const sale = row?.sales.find(
          (sale: any) =>
            sale?.yearMonth === yearMonth ||
            sale?.week === yearMonth ||
            sale.date === yearMonth,
        );
        return <div>{sale?.totalSales && sale?.totalSales.toFixed(2)}</div>;
      },
    })),
  ];
  const filters: FilterType[] = [
    {
      filterType: 'single-select',
      label: 'Compare Sales',
      fieldName: 'reportDuration',
      options: salesData || [],
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
          label: 'startDate',
          value: dateFilter?.start_date || '',
        },
        {
          label: 'endDate',
          value: dateFilter?.end_date || '',
        },
      ],
    }
  ];
  useEffect(() => {
    searchParams.set('reportDuration', 'MONTHLY');

    setSearchParams(searchParams);
  }, []);
  return (
    <>
      <SalesComparisonListing
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

export default SalesComparisonListingWrapper;
