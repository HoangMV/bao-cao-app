import React from 'react';

const ReportHeader = ({ title, subtitle, date }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-500">{subtitle}</p>
      <p className="text-sm text-gray-400 mt-1">Ngày tạo: {date}</p>
    </div>
  );
};

export default ReportHeader;