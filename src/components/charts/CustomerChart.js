import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { customerData } from '../../data/reportData';

const CustomerChart = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-80">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Khách hàng mới theo tháng</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={customerData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} khách hàng`, 'Số lượng']} />
          <Legend />
          <Line type="monotone" dataKey="customers" name="Khách hàng mới" stroke="#1e40af" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomerChart;