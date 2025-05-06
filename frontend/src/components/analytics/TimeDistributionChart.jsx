import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the required chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const TimeDistributionChart = ({ data }) => {
  // Color palette for different categories
  const backgroundColors = [
    'rgba(79, 70, 229, 0.6)',  // Indigo
    'rgba(16, 185, 129, 0.6)', // Green
    'rgba(239, 68, 68, 0.6)',  // Red
    'rgba(245, 158, 11, 0.6)', // Amber
    'rgba(59, 130, 246, 0.6)', // Blue
    'rgba(217, 70, 239, 0.6)', // Purple
  ];
  
  const borderColors = [
    'rgba(79, 70, 229, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(239, 68, 68, 1)',
    'rgba(245, 158, 11, 1)',
    'rgba(59, 130, 246, 1)',
    'rgba(217, 70, 239, 1)',
  ];

  // Helper function to format time in hours and minutes
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Prepare data for the chart
  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: 'Time Spent',
        data: data.map(item => item.timeSpent),
        backgroundColor: backgroundColors.slice(0, data.length),
        borderColor: borderColors.slice(0, data.length),
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const formattedTime = formatTime(value);
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formattedTime} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default TimeDistributionChart;