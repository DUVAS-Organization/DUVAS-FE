import axios from 'axios';

const API_BASE_URL = 'https://localhost:8000/api/UpdateRole';

const UpRoleService = {
    // Tạo giấy phép chủ nhà (sử dụng DTO)
    createLandlordLicense: async (data, token) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Create-LandlordLicence`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("📌 API Response (Create Landlord License):", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error creating landlord license:", error);
            throw error;
        }
    },

    // Tạo giấy phép dịch vụ (sử dụng DTO)
    createServiceLicense: async (data, token) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Create-ServiceLicence`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("📌 API Response (Create Service License):", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error creating service license:", error);
            throw error;
        }
    },

    // Cập nhật role thành chủ nhà
    updateRoleToLandlord: async (userId, token) => {
        try {
            await axios.put(`${API_BASE_URL}/${userId}/UpdateRoleLandlord`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("✅ Role updated to Landlord");
        } catch (error) {
            console.error("❌ Error updating role to Landlord:", error);
            throw error;
        }
    },

    // Cập nhật role thành dịch vụ
    updateRoleToService: async (userId, token) => {
        try {
            await axios.put(`${API_BASE_URL}/${userId}/UpdateRoleService`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("✅ Role updated to Service Provider");
        } catch (error) {
            console.error("❌ Error updating role to Service Provider:", error);
            throw error;
        }
    },

    // Lấy danh sách giấy phép chủ nhà
    getLandlordLicenses: async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("📌 Fetched Landlord Licenses:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching landlord licenses:", error);
            throw error;
        }
    },

    // Lấy chi tiết giấy phép chủ nhà theo ID
    getLandlordLicenseById: async (id, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("📌 Fetched Landlord License:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching landlord license details:", error);
            throw error;
        }
    },

    // Cập nhật thông tin giấy phép chủ nhà (khác với cập nhật role)
    updateLandlordLicense: async (id, data, token) => {
        try {
            await axios.put(`${API_BASE_URL}/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("✅ Landlord License updated");
        } catch (error) {
            console.error("❌ Error updating landlord license:", error);
            throw error;
        }
    },

    // Xóa giấy phép chủ nhà
    deleteLandlordLicense: async (id, token) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("✅ Landlord License Deleted");
        } catch (error) {
            console.error("❌ Error deleting landlord license:", error);
            throw error;
        }
    },

    // ---------------------------
    // Các API liên quan đến Service License
    // Lấy danh sách giấy phép dịch vụ
    getServiceLicenses: async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/service`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("📌 Fetched Service Licenses:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching service licenses:", error);
            throw error;
        }
    },

    // Lấy chi tiết giấy phép dịch vụ theo ID
    getServiceLicenseById: async (id, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/service/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("📌 Fetched Service License:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching service license details:", error);
            throw error;
        }
    },

    // Tạo giấy phép dịch vụ (sử dụng model, nếu cần tách riêng DTO và model)
    createServiceLicenseModel: async (data, token) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/service`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("📌 API Response (Create Service License Model):", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error creating service license model:", error);
            throw error;
        }
    },

    // Cập nhật thông tin giấy phép dịch vụ
    updateServiceLicense: async (id, data, token) => {
        try {
            await axios.put(`${API_BASE_URL}/service/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("✅ Service License updated");
        } catch (error) {
            console.error("❌ Error updating service license:", error);
            throw error;
        }
    },

    // Xóa giấy phép dịch vụ
    deleteServiceLicense: async (id, token) => {
        try {
            await axios.delete(`${API_BASE_URL}/service/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("✅ Service License Deleted");
        } catch (error) {
            console.error("❌ Error deleting service license:", error);
            throw error;
        }
    },
};

export default UpRoleService;
