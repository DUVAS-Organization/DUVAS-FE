import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../../Components/Layout/Layout';
import { FaBuilding, FaDoorOpen, FaDoorClosed, FaHourglassHalf, FaLock, FaList, FaFileContract, FaMoneyBillWave } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Footer from '../../../Components/Layout/Footer';
import RoomServices from '../../../Services/Admin/RoomServices';
import UserService from '../../../Services/User/UserService';
import PriorityRoomService from '../../../Services/Admin/PriorityRoomService';
import NotificationService from '../../../Services/User/NotificationService';
import CPPRoomsService from '../../../Services/Admin/CPPRoomsService';
import { useAuth } from '../../../Context/AuthProvider';
import { getUserProfile } from '../../../Services/User/UserProfileService';
import OverviewService from '../../../Services/Landlord/OverviewService';

// Helper functions
const parseCreatedDate = (dateStr) => {
    try {
        if (dateStr.includes('T')) {
            return new Date(dateStr);
        }
        const [time, date] = dateStr.split(' - ');
        const [hours, minutes] = time.split(':').map(Number);
        const [day, month, year] = date.split('/').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    } catch (error) {
        console.error('Error parsing date:', dateStr, error);
        return null;
    }
};

const formatRelativeTime = (dateStr) => {
    const date = parseCreatedDate(dateStr);
    if (!date) return 'Không rõ thời gian';

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const absDiffInSeconds = Math.abs(diffInSeconds);
    const isFuture = diffInSeconds < 0;

    if (absDiffInSeconds < 60) return isFuture ? `trong ${absDiffInSeconds} giây` : `${absDiffInSeconds} giây trước`;
    const diffInMinutes = Math.floor(absDiffInSeconds / 60);
    if (diffInMinutes < 60) return isFuture ? `trong ${diffInMinutes} phút` : `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return isFuture ? `trong ${diffInHours} giờ` : `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    return isFuture ? `trong ${diffInDays} ngày` : `${diffInDays} ngày trước`;
};

