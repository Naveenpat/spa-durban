import { endOfDay, format, startOfDay, subMonths, subWeeks } from 'date-fns';
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
import { useGetGiftCardReportByOutletQuery, useGetGiftCardReportChartDataQuery, useGetRetailDashboardDataQuery, useGetSalesChartDataReportByOutletQuery, useGetSalesReportByOutletQuery } from '../../service/OutletServices';
import ATMChart from 'src/components/atoms/ATMChart/ATMChart';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
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

const ViewReatailDashboardPage = () => {
  const { searchQuery, limit, page, dateFilter, orderBy, orderValue, appliedFilters } =
    useFilterPagination(['outletIds', 'customerId', 'reportDuration']);
  const [searchParams, setSearchParams] = useSearchParams();
  const { outlets } = useSelector((state: RootState) => state.auth);


  const { data } = useGetRetailDashboardDataQuery({
    outletIds: appliedFilters?.[0]?.value,
    startDate: dateFilter?.start_date,
    endDate: dateFilter?.end_date,
    reportDuration: appliedFilters?.[2]?.value
  });

  console.log('----------ffff', data)

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
    {
      filterType: 'multi-select',
      label: 'Outlets',
      fieldName: 'outletIds',
      options:
        outlets?.map((el) => {
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
      label: 'Select',
      fieldName: 'reportDuration',
      options: salesData || [],
      renderOption: (option) => option.label,
      isOptionEqualToSearchValue: (option, value) => {
        return option?.label.includes(value);
      },
    },
  ];

  const today = new Date();
  const oneMonthAgo = subMonths(today, 1);

  // useEffect(() => {
  //   if (!dateFilter?.start_date && !dateFilter?.end_date) {
  //     const newSearchParams = new URLSearchParams(searchParams); // Clone existing searchParams
  //     newSearchParams.set('startDate', format(oneMonthAgo, 'yyyy-MM-dd') || '');
  //     newSearchParams.set('endDate', format(new Date(), 'yyyy-MM-dd') || '');
  //     newSearchParams.set('outletIds', outlets?.[0]._id);
  //     newSearchParams.set('reportDuration', "MONTHLY");
  //     setSearchParams(newSearchParams)
  //   }
  // }, [dateFilter, outlets]);

  useEffect(() => {
    const reportDuration = (appliedFilters?.[2]?.value?.[0] as string) || "DAILY";

    if (!outlets?.length) return;

    let startDate: string;
    let endDate: string;

    switch (reportDuration) {
      case "MONTHLY":
        startDate = format(subMonths(new Date(), 1), "yyyy-MM-dd");
        endDate = format(new Date(), "yyyy-MM-dd");
        break;
      case "WEEKLY":
        startDate = format(subWeeks(new Date(), 1), "yyyy-MM-dd");
        endDate = format(new Date(), "yyyy-MM-dd");
        break;
      case "DAILY":
      default:
        startDate = format(startOfDay(new Date()), "yyyy-MM-dd");
        endDate = format(endOfDay(new Date()), "yyyy-MM-dd");
        break;
    }

    const currentStart = searchParams.get("startDate");
    const currentEnd = searchParams.get("endDate");
    const currentDuration = searchParams.get("reportDuration");
    const currentOutlet = searchParams.get("outletIds"); // 👈 already selected outlet

    // ✅ Agar sab already same hai to kuch mat karo
    if (
      currentStart === startDate &&
      currentEnd === endDate &&
      currentDuration === reportDuration &&
      currentOutlet // 👈 agar outlet already set hai, तो skip
    ) {
      return;
    }

    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("startDate", startDate);
    newSearchParams.set("endDate", endDate);

    // ✅ Sirf tabhi default outlet set karo jab user ne abhi tak outlet select nahi किया
    if (!currentOutlet) {
      newSearchParams.set("outletIds", outlets?.[0]?._id || "");
    }

    newSearchParams.set("reportDuration", reportDuration);

    if (newSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(newSearchParams);
    }
  }, [appliedFilters, outlets, setSearchParams]);

  const navigate = useNavigate();


  type StatCardProps = {
    title: string;
    total: number;
    percent: number;
    previousLabel?: string;
    outlets: { outletId: string; outletName: string; value: number }[];
  };

  const StatCard = ({ title, total, percent, previousLabel = "Previous Month", outlets }: StatCardProps) => (
    <div className="flex-1 min-w-[250px] bg-white shadow rounded-xl p-4">
      <h2 className="text-lg font-semibold text-slate-700">{title}</h2>

      <div className="flex items-center gap-4 mt-2">
        <span className="text-3xl font-bold text-slate-900">R {total}k</span>
        <div className="flex flex-col items-center justify-center">
          {percent >= 0 ? (
            <span className="text-green-600 flex items-center text-sm font-medium">▲ {percent}%</span>
          ) : (
            <span className="text-red-600 flex items-center text-sm font-medium">▼ {Math.abs(percent)}%</span>
          )}
          <span className="text-xs text-slate-500">{previousLabel}</span>
        </div>
      </div>

      <div className="w-full space-y-2 mt-3">
        {outlets.map((o) => {
          const percentWidth = total ? (o.value / total) * 100 : 0;
          return (
            <div key={o.outletId} className="relative w-full h-4 rounded bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentWidth}%`,
                  background: 'linear-gradient(to right, #76bd74ff, #6dd765ff)',
                }}
              ></div>
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-slate-900 truncate">
                {o.outletName}
              </span>
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-slate-900">
                {o.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );



  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Retail Dashboard"
          hideButton={true}
          buttonProps={{
            label: 'Back',
            onClick: () => navigate('/outlets'), // Navigate to previous page
            // position: 'left', // if your ATMPageHeader supports it
          }}
        />
        <Authorization permission="OUTLET_LIST">
          <MOLFilterBar hideSearch={true} filters={filters} />
          <div className="flex flex-wrap gap-4 p-4 border rounded border-slate-300">
            <StatCard
              title="Revenue"
              total={data?.data?.totalRevenue?.value || 0}
              percent={data?.data?.totalRevenue?.percent || 0}
              outlets={data?.data?.outlets?.map((o: any) => ({ outletId: o.outletId, outletName: o.outletName, value: o.revenue })) || []}
            />
            <StatCard
              title="Sale Count"
              total={data?.data?.totalSaleCount?.value || 0}
              percent={data?.data?.totalSaleCount?.percent || 0}
              outlets={data?.data?.outlets?.map((o: any) => ({ outletId: o.outletId, outletName: o.outletName, value: o.saleCount })) || []}
            />
            <StatCard
              title="Customer Count"
              total={data?.data?.totalCustomerCount?.value || 0}
              percent={data?.data?.totalCustomerCount?.percent || 0}
              outlets={data?.data?.outlets?.map((o: any) => ({ outletId: o.outletId, outletName: o.outletName, value: o.customerCount })) || []}
            />
            <StatCard
              title="Gross Profit"
              total={data?.data?.totalGrossProfit?.value || 0}
              percent={data?.data?.totalGrossProfit?.percent || 0}
              outlets={data?.data?.outlets?.map((o: any) => ({ outletId: o.outletId, outletName: o.outletName, value: o.grossProfit })) || []}
            />
          </div>


        </Authorization >
      </div >
    </>
  )
};

export default ViewReatailDashboardPage;
