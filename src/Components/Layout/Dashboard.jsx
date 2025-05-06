import React, { useState, useEffect, useRef } from "react";
import { FiHome, FiList, FiUsers, FiDollarSign, FiTool, FiSettings, FiMoon } from "react-icons/fi";
import { FaRegBell } from "react-icons/fa";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { MdClose } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie } from "recharts";
import AccountsService from "../../Services/Admin/AccountServices";
import ServicePost from "../../Services/Admin/ServicePost";
import BuildingServices from "../../Services/Admin/BuildingServices";
import RoomServices from "../../Services/Admin/RoomServices";
import OtherService from "../../Services/User/OtherService";
import AdminWithdrawRequestService from "../../Services/Admin/WithdrawManagementService";
import UserService from "../../Services/User/UserService";
import NotificationService from "../../Services/User/NotificationService";
import { parse, format, differenceInSeconds, differenceInMinutes, differenceInHours } from "date-fns";
import { useAuth } from "../../Context/AuthProvider";
import { getUserProfile } from "../../Services/User/UserProfileService";

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
    { title: "Xử lý báo cáo", description: "Kiểm tra các phòng/dịch vụ bị báo cáo", icon: FaRegBell, color: "red", link: "/Admin/Reports" }
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
    try {
        const parsedDate = parse(dateStr, "HH:mm - dd/MM/yyyy", new Date());
        const now = new Date();
        const secondsDiff = differenceInSeconds(now, parsedDate);

        if (secondsDiff < 60) {
            return "vừa xong";
        } else if (secondsDiff < 3600) {
            const minutes = differenceInMinutes(now, parsedDate);
            return `${minutes} phút trước`;
        } else if (secondsDiff < 86400) {
            const hours = differenceInHours(now, parsedDate);
            return `${hours} giờ trước`;
        } else {
            return format(parsedDate, "dd-MM-yyyy");
        }
    } catch (err) {
        console.error("Error parsing date:", err);
        return "N/A";
    }
};

