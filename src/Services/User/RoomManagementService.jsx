import axios from 'axios';

const API_URL = 'https://localhost:8000/api/RoomManagement';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const handleError = (error) => {
    if (error.response) {
        const { status, data } = error.response;
        const errorMessage = typeof data === 'string' ? data : (data.message || JSON.stringify(data) || 'Unknown error');
        console.error(`Server Error [${status}]:`, data);
        switch (status) {
            case 400:
                throw new Error(errorMessage || 'Invalid request data.');
            case 401:
                localStorage.removeItem('authToken');
                throw new Error('Unauthorized: Please log in again.');
            case 403:
                throw new Error('Forbidden: You do not have permission.');
            case 404:
                throw new Error(errorMessage || 'Resource not found.');
            case 500:
                throw new Error('Server error occurred. Please try again later.');
            default:
                throw new Error('An unexpected error occurred.');
        }
    } else if (error.request) {
        console.error('No response from server:', error.request);
        throw new Error('Không thể kết nối tới máy chủ.');
    } else {
        console.error('Error:', error.message);
        throw error;
    }
};

const RoomService = {
    // Lấy danh sách phòng trống (status = 1)
    getAvailableRooms: async () => {
        try {
            const response = await api.get('/rooms');
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    rentRoom: async (rentalRequest) => {
        try {
            const response = await api.post('/rent-room', rentalRequest);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    trackRoomStatus: async (roomId) => {
        try {
            const response = await api.get(`/track-room/${roomId}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    sendMail: async (sendMailDTO) => {
        try {
            const response = await api.post('/send-mail', sendMailDTO);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    cancelRoom: async (rentalId) => {
        try {
            const response = await api.put(`/cancel-room/${rentalId}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    getRentalStatus: async (roomId) => {
        try {
            const response = await api.get(`/rental-status/${roomId}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    getRoomReviews: async (roomId) => {
        try {
            const response = await api.get(`/room-reviews/${roomId}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },
    getRoomById: (roomId) =>
        axios.get(`${API_URL}/${roomId}`).then((res) => res.data),
};

export default RoomService;