import axios from 'axios';

const API_URL = 'https://localhost:8000/api/landlord/RoomManagementLandlord';

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
        // Log chi tiết lỗi validation nếu có
        if (data.errors) {
            console.error('Validation Errors:', data.errors);
            // Trả về lỗi với thông tin validation chi tiết
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

const RoomLandlordService = {
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
            // Ném lỗi lại để FE có thể xử lý chính xác message, status,...
            throw error;
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

    deleteRoom: async (roomId) => {
        try {
            const response = await api.delete(`/${roomId}`);
            return response.data || 'Room deleted successfully'; // Backend trả về NoContent
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

export default RoomLandlordService;