// Helper function to format amount with thousand separators
const formatAmount = (amount) => {
    if (!amount) return '0';
    if (typeof amount === 'string' && amount.includes(',')) {
        const [integerPart, decimalPart] = amount.split(',');
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
    }
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
                const accounts = await AccountsService.getAccounts();
                setAccountCount(accounts.length);

                const posts = await ServicePost.getServicePosts();
                setPostCount(posts.length);

                const buildings = await BuildingServices.getBuildings();
                setBuildingCount(buildings.length);

                const rooms = await RoomServices.getRooms();
                setRoomCount(rooms.length);

                const token = localStorage.getItem('authToken');
                if (token) {
                    const reports = await OtherService.getAllReports(token);
                    setReportCount(reports.length);
                } else {
                    console.error('No auth token found');
                    setReportCount(0);
                }

                const withdraws = await AdminWithdrawRequestService.getWithdrawRequests();
                setWithdrawCount(withdraws.length);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const kpiData = [
        { title: "Tổng người dùng", value: accountCount.toString(), icon: FiUsers, color: "blue", link: "/Admin/Accounts" },
        { title: "Tổng tòa nhà", value: buildingCount.toString(), icon: FiHome, color: "green", link: "/Admin/Buildings" },
        { title: "Tổng phòng", value: roomCount.toString(), icon: FiList, color: "purple", link: "/Admin/Rooms" },
        { title: "Dịch vụ đang hoạt động", value: postCount.toString(), icon: FiTool, color: "orange", link: "/Admin/ServicePosts" },
        { title: "Báo cáo đang chờ", value: reportCount.toString(), icon: FaRegBell, color: "red", link: "/Admin/Reports" },
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

// Notification component adapted from BellNotifications
const Notifications = ({ userId, userRole }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [filterUnread, setFilterUnread] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const wsRef = useRef(null);
    const userCache = useRef({});
    const bellRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                bellRef.current &&
                !bellRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const processNotification = async (item) => {
        let message = item.message;
        let redirectUrl = null;
        let senderUserId = null;

        if (item.type === "RentRoom" || item.type === "ConfirmReservation") {
            redirectUrl = userRole === "Landlord" ? "/Room" : "/RentalList";
        } else if (item.type === "message") {
            redirectUrl = "/Message";
            const match = item.message.match(/#(\d+)/);
            if (match) {
                senderUserId = parseInt(match[1]);
                if (userCache.current[senderUserId]) {
                    message = `Bạn vừa có tin nhắn mới từ ${userCache.current[senderUserId]}`;
                } else {
                    try {
                        const userData = await UserService.getUserById(senderUserId);
                        userCache.current[senderUserId] = userData.name || "Người dùng không xác định";
                        message = `Bạn vừa có tin nhắn mới từ ${userCache.current[senderUserId]}`;
                    } catch (err) {
                        console.error(`Error fetching user ${senderUserId}:`, err);
                        message = "Bạn vừa có tin nhắn mới từ Người dùng không xác định";
                    }
                }
            }
        }

        return {
            id: item.notificationId,
            userId: item.userId,
            type: item.type,
            message,
            unread: !item.isRead,
            rawCreatedDate: item.createdDate,
            createdDate: formatRelativeTime(item.createdDate),
            redirectUrl,
        };
    };

    const fetchNotifications = async () => {
        if (!userId) {
            setError("Vui lòng đăng nhập để xem thông báo");
            return;
        }

        try {
            const data = filterUnread
                ? await NotificationService.getNotificationUnreadByUser(userId)
                : await NotificationService.getNotificationsByUser(userId);

            const mappedData = await Promise.all(data.map(processNotification));
            mappedData.sort((a, b) => {
                const dateA = parse(a.rawCreatedDate, "HH:mm - dd/MM/yyyy", new Date());
                const dateB = parse(b.rawCreatedDate, "HH:mm - dd/MM/yyyy", new Date());
                return dateB - dateA;
            });
            setNotifications(mappedData);
            setError(null);
        } catch (err) {
            console.error("Error fetching notifications:", err.response || err);
            setError(err.message || "Lỗi khi tải thông báo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userId) return;

        wsRef.current = NotificationService.connectWebSocket(userId, {
            onOpen: () => { },
            onMessage: async (event) => {
                try {
                    const newNotification = JSON.parse(event.data);
                    const processedNotification = await processNotification(newNotification);
                    setNotifications((prev) => {
                        const updatedNotifications = [processedNotification, ...prev];
                        updatedNotifications.sort((a, b) => {
                            const dateA = parse(a.rawCreatedDate, "HH:mm - dd/MM/yyyy", new Date());
                            const dateB = parse(b.rawCreatedDate, "HH:mm - dd/MM/yyyy", new Date());
                            return dateB - dateA;
                        });
                        return updatedNotifications;
                    });
                } catch (err) {
                    console.error("Error processing WebSocket message:", err);
                }
            },
            onClose: () => { },
            onError: (error) => {
                console.error("WebSocket error:", error);
                const pollingInterval = setInterval(() => {
                    fetchNotifications();
                }, 10000);
                return () => clearInterval(pollingInterval);
            },
        });

        return () => {
            wsRef.current?.close();
        };
    }, [userId]);

    useEffect(() => {
        if (isOpen && userId) {
            fetchNotifications();
        }
    }, [isOpen, filterUnread, userId]);

    const filteredNotifications = filterUnread
        ? notifications.filter((n) => n.unread)
        : notifications;

    const markAllAsRead = async () => {
        try {
            await Promise.all(
                notifications
                    .filter((n) => n.unread)
                    .map((n) => NotificationService.markAsRead(n.id))
            );
            setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
        } catch (err) {
            console.error("Error marking notifications as read:", err.response || err);
            setError(err.message || "Lỗi khi đánh dấu đã đọc");
        }
    };

    const removeNotification = async (id) => {
        try {
            await NotificationService.deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error("Error deleting notification:", err.response || err);
            setError(err.message || "Lỗi khi xóa thông báo");
        }
    };

    const clearAllNotifications = async () => {
        try {
            await Promise.all(notifications.map((n) => NotificationService.deleteNotification(n.id)));
            setNotifications([]);
        } catch (err) {
            console.error("Error clearing notifications:", err.response || err);
            setError(err.message || "Lỗi khi xóa tất cả thông báo");
        }
    };

    const handleNotificationClick = async (notification) => {
        if (notification.unread) {
            try {
                await NotificationService.markAsRead(notification.id);
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id ? { ...n, unread: false } : n
                    )
                );
            } catch (err) {
                console.error("Error marking notification as read:", err.response || err);
                setError(err.message || "Lỗi khi đánh dấu thông báo là đã đọc");
            }
        }

        if (notification.redirectUrl) {
            navigate(notification.redirectUrl);
        }
    };

    return (
        <div className="relative">
            <button
                ref={bellRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                <FaRegBell className="text-xl" />
                {notifications.some((n) => n.unread) && (
                    <span className="absolute -top-0 -right-0 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {notifications.filter((n) => n.unread).length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full right-0 mt-2 w-[90vw] max-w-[24rem] max-h-[70vh] md:w-96 md:max-h-96
                     bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700
                     flex flex-col z-50"
                >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Thông báo</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                        >
                            <MdClose className="text-2xl" />
                        </button>
                    </div>

                    <div className="px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                        <span className="text-base font-medium text-gray-800 dark:text-white">Xem tin chưa đọc</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={filterUnread}
                                onChange={() => setFilterUnread(!filterUnread)}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-red-600 peer-focus:ring-4
                              peer-focus:ring-white dark:peer-focus:ring-red-800 dark:bg-gray-700
                              transition-all duration-500 ease-in-out
                              after:absolute after:top-0.5 after:left-[2px]
                              after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all after:duration-500
                              peer-checked:after:translate-x-full">
                            </div>
                        </label>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <p>Loading...</p>
                            </div>
                        ) : error ? (
                            <div className="flex justify-center py-4">
                                <p className="text-red-500 dark:text-red-400">{error}</p>
                            </div>
                        ) : filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-center gap-3 p-3 ${notification.unread ? "bg-red-50 dark:bg-red-900/50 font-bold" : "hover:bg-gray-100 dark:hover:bg-gray-700"} rounded-md relative group ${notification.redirectUrl ? "cursor-pointer" : ""}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex-1">
                                        <p className={`text-sm ${notification.unread ? "font-bold" : "font-medium"} text-gray-800 dark:text-white`}>{notification.message}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-300">{notification.createdDate}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeNotification(notification.id);
                                        }}
                                        className="absolute right-2 p-1 text-gray-500 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MdClose className="text-lg" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 py-4">
                                <HiOutlineBellAlert className="text-6xl p-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                                <p className="mt-2 text-sm">Hiện tại bạn không có thông báo nào</p>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                            <button
                                onClick={markAllAsRead}
                                className="text-gray-500 dark:text-gray-300 text-sm font-medium hover:underline"
                            >
                                Đánh dấu tất cả là đã đọc
                            </button>
                            <button
                                onClick={clearAllNotifications}
                                className="text-red-500 dark:text-red-400 text-sm font-medium hover:underline"
                            >
                                Xóa tất cả
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [activeSection, setActiveSection] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pieData, setPieData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const { user } = useAuth();
    const userId = user?.userId ? parseInt(user.userId) : null;
    const [userRole, setUserRole] = useState("User");
    const navigate = useNavigate();

    const toggleDarkMode = () => setDarkMode(!darkMode);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // Fetch user profile including money
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId) {
                console.error('No user ID found from useAuth');
                setUserProfile({
                    money: 0,
                    role: "User"
                });
                setUserRole("User");
                return;
            }
            try {
                console.log('Fetching user profile for userId:', userId);
                const profileData = await getUserProfile(userId);
                setUserProfile({
                    userName: profileData.userName || user.username,
                    name: profileData.name || '',
                    profilePicture: profileData.profilePicture || 'https://www.gravatar.com/avatar/?d=mp',
                    money: profileData.money || 0,
                    encryptedMoney: profileData.encryptedMoney,
                    moneyIV: profileData.moneyIV
                });
                // Determine user role
                if (profileData.roleAdmin === 1) {
                    setUserRole("Admin");
                } else if (profileData.roleLandlord === 1) {
                    setUserRole("Landlord");
                } else if (profileData.roleService === 1) {
                    setUserRole("Service");
                } else {
                    setUserRole("User");
                }
            } catch (error) {
                console.error('Error fetching user profile:', error.response?.data || error.message);
                setUserProfile({
                    userName: user.username || '',
                    name: '',
                    profilePicture: 'https://www.gravatar.com/avatar/?d=mp',
                    money: 0,
                    encryptedMoney: null,
                    moneyIV: null
                });
                setUserRole("User");
            }
        };
        fetchUserProfile();
    }, [userId, user]);

    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                const users = await UserService.getUsers();
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

                const newPieData = Object.entries(roleCounts)
                    .filter(([_, count]) => count > 0)
                    .map(([name, value]) => ({ name, value }));

                setPieData(newPieData);
            } catch (error) {
                console.error('Error fetching user roles:', error);
                setPieData([]);
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
                const filteredNotifications = notifications.filter(notification => notification.type !== "message");
                const userCache = new Map();

                const activityPromises = filteredNotifications.map(async (notification) => {
                    let message = notification.message;
                    let primaryUserName = '';

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
                            const amountMatch = notification.message.match(/#([\d,]+)/);
                            const amount = amountMatch ? amountMatch[1] : '0';
                            message = `${primaryUserName} vừa nhận được ${formatAmount(amount)} đ`;
                            break;
                        }
                        case 'WithdrawRequest': {
                            const amountMatch = notification.message.match(/([\d.]+)đ/);
                            const amount = amountMatch ? amountMatch[1] : '0';
                            message = `${primaryUserName} đã gửi yêu cầu rút ${formatAmount(amount)} đ`;
                            break;
                        }
                        default:
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
                                message = message.replace(userIdMatch[0], userCache.get(refUserId));
                            }
                            if (primaryUserName) {
                                message = `${primaryUserName} ${message}`;
                            }
                            break;
                    }

                    message = message.replace(/\bBạn\b/gi, '').trim();

                    return {
                        id: notification.notificationId,
                        message,
                        type: notification.type,
                        time: formatRelativeTime(notification.createdDate),
                        createdDate: notification.createdDate
                    };
                });

                let recentActivityData = await Promise.all(activityPromises);
                recentActivityData = recentActivityData.sort((a, b) => {
                    const dateA = parseCreatedDate(a.createdDate);
                    const dateB = parseCreatedDate(b.createdDate);
                    return dateB - dateA;
                });

                setRecentActivity(recentActivityData);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setRecentActivity([]);
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
                        <span className="text-sm font-medium bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                            {userProfile?.money?.toLocaleString('vi-VN') || '0'} đ
                        </span>
                        <Notifications userId={userId} userRole={userRole} />
                        <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <FiMoon className="text-xl" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? "ml-0" : "ml-0"}`}>
                <div className="p-6 max-w-7xl mx-auto">
                    {activeSection === "dashboard" && (
                        <div className="space-y-8">
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
                                    <BarChart className="mx-auto" width={400} height={300} data={barData}>
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