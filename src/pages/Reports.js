import React from 'react';
import ReportHeader from '../components/reports/ReportHeader';
import DetailTable from '../components/reports/DetailTable';

const Reports = () => {
  const currentDate = new Date().toLocaleDateString('vi-VN');

  const detailData = [
    {
      Mã: 'RP001',
      'Tên báo cáo': 'Báo cáo doanh thu Q1/2025',
      'Ngày tạo': '15/03/2025',
      'Người tạo': 'Nguyễn Văn A',
      'Trạng thái': 'Hoàn thành'
    },
    {
      Mã: 'RP002',
      'Tên báo cáo': 'Báo cáo khách hàng Q1/2025',
      'Ngày tạo': '20/03/2025',
      'Người tạo': 'Trần Thị B',
      'Trạng thái': 'Hoàn thành'
    },
    {
      Mã: 'RP003',
      'Tên báo cáo': 'Báo cáo sản phẩm Q1/2025',
      'Ngày tạo': '25/03/2025',
      'Người tạo': 'Lê Văn C',
      'Trạng thái': 'Đang xử lý'
    },
    {
      Mã: 'RP004',
      'Tên báo cáo': 'Báo cáo doanh thu Q2/2025',
      'Ngày tạo': '01/04/2025',
      'Người tạo': 'Nguyễn Văn A',
      'Trạng thái': 'Đang xử lý'
    },
    {
      Mã: 'RP005',
      'Tên báo cáo': 'Báo cáo khách hàng Q2/2025',
      'Ngày tạo': '05/04/2025',
      'Người tạo': 'Trần Thị B',
      'Trạng thái': 'Đang xử lý'
    },
  ];

  return (
    <div>
      <ReportHeader
        title="Danh sách báo cáo"
        subtitle="Quản lý tất cả báo cáo trong hệ thống"
        date={currentDate}
      />

      <div className="mb-4">
        <button className="px-4 py-2 rounded-md font-medium transition-colors bg-blue-800 text-white hover:bg-blue-900">Tạo báo cáo mới</button>
      </div>

      <DetailTable data={detailData} />
    </div>
  );
};

export default Reports;