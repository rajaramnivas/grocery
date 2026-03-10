import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopPerformersChart = ({ finances }) => {
  // Calculate profit for each product
  const productProfits = {};
  
  finances.forEach(finance => {
    const productName = finance.productId?.name || 'Unknown';
    const profit = (finance.sellingPrice - finance.costPrice) * (finance.quantitySold || 0);
    
    if (!productProfits[productName]) {
      productProfits[productName] = 0;
    }
    productProfits[productName] += profit;
  });

  // Sort by profit and take top 10
  const topProducts = Object.entries(productProfits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const chartData = {
    labels: topProducts.map(p => p[0]),
    datasets: [
      {
        label: 'Profit (₹)',
        data: topProducts.map(p => p[1]),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(249, 115, 22, 0.6)',
          'rgba(139, 92, 246, 0.6)'
        ],
        borderColor: [
          'rgb(22, 163, 74)',
          'rgb(37, 99, 235)',
          'rgb(217, 119, 6)',
          'rgb(126, 34, 206)',
          'rgb(219, 39, 119)',
          'rgb(14, 165, 233)',
          'rgb(22, 163, 74)',
          'rgb(37, 99, 235)',
          'rgb(217, 119, 6)',
          'rgb(126, 34, 206)'
        ],
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Top 10 Profitable Products',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Profit (₹)'
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TopPerformersChart;
