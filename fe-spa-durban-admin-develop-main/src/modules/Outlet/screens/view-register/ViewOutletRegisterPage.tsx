import { format, subMonths } from 'date-fns';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import Authorization from 'src/components/Authorization/Authorization';
import MOLFilterBar, { FilterType } from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { SalesReport } from 'src/modules/Invoices/models/Invoices.model';
import { RootState } from 'src/store';
import { isAuthorized } from 'src/utils/authorization';
import { useGetRegisterChartDataQuery, useGetRegisterDataQuery, useGetSalesChartDataReportByOutletQuery, useGetSalesReportByOutletQuery } from '../../service/OutletServices';
import ATMChart from 'src/components/atoms/ATMChart/ATMChart';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import { formatZonedDate } from 'src/utils/formatZonedDate';
import * as XLSX from 'xlsx';
import { Register, RegisterValue } from 'src/modules/OpenRegister/models/OpenRegister.model';


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

const ViewOutletRegisterPage = () => {
  const { id } = useParams(); // outletId from URL


  const { searchQuery, limit, page, dateFilter, orderBy, orderValue } =
    useFilterPagination(['outletId', 'customerId']);
  const [searchParams, setSearchParams] = useSearchParams();
  const { outlets } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, error } = useGetRegisterDataQuery({
    outletId: id,
    startDate: dateFilter?.start_date,
    endDate: dateFilter?.end_date,
    page: page,
    limit: limit,
    sortBy: orderBy || 'createdAt',
    sortOrder: orderValue || 'desc',
  });

  const { data: chartData } = useGetRegisterChartDataQuery({
    outletId: id,
    startDate: dateFilter?.start_date,
    endDate: dateFilter?.end_date
  });

  console.log('-----chartData', chartData)


  const dailySummary = chartData?.data?.dailySummary || [];
  const finalCashVsOpening = chartData?.data?.finalCashVsOpening || [];
  const paymentModeBreakdown = chartData?.data?.paymentModeBreakdown || [];
  const allInOneTable = chartData?.data?.allInOneTable || [];
  // console.log('----chartData', chartData)


  const tableHeaders: TableHeader<RegisterValue>[] = [
    {
      fieldName: 'openedAt',
      headerName: 'Date',
      flex: 'flex-[1_1_0%]',
      sortable: true,
      sortKey: 'openedAt',
      extraClasses: () => '',
      stopPropagation: true,
      render: (row: any) => {
        const date = row.openedAt ? new Date(row.openedAt) : null;
        return date ? formatZonedDate(date) : '-';
      }
    },
    {
      fieldName: 'openingBalance',
      headerName: 'Opening Balance',
      flex: 'flex-[1_1_0%]',
    },
    {
      fieldName: 'carryForwardBalance',
      headerName: 'Carry Forward Balance',
      flex: 'flex-[1_1_0%]',
    },
    {
      fieldName: 'bankDeposit',
      headerName: 'Bank Deposite',
      flex: 'flex-[1_1_0%]',
    },
    {
      fieldName: 'cashAmount',
      headerName: 'Total Cash',
      flex: 'flex-[1_1_0%]',
    },
    {
      fieldName: 'closeRegister',
      headerName: 'Payment Summary',
      flex: 'flex-[3_1_0%]',
      render: (row: any) => {
        if (!Array.isArray(row?.closeRegister)) return '-';

        return (
          <div className="space-y-2 text-sm">
            {row.closeRegister.map((entry: any, index: number) => (
              <div key={index} className="border rounded p-2 bg-gray-50">
                {/* <div className="font-semibold">
                {new Date(entry.date).toLocaleDateString('en-GB')}
              </div> */}
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  {entry.payments?.map((payment: any, i: number) => (
                    <li key={i}>
                      <span className="capitalize font-medium">{payment.paymentModeName}</span>:
                      Total: R {payment.totalAmount?.toFixed(2)} | Manual: R {payment.manual || '0'}
                      {payment.reason && (
                        <span className="text-orange-600 ml-1">
                          (Reason: {payment.reason})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      }
    },
    {
      fieldName: 'registerStatus',
      headerName: 'Register Status',
      flex: 'flex-[1_1_0%]',
      render: (row: any) => {
        if (row.isClosed) return 'Closed';
        if (row.isOpened) return 'Opened';
        return 'Not Opened';
      }
    },
    {
      fieldName: 'cashUsageReason',
      headerName: 'Cash Usage Reason',
      flex: 'flex-[1_1_0%]',
    },
    {
      fieldName: 'cashUsageProofUrl',
      headerName: 'Image',
      flex: 'flex-[0.5_1_0%]',
      render: (row: any) => (
        <img
          src={`${process.env.REACT_APP_BASE_URL}/${row.cashUsageProofUrl}`}
          onError={(e) => (e.currentTarget.src)}
          alt="Logo"
          className="h-12 w-12 object-contain rounded-full border"
        />
      ),
      stopPropagation: true,
    }
  ];


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

  const invoices = data?.data || [];
  // const totalAmount = data && data?.data?.totalSalesData[0]?.totalSalesAmount || [];
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

  const navigate = useNavigate();


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
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Outlet Register Details"
          // hideButton={true}
          buttonProps={{
            label: 'Back',
            onClick: () => navigate('/outlets'), // Navigate to previous page
            // position: 'left', // if your ATMPageHeader supports it
          }}
        />
        <Authorization permission="OUTLET_LIST">
          {/* Table Toolbar */}
          <MOLFilterBar hideSearch={true} filters={filters} />
          <div className="flex flex-col overflow-auto border rounded border-slate-300 p-1">
            <div className="grid grid-cols-2 gap-4">
              {/* Chart 4: Daily Summary (Line) */}
              {dailySummary.length > 0 && (
                <div className="col-span">
                  <ATMChart
                    type="bar"
                    data={{
                      labels: dailySummary.map((item: any) => item.date),
                      datasets: [
                        {
                          label: 'Total Cash',
                          data: dailySummary.map((item: any) => item.totalCash),
                          borderColor: '#3b82f6',
                          backgroundColor: '#3b82f670',
                        },
                        {
                          label: 'Bank Deposit',
                          data: dailySummary.map((item: any) => item.bankDeposit),
                          borderColor: '#10b981',
                          backgroundColor: '#10b98170',
                        },
                        {
                          label: 'Carry Forward',
                          data: dailySummary.map((item: any) => item.carryForwardBalance),
                          borderColor: '#f59e0b',
                          backgroundColor: '#f59e0b70',
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

              {/* Chart 5: Final Cash vs Opening Balance (Bar) */}
              {finalCashVsOpening.length > 0 && (
                <div className="col-span">
                  <ATMChart
                    type="bar"
                    data={{
                      labels: finalCashVsOpening.map((item: any) => item.date),
                      datasets: [
                        {
                          label: 'Opening Balance',
                          data: finalCashVsOpening.map((item: any) => item.openingBalance),
                          backgroundColor: '#6366f1',
                        },
                        {
                          label: 'Final Cash',
                          data: finalCashVsOpening.map((item: any) => item.finalCash),
                          backgroundColor: '#06b6d4',
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
            </div>

            <div className="flex-1 overflow-auto mt-3">
              <MOLTable<RegisterValue>
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
        {/* {invoices.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 text-lg font-semibold">
            <span>Total Sales Amount: R {totalAmount?.toFixed(2)}</span>
            <ATMButton onClick={() => handleExportCSV()}>
              Export CSV
            </ATMButton>
          </div>
        )} */}


      </div>
    </>
  )
};

export default ViewOutletRegisterPage;
