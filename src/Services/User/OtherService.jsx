import axios from 'axios';

const API_URL = 'https://localhost:8000/api';
const HUB_BASE_URL = 'https://localhost:8000';

const OtherService = {
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
    toggleSavePost: async (userId, roomId) => {
        const payload = {
            userId: userId,
            roomId: parseInt(roomId),
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
    savedPostHub: `${HUB_BASE_URL}/savedPostHub`,
    chatHub: `${HUB_BASE_URL}/chathub`,

};

export default OtherService;