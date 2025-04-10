import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { revenueData } from '../../data/reportData';

const RevenueChart = () => {
  const formatYAxis = (value) => {
    return `${value / 1000000}tr`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-80">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Doanh thu theo tháng</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip formatter={(value) => [`${value.toLocaleString()} VNĐ`, 'Doanh thu']} />
          <Legend />
          <Bar dataKey="revenue" name="Doanh thu" fill="#1e40af" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;