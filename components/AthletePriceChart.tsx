'use client';

import { Line } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface AthletePriceChartProps {
  data: ChartData<'line'>;
  options: ChartOptions<'line'>;
}

export default function AthletePriceChart({ data, options }: AthletePriceChartProps) {
  return <Line data={data} options={options} />;
}
