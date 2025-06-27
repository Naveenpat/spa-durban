import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Bubble,
  Scatter,
} from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title
);

type ChartProps = {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter';
  data: any; // should be in Chart.js format
  options?: any;
  width?: number | string;
  height?: number | string;
};

const ATMChart = ({ type, data, options = {}, width = '100%', height = 300 }: ChartProps) => {
  const chartMap = {
    bar: Bar,
    line: Line,
    pie: Pie,
    doughnut: Doughnut,
    radar: Radar,
    polarArea: PolarArea,
    bubble: Bubble,
    scatter: Scatter,
  };

  const ChartComponent = chartMap[type];

  return (
    <div style={{ width, height }}>
      <ChartComponent data={data} options={options} />
    </div>
  );
};

export default ATMChart;
