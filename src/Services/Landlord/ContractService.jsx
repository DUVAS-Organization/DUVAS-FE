import axios from 'axios';

const API_URL = 'https://localhost:8000/api/Contract';

const ContractService = {
    // Generate a new authorization contract
    generateAuthorizationContract: async (contractDetails) => {
        try {
            const response = await axios.post(`${API_URL}/generate-authorization`, contractDetails, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error generating authorization contract' };
        }
    },

    // Get all authorization contracts for the authenticated user
    getMyAuthorizationContracts: async () => {
        try {
            const response = await axios.get(`${API_URL}/my-authorization-contracts`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error fetching authorization contracts' };
        }
    },

    // Get a specific authorization contract by ID
    getAuthorizationContractById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/authorization/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error fetching authorization contract' };
        }
    },

    // Update authorization for rooms
    updateRoomsAuthorization: async (requestData) => {
        try {
            const response = await axios.put(`${API_URL}/update-rooms-authorization`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error updating rooms authorization' };
        }
    },

    // Update status for contracts
    updateContractsStatus: async (requestData) => {
        try {
            const response = await axios.put(`${API_URL}/update-contracts-status`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error updating contracts status' };
        }
    },
};

export default ContractService;