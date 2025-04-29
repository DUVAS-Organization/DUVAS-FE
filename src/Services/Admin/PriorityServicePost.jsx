import axios from 'axios';

const API_URL = 'https://localhost:8000/api/PriorityPackageServicePost';

const PriorityServicePostService = {
    // Get all PriorityPackageServicePosts
    getPriorityServicePosts: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data.map(item => ({
                priorityPackageServicePostId: item.priorityPackageServicePostId,
                priorityPackageServicePostValue: item.priorityPackageServicePostValue ? `${item.priorityPackageServicePostValue} ngày` : `ServicePost ${item.priorityPackageServicePostId}`,
                status: item.status,
                price: item.price,
            }));
        } catch (error) {
            console.error('Error fetching Priority Service Posts:', error);
            throw error;
        }
    },

    // Get a single PriorityPackageServicePost by ID
    getPriorityServicePostById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            const item = response.data;
            return {
                priorityPackageServicePostId: item.priorityPackageServicePostId,
                priorityPackageServicePostValue: item.priorityPackageServicePostValue ? `${item.priorityPackageServicePostValue} ngày` : `ServicePost ${item.priorityPackageServicePostId}`,
                status: item.status,
                price: item.price,
            };
        } catch (error) {
            console.error(`Error fetching Priority Service Post with ID ${id}:`, error);
            throw error;
        }
    },

    // Create a new PriorityPackageServicePost
    createPriorityServicePost: async (servicePost) => {
        try {
            const response = await axios.post(API_URL, {
                priorityPackageServicePostValue: servicePost.priorityPackageServicePostValue || '',
                price: servicePost.price,
                status: servicePost.status,
            });
            const item = response.data;
            return {
                priorityPackageServicePostId: item.priorityPackageServicePostId,
                priorityPackageServicePostValue: item.priorityPackageServicePostValue ? `${item.priorityPackageServicePostValue} ngày` : `ServicePost ${item.priorityPackageServicePostId}`,
                status: item.status,
                price: item.price,
            };
        } catch (error) {
            console.error('Error creating Priority Service Post:', error);
            throw error;
        }
    },

    // Update an existing PriorityPackageServicePost
    updatePriorityServicePost: async (id, servicePost) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, {
                priorityPackageServicePostId: id,
                priorityPackageServicePostValue: servicePost.priorityPackageServicePostValue || '',
                price: servicePost.price,
                status: servicePost.status,
            });
            const item = response.data || {};
            return {
                priorityPackageServicePostId: item.priorityPackageServicePostId || id,
                priorityPackageServicePostValue: item.priorityPackageServicePostValue ? `${item.priorityPackageServicePostValue} ngày` : `ServicePost ${item.priorityPackageServicePostId}`,
                status: item.status,
                price: item.price,
            };
        } catch (error) {
            console.error(`Error updating Priority Service Post with ID ${id}:`, error);
            throw error;
        }
    },

    // Delete a PriorityPackageServicePost
    deletePriorityServicePost: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
        } catch (error) {
            console.error(`Error deleting Priority Service Post with ID ${id}:`, error);
            throw error;
        }
    },
};

export default PriorityServicePostService;