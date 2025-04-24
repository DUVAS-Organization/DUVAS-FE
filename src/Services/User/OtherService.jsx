import axios from 'axios';

const API_URL = 'https://apiduvas1.runasp.net/api';
const HUB_BASE_URL = 'https://apiduvas1.runasp.net';
const WS_URL = "wss://localhost:8000/ws/savedPosts";

const OtherService = {
    checkImageAzure: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${API_URL}/CheckImageAzure/check-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                }
            );

            const result = response.data;
            const isSafe = result === "Ảnh an toàn.";
            return {
                isSafe: isSafe,
                message: isSafe ? "Ảnh an toàn." : result || "Ảnh không hợp lệ."
            };
        } catch (error) {
            console.error(`Lỗi kiểm tra ảnh ${file.name}:`, error);
            return { isSafe: false, message: "Lỗi khi kiểm tra ảnh." };
        }
    },
    //JWT
    login: async (username, password) => {
        const payload = {
            username: username.trim(),
            password: password.trim(),
        };
        return axios.post(`${API_URL}/Auth/login`, payload).then((res) => res.data);
    },
    //Login Google
    googleLogin: () => {
        window.location.href = `${API_URL}/Auth/google`;
    },

    exchangeGoogleToken: async (code) => {
        return axios.get(`${API_URL}/Auth/token-exchange?code=${code}`).then((res) => res.data);
    },
    //Save Post
    getSavedPosts: async (userId) => {
        return axios.get(`${API_URL}/SavedPosts/${userId}`).then((res) => res.data);
    },
    // hàm xử lý servicePostId
    toggleSaveServicePost: async (userId, servicePostId) => {
        const payload = { userId, servicePostId: parseInt(servicePostId) };
        return axios.post(`${API_URL}/SavedPosts/`, payload).then((res) => res.data);
    },
    toggleSavePost: async (userId, roomId) => {
        const payload = {
            userId: userId,
            roomId: parseInt(roomId),
        };
        return axios.post(`${API_URL}/SavedPosts/`, payload).then((res) => res.data);
    },
    toggleSavePostService: async (userId, servicePostId) => {
        const payload = {
            userId: userId,
            roomId: parseInt(servicePostId),
        };
        return axios.post(`${API_URL}/SavedPosts/`, payload).then((res) => res.data);
    },
    // Hàm gửi OTP
    sendOtp: async (emailOrPhone) => {
        return axios.get(`${API_URL}/Auth/forgot-password?emailOrPhone=${emailOrPhone}`).then((res) => res.data);
    },

    // Hàm đặt lại mật khẩu
    resetPassword: async (otp, password, rePassword, email) => {
        const payload = {
            otp,
            password,
            rePassword,
            email,
        };
        return axios.post(`${API_URL}/Auth/reset-password`, payload).then((res) => res.data);
    },

    // Hàm gửi OTP
    sendOtpVerify: async (emailOrPhone) => {
        const payload = { emailOrPhone };
        return axios.post(`${API_URL}/Auth/verify`, payload).then((res) => res.data);
    },
    // Hàm đăng ký
    register: async (otp, userName, name, password, rePassword, address, sex, email) => {
        const payload = {
            otp,
            userName,
            name,
            password,
            rePassword,
            address,
            sex,
            email,
        };
        return axios.post(`${API_URL}/Auth/register`, payload).then((res) => res.data);
    },
    toggleSavePostRemove: async (userId, roomId, servicePostId) => {
        const payload = { userId };
        if (roomId) payload.roomId = roomId;
        if (servicePostId) payload.servicePostId = servicePostId;
        return axios.post(`${API_URL}/SavedPosts`, payload).then((res) => res.data);
    },
    // Hàm lấy tin nhắn giữa hai người dùng
    getMessages: async (userId, adminUserId) => {
        return axios.get(`${API_URL}/Message/user/${userId}/${adminUserId}`).then((res) => res.data);
    },
    // Hàm gửi tin nhắn
    sendMessage: async (message) => {
        return axios.post(`${API_URL}/Message`, message).then((res) => res.data);
    },
    uploadImage: async (file) => {
        return axios.post(`${API_URL}/Upload/upload-image`, file).then((res) => res.data);
    },
    //Thuê phòng
    rentRoom: async (rentPayload, token) => {
        return axios.post(`${API_URL}/RoomManagement/rent-room`, rentPayload, {
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => res.data);
    },
    // Gửi email thông báo
    sendMail: async (sendMailPayload, token) => {
        return axios.post(`${API_URL}/RoomManagement/send-mail`, sendMailPayload, {
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => res.data);
    },
    //Lấy danh sách hội thoại
    getConversations: async (userId) => {
        return axios.get(`${API_URL}/Message/conversations/${userId}`).then((res) => res.data);
    },
    // Xóa bài đăng đã lưu
    removeSavedPost: async (payload) => {
        return axios.delete(`${API_URL}/SavedPosts`, {
            headers: { "Content-Type": "application/json" },
            data: payload, // Gửi payload trong body của DELETE request
        }).then((res) => res.data);
    },
    //Yêu cầu dịch vụ
    rentService: async (requestPayload) => {
        return axios.post(`${API_URL}/ServiceManagement/rent-service`, requestPayload, {
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.data);
    },
    // Hàm AICCCD:kiểm tra ảnh CCCD
    AICCCD: async (file) => {
        const formData = new FormData();
        formData.append('File', file); // Tên 'File' phải khớp với tên trường trong DTO của backend

        try {
            const response = await axios.post(`${API_URL}/fptai/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Đảm bảo gửi dữ liệu file đúng định dạng
                },
            });
            return response.data; // Trả về dữ liệu kết quả từ backend
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error; // Nếu có lỗi xảy ra trong quá trình upload, throw lỗi để xử lý ở component
        }
    },
    // Lấy toàn bộ báo cáo
    getAllReports: async (token) => {
        try {
            const response = await axios.get(`${API_URL}/Report`, {
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data; // Trả về danh sách báo cáo
        } catch (error) {
            console.error('Error fetching reports:', error);
            throw error; // Throw lỗi để xử lý ở component gọi hàm này
        }
    },
    // Kết nối WebSocket
    connectWebSocket(userId, { onMessage, onOpen, onClose, onError }) {
        const ws = new WebSocket(`${WS_URL}?userId=${userId}`);

        ws.onopen = () => {
            console.log("WebSocket connected for SavedPostList");
            if (onOpen) onOpen();
        };

        ws.onmessage = (event) => {
            console.log("WebSocket message received for SavedPostList:", event.data);
            if (onMessage) onMessage(event);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected for SavedPostList");
            if (onClose) onClose();
        };

        ws.onerror = (error) => {
            console.error("WebSocket error for SavedPostList:", error);
            if (onError) onError(error);
        };

        return ws; // Trả về đối tượng WebSocket để đóng kết nối khi cần
    },
    savedPostHub: `${HUB_BASE_URL}/savedPostHub`,
    chatHub: `${HUB_BASE_URL}/chathub`,

};

export default OtherService;