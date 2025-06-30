import { format, subMonths } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMChart from 'src/components/atoms/ATMChart/ATMChart';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import Authorization from 'src/components/Authorization/Authorization';
import MOLFilterBar, { FilterType } from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { SalesReport } from 'src/modules/Invoices/models/Invoices.model';
import { useGetSalesChartDataReportByCustomerQuery, useGetSalesReportByCustomerQuery } from 'src/modules/Outlet/service/OutletServices';
import { RootState } from 'src/store';
import { isAuthorized } from 'src/utils/authorization';
import { formatZonedDate } from 'src/utils/formatZonedDate';
import * as XLSX from 'xlsx';

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

const CustomerSalesReportPage = () => {
  const { id } = useParams(); // outletId from URL


  const { searchQuery, limit, page, dateFilter, orderBy, orderValue } =
    useFilterPagination(['outletId', 'customerId']);

  // console.log('-----', searchQuery, limit, page, dateFilter, orderBy, orderValue)
  const [searchParams, setSearchParams] = useSearchParams();
  const { outlets } = useSelector((state: RootState) => state.auth);
  const queryParams = useMemo(() => ({
    customerId: id,
    startDate: dateFilter?.start_date,
    endDate: dateFilter?.end_date,
    page,
    limit,
    sortBy: orderBy || 'createdAt',
    sortOrder: orderValue || 'desc',
  }), [id, dateFilter?.start_date, dateFilter?.end_date, page, limit, orderBy, orderValue]);

  const { data, isLoading, error, refetch } = useGetSalesReportByCustomerQuery(queryParams);

  // Example: refetch on sort change
  // useEffect(() => {
  //   refetch();
  // }, [orderBy, orderValue]);

  const { data: customerSalesChartData } = useGetSalesChartDataReportByCustomerQuery({
    customerId: id,
    startDate: dateFilter?.start_date,
    endDate: dateFilter?.end_date
  });

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
      sortable: true,
      sortKey: 'totalAmount',
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
      sortable: true,
      sortKey: 'createdAt',
      extraClasses: () => '',
      stopPropagation: true,
      render: (row: any) => {
        const date = row.createdAt ? new Date(row.createdAt) : null;
        return date ? formatZonedDate(date) : '-';
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
    // {
    //   filterType: 'multi-select',
    //   label: 'Outlet',
    //   fieldName: 'outletsId',
    //   options:
    //     outlets?.map((el: any) => {
    //       return {
    //         label: el?.name,
    //         value: el?._id,
    //       };
    //     }) || [],
    //   renderOption: (option) => option.label,
    //   isOptionEqualToSearchValue: (option, value) => {
    //     return option?.label.includes(value);
    //   },
    // },
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

  const invoices = data?.data?.invoices || [];
  const totalAmount = data?.data?.totalSalesData[0]?.totalSalesAmount || [];

  const today = new Date();
  const oneMonthAgo = subMonths(today, 1);

  useEffect(() => {
    if (!dateFilter?.start_date && !dateFilter?.end_date) {
      const newSearchParams = new URLSearchParams(searchParams); // Clone existing searchParams
      newSearchParams.set('startDate', format(oneMonthAgo, 'yyyy-MM-dd') || '');
      newSearchParams.set('endDate', format(new Date(), 'yyyy-MM-dd') || '');
      newSearchParams.set('reportDuration', 'MONTHLY');
      setSearchParams(newSearchParams)
    }
  }, [dateFilter, outlets]);


  const salesByDate = customerSalesChartData?.data?.salesByDate || [];
  const salesByPaymentMode = customerSalesChartData?.data?.salesByPaymentMode || [];
  const salesByOutlet = customerSalesChartData?.data?.salesByOutlet || [];


  const handleExportCSV = () => {
    const exportData = invoices.map((inv: any) => ({
      InvoiceNumber: inv.invoiceNumber,
      CustomerName: inv.customerName,
      TotalAmount: inv.totalAmount,
      BalanceDue: inv.balanceDue,
      Status: inv.status || (inv.balanceDue > 0 ? 'Unpaid' : 'Paid'),
      Date: formatZonedDate(inv.createdAt), // you can use format() or your global time util
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Customer_Sales_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Customer Sales Report"
          // hideButton={true}
          buttonProps={{
            label: 'Back',
            onClick: () => navigate('/customer'), // Navigate to previous page
            // position: 'left', // if your ATMPageHeader supports it
          }}
        />
        <Authorization permission="OUTLET_LIST">
          <MOLFilterBar hideSearch={true} filters={filters} />
          <div className="flex flex-col overflow-auto border rounded border-slate-300 p-1">

            <div className="grid grid-cols-3 gap-4">
              {salesByDate.length > 0 && (
                <div className="col-span">
                  <ATMChart
                    type="bar"
                    width={600}
                    height={300}
                    data={{
                      labels: salesByDate.map((item: any) => item._id),
                      datasets: [
                        {
                          label: 'Sales by Date',
                          data: salesByDate.map((item: any) => item.total),
                          backgroundColor: '#006972',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'top' } },
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              )}

              {salesByPaymentMode.length > 0 && (
                <div className="col-span">
                  <ATMChart
                    type="pie"
                    width={600}
                    height={300}
                    data={{
                      labels: salesByPaymentMode.map((item: any) => item._id),
                      datasets: [
                        {
                          label: 'Payment Modes',
                          data: salesByPaymentMode.map((item: any) => item.total),
                          backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'top' } },
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              )}

              {salesByOutlet.length > 0 && (
                <div className="col-span">
                  <ATMChart
                    type="doughnut"
                    width={600}
                    height={300}
                    data={{
                      labels: salesByOutlet.map((item: any) => item._id),
                      datasets: [{ label: 'Sales by Outlet', data: salesByOutlet.map((item: any) => item.total), backgroundColor: ['#06b6d4', '#10b981', '#f59e0b', '#ef4444'] }],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'top' } },
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              )}

            </div>

            <div className="flex-1 overflow-auto mt-3">
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
          <div className="flex items-center justify-between px-4 py-3 text-lg font-semibold">
            <span>Total Sales Amount: R {totalAmount?.toFixed(2)}</span>
            <ATMButton onClick={() => handleExportCSV()}>
              Export CSV
            </ATMButton>
          </div>
        )}

      </div>
    </>
  )
};

export default CustomerSalesReportPage;
