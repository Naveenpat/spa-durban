import {
  IconChevronCompactLeft,
  IconChevronLeft,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconChevronRight,
} from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetMonthlyReportQuery } from '../../service/DashboardServices';
import { format, addMonths, subMonths } from 'date-fns';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const Chart = () => {
  const [selectMonth, setSelectMonth] = useState<Date>(new Date());
  const [selectYear, setSelectYear] = useState<number>(
    new Date().getFullYear(),
  );

  useEffect(() => {
    setSelectMonth(new Date());
    setSelectYear(new Date().getFullYear());
  }, []);

  const handlePrevMonth = () => {
    const newDate = subMonths(selectMonth, 1);
    setSelectMonth(newDate);
    setSelectYear(newDate.getFullYear());
  };

  const handleNextMonth = () => {
    const newDate = addMonths(selectMonth, 1);
    setSelectMonth(newDate);
    setSelectYear(newDate.getFullYear());
  };

  const handleYearChange = (newYear: number) => {
    setSelectYear(newYear);
    setSelectMonth(new Date(newYear, selectMonth.getMonth()));
  };

  const {
    data: chartData,
    isLoading,
    refetch,
  } = useFetchData(useGetMonthlyReportQuery, {
    body: {
      year: format(selectMonth, 'yyyy'),
      month: format(selectMonth, 'MM'),
    },
  });

  const labels = (chartData as any)?.map((item: any) =>
    item.date.substring(8, 10),
  );
  const salesData = (chartData as any)?.map((item: any) => item.totalAmount);

  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'Sales',
        data: salesData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Sales for the Month',
      },
    },
  };

  return (
    <div className="bg-white h-[700px] overflow-hidden p-2">
      <div className="flex items-center justify-between text-sm font-semibold uppercase text-slate-400">
        <div>Chart</div>
        <IconRefresh onClick={() => refetch()} className="cursor-pointer" />
      </div>
      <div className="flex items-center justify-center gap-8 px-2 py-1 mt-2 text-sm font-semibold border-y">
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-2 py-1 text-xs rounded-lg hover:bg-gray-100"
            onClick={() => handleYearChange(selectYear - 1)}
          >
            <IconMinus size={16} /> Year
          </button>
          <button
            className="p-1 bg-gray-100 rounded-lg aspect-square"
            onClick={handlePrevMonth}
          >
            <IconChevronLeft size={16} />
          </button>
        </div>
        <span className="w-[120px] text-center">
          {format(selectMonth, 'MMMM yyyy')}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="p-1 bg-gray-100 rounded-lg aspect-square"
            onClick={handleNextMonth}
          >
            <IconChevronRight size={16} />
          </button>
          <button
            className="flex items-center gap-2 px-2 py-1 text-xs rounded-lg hover:bg-gray-100"
            onClick={() => handleYearChange(selectYear + 1)}
          >
            <IconPlus size={16} /> Year
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="w-full h-full relative max-w-[100%] max-h-[600px]">
          <Bar data={data} options={options} />
        </div>
      )}
    </div>
  );
};

export default Chart;
