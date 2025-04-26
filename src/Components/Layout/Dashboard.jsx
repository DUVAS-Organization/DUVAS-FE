import React, { useState } from "react";
import { FiHome, FiList, FiUsers, FiDollarSign, FiTool, FiSettings, FiMoon, FiBell, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, LineChart, Line } from "recharts";

// Dữ liệu giữ nguyên
const barData = [
    { month: "Th1", occupancy: 85 },
    { month: "Th2", occupancy: 88 },
    { month: "Th3", occupancy: 92 },
    { month: "Th4", occupancy: 90 },
    { month: "Th5", occupancy: 85 },
    { month: "Th6", occupancy: 89 }
];

const pieData = [
    { name: "Dân cư", value: 65 },
    { name: "Thương mại", value: 35 }
];

const lineData = [
    { month: "Th1", income: 45000 },
    { month: "Th2", income: 48000 },
    { month: "Th3", income: 52000 },
    { month: "Th4", income: 51000 },
    { month: "Th5", income: 54000 },
    { month: "Th6", income: 58000 }
];

const propertyData = [
    {
        id: 1,
        name: "Căn hộ Sunset",
        address: "123 Đại lộ Sunset",
        type: "Dân cư",
        status: "Đã thuê",
        income: 5000
    },
    {
        id: 2,
        name: "Tòa nhà văn phòng trung tâm",
        address: "456 Đại lộ Kinh doanh",
        type: "Thương mại",
        status: "Thuê một phần",
        income: 12000
    }
];

const tenantData = [
    {
        id: 1,
        name: "John Smith",
        contact: "john@email.com",
        property: "Căn hộ Sunset",
        lease: "12 tháng",
        status: "Đã thanh toán"
    },
    {
        id: 2,
        name: "Sarah Johnson",
        contact: "sarah@email.com",
        property: "Tòa nhà văn phòng trung tâm",
        lease: "24 tháng",
        status: "Đang chờ"
    }
];

const maintenanceData = [
    {
        id: 1,
        property: "Căn hộ Sunset",
        issue: "Ống nước",
        status: "Đang chờ",
        date: "2024-01-15",
        staff: "Mike Tech"
    },
    {
        id: 2,
        property: "Tòa nhà văn phòng trung tâm",
        issue: "Hệ thống điều hòa",
        status: "Đang thực hiện",
        date: "2024-01-14",
        staff: "Jane Fix"
    }
];

const kpiData = [
    { title: "Tổng người dùng", value: "3,421", icon: FiUsers, color: "blue" },
    { title: "Tổng tòa nhà", value: "253", icon: FiHome, color: "green" },
    { title: "Tổng phòng", value: "812", icon: FiList, color: "purple" },
    { title: "Dịch vụ đang hoạt động", value: "119", icon: FiTool, color: "orange" },
    { title: "Báo cáo đang chờ", value: "7", icon: FiBell, color: "red" },
    { title: "Yêu cầu rút tiền", value: "4", icon: FiDollarSign, color: "yellow" }
];

const quickActions = [
    { title: "Quản lý người dùng", description: "Xem/khóa người dùng", icon: FiUsers, color: "blue", link: "/Admin/Accounts" },
    { title: "Quản lý phòng", description: "Xem xét/phê duyệt/sửa phòng", icon: FiHome, color: "green", link: "/Admin/Rooms" },
    { title: "Quản lý dịch vụ", description: "Xem xét và quản lý dịch vụ", icon: FiTool, color: "purple", link: "/Admin/ServicePosts" },
    { title: "Xử lý rút tiền", description: "Phê duyệt yêu cầu rút tiền", icon: FiDollarSign, color: "orange", link: "/Admin/Withdraws" },
    { title: "Cập nhật vai trò", description: "Xem xét yêu cầu chủ nhà/chủ dịch vụ", icon: FiUsers, color: "indigo", link: "/Admin/Landlord" },
    { title: "Xử lý báo cáo", description: "Kiểm tra các phòng/dịch vụ bị báo cáo", icon: FiBell, color: "red", link: "/Admin/Reports" }
];

const recentActivity = [
    { id: 1, message: "Nguyễn Văn A vừa đăng ký tài khoản mới", type: "user", time: "5 phút trước" },
    { id: 2, message: "Phòng ABC123 bị người dùng báo cáo", type: "alert", time: "10 phút trước" },
    { id: 3, message: "Lê Thị B yêu cầu rút 500.000đ", type: "money", time: "15 phút trước" },
    { id: 4, message: "Quản trị viên đã phê duyệt Phòng XYZ", type: "success", time: "20 phút trước" },
    { id: 5, message: "Đăng ký dịch vụ mới đang chờ xem xét", type: "pending", time: "25 phút trước" }
];

