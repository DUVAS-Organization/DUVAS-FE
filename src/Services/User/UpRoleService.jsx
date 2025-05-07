import axios from 'axios';

const API_BASE_URL = 'https://apiduvas1.runasp.net/api/UpdateRole';

/**
 * Service xử lý các yêu cầu liên quan đến cập nhật vai trò, giấy phép chủ nhà và dịch vụ
 */
const UpRoleService = {
    // ----- API giấy phép chủ nhà (Landlord License) -----

    /**
     * Tạo giấy phép chủ nhà mới
     * @param {Object} data - Dữ liệu giấy phép (LandlordLicenseDTO)
     * @param {string} token - Token xác thực
     * @returns {Object} Dữ liệu giấy phép đã tạo
     */
    createLandlordLicense: async (data, token) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Create-LandlordLicence`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi tạo giấy phép chủ nhà:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Lấy danh sách tất cả giấy phép chủ nhà
     * @param {string} token - Token xác thực
     * @returns {Array} Danh sách giấy phép
     */
    getLandlordLicenses: async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // console.log('📌 Lấy danh sách giấy phép chủ nhà:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy danh sách giấy phép chủ nhà:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Lấy thông tin giấy phép chủ nhà theo ID
     * @param {number} id - ID giấy phép
     * @param {string} token - Token xác thực
     * @returns {Object} Thông tin giấy phép
     */
    getLandlordLicenseById: async (landlordLicenseId, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${landlordLicenseId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy thông tin giấy phép chủ nhà:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Cập nhật thông tin giấy phép chủ nhà
     * @param {number} id - ID giấy phép
     * @param {Object} data - Dữ liệu giấy phép cần cập nhật
     * @param {string} token - Token xác thực
     */
    updateLandlordLicense: async (id, data, token) => {
        try {
            await axios.put(`${API_BASE_URL}/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật giấy phép chủ nhà:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Xóa giấy phép chủ nhà
     * @param {number} id - ID giấy phép
     * @param {string} token - Token xác thực
     */
    deleteLandlordLicense: async (id, token) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('✅ Xóa giấy phép chủ nhà thành công');
        } catch (error) {
            console.error('❌ Lỗi khi xóa giấy phép chủ nhà:', error.response?.data || error.message);
            throw error;
        }
    },

    // ----- API giấy phép dịch vụ (Service License) -----

    /**
     * Tạo giấy phép dịch vụ mới
     * @param {Object} data - Dữ liệu giấy phép (ServiceLicenseDTO)
     * @param {string} token - Token xác thực
     * @returns {Object} Dữ liệu giấy phép đã tạo
     */
    createServiceLicense: async (data, token) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Create-ServiceLicence`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi tạo giấy phép dịch vụ:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Lấy danh sách tất cả giấy phép dịch vụ
     * @param {string} token - Token xác thực
     * @returns {Array} Danh sách giấy phép
     */
    getServiceLicenses: async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/service`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // console.log('📌 Lấy danh sách giấy phép dịch vụ:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy danh sách giấy phép dịch vụ:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Lấy thông tin giấy phép dịch vụ theo ID
     * @param {number} id - ID giấy phép
     * @param {string} token - Token xác thực
     * @returns {Object} Thông tin giấy phép
     */
    getServiceLicenseById: async (id, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/service/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy thông tin giấy phép dịch vụ:', error.response?.data || error.message);
            throw error;
        }
    },


    /**
     * Cập nhật thông tin giấy phép dịch vụ
     * @param {number} id - ID giấy phép
     * @param {Object} data - Dữ liệu giấy phép cần cập nhật
     * @param {string} token - Token xác thực
     */
    updateServiceLicense: async (id, data, token) => {
        try {
            await axios.put(`${API_BASE_URL}/service/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật giấy phép dịch vụ:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Xóa giấy phép dịch vụ
     * @param {number} id - ID giấy phép
     * @param {string} token - Token xác thực
     */
    deleteServiceLicense: async (id, token) => {
        try {
            await axios.delete(`${API_BASE_URL}/service/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('❌ Lỗi khi xóa giấy phép dịch vụ:', error.response?.data || error.message);
            throw error;
        }
    },

    // ----- API cập nhật vai trò -----

    /**
     * Cập nhật vai trò thành chủ nhà (RoleLandlord = 2)
     * @param {number} userId - ID người dùng
     * @param {string} token - Token xác thực
     */
    updateRoleToLandlord: async (userId, token) => {
        try {
            const body = { UserId: userId }; // BE yêu cầu object User với UserId
            await axios.put(`${API_BASE_URL}/${userId}/UpdateRoleLandlord`, body, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật vai trò chủ nhà:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Cập nhật vai trò thành nhà cung cấp dịch vụ (RoleLandlord = 2)
     * @param {number} userId - ID người dùng
     * @param {string} token - Token xác thực
     */
    updateRoleToService: async (userId, token) => {
        try {
            const body = { UserId: userId }; // BE yêu cầu object User với UserId
            await axios.put(`${API_BASE_URL}/${userId}/UpdateRoleService`, body, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật vai trò dịch vụ:', error.response?.data || error.message);
            throw error;
        }
    },
};

export default UpRoleService;