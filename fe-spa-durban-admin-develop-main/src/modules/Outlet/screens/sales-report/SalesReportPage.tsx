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
import { useGetSalesReportByOutletQuery } from '../../service/OutletServices';

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

const SalesReportPage = () => {
  const { id } = useParams(); // outletId from URL


  const { searchQuery, limit, page, dateFilter } =
    useFilterPagination(['outletId', 'customerId']);
  const [searchParams, setSearchParams] = useSearchParams();
  const { outlets } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, error } = useGetSalesReportByOutletQuery({
    outletId: id,
    startDate: dateFilter?.start_date,
    endDate: dateFilter?.end_date,
    page: 1,
    limit: 10
  });

  console.log('----data', data)


  const tableHeaders: TableHeader<SalesReport>[] = [
    {
      fieldName: 'invoiceNumber',
      headerName: 'Invoice N0.',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'customerName',
      headerName: 'Customer Name',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'totalAmount',
      headerName: 'Total Amount',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'balanceDue',
      headerName: 'Balance Due',
      flex: 'flex-[1_0_0%]',
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
      headerName: 'Status',
      align: 'center',
      flex: 'flex-[1_1_0%]',
      renderCell: (item) => (
        <div>
          {item.status && item.status.trim() !== '' ? (
            <span className="text-red-700 bg-red-100 py-[3px] font-medium px-2 rounded-lg border-slate-300">
              {item.status}
            </span>
          ) : item?.balanceDue > 0 ? (
            <span className="text-yellow-700 bg-yellow-100 py-[3px] font-medium px-2 rounded-lg border-slate-300">
              Unpaid
            </span>
          ) : (
            <span className="text-green-700 bg-green-100 py-[3px] font-medium px-2 rounded-lg border-slate-300">
              Paid
            </span>
          )}
        </div>
      ),
    },
  ]

  const filters: FilterType[] = [
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

  const invoices = data?.data?.invoices || [];
  const totalAmount = data?.data?.totalSalesData[0]?.totalSalesAmount || [];


  useEffect(() => {
    if (!dateFilter?.start_date && !dateFilter?.end_date) {
      const newSearchParams = new URLSearchParams(searchParams); // Clone existing searchParams
      newSearchParams.set('startDate', format(new Date(), 'yyyy-MM-dd') || '');
      newSearchParams.set('endDate', format(new Date(), 'yyyy-MM-dd') || '');
      newSearchParams.set('reportDuration', 'MONTHLY');
      setSearchParams(newSearchParams)
    }
  }, [dateFilter, outlets]);

  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Outlet Sales Report"
          hideButton={true}
        />
        <Authorization permission="OUTLET_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar hideSearch={true} filters={filters} />

            <div className="flex-1 overflow-auto">
              <MOLTable<SalesReport>
                tableHeaders={tableHeaders}
                data={invoices || []}
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
              rows={invoices || []}
            />
          </div>
        </Authorization>
        {invoices.length > 0 && (
          <div className="flex items-center justify-end px-4 py-3 text-lg font-semibold">
            Total Sales Amount: R {totalAmount?.toFixed(2)}
          </div>
        )}

      </div>
    </>
  )
};

export default SalesReportPage;
