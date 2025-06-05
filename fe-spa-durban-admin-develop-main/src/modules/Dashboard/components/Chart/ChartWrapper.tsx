import React from 'react';
import Chart from './Chart';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetMonthlyReportQuery } from '../../service/DashboardServices';

const ChartWrapper = () => {
  return (
    <div>
      <Chart />
    </div>
  );
};

export default ChartWrapper;
