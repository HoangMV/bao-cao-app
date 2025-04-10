// src/pages/WarehouseManagement.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReportHeader from '../components/reports/ReportHeader';
import { CSVLink } from 'react-csv';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Đăng ký các thành phần Chart.js
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Component chứa nút xuất CSV để tránh lỗi
const ExportButton = ({ filteredData }) => {
    const csvData = useMemo(() => {
        return [
            ['Order KD', 'Số PO', 'Order phôi', 'Order VL', 'Tên chi tiết', 'ĐVT', 'SLL', 'Ngày gói', 'Thời hạn', 'Xác nhận', 'Ghi chú', 'Số gói', 'Lần giao', 'Ngày xuất'],
            ...filteredData.map(item => {
                let formattedNgayDongGoi = '';
                if (item.ngay_dong_goi) {
                    const dateObj = new Date(item.ngay_dong_goi);
                    formattedNgayDongGoi = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
                }

                let formattedNgayXuatHang = '';
                if (item.ngay_xuat_hang) {
                    const dateObj = new Date(item.ngay_xuat_hang);
                    formattedNgayXuatHang = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
                }

                return [
                    item.order_kd || '',
                    item.so_dh || '',
                    item.order_phoi || '',
                    item.order_vat_lieu || '',
                    item.ten_chi_tiet || '',
                    item.dvt || '',
                    item.sll || '',
                    formattedNgayDongGoi,
                    item.thoi_han || '',
                    item.xac_nhan_tu_rc || '',
                    item.ghi_chu || '',
                    item.so_goi || '',
                    item.lan_giao || '',
                    formattedNgayXuatHang
                ];
            })
        ];
    }, [filteredData]);

    return (
        <CSVLink
            data={csvData}
            filename={`giao-kho-${new Date().toISOString().slice(0, 10)}.csv`}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center transition duration-200"
        >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Xuất Excel
        </CSVLink>
    );
};

