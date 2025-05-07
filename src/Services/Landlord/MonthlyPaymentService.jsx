import axios from 'axios';

// Base URL cho API, có thể cấu hình trong biến môi trường hoặc file config
const API_BASE_URL = 'https://apiduvas1.runasp.net/api/MonthlyPayment';

// Hàm lấy token từ localStorage
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Cấu hình axios instance với header Authorization
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để thêm token vào mỗi request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const MonthlyPaymentService = {
    // 1a. Lấy danh sách phòng đang được thuê của Landlord
    async getRentedRoomsForLandlord() {
        try {
            const response = await axiosInstance.get('/landlord/rented-rooms');
            return response.data; // Trả về danh sách phòng
        } catch (error) {
            console.error('Error fetching rented rooms for landlord:', error);
            throw error.response?.data || { message: 'Lỗi khi lấy danh sách phòng của Landlord' };
        }
    },

    // 1b. Lấy danh sách phòng đang thuê của Renter
    async getRentedRoomsForRenter() {
        try {
            const response = await axiosInstance.get('/renter/rented-rooms');
            return response.data; // Trả về danh sách phòng
        } catch (error) {
            console.error('Error fetching rented rooms for renter:', error);
            throw error.response?.data || { message: 'Lỗi khi lấy danh sách phòng của Renter' };
        }
    },

    // 2. Lấy chi tiết thông tin của một phòng
    async getRoomDetails(roomId) {
        try {
            const response = await axiosInstance.get(`/room-details/${roomId}`);
            return response.data; // Trả về thông tin chi tiết phòng
        } catch (error) {
            console.error(`Error fetching room details for roomId ${roomId}:`, error);
            throw error.response?.data || { message: 'Lỗi khi lấy chi tiết phòng' };
        }
    },

    // 3. Tạo yêu cầu thanh toán tiền phòng hàng tháng
    async requestMonthlyPayment(roomId, paymentData) {
        try {
            const response = await axiosInstance.post(`/request-payment/${roomId}`, paymentData);
            console.log(response);
            return response.data; // Trả về thông báo thành công
        } catch (error) {
            console.error(`Error requesting monthly payment for roomId ${roomId}:`, error);
            throw error.response?.data || { message: 'Lỗi khi tạo yêu cầu thanh toán' };
        }
    },

    // 4. Lấy danh sách InsiderTrading của người dùng hiện tại
    async getMyInsiderTradings() {
        try {
            const response = await axiosInstance.get('/my-insider-tradings');
            return response.data; // Trả về danh sách giao dịch
        } catch (error) {
            console.error('Error fetching my insider tradings:', error);
            throw error.response?.data || { message: 'Lỗi khi lấy danh sách giao dịch' };
        }
    },

    // 5. Cập nhật trạng thái của một InsiderTrading
    async updateInsiderTradingStatus(insiderTradingId, status) {
        try {
            const response = await axiosInstance.put(`/update-insider-trading-status/${insiderTradingId}`, { status });
            return response.data; // Trả về thông báo thành công
        } catch (error) {
            console.error(`Error updating insider trading status for id ${insiderTradingId}:`, error);
            throw error.response?.data || { message: 'Lỗi khi cập nhật trạng thái giao dịch' };
        }
    },

    // 6. Lấy danh sách InsiderTrading theo RoomId
    async getInsiderTradingsByRoomId(roomId) {
        try {
            const response = await axiosInstance.get(`/room-insider-tradings/${roomId}`);
            return response.data; // Trả về danh sách giao dịch
        } catch (error) {
            console.error(`Error fetching insider tradings for roomId ${roomId}:`, error);
            throw error.response?.data || { message: 'Lỗi khi lấy danh sách giao dịch theo phòng' };
        }
    },
};

export default MonthlyPaymentService;