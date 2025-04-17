import axios from 'axios';

const API_URL = 'https://localhost:8000/api/Contract';

const ContractService = {
    // Generate a new authorization contract
    generateAuthorizationContract: async (contractDetails) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found.');
            }

            const response = await axios.post(`${API_URL}/generate-authorization`, contractDetails, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('📌 Tạo hợp đồng ủy quyền:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi tạo hợp đồng ủy quyền:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Error generating authorization contract' };
        }
    },

    // Get all authorization contracts
    getAllAuthorizationContracts: async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found.');
            }

            const response = await axios.get(`${API_URL}/all-authorization-contract`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('📌 Lấy tất cả hợp đồng ủy quyền:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy tất cả hợp đồng ủy quyền:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Error fetching all authorization contracts' };
        }
    },

    // Get all authorization contracts for the authenticated user
    getMyAuthorizationContracts: async (userId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found.');
            const response = await axios.get(`${API_URL}/my-authorization-contracts?userId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('📌 Lấy hợp đồng ủy quyền của tôi:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Error fetching my contracts' };
        }
    },
    // Get a specific authorization contract by ID
    getAuthorizationContractById: async (userId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found.');
            }

            const response = await axios.get(`${API_URL}/authorization/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('📌 Lấy hợp đồng ủy quyền theo userId:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy hợp đồng ủy quyền theo userId:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Error fetching authorization contracts' };
        }
    },

    // Update authorization for rooms
    updateRoomsAuthorization: async (requestData) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found.');
            }

            const response = await axios.put(`${API_URL}/update-rooms-authorization`, requestData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('📌 Cập nhật quyền phòng:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật quyền phòng:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Error updating rooms authorization' };
        }
    },

    // Update status for contracts
    updateContractsStatus: async (requestData) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found.');
            }

            const response = await axios.put(`${API_URL}/update-contracts-status`, requestData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('📌 Cập nhật trạng thái hợp đồng:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật trạng thái hợp đồng:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Error updating contracts status' };
        }
    },
    getSignedPdfUrl: (contractId) =>
        axios.get(`${API_URL}/signed-url/${contractId}`).then(res => res.data),
};

export default ContractService;