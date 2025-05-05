import axios from 'axios';

const API_URL = 'https://apiduvas1.runasp.net/api/AdminManageRoom';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No auth token found. Please log in.');
        }
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

const handleError = (error) => {
    if (error.response) {
        const { status, data } = error.response;
        const errorMessage = data.message || data.error || data || 'Unknown error';
        console.error(`Server Error [${status}]:`, data);
        if (data.errors) {
            console.error('Validation Errors:', data.errors);
            throw new Error(JSON.stringify({ message: errorMessage, validationErrors: data.errors }));
        }
        switch (status) {
            case 400:
                throw new Error(errorMessage || 'Dữ liệu không hợp lệ.');
            case 401:
                localStorage.removeItem('authToken');
                throw new Error('Không được phép: Vui lòng đăng nhập lại.');
            case 403:
                throw new Error('Bị cấm: Bạn không có quyền truy cập.');
            case 404:
                throw new Error(errorMessage || 'Không tìm thấy tài nguyên.');
            case 409:
                throw new Error(errorMessage || 'Không tìm thấy tài nguyên.');
            case 500:
                throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
            default:
                throw new Error('Đã xảy ra lỗi không xác định.');
        }
    } else if (error.request) {
        console.error('Không nhận được phản hồi từ máy chủ:', error.request);
        throw new Error('Không thể kết nối đến máy chủ.');
    } else {
        console.error('Lỗi:', error.message);
        throw error;
    }
};

const AdminManageRoomService = {
    getAuthorizedRooms: async () => {
        try {
            const response = await api.get('/authorized-rooms');
            return response.data; // [{ RoomId, Title, Image, ... }, …]
        } catch (error) {
            handleError(error);
        }
    },
    confirmReservation: async (roomId, rentalId, data, token) => {
        try {
            const response = await api.post(`/rentals/${rentalId}/confirm`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.message || 'Booking confirmed';
        } catch (error) {
            handleError(error);
        }
    },

    cancelReservation: async (rentalId, token) => {
        try {
            const response = await api.post(`/rentals/${rentalId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.message || 'Reservation cancelled';
        } catch (error) {
            handleError(error);
        }
    },
    getRooms: async () => {
        try {
            const response = await api.get('');
            return response.data; // { Message, Rooms }
        } catch (error) {
            handleError(error);
        }
    },

    getRoomsByStatus: async (status) => {
        try {
            const response = await api.get('/rooms', { params: { status } });
            return response.data; // { message, rooms }
        } catch (error) {
            handleError(error);
        }
    },

    getRoom: async (roomId) => {
        try {
            const response = await api.get(`/${roomId}`);
            return response.data; // Room object
        } catch (error) {
            handleError(error);
        }
    },

    addRoom: async (roomData) => {
        try {
            const response = await api.post('', roomData);
            return response.data; // { message, room }
        } catch (error) {
            handleError(error);
        }
    },

    updateRoom: async (roomId, roomData) => {
        try {
            const response = await api.put(`/${roomId}`, roomData);
            return response.data; // Success message
        } catch (error) {
            handleError(error);
        }
    },

    lockRoom: async (roomId) => {
        try {
            const response = await api.patch(`/${roomId}/lock`);
            return response.data; // { message }
        } catch (error) {
            handleError(error);
        }
    },

    unlockRoom: async (roomId) => {
        try {
            const response = await api.patch(`/${roomId}/unlock`);
            return response.data; // { message }
        } catch (error) {
            handleError(error);
        }
    },

    isRoomLocked: async (roomId) => {
        try {
            const response = await api.get(`/${roomId}/is-locked`);
            return response.data; // { RoomId, IsLocked, Message }
        } catch (error) {
            handleError(error);
        }
    },

    getLockedRooms: async () => {
        try {
            const response = await api.get('/locked-rooms');
            return response.data; // { message, rooms }
        } catch (error) {
            handleError(error);
        }
    },

    getRoomReviews: async (roomId) => {
        try {
            const response = await api.get(`/${roomId}/Reviews`);
            return response.data; // List of reviews
        } catch (error) {
            handleError(error);
        }
    },

    manageRoomStatus: async (roomId, status) => {
        try {
            const response = await api.patch(`/${roomId}/Status`, null, { params: { roomId, status } });
            return response.data; // { Message }
        } catch (error) {
            handleError(error);
        }
    },

    generateRoomDescription: async (roomData) => {
        try {
            const response = await api.post('/generate-description', roomData);
            return response.data; // { title, description }
        } catch (error) {
            handleError(error);
        }
    },
};

export default AdminManageRoomService;