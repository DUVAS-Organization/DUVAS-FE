import axios from 'axios';

const API_URL = 'https://apiduvas1.runasp.net/api/CategoryPriorityPackageRooms';

const CPPRoomsService = {
    // Get all CategoryPriorityPackageRooms
    getCPPRooms: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data.map(item => ({
                categoryPriorityPackageRoomId: item.categoryPriorityPackageRoomId,
                categoryPriorityPackageRoomValue: item.categoryPriorityPackageRoomValue ? `${item.categoryPriorityPackageRoomValue}` : `${item.categoryPriorityPackageRoomId}`,
                status: item.status,
                price: item.price,
            }));
        } catch (error) {
            console.error('Error fetching CPP Rooms:', error);
            throw error;
        }
    },

    // Get a single CategoryPriorityPackageRoom by ID
    getCPPRoomById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            const item = response.data;
            return {
                categoryPriorityPackageRoomId: item.categoryPriorityPackageRoomId,
                categoryPriorityPackageRoomValue: item.categoryPriorityPackageRoomValue ? `${item.categoryPriorityPackageRoomValue}` : `${item.categoryPriorityPackageRoomId}`,
                status: item.status,
                price: item.price,
            };
        } catch (error) {
            console.error(`Error fetching CPP Room with ID ${id}:`, error);
            throw error;
        }
    },

    // Create a new CategoryPriorityPackageRoom
    createCPPRoom: async (cppRoom) => {
        try {
            const response = await axios.post(API_URL, {
                categoryPriorityPackageRoomValue: cppRoom.categoryPriorityPackageRoomValue || '',
                price: cppRoom.price,
                status: cppRoom.status,
            });
            const item = response.data;
            return {
                categoryPriorityPackageRoomId: item.categoryPriorityPackageRoomId,
                categoryPriorityPackageRoomValue: item.categoryPriorityPackageRoomValue ? `${item.categoryPriorityPackageRoomValue}  ngày` : `Room ${item.categoryPriorityPackageRoomId}`,
                status: item.status,
                price: item.price,
            };
        } catch (error) {
            console.error('Error creating CPP Room:', error);
            throw error;
        }
    },

    // Update an existing CategoryPriorityPackageRoom
    updateCPPRoom: async (id, cppRoom) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, {
                categoryPriorityPackageRoomId: id,
                categoryPriorityPackageRoomValue: cppRoom.categoryPriorityPackageRoomValue || 0,
                price: cppRoom.price,
                status: cppRoom.status,
            });
            const item = response.data || {};
            return {
                categoryPriorityPackageRoomId: item.categoryPriorityPackageRoomId || id,
                categoryPriorityPackageRoomValue: item.categoryPriorityPackageRoomValue ? `${item.categoryPriorityPackageRoomValue}  ngày` : `Room ${item.categoryPriorityPackageRoomId}`,
                status: item.status,
                price: item.price,
            };
        } catch (error) {
            console.error(`Error updating CPP Room with ID ${id}:`, error);
            throw error;
        }
    },

    // Delete a CategoryPriorityPackageRoom
    deleteCPPRoom: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
        } catch (error) {
            console.error(`Error deleting CPP Room with ID ${id}:`, error);
            throw error;
        }
    },

    // Lock a CategoryPriorityPackageRoom
    lockCPPRoom: async (id) => {
        try {
            await axios.put(`${API_URL}/lock/${id}`);
        } catch (error) {
            console.error(`Error locking CPP Room with ID ${id}:`, error);
            throw error;
        }
    },

    // Unlock a CategoryPriorityPackageRoom
    unlockCPPRoom: async (id) => {
        try {
            await axios.put(`${API_URL}/unlock/${id}`);
        } catch (error) {
            console.error(`Error unlocking CPP Room with ID ${id}:`, error);
            throw error;
        }
    },
};

export default CPPRoomsService;