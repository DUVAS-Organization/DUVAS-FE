import axios from 'axios';

const API_URL = 'https://apiduvas1.runasp.net/api/PriorityPackageServicePost';

const PriorityServicePostService = {
    // Get all PriorityPackageServicePosts
    getPriorityServicePosts: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data.map(item => ({
                priorityPackageServicePostId: item.priorityPackageServicePostId,
                userId: item.userId,
                servicePostId: item.servicePostId,
                categoryPriorityPackageServicePostId: item.categoryPriorityPackageServicePostId,
                startDate: item.startDate,
                endDate: item.endDate,
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
                userId: item.userId,
                servicePostId: item.servicePostId,
                categoryPriorityPackageServicePostId: item.categoryPriorityPackageServicePostId,
                startDate: item.startDate,
                endDate: item.endDate,
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
                userId: servicePost.userId,
                servicePostId: servicePost.servicePostId,
                categoryPriorityPackageServicePostId: servicePost.categoryPriorityPackageServicePostId,
                startDate: servicePost.startDate,
                endDate: servicePost.endDate,
                price: servicePost.price,
            });
            const item = response.data;
            return {
                priorityPackageServicePostId: item.priorityPackageServicePostId,
                userId: item.userId,
                servicePostId: item.servicePostId,
                categoryPriorityPackageServicePostId: item.categoryPriorityPackageServicePostId,
                startDate: item.startDate,
                endDate: item.endDate,
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
                userId: servicePost.userId,
                servicePostId: servicePost.servicePostId,
                categoryPriorityPackageServicePostId: servicePost.categoryPriorityPackageServicePostId,
                startDate: servicePost.startDate,
                endDate: servicePost.endDate,
                price: servicePost.price,
            });
            const item = response.data || {};
            return {
                priorityPackageServicePostId: item.priorityPackageServicePostId || id,
                userId: item.userId,
                servicePostId: item.servicePostId,
                categoryPriorityPackageServicePostId: item.categoryPriorityPackageServicePostId,
                startDate: item.startDate,
                endDate: item.endDate,
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