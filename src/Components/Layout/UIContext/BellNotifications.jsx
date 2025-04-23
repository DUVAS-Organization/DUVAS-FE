import React, { useState, useEffect, useRef } from "react";
import { FaRegBell } from "react-icons/fa";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { MdClose } from "react-icons/md";
import { useUI } from "./UIContext";
import useOutsideClick from "./useOutsideClick";
import NotificationService from "../../../Services/User/NotificationService";
import UserService from "../../../Services/User/UserService";
import { useAuth } from "../../../Context/AuthProvider";
import { parse, format, differenceInSeconds, differenceInMinutes, differenceInHours } from "date-fns";

const BellNotifications = () => {
    const { openDropdown, toggleDropdown } = useUI();
    const isOpen = openDropdown === "notifications";
    const { user } = useAuth();
    const userId = user?.userId ? parseInt(user.userId) : null;
    const userRole = user?.role || "User";

    const [notifications, setNotifications] = useState([]);
    const [filterUnread, setFilterUnread] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const wsRef = useRef(null); // Ref cho WebSocket
    const userCache = useRef({}); // Cache cho username

    const bellRef = useRef(null);
    const dropdownRef = useOutsideClick(() => {
        if (isOpen) toggleDropdown(null);
    }, bellRef);

    // Log trạng thái ban đầu
    console.log("BellNotifications rendered", { isOpen, userId, userRole, user });

    // Hàm định dạng thời gian giống Facebook
    const formatRelativeTime = (dateString) => {
        try {
            const parsedDate = parse(dateString, "HH:mm - dd/MM/yyyy", new Date());
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

    // Hàm xử lý thông báo mới (từ API hoặc WebSocket)
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
            createdDate: formatRelativeTime(item.createdDate),
            redirectUrl,
        };
    };

    // Hàm lấy thông báo từ API
    const fetchNotifications = async () => {
        if (!userId) {
            console.log("No userId available, skipping API call");
            setError("Vui lòng đăng nhập để xem thông báo");
            return;
        }

        // setLoading(true);
        try {
            console.log(`Fetching notifications for userId: ${userId}, unread only: ${filterUnread}`);
            const data = filterUnread
                ? await NotificationService.getNotificationUnreadByUser(userId)
                : await NotificationService.getNotificationsByUser(userId);

            console.log("API response:", data);

            const mappedData = await Promise.all(data.map(processNotification));
            setNotifications(mappedData);
            setError(null);
        } catch (err) {
            console.error("Error fetching notifications:", err.response || err);
            setError(err.message || "Lỗi khi tải thông báo");
        } finally {
            setLoading(false);
        }
    };

    // Thiết lập WebSocket
    useEffect(() => {
        if (!userId) return;

        // Kết nối WebSocket qua NotificationService
        wsRef.current = NotificationService.connectWebSocket(userId, {
            onOpen: () => {
                console.log("WebSocket connected");
            },
            onMessage: async (event) => {
                try {
                    const newNotification = JSON.parse(event.data);
                    console.log("New notification received:", newNotification);

                    const processedNotification = await processNotification(newNotification);
                    setNotifications((prev) => [processedNotification, ...prev]);
                } catch (err) {
                    console.error("Error processing WebSocket message:", err);
                }
            },
            onClose: () => {
                console.log("WebSocket disconnected");
            },
            onError: (error) => {
                console.error("WebSocket error:", error);
                // Fallback sang polling nếu WebSocket thất bại
                const pollingInterval = setInterval(() => {
                    fetchNotifications();
                }, 10000); // Gọi mỗi 10 giây

                return () => clearInterval(pollingInterval);
            },
        });

        return () => {
            wsRef.current?.close();
        };
    }, [userId]);

    // Gọi API ban đầu khi mở dropdown hoặc thay đổi filterUnread
    useEffect(() => {
        console.log("useEffect triggered", { isOpen, userId });
        if (isOpen && userId) {
            fetchNotifications();
        }
    }, [isOpen, filterUnread, userId]);

    // Lọc thông báo dựa trên filterUnread
    const filteredNotifications = filterUnread
        ? notifications.filter((n) => n.unread)
        : notifications;

    // Đánh dấu tất cả thông báo là đã đọc
    const markAllAsRead = async () => {
        try {
            console.log("Marking all notifications as read");
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

    // Xóa thông báo
    const removeNotification = async (id) => {
        try {
            console.log(`Deleting notification with id: ${id}`);
            await NotificationService.deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error("Error deleting notification:", err.response || err);
            setError(err.message || "Lỗi khi xóa thông báo");
        }
    };

    // Xóa tất cả thông báo
    const clearAllNotifications = async () => {
        try {
            console.log("Clearing all notifications");
            await Promise.all(notifications.map((n) => NotificationService.deleteNotification(n.id)));
            setNotifications([]);
        } catch (err) {
            console.error("Error clearing notifications:", err.response || err);
            setError(err.message || "Lỗi khi xóa tất cả thông báo");
        }
    };

    // Xử lý nhấp vào thông báo
    const handleNotificationClick = (notification) => {
        if (notification.redirectUrl) {
            console.log(`Redirecting to: ${notification.redirectUrl}`);
            window.location.href = notification.redirectUrl;
        }
    };

    return (
        <div className="relative">
            {/* Nút chuông thông báo */}
            <button
                ref={bellRef}
                onClick={() => {
                    console.log("Bell button clicked, toggling dropdown");
                    toggleDropdown(isOpen ? null : "notifications");
                }}
                className="relative p-2 focus:outline-none"
            >
                <FaRegBell className="text-2xl text-black dark:text-white" />
                {notifications.some((n) => n.unread) && (
                    <span className="absolute -top-0 -right-0 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {notifications.filter((n) => n.unread).length}
                    </span>
                )}
            </button>

            {/* Dropdown thông báo */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[90vw] max-w-[24rem] max-h-[70vh] md:w-96 md:max-h-96
                     bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700
                     flex flex-col z-50"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Thông báo</h3>
                        <button
                            onClick={() => toggleDropdown(null)}
                            className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                        >
                            <MdClose className="text-2xl" />
                        </button>
                    </div>

                    {/* Bộ lọc chưa đọc */}
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
                              peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px]
                              after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all after:duration-500">
                            </div>
                        </label>
                    </div>

                    {/* Danh sách thông báo */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                {/* <p className="text-gray-500 dark:text-gray-400">Đang tải...</p> */}
                            </div>
                        ) : error ? (
                            <div className="flex justify-center py-4">
                                <p className="text-red-500 dark:text-red-400">{error}</p>
                            </div>
                        ) : filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-center gap-3 p-3 ${notification.unread ? "bg-red-50 dark:bg-red-900/50" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                        } rounded-md relative group ${notification.redirectUrl ? "cursor-pointer" : ""}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800 dark:text-white">{notification.message}</p>
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

                    {/* Thanh hành động */}
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

export default BellNotifications;