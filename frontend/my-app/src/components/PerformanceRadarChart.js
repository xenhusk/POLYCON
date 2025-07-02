import React from 'react';
import { Radar } from 'react-chartjs-2';

const PerformanceRadarChart = ({ metricsData }) => {
  // Extract and prepare the data with proper defaults
  const { normalizedImprovement, averageEventImpact, consultationQuality } = metricsData || {};
  
  // Ensure all values are numbers and provide fallbacks
  const safeNormalizedImprovement = typeof normalizedImprovement === 'number' ? normalizedImprovement : 0;
  const safeAverageEventImpact = typeof averageEventImpact === 'number' ? averageEventImpact : 0;
  const safeConsultationQuality = typeof consultationQuality === 'number' ? consultationQuality : 0;
  
  // Cap grade improvement at 0.5 and then double it for display
  // This makes it appear on the same scale as other metrics (0-1)
  // while actually representing a 0-50% range
  const scaledImprovement = Math.min(0.5, safeNormalizedImprovement) * 2;
  
  // Generate chart data
  const chartData = {
    labels: ['Grade Improvement', 'Academic Events', 'Consultation Quality'],
    datasets: [
      {
        label: 'Student Performance',        data: [
          scaledImprovement,
          safeAverageEventImpact,
          safeConsultationQuality
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)'
      }
    ]
  };
  
  // Custom chart options with hidden tick labels
  const chartOptions = {
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 1,
        ticks: { 
          display: false, // Hide the number labels
          stepSize: 0.2 
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const index = context.dataIndex;
            let displayValue;
            
            // Handle the Grade Improvement axis differently
            if (index === 0) {
              // Convert back to original 0-50% scale for display
              const originalValue = value / 2;
              displayValue = `Grade Improvement: ${(originalValue * 100).toFixed(0)}% (max 50%)`;
            } else if (index === 1) {
              displayValue = `Academic Events: ${(value * 100).toFixed(0)}%`;
            } else {
              displayValue = `Consultation Quality: ${(value * 100).toFixed(0)}%`;
            }
            
            return displayValue;
          }
        }
      },
      legend: {
        display: false
      }
    }
  };
  
  return (
    <div className="radar-chart-container">
      <Radar data={chartData} options={chartOptions} />
      <div className="mt-3 text-center text-sm text-gray-500">
        <p>* Grade Improvement is scaled to a maximum of 50%</p>
      </div>
    </div>
  );
};

export default PerformanceRadarChart;