import React, { useState, useEffect } from 'react';
import Layout from '../../../Components/Layout/Layout';
import { FaRegNewspaper } from "react-icons/fa";
import { Link } from 'react-router-dom';
import Footer from '../../../Components/Layout/Footer';
import RoomServices from '../../../Services/Admin/RoomServices';
import UserService from '../../../Services/User/UserService';
import PriorityRoomService from '../../../Services/Admin/PriorityRoomService';
import NotificationService from '../../../Services/User/NotificationService';
import CPPRoomsService from '../../../Services/Admin/CPPRoomsService';
import { useAuth } from '../../../Context/AuthProvider';

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

const formatAmount = (amount) => {
    if (!amount) return '0';
    const amountStr = amount.toString();
    if (amountStr.includes(',')) {
        const [integerPart, decimalPart] = amountStr.split(',');
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
    }
    return amountStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                console.error('No userId found');
                return;
            }

            try {
                // Lấy thông tin người dùng và số dư
                const userData = await UserService.getUserById(userId);
                if (userData) {
                    setMoney({
                        main: userData.money || 0,
                        promotion: 0,
                    });
                    setRole(
                        userData.roleLandlord === 1 || userData.isLandlord
                            ? 'Landlord'
                            : userData.roleService === 1 || userData.isService
                                ? 'Service'
                                : null
                    );
                } else {
                    console.error('User data not found');
                    setMoney({ main: 0, promotion: 0 });
                    setRole(null);
                }

                // Lấy số tin đăng
                const rooms = await RoomServices.getRooms();
                if (Array.isArray(rooms)) {
                    const userRooms = rooms.filter(room => Number(room.userId) === userId);
                    setRoomCount(rooms.length);
                } else {
                    console.error('Invalid rooms data format:', rooms);
                    setRoomCount(0);
                }

                // Lấy số tin ưu tiên và chi tiết tin ưu tiên
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

                // Lấy chi tiết cho từng tin ưu tiên
                const token = localStorage.getItem('authToken');
                if (!token) {
                    console.error('No auth token found');
                    setPriorityRooms([]);
                    setNotifications([]);
                    setUnreadNotifications([]);
                    return;
                }

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
                            price: formatAmount(room.price),
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
                            price: formatAmount(room.price || 0),
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

                // Lấy thông báo tất cả
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

                // Lấy thông báo chưa đọc
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
            }
        };

        fetchData();
    }, [userId]);

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
                    <h2 className="text-xl font-semibold mb-2">Tổng quan tài khoản</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-white h-36 w-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center mb-2 font-semibold">
                                    <FaRegNewspaper className="text-2xl mr-2" />
                                    <span className="font-semibold text-xl">Tin đăng</span>
                                </div>
                                <p className="text-2xl font-bold">{roomCount} tin</p>
                                <p className="text-gray-500">Đang hiển thị ({priorityRoomCount} tin ưu tiên)</p>
                            </div>
                            <div className="flex">
                                <Link
                                    to={postLink}
                                    className={`text-red-600 font-medium underline underline-offset-2 ${!role ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    Đăng tin
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-white h-36 w-full flex flex-col justify-between">
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Số dư tài khoản</h2>
                                <div className="flex justify-between mb-2">
                                    <span>TK Chính</span>
                                    <span className="text-red-500 font-semibold">{formatAmount(money.main.toString())} đ</span>
                                </div>
                            </div>
                            <div className="flex">
                                <Link
                                    to="/Moneys"
                                    className="text-red-600 font-medium underline underline-offset-2"
                                >
                                    Nạp tiền
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 dark:text-white h-36 w-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center mb-2 font-semibold">
                                    <FaRegNewspaper className="text-2xl mr-2" />
                                    <span className="font-semibold text-xl">Tin ưu tiên</span>
                                </div>
                                <p className="text-2xl font-bold">{priorityRoomCount} tin</p>
                                <p className="text-gray-500">Đang được ưu tiên hiển thị</p>
                            </div>
                            <div className="flex"></div>
                        </div>
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