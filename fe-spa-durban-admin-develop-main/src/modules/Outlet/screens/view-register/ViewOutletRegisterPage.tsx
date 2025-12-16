import { format, subMonths } from 'date-fns';
import { useEffect, useState } from 'react';
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


  const { searchQuery, limit, page, dateFilter, orderBy, orderValue, appliedFilters } =
    useFilterPagination(['outletsId', 'customerId']);
  const [searchParams, setSearchParams] = useSearchParams();
  const { outlets } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, error } = useGetRegisterDataQuery({
    outletId: appliedFilters?.[0]?.value,
    startDate: dateFilter?.start_date,
    endDate: dateFilter?.end_date,
    page: page,
    limit: limit,
    sortBy: orderBy || 'createdAt',
    sortOrder: orderValue || 'desc',
  });

  const { data: chartData } = useGetRegisterChartDataQuery({
    outletId: appliedFilters?.[0]?.value,
    startDate: dateFilter?.start_date,
    endDate: dateFilter?.end_date
  });

  console.log('-----chartData', chartData)


  const dailySummary = chartData?.data?.dailySummary || [];
  const finalCashVsOpening = chartData?.data?.finalCashVsOpening || [];
  const paymentModeBreakdown = chartData?.data?.paymentModeBreakdown || [];
  const allInOneTable = chartData?.data?.allInOneTable || [];
  // console.log('----chartData', chartData)


  const [selectedRegister, setSelectedRegister] = useState<any>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const handleViewPayouts = (row: any) => {
    setSelectedRegister(row);
    setShowPayoutModal(true);
  };

  const handleViewPayments = (row: any) => {
    setSelectedRegister(row);
    setShowPaymentsModal(true);
  };



  const tableHeaders: TableHeader<RegisterValue>[] = [
    {
      fieldName: 'openedAt',
      headerName: 'Open Date',
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
      fieldName: 'closedAt',
      headerName: 'Close Date',
      flex: 'flex-[1_1_0%]',
      sortable: true,
      sortKey: 'closedAt',
      extraClasses: () => '',
      stopPropagation: true,
      render: (row: any) => {
        const date = row.closedAt ? new Date(row.closedAt) : null;
        return date ? formatZonedDate(date) : '-';
      }
    },
    {
      fieldName: 'openingBalance',
      headerName: 'Opening Balance',
      flex: 'flex-[1_1_0%]',
      // render:(row:any)=>{
      //   return `${row?.openingBalance} (+${row?.carryForwardBalance})`
      // }
    },
    {
      fieldName: 'totalManualAmount',
      headerName: 'Total Manual Cash',
      flex: 'flex-[1_1_0%]',
    },
    {
      fieldName: 'bankDeposit',
      headerName: 'Bank Deposite',
      flex: 'flex-[1_1_0%]',
      render: (row: any) => {
        return `-${row?.bankDeposit}`
      }
    },
    {
      fieldName: 'totalPayouts',
      headerName: 'Total Payout',
      flex: 'flex-[1_1_0%]',
       render: (row: any) => {
        return `-${row?.totalPayouts}`
      }
    },
    
    {
      fieldName: 'carryForwardBalance',
      headerName: 'C/F Balance',
      flex: 'flex-[1_1_0%]',
    },
    // {
    //   fieldName: 'closeRegister',
    //   headerName: 'Payment Summary',
    //   flex: 'flex-[3_1_0%]',
    //   render: (row: any) => {
    //     if (!Array.isArray(row?.closeRegister)) return '-';

    //     return (
    //       <div className="space-y-2 text-sm">
    //         {row.closeRegister.map((entry: any, index: number) => (
    //           <div key={index} className="border rounded p-2 bg-gray-50">
    //             {/* <div className="font-semibold">
    //             {new Date(entry.date).toLocaleDateString('en-GB')}
    //           </div> */}
    //             <ul className="list-disc pl-4 mt-1 space-y-1">
    //               {entry.payments?.map((payment: any, i: number) => (
    //                 <li key={i}>
    //                   <span className="capitalize font-medium">{payment.paymentModeName}</span>:
    //                   Total: R {payment.totalAmount?.toFixed(2)} | Manual: R {payment.manual || '0'}
    //                   {payment.reason && (
    //                     <span className="text-orange-600 ml-1">
    //                       (Reason: {payment.reason})
    //                     </span>
    //                   )}
    //                 </li>
    //               ))}
    //             </ul>
    //           </div>
    //         ))}
    //       </div>
    //     );
    //   }
    // },
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
      fieldName: 'closeRegister',
      headerName: 'Payment Summary',
      flex: 'flex-[1_1_0%]',
      render: (row: any) => (
        <button
          className="text-white px-3 py-1 rounded hover:opacity-90"
          style={{ backgroundColor: '#006972' }}
          onClick={() => handleViewPayments(row)}
        >
          View Payments
        </button>
      ),
    },


    // {
    //   fieldName: 'cashUsageReason',
    //   headerName: 'Cash Usage Reason',
    //   flex: 'flex-[1_1_0%]',
    // },
    {
      fieldName: 'actions',
      headerName: 'Payouts',
      flex: 'flex-[1_1_0%]',
      render: (row: any) => (
        <button
          className="text-white px-3 py-1 rounded hover:opacity-90"
          style={{ backgroundColor: '#006972' }}
          onClick={() => handleViewPayouts(row)}
        >
          View Payouts
        </button>
      ),
    }
  ];


  const filters: FilterType[] = [
    {
      filterType: 'single-select',
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

  const invoices = data?.data || [];
  // const totalAmount = data && data?.data?.totalSalesData[0]?.totalSalesAmount || [];
  const today = new Date();
  const oneMonthAgo = subMonths(today, 1);

  useEffect(() => {
    if (!dateFilter?.start_date && !dateFilter?.end_date) {
      const newSearchParams = new URLSearchParams(searchParams); // Clone existing searchParams
      newSearchParams.set('startDate', format(oneMonthAgo, 'yyyy-MM-dd') || '');
      newSearchParams.set('endDate', format(new Date(), 'yyyy-MM-dd') || '');
      newSearchParams.set('outletsId', outlets?.[0]._id);
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
          hideButton={true}
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
                    type="pie"
                    data={{
                      labels: ['Opening Balance', 'Final Cash', 'Payout Cash'],
                      datasets: [
                        {
                          label: finalCashVsOpening[0].date, // show date in tooltip
                          data: [
                            finalCashVsOpening[0].openingBalance,
                            finalCashVsOpening[0].finalCash,
                            finalCashVsOpening[0].payoutCash,
                          ],
                          backgroundColor: ['#6366f1', '#06b6d4', '#f59e0b'],
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

            <div className="flex-1 mt-3">
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
        {showPayoutModal && selectedRegister && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full p-6 rounded-xl shadow-xl space-y-4 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold text-gray-800">Cash Usage Payouts</h2>
                <ATMButton variant="outlined" onClick={() => setShowPayoutModal(false)}>Close</ATMButton>
              </div>

              {selectedRegister?.cashUsage?.length > 0 ? (
                <ul className="space-y-4">
                  {selectedRegister.cashUsage.map((entry: any, idx: number) => (
                    <li
                      key={idx}
                      className="border rounded-lg p-4 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                    >
                      <div>
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Reason:</strong> {entry.reason}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Amount:</strong> R {entry.amount}
                        </p>
                      </div>
                      {entry.proofUrl && (
                        <img
                          src={`${process.env.REACT_APP_BASE_URL}/${entry.proofUrl}`}
                          alt="Proof"
                          className="mt-3 sm:mt-0 w-16 h-16 object-contain rounded border"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No cash usage entries found.</p>
              )}
            </div>
          </div>
        )}

        {showPaymentsModal && selectedRegister && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-xl w-full p-6 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Payment Summary</h2>
                <ATMButton variant="outlined" onClick={() => setShowPaymentsModal(false)}>Close</ATMButton>
              </div>

              {selectedRegister?.closeRegister?.length > 0 ? (
                selectedRegister.closeRegister.map((entry: any, dateIndex: number) => (
                  <div key={dateIndex} className="mb-4">
                    <h3 className="text-sm font-bold mb-2 text-gray-700">
                      {new Date(entry.date).toLocaleDateString('en-GB')}
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      {entry.payments?.map((payment: any, idx: number) => (
                        <li key={idx}>
                          <span className="font-medium capitalize">{payment.paymentModeName}</span>: Total: R{" "}
                          {payment.totalAmount?.toFixed(2)} | Manual: R {payment.manual || '0'}
                          {payment.reason && (
                            <span className="text-orange-600 ml-1">(Reason: {payment.reason})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No payment summary available.</p>
              )}
            </div>
          </div>
        )}


      </div>
    </>
  )
};

export default ViewOutletRegisterPage;
