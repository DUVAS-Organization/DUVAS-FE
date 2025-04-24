import axios from "axios";

const API_URL = "https://apiduvas1.runasp.net/api/Notification";
const WS_URL = "wss://apiduvas1.runasp.net/ws/notifications"; // Link WebSocket

const NotificationService = {
    // Lấy danh sách thông báo theo userId
    async getNotificationsByUser(userId) {
        try {
            //console.log(`Sending request to ${API_URL}/user/${userId}`);
            const response = await axios.get(`${API_URL}/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`, // Thay bằng user.token nếu dùng useAuth
                },
            });
            //console.log("getNotificationsByUser response:", response.data);
            return response.data;
        } catch (error) {
            console.error("getNotificationsByUser error:", error.response || error);
            throw new Error(error.response?.data?.message || "Lỗi khi lấy thông báo");
        }
    },

    // Lấy danh sách thông báo chưa đọc theo userId
    async getNotificationUnreadByUser(userId) {
        try {
            //console.log(`Sending request to ${API_URL}/unread/${userId}`);
            const response = await axios.get(`${API_URL}/unread/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            });
            //console.log("getNotificationUnreadByUser response:", response.data);
            return response.data;
        } catch (error) {
            console.error("getNotificationUnreadByUser error:", error.response || error);
            throw new Error(error.response?.data?.message || "Lỗi khi lấy thông báo chưa đọc");
        }
    },

    // Đánh dấu thông báo là đã đọc
    async markAsRead(notificationId) {
        try {
            //console.log(`Sending request to ${API_URL}/mark-as-read/${notificationId}`);
            await axios.put(`${API_URL}/mark-as-read/${notificationId}`, null, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            });
            //console.log(`Marked notification ${notificationId} as read`);
        } catch (error) {
            console.error("markAsRead error:", error.response || error);
            throw new Error(error.response?.data?.message || "Lỗi khi đánh dấu thông báo đã đọc");
        }
    },

    // Xóa thông báo
    async deleteNotification(notificationId) {
        try {
            //console.log(`Sending request to ${API_URL}/${notificationId}`);
            await axios.delete(`${API_URL}/${notificationId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            });
            //console.log(`Deleted notification ${notificationId}`);
        } catch (error) {
            console.error("deleteNotification error:", error.response || error);
            throw new Error(error.response?.data?.message || "Lỗi khi xóa thông báo");
        }
    },

    // Đếm số thông báo chưa đọc theo userId
    async countUnreadNotifications(userId) {
        try {
            //console.log(`Sending request to ${API_URL}/count-unread/${userId}`);
            const response = await axios.get(`${API_URL}/count-unread/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            });
            //console.log("countUnreadNotifications response:", response.data);
            return response.data;
        } catch (error) {
            console.error("countUnreadNotifications error:", error.response || error);
            throw new Error(error.response?.data?.message || "Lỗi khi đếm thông báo chưa đọc");
        }
    },

    // Các phương thức khác
    async getAllNotifications() {
        try {
            //console.log(`Sending request to ${API_URL}`);
            const response = await axios.get(`${API_URL}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            });
            //console.log("getAllNotifications response:", response.data);
            return response.data;
        } catch (error) {
            console.error("getAllNotifications error:", error.response || error);
            throw new Error(error.response?.data?.message || "Lỗi khi lấy tất cả thông báo");
        }
    },

    async getNotificationsByType(type) {
        try {
            //console.log(`Sending request to ${API_URL}/type/${type}`);
            const response = await axios.get(`${API_URL}/type/${type}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            });
            //console.log("getNotificationsByType response:", response.data);
            return response.data;
        } catch (error) {
            console.error("getNotificationsByType error:", error.response || error);
            throw new Error(error.response?.data?.message || "Lỗi khi lấy thông báo theo loại");
        }
    },
    // Kết nối WebSocket
    connectWebSocket(userId, { onMessage, onOpen, onClose, onError }) {
        const ws = new WebSocket(`${WS_URL}?userId=${userId}`);

        ws.onopen = () => {
            //console.log("WebSocket connected");
            if (onOpen) onOpen();
        };

        ws.onmessage = (event) => {
            //console.log("New notification received:", event.data);
            if (onMessage) onMessage(event);
        };

        ws.onclose = () => {
            //console.log("WebSocket disconnected");
            if (onClose) onClose();
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            if (onError) onError(error);
        };

        return ws; // Trả về đối tượng WebSocket để đóng kết nối khi cần
    },
};

export default NotificationService;