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
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const handleError = (error) => {
    if (error.response) {
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
        throw error.response.data; // Ném lỗi để RoomList xử lý
    } else if (error.request) {
        console.error('No response from server:', error.request);
        throw new Error('No response from server');
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
            const response = await api.get('rooms', { params: { status } });
            return response.data; // { message, rooms }
        } catch (error) {
            handleError(error);
        }
    },

    // Các phương thức khác giữ nguyên...
};

export default RoomLandlordService;