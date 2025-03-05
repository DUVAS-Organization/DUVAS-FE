import React, { useState, useRef } from "react";
import { FaRegBell } from "react-icons/fa";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { MdClose } from "react-icons/md";
import { useUI } from "./UIContext";
import useOutsideClick from "./useOutsideClick";

const notificationsData = [
    { id: 1, message: "Bạn có một tin nhắn mới từ chủ nhà.", type: "Tin đăng", unread: true },
    { id: 2, message: "Khuyến mãi 10% khi đặt phòng hôm nay!", type: "Khuyến mãi", unread: true },
    { id: 3, message: "Thanh toán của bạn đã được xác nhận.", type: "Tài chính", unread: false }
];

const BellNotifications = () => {
    const { openDropdown, toggleDropdown } = useUI();
    const isOpen = openDropdown === "notifications";

    const [notifications, setNotifications] = useState(notificationsData);
    const [filterUnread, setFilterUnread] = useState(false);

    const bellRef = useRef(null); // Tham chiếu đến nút chuông
    const dropdownRef = useOutsideClick(() => {
        if (isOpen) toggleDropdown(null);
    }, bellRef);

    const filteredNotifications = filterUnread
        ? notifications.filter((n) => n.unread)
        : notifications;

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <div className="relative">
            {/* Nút chuông thông báo */}
            <button
                ref={bellRef}
                onClick={() => toggleDropdown(isOpen ? null : "notifications")}
                className="relative p-2"
            >
                <FaRegBell className="text-2xl text-black" />
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
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-96 max-h-80
                     bg-white shadow-lg rounded-md border border-gray-200 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Thông báo</h3>
                        <button onClick={() => toggleDropdown(null)} className="text-gray-500 hover:text-gray-700">
                            <MdClose className="text-2xl" />
                        </button>
                    </div>

                    {/* Bộ lọc chưa đọc */}
                    <div className="px-4 py-2 flex items-center justify-between border-b">
                        <span className="text-base font-medium">Xem tin chưa đọc</span>
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
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-center gap-3 p-3 ${notification.unread ? "bg-red-50" : "hover:bg-gray-100"} rounded-md relative group`}
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                                        <p className="text-xs text-gray-500">{notification.type}</p>
                                    </div>
                                    <button
                                        onClick={() => removeNotification(notification.id)}
                                        className="absolute right-2 p-1 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MdClose className="text-lg" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-2">
                                <HiOutlineBellAlert className="text-9xl p-2 bg-gray-200 rounded-full" />
                                <p className="mb-2 text-sm ">Hiện tại bạn không có thông báo nào</p>
                            </div>
                        )}
                    </div>

                    {/* Thanh hành động */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t flex justify-between">
                            <button
                                onClick={markAllAsRead}
                                className="text-gray-500 text-sm font-medium hover:underline"
                            >
                                Đánh dấu tất cả là đã đọc
                            </button>
                            <button
                                onClick={() => setNotifications([])}
                                className="text-red-500 text-sm font-medium hover:underline"
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
