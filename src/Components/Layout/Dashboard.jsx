import React, { useState, useEffect } from "react";
import { FiHome, FiList, FiUsers, FiDollarSign, FiTool, FiSettings, FiMoon, FiBell, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie } from "recharts";
import AccountsService from "../../Services/Admin/AccountServices";
import ServicePost from "../../Services/Admin/ServicePost";
import BuildingServices from "../../Services/Admin/BuildingServices";
import RoomServices from "../../Services/Admin/RoomServices";
import OtherService from "../../Services/User/OtherService";
import AdminWithdrawRequestService from "../../Services/Admin/WithdrawManagementService";
import UserService from "../../Services/User/UserService";
import NotificationService from "../../Services/User/NotificationService";

// Static data remains unchanged
const barData = [
    { month: "Th1", occupancy: 85 },
    { month: "Th2", occupancy: 88 },
    { month: "Th3", occupancy: 92 },
    { month: "Th4", occupancy: 90 },
    { month: "Th5", occupancy: 85 },
    { month: "Th6", occupancy: 89 }
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

const quickActions = [
    { title: "Quản lý người dùng", description: "Xem/khóa người dùng", icon: FiUsers, color: "blue", link: "/Admin/Accounts" },
    { title: "Quản lý phòng", description: "Xem xét/phê duyệt/sửa phòng", icon: FiHome, color: "green", link: "/Admin/Rooms" },
    { title: "Quản lý dịch vụ", description: "Xem xét và quản lý dịch vụ", icon: FiTool, color: "purple", link: "/Admin/ServicePosts" },
    { title: "Xử lý rút tiền", description: "Phê duyệt yêu cầu rút tiền", icon: FiDollarSign, color: "orange", link: "/Admin/Withdraws" },
    { title: "Cập nhật vai trò", description: "Xem xét yêu cầu chủ nhà/chủ dịch vụ", icon: FiUsers, color: "indigo", link: "/Admin/Landlord" },
    { title: "Xử lý báo cáo", description: "Kiểm tra các phòng/dịch vụ bị báo cáo", icon: FiBell, color: "red", link: "/Admin/Reports" }
];

// Helper function to parse "HH:mm - DD/MM/YYYY" to Date object
const parseCreatedDate = (dateStr) => {
    try {
        const [time, date] = dateStr.split(' - ');
        const [hours, minutes] = time.split(':').map(Number);
        const [day, month, year] = date.split('/').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    } catch (error) {
        console.error('Error parsing createdDate:', dateStr, error);
        return null;
    }
};

// Helper function to format relative time
const formatRelativeTime = (dateStr) => {
    const date = parseCreatedDate(dateStr);
    if (!date) return 'Không rõ thời gian';

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
};

// Helper function to format amount with thousand separators
const formatAmount = (amount) => {
    if (!amount) return '0';
    // Check if amount contains a comma (e.g., "19000000,0" for InsiderTrading)
    if (amount.includes(',')) {
        // Split into integer and decimal parts
        const [integerPart, decimalPart] = amount.split(',');
        // Add thousand separators to integer part
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        // Return with decimal part if present
        return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
    }
    // For WithdrawRequest (e.g., "10.000"), return as-is since it's already formatted
    return amount;
};

// Counts component to fetch all KPI data
const Counts = () => {
    const [accountCount, setAccountCount] = useState(0);
    const [postCount, setPostCount] = useState(0);
    const [buildingCount, setBuildingCount] = useState(0);
    const [roomCount, setRoomCount] = useState(0);
    const [reportCount, setReportCount] = useState(0);
    const [withdrawCount, setWithdrawCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch accounts
                const accounts = await AccountsService.getAccounts();
                setAccountCount(accounts.length);

                // Fetch service posts
                const posts = await ServicePost.getServicePosts();
                setPostCount(posts.length);

                // Fetch buildings
                const buildings = await BuildingServices.getBuildings();
                setBuildingCount(buildings.length);

                // Fetch rooms
                const rooms = await RoomServices.getRooms();
                setRoomCount(rooms.length);

                // Fetch reports with token
                const token = localStorage.getItem('authToken'); // Adjust based on your auth mechanism
                if (token) {
                    const reports = await OtherService.getAllReports(token);
                    setReportCount(reports.length);
                } else {
                    console.error('No auth token found');
                    setReportCount(0);
                }

                // Fetch withdraw requests
                const withdraws = await AdminWithdrawRequestService.getWithdrawRequests();
                setWithdrawCount(withdraws.length);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    // Define kpiData dynamically based on fetched counts with links
    const kpiData = [
        { title: "Tổng người dùng", value: accountCount.toString(), icon: FiUsers, color: "blue", link: "/Admin/Accounts" },
        { title: "Tổng tòa nhà", value: buildingCount.toString(), icon: FiHome, color: "green", link: "/Admin/Buildings" },
        { title: "Tổng phòng", value: roomCount.toString(), icon: FiList, color: "purple", link: "/Admin/Rooms" },
        { title: "Dịch vụ đang hoạt động", value: postCount.toString(), icon: FiTool, color: "orange", link: "/Admin/ServicePosts" },
        { title: "Báo cáo đang chờ", value: reportCount.toString(), icon: FiBell, color: "red", link: "/Admin/Reports" },
        { title: "Yêu cầu rút tiền", value: withdrawCount.toString(), icon: FiDollarSign, color: "yellow", link: "/Admin/Withdraws" }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {kpiData.map((kpi, index) => (
                <Link key={index} to={kpi.link} className="block">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
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
                </Link>
            ))}
        </div>
    );
};

const Dashboard = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [activeSection, setActiveSection] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pieData, setPieData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    const toggleDarkMode = () => setDarkMode(!darkMode);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                const users = await UserService.getUsers();
                // Count users based on role priority
                const roleCounts = {
                    "Quản trị viên": 0,
                    "Chủ nhà": 0,
                    "Chủ dịch vụ": 0,
                    "Người dùng": 0
                };

                users.forEach(user => {
                    if (user.roleAdmin === 1) {
                        roleCounts["Quản trị viên"]++;
                    } else if (user.roleLandlord === 1) {
                        roleCounts["Chủ nhà"]++;
                    } else if (user.roleService === 1) {
                        roleCounts["Chủ dịch vụ"]++;
                    } else if (user.roleUser === 1) {
                        roleCounts["Người dùng"]++;
                    }
                });

                // Format pieData, only include roles with count > 0
                const newPieData = Object.entries(roleCounts)
                    .filter(([_, count]) => count > 0)
                    .map(([name, value]) => ({ name, value }));

                setPieData(newPieData);
            } catch (error) {
                console.error('Error fetching user roles:', error);
                setPieData([]); // Fallback to empty array on error
            }
        };

        const fetchRecentActivity = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    console.error('No auth token found');
                    setRecentActivity([]);
                    return;
                }

                const notifications = await NotificationService.getAllNotifications(token);
                // Filter out notifications with type === "message"
                const filteredNotifications = notifications.filter(notification => notification.type !== "message");
                const userCache = new Map(); // Cache user names

                const activityPromises = filteredNotifications.map(async (notification) => {
                    let message = notification.message;
                    let primaryUserName = '';

                    // Fetch primary user's name if userId exists
                    if (notification.userId) {
                        if (!userCache.has(notification.userId)) {
                            try {
                                const user = await UserService.getUserById(notification.userId, token);
                                userCache.set(notification.userId, user.name || 'Người dùng');
                            } catch (error) {
                                console.error(`Error fetching user ${notification.userId}:`, error);
                                userCache.set(notification.userId, 'Người dùng');
                            }
                        }
                        primaryUserName = userCache.get(notification.userId);
                    }

                    // Set custom messages based on notification type
                    switch (notification.type) {
                        case 'ConfirmReservation':
                            message = `Chủ nhà vừa đồng ý yêu cầu thuê của ${primaryUserName}`;
                            break;
                        case 'RentRoom':
                            message = `${primaryUserName} đã gửi thành công yêu cầu thuê phòng`;
                            break;
                        case 'BankAccount':
                            message = `${primaryUserName} đã thêm tài khoản ngân hàng thành công.`;
                            break;
                        case 'InsiderTrading': {
                            // Extract amount from message (e.g., #19000000,0 vnđ)
                            const amountMatch = notification.message.match(/#([\d,]+)/);
                            const amount = amountMatch ? amountMatch[1] : '0';
                            message = `${primaryUserName} vừa nhận được ${formatAmount(amount)} đ`;
                            break;
                        }
                        case 'WithdrawRequest': {
                            // Extract amount from message (e.g., 10.000đ)
                            const amountMatch = notification.message.match(/([\d.]+)đ/);
                            const amount = amountMatch ? amountMatch[1] : '0';
                            message = `${primaryUserName} đã gửi yêu cầu rút ${formatAmount(amount)} đ`;
                            break;
                        }
                        default:
                            // Handle #<userId> references for other types
                            const userIdMatch = message.match(/#(\d+)/);
                            if (userIdMatch) {
                                const refUserId = parseInt(userIdMatch[1], 10);
                                if (!userCache.has(refUserId)) {
                                    try {
                                        const refUser = await UserService.getUserById(refUserId, token);
                                        userCache.set(refUserId, refUser.name || 'Người dùng');
                                    } catch (error) {
                                        console.error(`Error fetching referenced user ${refUserId}:`, error);
                                        userCache.set(refUserId, 'Người dùng');
                                    }
                                }
                                // Replace #<userId> with referenced user's name
                                message = message.replace(userIdMatch[0], userCache.get(refUserId));
                            }
                            // Prepend primary user's name if available
                            if (primaryUserName) {
                                message = `${primaryUserName} ${message}`;
                            }
                            break;
                    }

                    // Remove "Bạn" from the message
                    message = message.replace(/\bBạn\b/gi, '').trim();

                    return {
                        id: notification.notificationId,
                        message,
                        type: notification.type,
                        time: formatRelativeTime(notification.createdDate),
                        createdDate: notification.createdDate // Store for sorting
                    };
                });

                let recentActivityData = await Promise.all(activityPromises);
                // Sort by createdDate (newest first)
                recentActivityData = recentActivityData.sort((a, b) => {
                    const dateA = parseCreatedDate(a.createdDate);
                    const dateB = parseCreatedDate(b.createdDate);
                    return dateB - dateA; // Descending order
                });

                setRecentActivity(recentActivityData);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setRecentActivity([]); // Fallback to empty array on error
            }
        };

        fetchUserRoles();
        fetchRecentActivity();
    }, []);

    return (
        <div className={`${darkMode ? "dark bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gradient-to-br from-blue-50 to-indigo-50"}`}>
            {/* Header */}
            <header className="fixed top-0 z-50 h-16 bg-white dark:bg-gray-800/80 backdrop-blur-md shadow-lg w-[81%] ml-[35px]">
                <div className="flex justify-between items-center max-w-7xl mx-auto h-full px-4">
                    <div className="flex items-center space-x-4">
                        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <FiList className="text-xl" />
                        </button>
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
                        <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <FiBell className="text-xl" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? "ml-0" : "ml-0"}`}>
                <div className="p-6 max-w-7xl mx-auto">
                    {activeSection === "dashboard" && (
                        <div className="space-y-8">
                            {/* KPI section with original design, powered by Counts */}
                            <Counts />

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
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-center p-3 border-b dark:border-gray-700">
                                                <div className={`w-2 h-2 rounded-full mr-3 ${activity.type === "ConfirmReservation" ? "bg-blue-500" :
                                                    activity.type === "RentRoom" ? "bg-green-500" :
                                                        activity.type === "InsiderTrading" ? "bg-yellow-500" :
                                                            activity.type === "WithdrawRequest" ? "bg-orange-500" :
                                                                activity.type === "alert" ? "bg-red-500" :
                                                                    activity.type === "money" ? "bg-yellow-500" :
                                                                        activity.type === "success" ? "bg-green-500" :
                                                                            activity.type === "pending" ? "bg-blue-500" :
                                                                                "bg-blue-500"
                                                    }`} />
                                                <div className="flex-1">
                                                    <p className="text-sm">{activity.message}</p>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">Không có hoạt động gần đây</p>
                                    )}
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