import React from 'react';

const SummaryCard = ({ title, value, change, isPositive }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-500">{title}</h3>
        <div className="p-2 rounded-full bg-blue-100 text-blue-800">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'} mt-1 flex items-center`}>
        {isPositive ? '↑' : '↓'} {change}
      </div>
    </div>
  );
};

export default SummaryCard;