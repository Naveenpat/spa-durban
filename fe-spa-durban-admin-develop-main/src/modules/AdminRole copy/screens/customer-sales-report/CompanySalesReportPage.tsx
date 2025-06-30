import { IconFileInvoice, IconGardenCart, IconPercentage, IconWallet } from '@tabler/icons-react';
import { format, subMonths } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
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
import HeaderWrapper from 'src/modules/Dashboard/components/Header/HeaderWrapper';
import { SalesReport } from 'src/modules/Invoices/models/Invoices.model';
import { useGetSalesChartDataReportByCustomerQuery, useGetSalesReportByCustomerQuery } from 'src/modules/Outlet/service/OutletServices';
import { RootState } from 'src/store';
import { isAuthorized } from 'src/utils/authorization';
import { formatZonedDate } from 'src/utils/formatZonedDate';
import * as XLSX from 'xlsx';
import { useGetCompanySalesChartDataQuery, useGetCompanySalesReportPaginatedQuery, useGetCompanySalesSummaryQuery } from '../../service/CompanyServices';
import { CURRENCY } from 'src/utils/constants';
import { showToast } from 'src/utils/showToaster';

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

type ChartType = "bar" | "pie" | "doughnut" | "line" | "radar" | "polarArea" | "bubble" | "scatter";




