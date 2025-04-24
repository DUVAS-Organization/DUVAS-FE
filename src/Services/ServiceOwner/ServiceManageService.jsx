import axios from 'axios';

const API_URL = 'https://localhost:8000/api/service/ServiceManagement';

const ServiceManageService = {
    // Get services for the authenticated user
    getMyServices: async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/my-services`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error fetching services' };
        }
    },

    // Add a new service
    addService: async (serviceData) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_URL}/add-service`, serviceData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error adding service' };
        }
    },

    // Edit an existing service
    editService: async (servicePostId, serviceData) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(`${API_URL}/edit-service/${servicePostId}`, serviceData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error editing service' };
        }
    },

    // Delete a service
    deleteService: async (servicePostId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.delete(`${API_URL}/delete-service/${servicePostId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error deleting service' };
        }
    },

    // View all services
    viewServiceList: async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/view-service-list`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error fetching service list' };
        }
    },

    // Track service status
    trackServiceStatus: async (servicePostId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/track-service-status/${servicePostId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error tracking service status' };
        }
    },

    lockService: async (servicePostId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(`${API_URL}/lock/${servicePostId}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error locking service' };
        }
    },

    unlockService: async (servicePostId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(`${API_URL}/unlock/${servicePostId}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error unlocking service' };
        }
    },
};

export default ServiceManageService;