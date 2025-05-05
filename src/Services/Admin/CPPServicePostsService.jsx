import axios from 'axios';

const API_URL = 'https://apiduvas1.runasp.net/api/CategoryPriorityPackageServicePosts';

const CPPServicePostsService = {
    // Get all CategoryPriorityPackageServicePosts
    getAllCategoryPriorityPackageServicePosts: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data.map(item => ({
                categoryPriorityPackageServicePostId: item.categoryPriorityPackageServicePostId,
                categoryPriorityPackageServicePostValue: item.categoryPriorityPackageServicePostValue
                    ? `${item.categoryPriorityPackageServicePostValue}`
                    : `${item.categoryPriorityPackageServicePostId}`,
                price: item.price,
                status: item.status,
            }));
        } catch (error) {
            console.error('Error fetching CategoryPriorityPackageServicePosts:', error);
            throw error;
        }
    },

    // Get a single CategoryPriorityPackageServicePost by ID
    getCategoryPriorityPackageServicePostById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            const item = response.data;
            return {
                categoryPriorityPackageServicePostId: item.categoryPriorityPackageServicePostId,
                categoryPriorityPackageServicePostValue: item.categoryPriorityPackageServicePostValue
                    ? `${item.categoryPriorityPackageServicePostValue}`
                    : `${item.categoryPriorityPackageServicePostId}`,
                price: item.price,
                status: item.status,
            };
        } catch (error) {
            console.error(`Error fetching CategoryPriorityPackageServicePost with ID ${id}:`, error);
            throw error;
        }
    },

    // Create a new CategoryPriorityPackageServicePost
    createCategoryPriorityPackageServicePost: async (cppServicePost) => {
        try {
            const response = await axios.post(API_URL, {
                categoryPriorityPackageServicePostValue: cppServicePost.categoryPriorityPackageServicePostValue || '',
                price: cppServicePost.price,
                status: cppServicePost.status,
            });
            const item = response.data;
            return {
                categoryPriorityPackageServicePostId: item.categoryPriorityPackageServicePostId,
                categoryPriorityPackageServicePostValue: item.categoryPriorityPackageServicePostValue
                    ? `${item.categoryPriorityPackageServicePostValue}`
                    : `${item.categoryPriorityPackageServicePostId}`,
                price: item.price,
                status: item.status,
            };
        } catch (error) {
            console.error('Error creating CategoryPriorityPackageServicePost:', error);
            throw error;
        }
    },

    // Update an existing CategoryPriorityPackageServicePost
    updateCategoryPriorityPackageServicePost: async (id, cppServicePost) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, {
                categoryPriorityPackageServicePostId: id,
                categoryPriorityPackageServicePostValue: cppServicePost.categoryPriorityPackageServicePostValue || 0,
                price: cppServicePost.price,
                status: cppServicePost.status,
            });
            const item = response.data || {};
            return {
                categoryPriorityPackageServicePostId: item.categoryPriorityPackageServicePostId || id,
                categoryPriorityPackageServicePostValue: item.categoryPriorityPackageServicePostValue
                    ? `${item.categoryPriorityPackageServicePostValue}`
                    : `${item.categoryPriorityPackageServicePostId}`,
                price: item.price,
                status: item.status,
            };
        } catch (error) {
            console.error(`Error updating CategoryPriorityPackageServicePost with ID ${id}:`, error);
            throw error;
        }
    },

    // Delete a CategoryPriorityPackageServicePost
    deleteCategoryPriorityPackageServicePost: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
        } catch (error) {
            console.error(`Error deleting CategoryPriorityPackageServicePost with ID ${id}:`, error);
            throw error;
        }
    },

    // Lock a CategoryPriorityPackageServicePost
    lockCategoryPriorityPackageServicePost: async (id) => {
        try {
            await axios.put(`${API_URL}/lock/${id}`);
        } catch (error) {
            console.error(`Error locking CategoryPriorityPackageServicePost with ID ${id}:`, error);
            throw error;
        }
    },

    // Unlock a CategoryPriorityPackageServicePost
    unlockCategoryPriorityPackageServicePost: async (id) => {
        try {
            await axios.put(`${API_URL}/unlock/${id}`);
        } catch (error) {
            console.error(`Error unlocking CategoryPriorityPackageServicePost with ID ${id}:`, error);
            throw error;
        }
    },
};

export default CPPServicePostsService;
