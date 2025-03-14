import axios from 'axios';

const API_URL = 'https://localhost:8000/api/landlord/RoomManagementLandlord';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor để tự động thêm token nếu có
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Giả định token được lưu trong localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const RoomLandlordService = {
    // Lấy danh sách phòng của landlord
    getRooms: async (searchTerm = '') => {
        try {
            const response = await api.get(searchTerm ? `?searchTerm=${searchTerm}` : '');
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Lấy danh sách phòng theo trạng thái
    getRoomsByStatus: async (status) => {
        try {
            const response = await api.get('rooms', { params: { status } });
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Lấy thông tin phòng theo ID
    getRoomById: async (roomId) => {
        try {
            const response = await api.get(`/${roomId}`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Thêm phòng mới
    addRoom: async (room) => {
        try {
            const response = await api.post('', room);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Cập nhật phòng
    updateRoom: async (roomId, room) => {
        try {
            const response = await api.put(`/${roomId}`, room);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Xóa phòng
    deleteRoom: async (roomId) => {
        try {
            const response = await api.delete(`/${roomId}`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Lấy đánh giá của phòng
    getRoomReviews: async (roomId) => {
        try {
            const response = await api.get(`/${roomId}/Reviews`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Cập nhật trạng thái phòng
    manageRoomStatus: async (roomId, status) => {
        try {
            const response = await api.patch(`/${roomId}/Status`, null, { params: { roomId, status } });
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },
};

// Hàm xử lý lỗi
const handleError = (error) => {
    if (error.response) {
        // Lỗi từ server
        console.error('Server Error:', error.response.data);
        switch (error.response.status) {
            case 401:
                console.error('Unauthorized: Vui lòng đăng nhập lại.');
                break;
            case 404:
                console.error('Not Found:', error.response.data);
                break;
            case 400:
                console.error('Bad Request:', error.response.data);
                break;
            default:
                console.error('Error:', error.response.data);
        }
    } else if (error.request) {
        // Lỗi không nhận được response
        console.error('No response from server:', error.request);
    } else {
        // Lỗi trong quá trình thiết lập request
        console.error('Error:', error.message);
    }
};

export default RoomLandlordService;