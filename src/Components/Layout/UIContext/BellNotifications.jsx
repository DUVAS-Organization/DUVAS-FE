import React, { useState, useEffect, useRef } from "react";
import { FaRegBell } from "react-icons/fa";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { MdClose } from "react-icons/md";
import { useUI } from "./UIContext";
import useOutsideClick from "./useOutsideClick";
import NotificationService from "../../../Services/User/NotificationService";
import UserService from "../../../Services/User/UserService";
import { useAuth } from "../../../Context/AuthProvider";
import { parse, format, differenceInSeconds, differenceInMinutes, differenceInHours, addHours } from "date-fns";
import { useNavigate } from "react-router-dom";

// Hàm format tiền thành định dạng 10.000 đ
const formatVND = (amount) => {
    if (isNaN(amount)) return "N/A";
    return amount.toLocaleString("vi-VN") + " đ";
};

const BellNotifications = () => {
    const { openDropdown, toggleDropdown } = useUI();
    const isOpen = openDropdown === "notifications";
    const { user } = useAuth();
    const userId = user?.userId ? parseInt(user.userId) : null;
    const userRole = user?.role || "User";
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [filterUnread, setFilterUnread] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const wsRef = useRef(null);
    const userCache = useRef({});

    const bellRef = useRef(null);
    const dropdownRef = useOutsideClick(() => {
        if (isOpen) toggleDropdown(null);
    }, bellRef);

    const formatRelativeTime = (dateString) => {
        try {
            // Parse the date string
            const parsedDate = parse(dateString, "HH:mm - dd/MM/yyyy", new Date());
            // Add 5 hours to the parsed date
            const adjustedDate = addHours(parsedDate, 5);
            const now = new Date();
            const secondsDiff = differenceInSeconds(now, adjustedDate);
    console.log(adjustedDate);
            if (secondsDiff < 60) {
                return "vừa xong";
            } else if (secondsDiff < 3600) {
                const minutes = differenceInMinutes(now, adjustedDate);
                return `${minutes} phút trước`;
            } else if (secondsDiff < 86400) {
                const hours = differenceInHours(now, adjustedDate);
                return `${hours} giờ trước`;
            } else {
                return format(adjustedDate, "dd-MM-yyyy");
            }
        } catch (err) {
            console.error("Error parsing date:", err);
            return "N/A";
        }
    };

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
        } else if (item.type === "TransactionPaid") {
            // Trích xuất số tiền từ message (khớp với số nguyên hoặc số thập phân)
            const amountMatch = item.message.match(/(\d+[,.]?\d*)/);
            if (amountMatch) {
                const rawAmount = amountMatch[0];
                // Chuyển thành số, loại bỏ dấu chấm/phẩy và các ký tự không phải số
                let amount = parseFloat(rawAmount.replace(/[^0-9]/g, ""));
                // Nếu số tiền lớn hơn 100 lần (do lỗi backend), chia cho 100
                if (amount > 100000) {
                    amount = amount / 100;
                }
                const formattedAmount = formatVND(amount);
                message = item.message.replace(rawAmount, formattedAmount);
                // console.log(
                //     "TransactionPaid Message:", item.message,
                //     "Raw Amount:", rawAmount,
                //     "Extracted Amount:", amount,
                //     "Formatted:", formattedAmount
                // );
            } else {
                console.error("Failed to extract amount from message:", item.message);
            }
            redirectUrl = "/Transaction";
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
                onClick={() => {
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

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[90vw] max-w-[24rem] max-h-[70vh] md:w-96 md:max-h-96
                     bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700
                     flex flex-col z-50"
                >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Thông báo</h3>
                        <button
                            onClick={() => toggleDropdown(null)}
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
                              peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px]
                              after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all after:duration-500">
                            </div>
                        </label>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-4">
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

export default BellNotifications;