const CompanySalesReportPage = () => {
  const { id } = useParams(); // outletId from URL
  const [showCashbackModal, setShowCashbackModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const { searchQuery, limit, page, dateFilter, orderBy, orderValue } =
    useFilterPagination(['outletId', 'customerId']);

  // console.log('-----', searchQuery, limit, page, dateFilter, orderBy, orderValue)
  const [searchParams, setSearchParams] = useSearchParams();
  const { outlets } = useSelector((state: RootState) => state.auth);
  const queryParams = useMemo(() => ({
    companyId: id,
    page: page,
    limit: limit,
    sortBy: 'invoiceDate',
    sortOrder: 'desc',
    searchValue: '',
    searchIn: ['customerName', 'outletName'],
    startDate: dateFilter?.start_date,
    endDate: dateFilter?.end_date
  }), [id, dateFilter?.start_date, dateFilter?.end_date, page, limit, orderBy, orderValue]);

  const { data, error, refetch } = useGetCompanySalesReportPaginatedQuery(queryParams);

  // Example: refetch on sort change
  // useEffect(() => {
  //   refetch();
  // }, [orderBy, orderValue]);

  const { data: companySummaryData } = useGetCompanySalesSummaryQuery(id);


  const chartQueryParams = useMemo(() => {
    const query: Record<string, any> = {
      reportDuration: 'MONTHLY',
      startDate: dateFilter?.start_date,
      endDate: dateFilter?.end_date,
    };

    return {
      companyId: id,
      ...query,
    };
  }, [id, dateFilter?.start_date, dateFilter?.end_date]);

  const { data: customerSalesChartData, isLoading } =
    useGetCompanySalesChartDataQuery(chartQueryParams);

  const handleViewSalesReport = (row: any) => {
    setSelectedRow(row);
    setShowCashbackModal(true);
  };

  const handleCloseModal = () => {
    setShowCashbackModal(false);
    setSelectedRow(null);
  };

  const tableHeaders: TableHeader<SalesReport>[] = [
    {
      fieldName: 'invoiceNumber',
      headerName: 'Invoice N0.',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'outletName',
      headerName: 'Outlet Name',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'customerName',
      headerName: 'Customer Name',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'cashBackEarned',
      headerName: 'Cashback Earn',
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
    {
      fieldName: 'showItemModal',
      headerName: 'View Services',
      flex: 'flex-[0_0_150px]',
      renderCell: (row: any) => (
        <button
          onClick={() => {
            if (!isAuthorized('CUSTOMER_SALES_REPORT')) {
              showToast('error', 'You are not authorized to access this page.')
            } else { handleViewSalesReport(row) }
          }}
          className="text-white px-3 py-1 rounded hover:opacity-90"
          style={{ backgroundColor: '#006972' }}
        >
          View Services
        </button>

      ),
    }
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
  const totalAmount = data?.data?.totalSalesData;

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


  // const salesByDate = customerSalesChartData?.data?.salesByDate || [];
  // const salesByPaymentMode = customerSalesChartData?.data?.salesByPaymentMode || [];
  // const salesByOutlet = customerSalesChartData?.data?.salesByOutlet || [];

  const salesByDate = customerSalesChartData?.data?.salesByDate || [];
  const salesByPaymentMode = customerSalesChartData?.data?.salesByPaymentMode || [];
  const salesByOutlet = customerSalesChartData?.data?.salesByOutlet || [];
  const salesByStatus = customerSalesChartData?.data?.salesByStatus || [];
  const topCustomers = customerSalesChartData?.data?.topCustomers || [];
  const topItems = customerSalesChartData?.data?.topItems || [];


  const charts: {
    data: any[],
    label: string,
    type: ChartType,
    bg: string[] | string,
    width: number,
    height: number
  }[] = [
      { data: salesByDate, label: 'Sales Amount', type: 'bar', bg: '#006972', width: 600, height: 300 },
      { data: salesByPaymentMode, label: 'Payment Modes', type: 'pie', bg: ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0'], width: 280, height: 280 },
      { data: salesByOutlet, label: 'Outlet Sales', type: 'doughnut', bg: ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'], width: 280, height: 280 },
      { data: salesByStatus, label: 'Status', type: 'pie', bg: ['#f87171', '#facc15', '#4ade80'], width: 280, height: 280 },
      { data: topCustomers, label: 'Total Sales', type: 'bar', bg: '#3b82f6', width: 600, height: 300 },
      { data: topItems, label: 'Quantity Sold', type: 'bar', bg: '#8b5cf6', width: 600, height: 300 },
    ];

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
      <div className="flex flex-col h-full gap-2 p-3">
        <ATMPageHeader
          heading="Company Sales Report"
          // hideButton={true}
          buttonProps={{
            label: 'Back',
            onClick: () => navigate('/company'), // Navigate to previous page
            // position: 'left', // if your ATMPageHeader supports it
          }}
        />
        <Authorization permission="OUTLET_LIST">
          <div className="grid grid-cols-5 gap-2 font-semibold text-white">
            <div className="flex items-center gap-4 p-3 text-sm rounded-lg bg-gradient-to-r from-primary-40 to-primary-60">
              <IconFileInvoice size={50} />
              <div>
                <div>Today Invoices</div>
                <div>+{companySummaryData?.todayInvoices || '0'}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 text-sm rounded-lg bg-gradient-to-r from-red-600 to-red-400">
              <IconFileInvoice size={50} />
              <div>
                <div>This Month Invoices</div>
                <div>+{companySummaryData?.thisMonthInvoices || '0'}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 text-sm rounded-lg bg-gradient-to-r from-orange-600 to-orange-400">
              <IconGardenCart size={50} />
              <div>
                <div>Today Sales</div>
                <div>
                  + {CURRENCY}{' '}
                  {(companySummaryData?.todaySales && companySummaryData?.todaySales.toFixed(2)) || '0'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 text-sm rounded-lg bg-gradient-to-r from-green-600 to-green-400">
              <IconWallet size={50} />
              <div>
                <div>This Month Sales</div>
                <div>
                  + {CURRENCY}{' '}
                  {(companySummaryData?.thisMonthSales && companySummaryData?.thisMonthSales.toFixed(2)) || '0'}
                </div>
              </div>
            </div>

            {/* 🔹 Card D - Total Discount Given */}
            <div className="flex items-center gap-4 p-3 text-sm rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-400">
              <IconPercentage size={50} />
              <div>
                <div>Total Discounts</div>
                <div>
                  - {CURRENCY}{' '}
                  {(companySummaryData?.totalDiscount && companySummaryData?.totalDiscount.toFixed(2)) || '0'}
                </div>
              </div>
            </div>
          </div>
          <div>
            <MOLFilterBar hideSearch={true} filters={filters} />
          </div>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {charts.map((chart, index) => (
                chart.data.length > 0 && (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-md p-4 border border-slate-200 flex items-center justify-center"
                  >
                    <ATMChart
                      type={chart.type}
                      width={chart.width}
                      height={chart.height}
                      data={{
                        labels: chart.data.map((item: any) => item._id || 'N/A'),
                        datasets: [
                          {
                            label: chart.label,
                            data: chart.data.map((item: any) => item.total),
                            backgroundColor: chart.bg,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: chart.label || 'Chart',
                          },
                          scales: {
                            x: {
                              ticks: {
                                maxRotation: 45,
                                minRotation: 45,
                                callback: (val: any): string => {
                                  const label = (this as any).getLabelForValue(val); // cast if needed
                                  return label.length > 12 ? label.substring(0, 12) + '...' : label;
                                }

                              },
                            },
                          }
                        },
                      }}
                    />
                  </div>
                )
              ))}
            </div>

            <div>
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

            {invoices.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 text-lg font-semibold">
                <span>Total Sales Amount: R {totalAmount?.toFixed(2)}</span>
                <ATMButton onClick={() => handleExportCSV()}>
                  Export CSV
                </ATMButton>
              </div>
            )}
            {showCashbackModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                  <h2 className="text-xl font-semibold mb-4">Invoice Services Details</h2>

                  <p><strong>Customer Name:</strong> {selectedRow?.customerName || 'N/A'}</p>
                  <p><strong>Cashback Earned:</strong> ₹{selectedRow?.cashBackEarned ?? 0}</p>

                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Services:</h3>
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full border">
                        <thead>
                          <tr className="bg-gray-100 text-left text-sm">
                            <th className="p-2 border text-center">Item Name</th>
                            <th className="p-2 border text-center">Quantity</th>
                            <th className="p-2 border text-center">Selling Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRow?.items?.length > 0 ? (
                            selectedRow.items.map((item: any, idx: number) => (
                              <tr key={idx} className="text-sm">
                                <td className="p-2 border text-center">{item.itemName}</td>
                                <td className="p-2 border text-center">{item.quantity}</td>
                                <td className="p-2 border text-center">R {item.sellingPrice}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="text-center p-2">
                                No items found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-6 text-right">
                    <button
                      className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
                      onClick={handleCloseModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Authorization>
      </div >
    </>
  )
};

export default CompanySalesReportPage;