const Dashboard = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [activeSection, setActiveSection] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleDarkMode = () => setDarkMode(!darkMode);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className={`${darkMode ? "dark bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gradient-to-br from-blue-50 to-indigo-50"}`}>
            {/* Header */}
            <header className="fixed top-0 z-50 h-16 bg-white dark:bg-gray-800/80 backdrop-blur-md shadow-lg w-[81%] ml-[35px]">
                <div className="flex justify-between items-center max-w-7xl mx-auto h-full px-4">
                    <div className="flex items-center space-x-4">
                        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <FiList className="text-xl" />
                        </button>
                        {/* Hiển thị navbar ngang khi sidebarOpen là true */}
                        {sidebarOpen && (
                            <nav className="flex space-x-4 flex-grow">
                                <button onClick={() => setActiveSection("dashboard")} className={`flex items-center p-2 rounded-lg ${activeSection === "dashboard" ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                                    <FiHome className="mr-2" /> Trang tổng quan
                                </button>
                                <button onClick={() => setActiveSection("properties")} className={`flex items-center p-2 rounded-lg ${activeSection === "properties" ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                                    <FiList className="mr-2" /> Bất động sản
                                </button>
                                <button onClick={() => setActiveSection("tenants")} className={`flex items-center p-2 rounded-lg ${activeSection === "tenants" ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                                    <FiUsers className="mr-2" /> Người thuê
                                </button>
                                <button onClick={() => setActiveSection("maintenance")} className={`flex items-center p-2 rounded-lg ${activeSection === "maintenance" ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                                    <FiTool className="mr-2" /> Bảo trì
                                </button>
                            </nav>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <FiMoon className="text-xl" />
                        </button> */}
                        <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <FiBell className="text-xl" />
                        </button>
                        {/* <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <FiUser className="text-xl" />
                        </button> */}
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? "ml-0" : "ml-0"}`}>
                <div className="p-6 max-w-7xl mx-auto">
                    {activeSection === "dashboard" && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                {kpiData.map((kpi, index) => (
                                    <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">{kpi.title}</h3>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{kpi.value}</p>
                                            </div>
                                            <div className={`p-4 rounded-full bg-${kpi.color}-100 dark:bg-${kpi.color}-900/30`}>
                                                <kpi.icon className={`text-${kpi.color}-500 text-2xl`} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-xl font-semibold mb-6">Phân phối vai trò người dùng</h3>
                                    <PieChart width={400} height={300}>
                                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#4299e1" label />
                                        <Tooltip />
                                    </PieChart>
                                </div>
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-xl font-semibold mb-6">Tăng trưởng phòng/dịch vụ hàng tháng</h3>
                                    <BarChart width={400} height={300} data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="occupancy" fill="#4299e1" />
                                    </BarChart>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {quickActions.map((action, index) => (
                                    <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-xl transition-shadow">
                                        <div className="flex items-center mb-4">
                                            <action.icon className={`text-${action.color}-500 text-2xl mr-3`} />
                                            <h3 className="text-lg font-semibold">{action.title}</h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">{action.description}</p>
                                        <Link
                                            to={action.link}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Truy cập
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                                <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-center p-3 border-b dark:border-gray-700">
                                            <div className={`w-2 h-2 rounded-full mr-3 ${activity.type === "alert" ? "bg-red-500" :
                                                activity.type === "money" ? "bg-yellow-500" :
                                                    activity.type === "success" ? "bg-green-500" :
                                                        "bg-blue-500"
                                                }`} />
                                            <div className="flex-1">
                                                <p className="text-sm">{activity.message}</p>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "properties" && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">Danh sách bất động sản</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-700">
                                            <th className="p-3 text-left">Tên bất động sản</th>
                                            <th className="p-3 text-left">Địa chỉ</th>
                                            <th className="p-3 text-left">Loại</th>
                                            <th className="p-3 text-left">Trạng thái</th>
                                            <th className="p-3 text-left">Thu nhập hàng tháng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {propertyData.map((property) => (
                                            <tr key={property.id} className="border-b dark:border-gray-700">
                                                <td className="p-3">{property.name}</td>
                                                <td className="p-3">{property.address}</td>
                                                <td className="p-3">{property.type}</td>
                                                <td className="p-3">{property.status}</td>
                                                <td className="p-3">${property.income}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeSection === "tenants" && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">Quản lý người thuê</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-700">
                                            <th className="p-3 text-left">Tên</th>
                                            <th className="p-3 text-left">Liên hệ</th>
                                            <th className="p-3 text-left">Bất động sản</th>
                                            <th className="p-3 text-left">Thời hạn thuê</th>
                                            <th className="p-3 text-left">Trạng thái thanh toán</th>
                                            <th className="p-3 text-left">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tenantData.map((tenant) => (
                                            <tr key={tenant.id} className="border-b dark:border-gray-700">
                                                <td className="p-3">{tenant.name}</td>
                                                <td className="p-3">{tenant.contact}</td>
                                                <td className="p-3">{tenant.property}</td>
                                                <td className="p-3">{tenant.lease}</td>
                                                <td className="p-3">{tenant.status}</td>
                                                <td className="p-3">
                                                    <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Xem</button>
                                                    <button className="bg-green-500 text-white px-3 py-1 rounded">Liên hệ</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeSection === "maintenance" && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">Yêu cầu bảo trì</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-700">
                                            <th className="p-3 text-left">Bất động sản</th>
                                            <th className="p-3 text-left">Vấn đề</th>
                                            <th className="p-3 text-left">Trạng thái</th>
                                            <th className="p-3 text-left">Ngày</th>
                                            <th className="p-3 text-left">Giao cho</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {maintenanceData.map((request) => (
                                            <tr key={request.id} className="border-b dark:border-gray-700">
                                                <td className="p-3">{request.property}</td>
                                                <td className="p-3">{request.issue}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded ${request.status === "Đang chờ" ? "bg-yellow-200 text-yellow-800" : "bg-blue-200 text-blue-800"}`}>
                                                        {request.status}
                                                    </span>
                                                </td>
                                                <td className="p-3">{request.date}</td>
                                                <td className="p-3">{request.staff}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;