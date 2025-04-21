import React, { useState, useEffect, useRef } from "react";
import { FaComments, FaPaperPlane, FaTimes } from "react-icons/fa";
import { useAuth } from "../Context/AuthProvider";
import { useRealtime } from "../Context/RealtimeProvider";
import UserService from "../Services/User/UserService";
import OtherService from "../Services/User/OtherService";

// Hàm hiển thị avatar
const renderAvatar = (avatar, name, size = 30) => {
    if (avatar) {
        return (
            <img
                alt={`Avatar of ${name}`}
                className="rounded-full"
                height={size}
                width={size}
                src={avatar}
            />
        );
    } else {
        const initial = name ? name.charAt(0).toUpperCase() : "A";
        return (
            <div
                className="rounded-full bg-gray-300 flex items-center justify-center"
                style={{ height: size, width: size }}
            >
                <span className="text-sm font-semibold text-gray-800">{initial}</span>
            </div>
        );
    }
};

// Hàm định dạng thời gian
const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

const AdminChatWidget = () => {
    const { user } = useAuth();
    const { connectSocket, onEvent, offEvent, emitEvent, isChatConnected } = useRealtime();

    const [isOpen, setIsOpen] = useState(false);
    const [inputMsg, setInputMsg] = useState("");
    const [messages, setMessages] = useState([]);
    const [adminUser, setAdminUser] = useState(null);
    const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [hasSentWelcomeMessage, setHasSentWelcomeMessage] = useState(false);
    const messagesEndRef = useRef(null);

    const isCurrentUserAdmin = user?.role === "Admin";
    const currentUserId = user?.userId;

    // Fetch admin info
    useEffect(() => {
        const fetchAdminInfo = async () => {
            try {
                const allUsers = await UserService.getUsers();
                // console.log("All Users from API:", allUsers);
                const foundAdmin = allUsers.find((u) => u.roleAdmin === 1);
                // console.log("Found Admin:", foundAdmin);
                if (foundAdmin) {
                    setAdminUser(foundAdmin);
                } else {
                    console.error("No admin found in the user list.");
                }
            } catch (error) {
                console.error("Error fetching admin info:", error);
            } finally {
                setIsLoadingAdmin(false);
            }
        };

        fetchAdminInfo();
    }, []);

    // Fetch initial messages from API when widget opens
    useEffect(() => {
        if (!adminUser || !user || !isOpen) return;

        const fetchMessages = async () => {
            try {
                const data = await OtherService.getMessages(user.userId, adminUser.userId);
                // console.log("Initial Messages from API:", data);

                // Chuyển đổi dữ liệu API thành định dạng phù hợp
                const formattedMessages = data.map((msg) => ({
                    userSendID: msg.userSendID,
                    userGetID: msg.userGetID,
                    content: msg.content,
                    dateTime: msg.dateTime,
                    status: msg.status,
                    sender: msg.userSendID === Number(user.userId) ? "user" : "admin",
                }));

                setMessages(formattedMessages);

                // Gửi tin nhắn chào hỏi tự động một lần nếu chưa gửi
                if (
                    formattedMessages.length > 0 &&
                    !hasSentWelcomeMessage &&
                    formattedMessages[0].sender === "user"
                ) {
                    setTimeout(() => {
                        const adminReply = {
                            userSendID: Number(adminUser.userId),
                            userGetID: Number(user.userId),
                            content: "Chào bạn, admin đây. Chúng tôi sẽ phản hồi sớm nhất.",
                            dateTime: new Date().toISOString(),
                            status: 1,
                            sender: "admin",
                        };
                        setMessages((prev) => [...prev, adminReply]);
                        setHasSentWelcomeMessage(true);
                    }, 2000);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, [isOpen, adminUser, user, hasSentWelcomeMessage]);

    // Tích hợp SignalR để nhận tin nhắn realtime
    useEffect(() => {
        if (!currentUserId || !adminUser) return;

        // Kết nối tới ChatHub
        connectSocket(currentUserId, "chat");

        // Đăng ký user với ChatHub
        if (isChatConnected) {
            emitEvent("RegisterUser", currentUserId, "chat");
        }

        // Lắng nghe sự kiện ReceiveMessage
        const handleReceiveMessage = (message) => {
            // console.log("Received new message:", message);
            // Kiểm tra xem tin nhắn có thuộc về cuộc trò chuyện với Admin không
            if (
                (message.userSendID === adminUser.userId &&
                    message.userGetID === currentUserId) ||
                (message.userSendID === currentUserId &&
                    message.userGetID === adminUser.userId)
            ) {
                // Kiểm tra xem tin nhắn đã tồn tại chưa để tránh trùng lặp
                setMessages((prev) => {
                    const exists = prev.some((msg) => msg.id === message.id);
                    if (!exists) {
                        return [
                            ...prev,
                            {
                                userSendID: message.userSendID,
                                userGetID: message.userGetID,
                                content: message.content,
                                dateTime: message.dateTime,
                                status: message.status,
                                sender:
                                    message.userSendID === Number(currentUserId)
                                        ? "user"
                                        : "admin",
                            },
                        ];
                    }
                    return prev;
                });
            }
        };

        onEvent("ReceiveMessage", handleReceiveMessage, "chat");

        return () => {
            offEvent("ReceiveMessage", handleReceiveMessage, "chat");
        };
    }, [
        currentUserId,
        adminUser,
        connectSocket,
        onEvent,
        offEvent,
        emitEvent,
        isChatConnected,
    ]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (isLoadingAdmin || !adminUser || isCurrentUserAdmin) {
        return null;
    }

    const toggleWidget = () => {
        setIsOpen((prev) => !prev);
    };

    const handleSendMessage = async () => {
        if (!inputMsg.trim() || isSending) return;
        setIsSending(true);

        const newMessage = {
            userSendID: Number(user.userId),
            userGetID: Number(adminUser.userId),
            content: inputMsg,
            dateTime: new Date().toISOString(),
            status: 1,
        };

        // Thêm tin nhắn vào state để hiển thị ngay
        setMessages((prev) => [...prev, { ...newMessage, sender: "user" }]);
        setInputMsg("");

        try {
            await OtherService.sendMessage(newMessage);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div>
            {isOpen ? (
                <div className="fixed bottom-5 right-5 w-80 h-[450px] dark:bg-gray-800 dark:text-white bg-white border border-gray-300 shadow-lg rounded-lg z-50 flex flex-col">
                    <div className="flex items-center justify-between bg-red-600 text-white p-3 rounded-t-lg">
                        <span className="font-semibold">
                            Chat với {adminUser.name}
                        </span>
                        <button
                            onClick={toggleWidget}
                            className="hover:text-gray-300"
                        >
                            <FaTimes />
                        </button>
                    </div>
                    <div className="flex-1 p-3 overflow-y-auto bg-gray-50 dark:bg-gray-800 dark:text-white">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500">
                                Chưa có tin nhắn nào.
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`mb-3 flex dark:bg-gray-800 dark:text-white ${msg.sender === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                        } items-start`}
                                >
                                    {msg.sender === "admin" && (
                                        <div className="mr-2">
                                            {renderAvatar(
                                                adminUser.profilePicture,
                                                adminUser.name,
                                                30
                                            )}
                                        </div>
                                    )}
                                    <div
                                        className={`flex flex-col ${msg.sender === "user"
                                            ? "items-end"
                                            : "items-start"
                                            }`}
                                    >
                                        <div
                                            className={`inline-block p-2 rounded-lg max-w-[250px] min-w-fit break-words whitespace-pre-wrap ${msg.sender === "user"
                                                ? "bg-red-600 text-white"
                                                : "bg-gray-200 text-gray-800 dark:bg-gray-500 dark:text-white"
                                                }`}
                                        >
                                            {msg.content}
                                            <div
                                                className={`text-xs text-gray-400 mt-1 ${msg.sender === "user"
                                                    ? "text-right text-white"
                                                    : "text-left "
                                                    }`}
                                            >
                                                {formatTime(msg.dateTime)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 border-t border-gray-300 flex items-center">
                        <input
                            type="text"
                            placeholder="Nhập tin nhắn..."
                            value={inputMsg}
                            onChange={(e) => setInputMsg(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleSendMessage()
                            }
                            className="flex-1 p-2 dark:bg-gray-800 dark:text-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isSending}
                            className="ml-2 bg-red-600 p-2 rounded-full text-white hover:bg-red-700"
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={toggleWidget}
                    className="fixed bottom-5 right-5 bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-50"
                >
                    <FaComments size={30} />
                </button>
            )}
        </div>
    );
};

export default AdminChatWidget;