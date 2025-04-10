import React from 'react';
import ReportHeader from '../components/reports/ReportHeader';
import SummaryCard from '../components/reports/SummaryCard';
import RevenueChart from '../components/charts/RevenueChart';
import CustomerChart from '../components/charts/CustomerChart';
import ConversionChart from '../components/charts/ConversionChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';

const Dashboard = () => {
  const currentDate = new Date().toLocaleDateString('vi-VN');

  return (
    <div>
      <ReportHeader
        title="Bảng điều khiển"
        subtitle="Tổng quan về hoạt động kinh doanh"
        date={currentDate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Doanh thu"
          value="80.500.000 VNĐ"
          change="12% so với tháng trước"
          isPositive={true}
        />
        
        <SummaryCard
          title="Khách hàng mới"
          value="45"
          change="8% so với tháng trước"
          isPositive={true}
        />
        
        <SummaryCard
          title="Tỷ lệ chuyển đổi"
          value="23.5%"
          change="2% so với tháng trước"
          isPositive={false}
        />
        
        <SummaryCard
          title="Thị phần"
          value="27.8%"
          change="3.5% so với tháng trước"
          isPositive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart />
        <CustomerChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionChart />
        <CategoryPieChart />
      </div>
    </div>
  );
};

export default Dashboard;