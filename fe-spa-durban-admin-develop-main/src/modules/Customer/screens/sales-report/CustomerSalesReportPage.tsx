import { format } from 'date-fns';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import Authorization from 'src/components/Authorization/Authorization';
import MOLFilterBar, { FilterType } from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { SalesReport } from 'src/modules/Invoices/models/Invoices.model';
import { RootState } from 'src/store';
import { isAuthorized } from 'src/utils/authorization';

const CustomerSalesReportPage = () => {
  const { id } = useParams(); // outletId from URL


  const { searchQuery, limit, page, dateFilter, appliedFilters } =
    useFilterPagination(['outletId', 'customerId']);
  const [searchParams, setSearchParams] = useSearchParams();
  const { outlets } = useSelector((state: RootState) => state.auth);

  const tableHeaders: TableHeader<SalesReport>[] = [
    {
      fieldName: 'invoiceNumber',
      headerName: 'Invoice Number',
      flex: 'flex-[1_0_0%]',
    }
  ]

  const filters: FilterType[] = [
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
    },
  ];


  useEffect(() => {
    if (!dateFilter?.start_date && !dateFilter?.end_date) {
      const newSearchParams = new URLSearchParams(searchParams); // Clone existing searchParams
      newSearchParams.set('startDate', format(new Date(), 'yyyy-MM-dd') || '');
      newSearchParams.set('endDate', format(new Date(), 'yyyy-MM-dd') || '');
      const existingOutlets = newSearchParams.getAll('outletId');
      const newOutletIds = outlets.map((item: any) => item?._id) || [];
      if (JSON.stringify(existingOutlets) !== JSON.stringify(newOutletIds)) {
        newSearchParams.delete('outletId'); // Remove existing outletId params
        newOutletIds.forEach((id) => {
          newSearchParams.append('outletId', id); // Append new outlet IDs
        });
        setSearchParams(newSearchParams);
      }
    }
  }, [dateFilter, outlets]);

  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Customer Sales Report"
          hideButton={true}
        />
        <Authorization permission="OUTLET_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar filters={filters} />

            <div className="flex-1 overflow-auto">
              <MOLTable<SalesReport>
                tableHeaders={tableHeaders}
                data={[]}
                getKey={(item) => item?._id}
                onEdit={undefined}
                onDelete={undefined}
                isLoading={false}
              />
            </div>

            {/* Pagination */}
            <ATMPagination
              totalPages={1}
              rowCount={1}
              rows={[]}
            />
          </div>
        </Authorization>
      </div>
    </>
  )
};

export default CustomerSalesReportPage;