const Overview = () => {
    const { user } = useAuth();
    const userId = user?.userId;
    const [roomCount, setRoomCount] = useState(0);
    const [priorityRoomCount, setPriorityRoomCount] = useState(0);
    const [money, setMoney] = useState({ main: 0, promotion: 0 });
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState([]);
    const [notificationFilter, setNotificationFilter] = useState('all');
    const [priorityRooms, setPriorityRooms] = useState([]);
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [role, setRole] = useState(null);
    const [overviewData, setOverviewData] = useState({
        totalRooms: 0,
        rentedRooms: 0,
        availableRooms: 0,
        pendingRooms: 0,
        lockedRooms: 0,
        totalRentalLists: 0,
        completedContracts: 0,
        totalInsiderTradingAmount: 0,
    });
    const canvasRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                console.error('No userId found');
                return;
            }

            try {
                // Fetch user profile
                const profileData = await getUserProfile(userId);
                setMoney({
                    main: profileData.money || 0,
                    promotion: 0,
                });

                // Fetch user role
                const userData = await UserService.getUserById(userId);
                if (userData) {
                    setRole(
                        userData.roleLandlord === 1 || userData.isLandlord
                            ? 'Landlord'
                            : userData.roleService === 1 || userData.isService
                                ? 'Service'
                                : null
                    );
                } else {
                    console.error('User data not found');
                    setRole(null);
                }

                // Fetch room count
                const rooms = await RoomServices.getRooms();
                if (Array.isArray(rooms)) {
                    const userRooms = rooms.filter(room => Number(room.userId) === userId);
                    setRoomCount(userRooms.length);
                } else {
                    console.error('Invalid rooms data format:', rooms);
                    setRoomCount(0);
                }

                // Fetch priority rooms
                const priorityRoomsData = await PriorityRoomService.getPriorityRoomByUserId(userId);
                let priorityRoomsArray = [];
                if (Array.isArray(priorityRoomsData)) {
                    priorityRoomsArray = priorityRoomsData;
                } else if (priorityRoomsData && typeof priorityRoomsData === 'object') {
                    priorityRoomsArray = Object.values(priorityRoomsData).filter(r => r);
                } else {
                    console.error('Invalid priority rooms response');
                    priorityRoomsArray = [];
                }
                setPriorityRoomCount(priorityRoomsArray.length);

                // Fetch landlord overview data
                const token = localStorage.getItem('authToken');
                if (!token) {
                    console.error('No auth token found');
                    setPriorityRooms([]);
                    setNotifications([]);
                    setUnreadNotifications([]);
                    setOverviewData({
                        totalRooms: 0,
                        rentedRooms: 0,
                        availableRooms: 0,
                        pendingRooms: 0,
                        lockedRooms: 0,
                        totalRentalLists: 0,
                        completedContracts: 0,
                        totalInsiderTradingAmount: 0,
                    });
                    return;
                }

                const overviewService = OverviewService();
                const overview = await overviewService.getLandlordOverview(userId, token);
                console.log('Overview data from API:', overview); // Debug log
                setOverviewData({
                    totalRooms: overview.totalRooms || 0,
                    rentedRooms: overview.rentedRooms || 0,
                    availableRooms: overview.availableRooms || 0,
                    pendingRooms: overview.pendingRooms || 0,
                    lockedRooms: overview.lockedRooms || 0,
                    totalRentalLists: overview.totalRentalLists || 0,
                    completedContracts: overview.completedContracts || 0,
                    totalInsiderTradingAmount: overview.totalInsiderTradingAmount || 0,
                });

                // Fetch details for each priority room
                const priorityRoomPromises = priorityRoomsArray.map(async (room) => {
                    try {
                        const [user, roomDetails, cppRoom] = await Promise.all([
                            UserService.getUserById(room.userId, token),
                            RoomServices.getRoomById(room.roomId),
                            CPPRoomsService.getCPPRoomById(room.categoryPriorityPackageRoomId),
                        ]);

                        return {
                            id: room.priorityPackageRoomId,
                            userName: user?.name || 'Người dùng',
                            roomTitle: roomDetails?.title || 'Không xác định',
                            categoryValue: cppRoom?.categoryPriorityPackageRoomValue || 'Không xác định',
                            startDate: formatRelativeTime(room.startDate),
                            endDate: formatRelativeTime(room.endDate),
                            price: (room.price || 0).toLocaleString('vi-VN'),
                            rawStartDate: room.startDate,
                            rawEndDate: room.endDate,
                        };
                    } catch (error) {
                        console.error(`Error processing priority room ${room.priorityPackageRoomId}:`, error);
                        return {
                            id: room.priorityPackageRoomId,
                            userName: 'Người dùng',
                            roomTitle: 'Không xác định',
                            categoryValue: 'Không xác định',
                            startDate: 'Không rõ thời gian',
                            endDate: 'Không rõ thời gian',
                            price: (room.price || 0).toLocaleString('vi-VN'),
                            rawStartDate: room.startDate,
                            rawEndDate: room.endDate,
                        };
                    }
                });

                const formattedPriorityRooms = await Promise.all(priorityRoomPromises);
                formattedPriorityRooms.sort((a, b) => {
                    const dateA = parseCreatedDate(a.rawStartDate);
                    const dateB = parseCreatedDate(b.rawStartDate);
                    return dateB - dateA;
                });
                setPriorityRooms(formattedPriorityRooms);

                // Fetch all notifications
                const userNotifications = await NotificationService.getNotificationsByUser(userId, token);
                if (Array.isArray(userNotifications)) {
                    const filteredNotifications = userNotifications.filter(
                        notification => notification.type !== "message"
                    );
                    const userCache = new Map();

                    const notificationPromises = filteredNotifications.map(async (notification) => {
                        let message = notification.message;

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

                        return {
                            id: notification.notificationId,
                            message,
                            time: formatRelativeTime(notification.createdDate),
                            createdDate: notification.createdDate,
                        };
                    });

                    const formattedNotifications = await Promise.all(notificationPromises);
                    formattedNotifications.sort((a, b) => {
                        const dateA = parseCreatedDate(a.createdDate);
                        const dateB = parseCreatedDate(b.createdDate);
                        return dateB - dateA;
                    });
                    setNotifications(formattedNotifications);
                } else {
                    console.error('Invalid notifications data format:', userNotifications);
                    setNotifications([]);
                }

                // Fetch unread notifications
                const unreadNotificationsData = await NotificationService.getNotificationUnreadByUser(userId, token);
                if (Array.isArray(unreadNotificationsData)) {
                    const filteredUnreadNotifications = unreadNotificationsData.filter(
                        notification => notification.type !== "message"
                    );
                    const userCache = new Map();

                    const unreadNotificationPromises = filteredUnreadNotifications.map(async (notification) => {
                        let message = notification.message;

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

                        return {
                            id: notification.notificationId,
                            message,
                            time: formatRelativeTime(notification.createdDate),
                            createdDate: notification.createdDate,
                        };
                    });

                    const formattedUnreadNotifications = await Promise.all(unreadNotificationPromises);
                    formattedUnreadNotifications.sort((a, b) => {
                        const dateA = parseCreatedDate(a.createdDate);
                        const dateB = parseCreatedDate(b.createdDate);
                        return dateB - dateA;
                    });
                    setUnreadNotifications(formattedUnreadNotifications);
                } else {
                    console.error('Invalid unread notifications data format:', unreadNotificationsData);
                    setUnreadNotifications([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setRoomCount(0);
                setPriorityRoomCount(0);
                setMoney({ main: 0, promotion: 0 });
                setNotifications([]);
                setUnreadNotifications([]);
                setPriorityRooms([]);
                setOverviewData({
                    totalRooms: 0,
                    rentedRooms: 0,
                    availableRooms: 0,
                    pendingRooms: 0,
                    lockedRooms: 0,
                    totalRentalLists: 0,
                    completedContracts: 0,
                    totalInsiderTradingAmount: 0,
                });
            }
        };

        fetchData();
    }, [userId]);

    // Draw bar chart using Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = [
            { label: 'Tổng số phòng', value: overviewData.totalRooms, color: '#3b82f6' },
            { label: 'Phòng đang thuê', value: overviewData.rentedRooms, color: '#22c55e' },
            { label: 'Phòng trống', value: overviewData.availableRooms, color: '#f97316' },
            { label: 'Phòng chờ duyệt', value: overviewData.pendingRooms, color: '#eab308' },
            { label: 'Phòng bị khóa', value: overviewData.lockedRooms, color: '#ef4444' },
        ];

        // Calculate dimensions
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const chartHeight = height - padding * 2;
        const chartWidth = width - padding * 2;
        const barWidth = chartWidth / data.length / 2;
        const maxValue = Math.max(...data.map(d => d.value), 10); // Ensure non-zero max

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw axes
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Draw Y-axis labels
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= 5; i++) {
            const yValue = (maxValue / 5) * i;
            const yPos = height - padding - (chartHeight * i) / 5;
            ctx.fillText(Math.round(yValue), padding - 10, yPos);
        }

        // Draw bars and X-axis labels
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = padding + index * (barWidth * 2) + barWidth / 2;
            const y = height - padding - barHeight;

            // Draw bar
            ctx.fillStyle = item.color;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw label
            ctx.fillStyle = '#000';
            ctx.fillText(item.label, x + barWidth / 2, height - padding + 10);
        });

        // Draw title
        ctx.textAlign = 'center';
        ctx.font = '16px Arial';
        ctx.fillText('', width / 2, padding / 2);
    }, [overviewData]);

    const postLink = role === 'Landlord' ? '/Room/Create' : role === 'Service' ? '/ServiceOwner/ServicePosts/Create' : '#';

    const displayedNotifications = notificationFilter === 'all' ? notifications : unreadNotifications;

    const displayedPriorityRooms = priorityFilter === 'all'
        ? priorityRooms
        : priorityRooms.filter(room => {
            const endDate = parseCreatedDate(room.rawEndDate);
            return endDate && endDate < new Date();
        });

    return (
        <Layout showFooter={false} showNavbar={false} showSidebar={true}>
            <div className="container mx-auto max-w-6xl p-6 bg-white dark:bg-gray-800 dark:text-white">
                <div className="flex justify-between items-center mb-4 border-b-2 border-gray-300 pb-2">
                    <h1 className="text-4xl font-semibold mb-5">Tổng quan</h1>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Tổng quan Landlord</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-white flex items-center space-x-4">
                            <FaMoneyBillWave className="text-3xl text-green-600" />
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Tổng doanh thu</p>
                                <p className="text-2xl font-bold">
                                    {typeof overviewData.totalInsiderTradingAmount === 'number'
                                        ? overviewData.totalInsiderTradingAmount.toLocaleString('vi-VN')
                                        : '0'} đ
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-white flex items-center space-x-4">
                            <FaBuilding className="text-3xl text-blue-500" />
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Tổng số phòng</p>
                                <p className="text-2xl font-bold">{overviewData.totalRooms}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-white flex items-center space-x-4">
                            <FaDoorOpen className="text-3xl text-green-500" />
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Phòng đang thuê</p>
                                <p className="text-2xl font-bold">{overviewData.rentedRooms}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-white flex items-center space-x-4">
                            <FaDoorClosed className="text-3xl text-orange-500" />
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Phòng trống</p>
                                <p className="text-2xl font-bold">{overviewData.availableRooms}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-white flex items-center space-x-4">
                            <FaHourglassHalf className="text-3xl text-yellow-500" />
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Phòng chờ giao dịch</p>
                                <p className="text-2xl font-bold">{overviewData.pendingRooms}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-white flex items-center space-x-4">
                            <FaLock className="text-3xl text-red-500" />
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Phòng bị khóa</p>
                                <p className="text-2xl font-bold">{overviewData.lockedRooms}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-white flex items-center space-x-4">
                            <FaList className="text-3xl text-purple-500" />
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Yêu cầu thuê</p>
                                <p className="text-2xl font-bold">{overviewData.totalRentalLists}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-white flex items-center space-x-4">
                            <FaFileContract className="text-3xl text-teal-500" />
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Hợp đồng hoàn thành</p>
                                <p className="text-2xl font-bold">{overviewData.completedContracts}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Thống kê phòng</h2>
                    <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                        <canvas ref={canvasRef} width="600" height="400"></canvas>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Thông báo dành riêng cho bạn</h2>
                        <div className="flex mb-4">
                            <button
                                className={`px-4 py-2 rounded-lg mr-2 ${notificationFilter === 'all' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
                                onClick={() => setNotificationFilter('all')}
                            >
                                Tất cả
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg ${notificationFilter === 'unread' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
                                onClick={() => setNotificationFilter('unread')}
                            >
                                Chưa đọc
                            </button>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                {displayedNotifications.length > 0 ? (
                                    displayedNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className="flex items-center p-3 border-b dark:border-gray-700"
                                        >
                                            <div className="w-2 h-2 rounded-full mr-3 bg-blue-500" />
                                            <div className="flex-1">
                                                <p className="text-sm">{notification.message}</p>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {notification.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">Không có thông báo gần đây</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Danh sách tin ưu tiên</h2>
                        <div className="flex mb-4">
                            <button
                                className={`px-4 py-2 rounded-lg mr-2 ${priorityFilter === 'all' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
                                onClick={() => setPriorityFilter('all')}
                            >
                                Tất cả
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg ${priorityFilter === 'expired' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
                                onClick={() => setPriorityFilter('expired')}
                            >
                                Hết hạn
                            </button>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                {displayedPriorityRooms.length > 0 ? (
                                    displayedPriorityRooms.map((room) => (
                                        <div
                                            key={room.id}
                                            className="flex items-center p-3 border-b dark:border-gray-700"
                                        >
                                            <div className={`w-2 h-2 rounded-full mr-3 ${priorityFilter === 'expired' ? 'bg-red-500' : 'bg-green-500'}`} />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold">{room.roomTitle}</p>
                                                <p className="text-sm">Người dùng: {room.userName}</p>
                                                <p className="text-sm">Gói ưu tiên: {room.categoryValue}</p>
                                                <p className="text-sm">Giá: {room.price} đ</p>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Bắt đầu: {room.startDate} | Kết thúc: {room.endDate}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">Không có tin ưu tiên</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    );
};

export default Overview;