import axios from 'axios';

const API_URL = 'http://apiduvas1.runasp.net/api/UserProfile';

// Lấy thông tin người dùng (không cần token)
export const getUserProfile = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi khi lấy thông tin người dùng' };
    }
};

// Chỉnh sửa hồ sơ người dùng (không cần token)
export const editProfile = async (userId, updatedUser) => {
    try {
        const response = await axios.put(`${API_URL}/edit-profile/${userId}`, updatedUser);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi khi chỉnh sửa hồ sơ' };
    }
};

// Đổi mật khẩu (cần token)
export const changePassword = async (changePasswordData) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Bạn cần đăng nhập để đổi mật khẩu.');
    }
    try {
        const response = await axios.post(`${API_URL}/changePassword`, changePasswordData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi khi đổi mật khẩu' };
    }
};

// Thêm mật khẩu (cần token)
export const addPassword = async (addPasswordData) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Bạn cần đăng nhập để thêm mật khẩu.');
    }
    try {
        const response = await axios.post(`${API_URL}/addPassword`, addPasswordData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi khi thêm mật khẩu' };
    }
};

// Lấy lịch sử thuê phòng (không cần token)
export const getRoomRentalHistory = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/${userId}/RoomRentalHistory`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi khi lấy lịch sử thuê phòng' };
    }
};

// Lấy lịch sử sử dụng dịch vụ (không cần token)
export const getServiceRentalHistory = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/${userId}/ServiceRentalHistory`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi khi lấy lịch sử sử dụng dịch vụ' };
    }
};

// Lấy ngày hết hạn sử dụng phòng (không cần token)
export const getRoomUsageExpirationDates = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/${userId}/RoomUsageExpiration`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi khi lấy ngày hết hạn sử dụng phòng' };
    }
};