const WarehouseManagement = () => {
    // State cho dữ liệu
    const [warehouseData, setWarehouseData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showExportModal, setShowExportModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        orderKD: '',
        orderVL: '',
        status: 'all', // 'all', 'exported', 'pending'
        dateRange: { start: '', end: '' }
    });
    const [previewData, setPreviewData] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState({
        orderKD: true,
        soPO: true,
        orderPhoi: true,
        orderVL: true,
        tenChiTiet: true,
        dvt: true,
        sll: true,
        ngayGoi: true,
        thoiHan: true,
        xacNhan: true,
        ghiChu: true,
        soGoi: true,
        lanGiao: true,
        ngayXuat: true
    });
    const [showColumnSettings, setShowColumnSettings] = useState(false);
    const printAreaRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Constants cho AppSheet API
    const appId = '684ad0ab-ffc5-4c21-a959-f5e023c668e3';
    const accessKey = 'V2-jOfc3-JvKqz-lxeNm-FS8O6-1RK08-Bu5SX-erQVj-Jp2S9';
    const region = 'www';

    // Hàm lấy dữ liệu từ AppSheet
    const fetchDataFromAppSheet = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://${region}.appsheet.com/api/v2/apps/${appId}/tables/giao_kho_vp/Action`, {
                method: 'POST',
                headers: {
                    'ApplicationAccessKey': accessKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Action: 'Find',
                    Properties: {},
                    Selector: "Filter(giao_kho_vp, true)"
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received');
            }

            // Đảo ngược thứ tự để hiển thị mới nhất trước
            setWarehouseData(data.reverse());
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch data from AppSheet:', error);
            setLoading(false);
        }
    };

    // Lấy dữ liệu khi component mount
    useEffect(() => {
        fetchDataFromAppSheet();
    }, []);

    // Reset lựa chọn khi dữ liệu thay đổi
    useEffect(() => {
        setSelectedRows([]);
        setSelectAll(false);
    }, [activeFilter, filters]);

    // Lọc dữ liệu theo tìm kiếm và bộ lọc
    const filteredData = useMemo(() => {
        return warehouseData.filter(item => {
            // Lọc theo tìm kiếm chung
            const searchMatch = !searchTerm ||
                Object.values(item).some(val =>
                    val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );

            if (!searchMatch) return false;

            // Lọc theo filter bên trái (date filter)
            if (activeFilter !== 'all') {
                if (item.ngay_dong_goi) {
                    const dateObj = new Date(item.ngay_dong_goi);
                    const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
                    if (formattedDate !== activeFilter) return false;
                } else {
                    return false;
                }
            }

            // Lọc theo bộ lọc nâng cao
            // Lọc theo Order KD
            if (filters.orderKD && !item.order_kd?.toLowerCase().includes(filters.orderKD.toLowerCase())) {
                return false;
            }

            // Lọc theo Order VL
            if (filters.orderVL && !item.order_vat_lieu?.toLowerCase().includes(filters.orderVL.toLowerCase())) {
                return false;
            }

            // Lọc theo trạng thái
            if (filters.status === 'exported' && item.thoi_han !== 'Đã xuất') {
                return false;
            } else if (filters.status === 'pending' && item.thoi_han === 'Đã xuất') {
                return false;
            }

            // Lọc theo khoảng ngày
            if (filters.dateRange.start && filters.dateRange.end && item.ngay_dong_goi) {
                const startDate = new Date(filters.dateRange.start);
                const endDate = new Date(filters.dateRange.end);
                const itemDate = new Date(item.ngay_dong_goi);

                if (itemDate < startDate || itemDate > endDate) {
                    return false;
                }
            }

            return true;
        });
    }, [warehouseData, searchTerm, activeFilter, filters]);

    // Sắp xếp dữ liệu
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key] || '';
                let bValue = b[sortConfig.key] || '';

                // Xử lý đặc biệt cho cột ngày
                if (sortConfig.key === 'ngay_dong_goi' || sortConfig.key === 'ngay_xuat_hang') {
                    aValue = aValue ? new Date(aValue) : new Date(0);
                    bValue = bValue ? new Date(bValue) : new Date(0);
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    // Phân trang
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);

    // Hàm tạo bộ lọc ngày từ dữ liệu
    const createDateFilters = () => {
        const dateCountMap = new Map();
        const dateItemCountMap = new Map();

        warehouseData.forEach(item => {
            if (item.ngay_dong_goi) {
                const dateObj = new Date(item.ngay_dong_goi);
                const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

                if (dateCountMap.has(formattedDate)) {
                    dateCountMap.set(formattedDate, dateCountMap.get(formattedDate) + 1);
                    dateItemCountMap.set(formattedDate, dateItemCountMap.get(formattedDate) + parseInt(item.sll || 0));
                } else {
                    dateCountMap.set(formattedDate, 1);
                    dateItemCountMap.set(formattedDate, parseInt(item.sll || 0));
                }
            }
        });

        // Sắp xếp ngày theo thứ tự giảm dần (mới nhất trước)
        const sortedDates = [...dateCountMap.keys()].sort((a, b) => {
            const partsA = a.split('/');
            const partsB = b.split('/');
            const dateA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
            const dateB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
            return dateB - dateA;
        });

        return { sortedDates, dateCountMap, dateItemCountMap };
    };

    // Phân tích dữ liệu cho biểu đồ
    const chartData = useMemo(() => {
        // Dữ liệu cho biểu đồ tròn trạng thái
        const statusData = {
            labels: ['Đã xuất', 'Chưa xuất'],
            datasets: [
                {
                    data: [
                        warehouseData.filter(item => item.thoi_han === 'Đã xuất').length,
                        warehouseData.filter(item => item.thoi_han !== 'Đã xuất').length
                    ],
                    backgroundColor: ['#4CAF50', '#2196F3'],
                    borderWidth: 1,
                },
            ],
        };

        // Dữ liệu cho biểu đồ cột xuất theo ngày
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date);
        }

        const exportByDate = last7Days.map(date => {
            const dateString = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
            return {
                date: dateString,
                count: warehouseData.filter(item => {
                    if (!item.ngay_xuat_hang) return false;
                    const exportDate = new Date(item.ngay_xuat_hang);
                    return exportDate.getDate() === date.getDate() &&
                        exportDate.getMonth() === date.getMonth() &&
                        exportDate.getFullYear() === date.getFullYear();
                }).length
            };
        });

        const exportData = {
            labels: exportByDate.map(item => item.date),
            datasets: [
                {
                    label: 'Số đơn hàng xuất kho',
                    data: exportByDate.map(item => item.count),
                    backgroundColor: '#3f51b5',
                },
            ],
        };

        return { statusData, exportData };
    }, [warehouseData]);

    // Hàm xử lý khi chọn bộ lọc
    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    // Hàm xuất biên bản giao kho
    const generateExportTemplate = (rows, dateFilter) => {
        // Lấy phần tử in
        const printArea = printAreaRef.current;
        if (!printArea) return;

        // Sử dụng ngày filter làm ngày của biên bản
        let day, month, year;
        if (dateFilter && dateFilter !== 'all') {
            const dateParts = dateFilter.split('/');
            day = dateParts[0];
            month = dateParts[1];
            year = dateParts[2];
        } else {
            const today = new Date();
            day = String(today.getDate()).padStart(2, '0');
            month = String(today.getMonth() + 1).padStart(2, '0');
            year = today.getFullYear();
        }

        // Tạo nội dung HTML cho biểu mẫu
        let content = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="text-align: center; font-weight: bold; font-size: 24px; margin-bottom: 10px;">BIÊN BẢN CHECK GIAO KHO VP</div>
        <div style="margin-bottom: 10px; font-weight: bold; font-size: 14px;">Lần: ......... &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Giao Kho VP: ......... h ........, ngày ${day} tháng ${month} năm ${year}</div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid black;">
            <thead>
                <tr>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;" rowspan="2">Stt</th>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;" rowspan="2">Order<br>Vật liệu</th>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;" rowspan="2">Order<br>Kinh<br>doanh</th>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;" rowspan="2">Tên sản phẩm</th>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;" rowspan="2">Số<br>lg</th>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;" colspan="8">CHECK THỰC HIỆN</th>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;" rowspan="2">Ghi chú</th>
                </tr>
                <tr>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;">Dán<br>tem</th>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;">BB ktra</th>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;">Đầu<br>Rửa +<br>Sp mới</th>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;">Đấu<br>D.gối</th>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;">Mail<br>XN</th>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;">QR<br>code</th>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;">Tổng<br>số gói</th>
                    <th style="border: 1px solid black; font-weight: bold; text-align: center; padding: 5px; font-size: 13px;">Xếp<br>thùng</th>
                </tr>
            </thead>
            <tbody>
    `;

        // Thêm dữ liệu từ các hàng được chọn
        Array.from(rows).forEach((row, index) => {
            const orderVL = row.orderVL || '';
            const orderKD = row.orderKD || '';
            const tenSP = row.tenSP || '';
            const soLuong = row.soLuong || '';
            const ghiChu = row.ghiChu || '';
            const soGoi = row.soGoi || '';

            content += `
      <tr>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;">${index + 1}</td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;">${orderVL}</td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;">${orderKD}</td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;">${tenSP}</td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;">${soLuong}</td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;">${soGoi}</td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;">${ghiChu}</td>
      </tr>
      `;
        });

        // Thêm các hàng trống để giữ đúng bố cục
        for (let i = rows.length; i < 20; i++) {
            content += `
      <tr>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;">${i + 1}</td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
          <td style="border: 1px solid black; padding: 5px; height: 25px; text-align: center; font-size: 13px;"></td>
      </tr>
      `;
        }

        // Hoàn thiện biểu mẫu với phần chân
        content += `
            </tbody>
        </table>
        
        <div style="text-align: center; margin-top: 10px; font-size: 13px;">
            <p>Thực hiện việc đến đáu tích dấu "√" vào ô tương ứng bảng bút đó.</p>
            <p>Kiểm tra lại biên bản đã được tích đủ các ô, các cột mới được giao Kho VP</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <div style="text-align: center; width: 40%; font-size: 13px;">
                <p>Người thực hiện</p>
                <br><br><br>
            </div>
            <div style="text-align: center; width: 40%; font-size: 13px;">
                <p>Người soát xét</p>
                <br><br><br>
            </div>
        </div>
    </div>
    `;

        return content;
    };

    // Xử lý xem trước biên bản
    const handlePreviewTemplate = () => {
        if (selectedRows.length === 0) {
            alert('Vui lòng chọn ít nhất một đơn hàng để xem trước.');
            return;
        }

        const rows = selectedRows.map(index => {
            const item = warehouseData[index];
            return {
                orderVL: item.order_vat_lieu || '',
                orderKD: item.order_kd || '',
                tenSP: item.ten_chi_tiet || '',
                soLuong: item.sll || '',
                ghiChu: item.ghi_chu || '',
                soGoi: item.so_goi || ''
            };
        });

        const content = generateExportTemplate(rows);
        setPreviewData(content);
        setShowPreviewModal(true);
    };

    // Xử lý in biên bản
    const handlePrintTemplate = () => {
        // Lấy phần tử in
        const printArea = printAreaRef.current;
        if (!printArea) return;

        const rows = selectedRows.map(index => {
            const item = warehouseData[index];
            return {
                orderVL: item.order_vat_lieu || '',
                orderKD: item.order_kd || '',
                tenSP: item.ten_chi_tiet || '',
                soLuong: item.sll || '',
                ghiChu: item.ghi_chu || '',
                soGoi: item.so_goi || ''
            };
        });

        const content = generateExportTemplate(rows);

        // Tạo iframe để in
        const iframe = document.createElement('iframe');
        iframe.name = 'print_frame';
        iframe.style.position = 'absolute';
        iframe.style.top = '-1000px';
        iframe.style.left = '-1000px';
        document.body.appendChild(iframe);

        const frameDoc = iframe.contentWindow ? iframe.contentWindow : (iframe.contentDocument?.document ? iframe.contentDocument.document : iframe.contentDocument);
        frameDoc.document.open();
        frameDoc.document.write(`
      <title>Biên bản check giao kho VP</title>
      <style>
        @page { 
          size: A4; 
          margin: 10mm;
        }
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        table, th, td {
          border: 1px solid black;
          border-collapse: collapse;
        }
        th, td {
          padding: 5px;
          text-align: center;
          font-size: 13px;
        }
      </style>
      ${content}
    `);
        frameDoc.document.close();

        setTimeout(function () {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            document.body.removeChild(iframe);
        }, 500);
    };

    // Xử lý chọn dòng để xuất
    const handleRowClick = (index) => {
        setSelectedRows(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    // Xử lý chọn tất cả - sửa lại để tránh lỗi
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows([]);
        } else {
            // Sử dụng callback để đảm bảo có quyền truy cập vào filteredData
            const newSelected = [];
            // Lặp qua các mục đã lọc và tìm chỉ mục thực của chúng trong warehouseData
            filteredData.forEach(item => {
                const actualIndex = warehouseData.findIndex(i => i === item);
                if (actualIndex !== -1) {
                    newSelected.push(actualIndex);
                }
            });
            setSelectedRows(newSelected);
        }
        setSelectAll(!selectAll);
    };

    // Xử lý xuất giao kho
    const handleExport = () => {
        if (selectedRows.length === 0) {
            alert('Vui lòng chọn ít nhất một đơn hàng để xuất.');
            return;
        }
        setShowExportModal(true);
    };

    // Xử lý xác nhận xuất
    const handleConfirmExport = () => {
        const rows = selectedRows.map(index => {
            const item = warehouseData[index];
            return {
                orderVL: item.order_vat_lieu || '',
                orderKD: item.order_kd || '',
                tenSP: item.ten_chi_tiet || '',
                soLuong: item.sll || '',
                ghiChu: item.ghi_chu || '',
                soGoi: item.so_goi || ''
            };
        });

        handlePrintTemplate();

        // Cập nhật trạng thái
        const updatedData = [...warehouseData];
        selectedRows.forEach(index => {
            if (updatedData[index]) {
                updatedData[index].thoi_han = 'Đã xuất';

                // Thêm ngày xuất hiện tại
                const today = new Date();
                updatedData[index].ngay_xuat_hang = today.toISOString();
            }
        });

        setWarehouseData(updatedData);
        setSelectedRows([]);
        setSelectAll(false);
        setShowExportModal(false);
        alert('Xuất giao kho thành công!');
    };

    // Hàm sắp xếp
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Xử lý tìm kiếm
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Xử lý thay đổi bộ lọc
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    // Xử lý thay đổi hiển thị cột
    const handleColumnVisibilityChange = (column) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    // Tính toán tổng số trang
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    // Điều hướng phân trang
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Thay đổi số lượng mục trên một trang
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Tạo bộ lọc ngày
    const { sortedDates, dateCountMap, dateItemCountMap } = createDateFilters();

    // Tính tổng số lượng
    const totalItems = filteredData.length;
    const totalCount = filteredData.reduce((sum, item) => sum + parseInt(item.sll || 0), 0);

    const currentDate = new Date().toLocaleDateString('vi-VN');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Khu vực in ấn */}
            <div ref={printAreaRef} className="hidden"></div>

            {/* Header */}
            <ReportHeader
                title="Quản lý Giao Kho"
                subtitle="Hệ thống quản lý giao kho năm 2025"
                date={currentDate}
            />

            {/* Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-medium mb-3">Trạng thái đơn hàng</h3>
                    <div className="h-60">
                        <Doughnut data={chartData.statusData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-medium mb-3">Xuất kho 7 ngày qua</h3>
                    <div className="h-60">
                        <Bar
                            data={chartData.exportData}
                            options={{
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            precision: 0
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* Sidebar */}
                <div className="w-full lg:w-60 bg-white border-r border-gray-200 mb-4 lg:mb-0 rounded-lg shadow-sm">
                    {/* "Tất cả" section */}
                    <div
                        className={`py-3 px-4 border-l-4 ${activeFilter === 'all' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-transparent hover:bg-gray-50'} cursor-pointer mb-2`}
                        onClick={() => handleFilterClick('all')}
                    >
                        <div className="font-medium">Tất cả</div>
                        <div className="text-sm flex justify-between">
                            <span>{totalItems} Lệnh</span>
                            <span>{totalCount}</span>
                        </div>
                    </div>

                    {/* Separator line */}
                    <div className="border-b border-gray-200 my-2"></div>

                    {/* Individual date entries */}
                    <div className="max-h-96 overflow-y-auto">
                        {sortedDates.map(date => (
                            <div
                                key={date}
                                className={`py-3 px-4 border-l-4 ${activeFilter === date ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-transparent hover:bg-gray-50'} cursor-pointer`}
                                onClick={() => handleFilterClick(date)}
                            >
                                <div className="font-medium">{date} - {dateCountMap.get(date)} Lệnh</div>
                                <div className="text-sm flex justify-between">
                                    <span></span>
                                    <span>{dateItemCountMap.get(date)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 overflow-hidden ml-0 lg:ml-4">
                    {/* Tìm kiếm và nút xuất */}
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-3">
                            <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 w-full md:w-auto mb-3 md:mb-0">
                                <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm Giao kho"
                                    className="bg-transparent w-full outline-none text-sm"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center transition duration-200"
                                    onClick={handleExport}
                                >
                                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Xuất giao kho
                                </button>

                                <button
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center transition duration-200"
                                    onClick={handlePreviewTemplate}
                                >
                                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Xem trước
                                </button>

                                {/* Thay thế bằng component ExportButton */}
                                <ExportButton filteredData={filteredData} />

                                <button
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center transition duration-200"
                                    onClick={() => setShowColumnSettings(!showColumnSettings)}
                                >
                                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Cột
                                </button>

                                <button
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded flex items-center transition duration-200"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Lọc
                                </button>
                            </div>
                        </div>

                        {/* Hiện bộ lọc nâng cao */}
                        {showFilters && (
                            <div className="bg-gray-50 p-3 rounded-md mb-3 border border-gray-200">
                                <h4 className="font-medium mb-2">Bộ lọc nâng cao</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Order KD</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            value={filters.orderKD}
                                            onChange={(e) => handleFilterChange('orderKD', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Order VL</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            value={filters.orderVL}
                                            onChange={(e) => handleFilterChange('orderVL', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            value={filters.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                        >
                                            <option value="all">Tất cả</option>
                                            <option value="exported">Đã xuất</option>
                                            <option value="pending">Chưa xuất</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            value={filters.dateRange.start}
                                            onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            value={filters.dateRange.end}
                                            onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded"
                                            onClick={() => {
                                                setFilters({
                                                    orderKD: '',
                                                    orderVL: '',
                                                    status: 'all',
                                                    dateRange: { start: '', end: '' }
                                                });
                                            }}
                                        >
                                            Đặt lại
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cài đặt hiển thị cột */}
                        {showColumnSettings && (
                            <div className="bg-gray-50 p-3 rounded-md mb-3 border border-gray-200">
                                <h4 className="font-medium mb-2">Cài đặt hiển thị cột</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-orderKD"
                                            checked={visibleColumns.orderKD}
                                            onChange={() => handleColumnVisibilityChange('orderKD')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-orderKD" className="text-sm">Order KD</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-soPO"
                                            checked={visibleColumns.soPO}
                                            onChange={() => handleColumnVisibilityChange('soPO')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-soPO" className="text-sm">Số PO</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-orderPhoi"
                                            checked={visibleColumns.orderPhoi}
                                            onChange={() => handleColumnVisibilityChange('orderPhoi')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-orderPhoi" className="text-sm">Order phôi</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-orderVL"
                                            checked={visibleColumns.orderVL}
                                            onChange={() => handleColumnVisibilityChange('orderVL')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-orderVL" className="text-sm">Order VL</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-tenChiTiet"
                                            checked={visibleColumns.tenChiTiet}
                                            onChange={() => handleColumnVisibilityChange('tenChiTiet')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-tenChiTiet" className="text-sm">Tên chi tiết</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-dvt"
                                            checked={visibleColumns.dvt}
                                            onChange={() => handleColumnVisibilityChange('dvt')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-dvt" className="text-sm">ĐVT</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-sll"
                                            checked={visibleColumns.sll}
                                            onChange={() => handleColumnVisibilityChange('sll')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-sll" className="text-sm">SLL</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-ngayGoi"
                                            checked={visibleColumns.ngayGoi}
                                            onChange={() => handleColumnVisibilityChange('ngayGoi')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-ngayGoi" className="text-sm">Ngày gói</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-thoiHan"
                                            checked={visibleColumns.thoiHan}
                                            onChange={() => handleColumnVisibilityChange('thoiHan')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-thoiHan" className="text-sm">Thời hạn</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-xacNhan"
                                            checked={visibleColumns.xacNhan}
                                            onChange={() => handleColumnVisibilityChange('xacNhan')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-xacNhan" className="text-sm">Xác nhận</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-ghiChu"
                                            checked={visibleColumns.ghiChu}
                                            onChange={() => handleColumnVisibilityChange('ghiChu')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-ghiChu" className="text-sm">Ghi chú</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-soGoi"
                                            checked={visibleColumns.soGoi}
                                            onChange={() => handleColumnVisibilityChange('soGoi')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-soGoi" className="text-sm">Số gói</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-lanGiao"
                                            checked={visibleColumns.lanGiao}
                                            onChange={() => handleColumnVisibilityChange('lanGiao')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-lanGiao" className="text-sm">Lần giao</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="col-ngayXuat"
                                            checked={visibleColumns.ngayXuat}
                                            onChange={() => handleColumnVisibilityChange('ngayXuat')}
                                            className="mr-2"
                                        />
                                        <label htmlFor="col-ngayXuat" className="text-sm">Ngày xuất</label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Thông tin số lượng và phân trang */}
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-sm text-gray-600 mb-2 md:mb-0">
                                Hiển thị {paginatedData.length} / {filteredData.length} mục
                            </div>
                            <div className="flex items-center">
                                <span className="mr-2 text-sm">Hiển thị:</span>
                                <select
                                    className="border border-gray-300 rounded p-1 mr-4 text-sm"
                                    value={itemsPerPage}
                                    onChange={handleItemsPerPageChange}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                                    >
                                        &#171;
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                                    >
                                        &#8249;
                                    </button>
                                    <span className="px-3 py-1 rounded border bg-blue-50 text-blue-600">
                                        {currentPage} / {totalPages || 1}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className={`px-3 py-1 rounded border ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                                    >
                                        &#8250;
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className={`px-3 py-1 rounded border ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                                    >
                                        &#187;
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bảng dữ liệu */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm leading-normal">
                                        <th className="py-3 px-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        {visibleColumns.orderKD && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('order_kd')}
                                            >
                                                Order KD
                                                {sortConfig.key === 'order_kd' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                        {visibleColumns.soPO && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('so_dh')}
                                            >
                                                Số PO
                                                {sortConfig.key === 'so_dh' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                        {visibleColumns.orderPhoi && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('order_phoi')}
                                            >
                                                Order phôi
                                                {sortConfig.key === 'order_phoi' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                        {visibleColumns.orderVL && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('order_vat_lieu')}
                                            >
                                                Order VL
                                                {sortConfig.key === 'order_vat_lieu' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                        {visibleColumns.tenChiTiet && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('ten_chi_tiet')}
                                            >
                                                Tên chi tiết
                                                {sortConfig.key === 'ten_chi_tiet' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                        {visibleColumns.dvt && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('dvt')}
                                            >
                                                ĐVT
                                                {sortConfig.key === 'dvt' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                        {visibleColumns.sll && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('sll')}
                                            >
                                                SLL
                                                {sortConfig.key === 'sll' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                        {visibleColumns.ngayGoi && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('ngay_dong_goi')}
                                            >
                                                Ngày gói
                                                {sortConfig.key === 'ngay_dong_goi' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                        {visibleColumns.thoiHan && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('thoi_han')}
                                            >
                                                Thời hạn
                                                {sortConfig.key === 'thoi_han' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                        {visibleColumns.xacNhan && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('xac_nhan_tu_rc')}
                                            >
                                                Xác nhận
                                                {sortConfig.key === 'xac_nhan_tu_rc' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                        {visibleColumns.ghiChu && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('ghi_chu')}
                                            >
                                                Ghi chú
                                                {sortConfig.key === 'ghi_chu' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                        {visibleColumns.soGoi && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('so_goi')}
                                            >
                                                Số gói
                                                {sortConfig.key === 'so_goi' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                        {visibleColumns.lanGiao && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('lan_giao')}
                                            >
                                                Lần giao
                                                {sortConfig.key === 'lan_giao' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                        {visibleColumns.ngayXuat && (
                                            <th
                                                className="py-3 px-4 text-left font-bold cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort('ngay_xuat_hang')}
                                            >
                                                Ngày xuất
                                                {sortConfig.key === 'ngay_xuat_hang' && (
                                                    <span className="ml-1">
                                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600 text-sm">
                                    {loading ? (
                                        <tr className="border-b border-gray-200 text-center">
                                            <td colSpan="15" className="py-4">
                                                <div className="flex justify-center items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Đang tải dữ liệu...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : paginatedData.length === 0 ? (
                                        <tr className="border-b border-gray-200 text-center">
                                            <td colSpan="15" className="py-4">
                                                Không có dữ liệu để hiển thị
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((item, index) => {
                                            // Format date to DD/MM/YYYY for display
                                            let formattedNgayDongGoi = '';
                                            if (item.ngay_dong_goi) {
                                                const dateObj = new Date(item.ngay_dong_goi);
                                                formattedNgayDongGoi = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
                                            }
                                            let formattedNgayXuatHang = '';
                                            if (item.ngay_xuat_hang) {
                                                const dateObj = new Date(item.ngay_xuat_hang);
                                                formattedNgayXuatHang = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
                                            }

                                            const actualIndex = warehouseData.findIndex(i => i === item);
                                            const isSelected = selectedRows.includes(actualIndex);

                                            // Màu nền dựa trên trạng thái
                                            let rowBgClass = '';
                                            if (isSelected) {
                                                rowBgClass = 'bg-blue-100';
                                            } else if (item.thoi_han === 'Đã xuất') {
                                                rowBgClass = 'bg-green-50';
                                            }

                                            // Highlight cho hàng sắp đến hạn
                                            if (item.thoi_han !== 'Đã xuất') {
                                                const today = new Date();
                                                const ngayDongGoi = new Date(item.ngay_dong_goi);
                                                const daysDiff = Math.ceil((today - ngayDongGoi) / (1000 * 60 * 60 * 24));

                                                if (daysDiff > 3) {
                                                    rowBgClass = isSelected ? 'bg-blue-100' : 'bg-red-50';
                                                }
                                            }

                                            return (
                                                <tr
                                                    key={index}
                                                    className={`border-b border-gray-200 hover:bg-gray-50 transition duration-100 ${rowBgClass}`}
                                                    onClick={() => handleRowClick(actualIndex)}
                                                >
                                                    <td className="py-3 px-2 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleRowClick(actualIndex)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </td>
                                                    {visibleColumns.orderKD && <td className="py-3 px-4">{item.order_kd || ''}</td>}
                                                    {visibleColumns.soPO && <td className="py-3 px-4">{item.so_dh || ''}</td>}
                                                    {visibleColumns.orderPhoi && <td className="py-3 px-4">{item.order_phoi || ''}</td>}
                                                    {visibleColumns.orderVL && <td className="py-3 px-4">{item.order_vat_lieu || ''}</td>}
                                                    {visibleColumns.tenChiTiet && <td className="py-3 px-4">{item.ten_chi_tiet || ''}</td>}
                                                    {visibleColumns.dvt && <td className="py-3 px-4">{item.dvt || ''}</td>}
                                                    {visibleColumns.sll && <td className="py-3 px-4">{item.sll || ''}</td>}
                                                    {visibleColumns.ngayGoi && <td className="py-3 px-4">{formattedNgayDongGoi}</td>}
                                                    {visibleColumns.thoiHan && <td className={`py-3 px-4 ${item.thoi_han === 'Đã xuất' ? 'text-gray-500' : 'text-blue-600 font-medium'}`}>
                                                        {item.thoi_han || ''}
                                                    </td>}
                                                    {visibleColumns.xacNhan && <td className="py-3 px-4">{item.xac_nhan_tu_rc || ''}</td>}
                                                    {visibleColumns.ghiChu && <td className="py-3 px-4">{item.ghi_chu || ''}</td>}
                                                    {visibleColumns.soGoi && <td className="py-3 px-4">{item.so_goi || ''}</td>}
                                                    {visibleColumns.lanGiao && <td className="py-3 px-4">{item.lan_giao || ''}</td>}
                                                    {visibleColumns.ngayXuat && <td className="py-3 px-4">{formattedNgayXuatHang}</td>}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Xuất giao kho</h2>
                        <p>Bạn muốn xuất {selectedRows.length} đơn hàng đã chọn?</p>
                        <div className="flex justify-end mt-6 space-x-3">
                            <button
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                                onClick={() => setShowExportModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={handleConfirmExport}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Xem trước biên bản</h2>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPreviewModal(false)}
                            >
                                <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div className="border p-4 rounded-lg bg-gray-50 overflow-auto max-h-[calc(100vh-200px)]">
                            <div dangerouslySetInnerHTML={{ __html: previewData }}></div>
                        </div>
                        <div className="flex justify-end mt-6 space-x-3">
                            <button
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                                onClick={() => setShowPreviewModal(false)}
                            >
                                Đóng
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={() => {
                                    handlePrintTemplate();
                                    setShowPreviewModal(false);
                                }}
                            >
                                In biên bản
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehouseManagement;