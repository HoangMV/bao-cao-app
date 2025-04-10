import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { conversionData } from '../../data/reportData';

const ConversionChart = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-80">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Tỷ lệ chuyển đổi theo tháng</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={conversionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ chuyển đổi']} />
          <Legend />
          <Line type="monotone" dataKey="rate" name="Tỷ lệ chuyển đổi" stroke="#1e40af" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConversionChart;