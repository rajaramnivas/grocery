import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryBreakdownChart = ({ finances }) => {
  // Calculate costs by category
  const costByCategory = {};
  
  finances.forEach(finance => {
    const category = finance.productId?.category || 'Others';
    const cost = finance.costPrice * finance.quantity;
    
    if (!costByCategory[category]) {
      costByCategory[category] = 0;
    }
    costByCategory[category] += cost;
  });

  const colors = [
    'rgba(34, 197, 94, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(6, 182, 212, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(168, 85, 247, 0.8)'
  ];

  const chartData = {
    labels: Object.keys(costByCategory),
    datasets: [
      {
        data: Object.values(costByCategory),
        backgroundColor: colors.slice(0, Object.keys(costByCategory).length),
        borderColor: colors.slice(0, Object.keys(costByCategory).length).map(c => c.replace('0.8', '1')),
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 12 },
          padding: 15
        }
      },
      title: {
        display: true,
        text: 'Cost Distribution by Category',
        font: { size: 16, weight: 'bold' }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default CategoryBreakdownChart;
