import axios from 'axios';

const API_URL = 'https://localhost:8000/api/landlord/ReportLandlord';

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

const ReportLandlordService = {
    getLandlordReports: async () => {
        try {
            const response = await api.get('/my-room-reports');
            console.log('API Response:', response.data); // Log response để debug
            return response.data.reports || []; // Trả về mảng reports hoặc mảng rỗng nếu không có
        } catch (error) {
            handleError(error);
        }
    },
};

export default ReportLandlordService;