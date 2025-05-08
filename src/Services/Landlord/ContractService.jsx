import axios from 'axios';

const API_URL = 'https://apiduvas1.runasp.net/api/Contract';

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

            const response = await axios.get(`${API_URL}/authorization`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            // console.log('📌 Lấy tất cả hợp đồng ủy quyền:', response.data);
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
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật trạng thái hợp đồng:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Error updating contracts status' };
        }
    },
    sendEmailToLandlord: async (userId, contractId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Không tìm thấy token xác thực.');
            }
            if (!userId || !contractId || userId <= 0 || contractId <= 0) {
                throw new Error('userId hoặc contractId không hợp lệ.');
            }

            const url = `${API_URL}/send-email-to-landlord?userId=${userId}&contractId=${contractId}`;
            console.log('Gửi yêu cầu gửi email - URL:', url);
            console.log('Gửi yêu cầu gửi email - Headers:', {
                Authorization: `Bearer ${token}`,
                'Accept': 'application/json',
            });

            const response = await axios.post(
                url,
                null,  // Không gửi body
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                }
            );
            console.log('Phản hồi từ server:', response.data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.response?.data?.message || error.message || 'Lỗi không xác định khi gửi email đến chủ phòng.';
            console.error('Lỗi khi gửi email đến chủ phòng:', {
                message: errorMessage,
                response: error.response?.data,
                status: error.response?.status,
                userId,
                contractId,
            });
            throw new Error(errorMessage);
        }
    },
    getSignedPdfUrl: (contractId) =>
        axios.get(`${API_URL}/signed-url/${contractId}`).then(res => res.data),
};

export default ContractService;