import axios from 'axios';

const API_URL = 'https://localhost:8000/api/ReportAdmin/';

const ReportAdminService = {
    // Reject a report by its ID
    rejectReport: async (reportId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.put(
                `${API_URL}reject/${reportId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
        } catch (error) {
            if (error.response) {
                // Server responded with a status other than 2xx
                if (error.response.status === 404) {
                    throw new Error('Báo cáo không tồn tại.');
                } else if (error.response.status === 400) {
                    throw new Error(error.response.data.message || 'Báo cáo không có RoomId liên kết hoặc không tìm thấy chủ phòng.');
                } else {
                    throw new Error(error.response.data.message || 'Đã xảy ra lỗi khi từ chối báo cáo.');
                }
            } else {
                // Network error or other issues
                throw new Error(error.message || 'Không thể kết nối đến server.');
            }
        }
    },

    // Lock a room associated with a report by its ID
    lockRoom: async (reportId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.put(
                `${API_URL}lock-room/${reportId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Đã xảy ra lỗi khi khóa phòng.');
            } else {
                throw new Error(error.message || 'Không thể kết nối đến server.');
            }
        }
    },

    // Lock an account associated with a report by its ID
    lockAccount: async (reportId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.put(
                `${API_URL}lock-account/${reportId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Đã xảy ra lỗi khi khóa tài khoản.');
            } else {
                throw new Error(error.message || 'Không thể kết nối đến server.');
            }
        }
    },
};

export default ReportAdminService;