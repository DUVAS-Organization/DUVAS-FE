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
        switch (status) {
            case 400:
                throw new Error(errorMessage || 'Invalid data provided.');
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
        throw new Error('Unable to connect to the server.');
    } else {
        console.error('Error:', error.message);
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
};

export default RoomLandlordService;