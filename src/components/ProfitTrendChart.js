import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProfitTrendChart = ({ finances }) => {
  // Group finances by date and calculate cumulative profit
  const profitData = {};
  
  finances.forEach(finance => {
    const dateStr = new Date(finance.buyingDate).toLocaleDateString('en-IN');
    if (!profitData[dateStr]) {
      profitData[dateStr] = { revenue: 0, cost: 0 };
    }
    
    const profit = (finance.sellingPrice - finance.costPrice) * finance.quantity;
    const cost = finance.costPrice * finance.quantity;
    const revenue = finance.sellingPrice * finance.quantitySold || 0;
    
    profitData[dateStr].revenue += revenue;
    profitData[dateStr].cost += cost;
  });

  const sortedDates = Object.keys(profitData).sort((a, b) => new Date(a) - new Date(b));
  
  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Revenue',
        data: sortedDates.map(date => profitData[date].revenue),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Cost',
        data: sortedDates.map(date => profitData[date].cost),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' }
        }
      },
      title: {
        display: true,
        text: 'Revenue vs Cost Trend',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (₹)'
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ProfitTrendChart;
