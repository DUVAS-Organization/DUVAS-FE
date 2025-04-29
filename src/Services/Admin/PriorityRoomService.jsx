import axios from 'axios';

const API_URL = 'https://apiduvas1.runasp.net/api/PriorityPackageRoom';

const PriorityRoomService = {
    // Get all PriorityPackageRooms
    getPriorityRooms: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data.map(item => ({
                priorityPackageRoomId: item.priorityPackageRoomId,
                userId: item.userId,
                // roomId: item.roomId,
                categoryPriorityPackageRoomId: item.categoryPriorityPackageRoomId,
                startDate: item.startDate,
                endDate: item.endDate,
                price: item.price,
            }));
        } catch (error) {
            console.error('Error fetching Priority Rooms:', error);
            throw error;
        }
    },

    // Get a single PriorityPackageRoom by ID
    getPriorityRoomById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            const item = response.data;
            return {
                priorityPackageRoomId: item.priorityPackageRoomId,
                userId: item.userId,
                // roomId: item.roomId,
                categoryPriorityPackageRoomId: item.categoryPriorityPackageRoomId,
                startDate: item.startDate,
                endDate: item.endDate,
                price: item.price,
            };
        } catch (error) {
            console.error(`Error fetching Priority Room with ID ${id}:`, error);
            throw error;
        }
    },

    // Create a new PriorityPackageRoom
    createPriorityRoom: async (room) => {
        try {
            console.log('Sending PriorityRoom payload:', room); // Debug payload
            const response = await axios.post(API_URL, {
                userId: room.userId,
                // roomId: room.roomId,
                categoryPriorityPackageRoomId: room.categoryPriorityPackageRoomId,
                startDate: room.startDate,
                endDate: room.endDate,
                price: room.price,
            });
            const item = response.data;
            console.log('PriorityRoom response:', item); // Debug response
            return {
                priorityPackageRoomId: item.priorityPackageRoomId,
                userId: item.userId,
                // roomId: item.roomId,
                categoryPriorityPackageRoomId: item.categoryPriorityPackageRoomId,
                startDate: item.startDate,
                endDate: item.endDate,
                price: item.price,
            };
        } catch (error) {
            console.error('Error creating Priority Room:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            throw error;
        }
    },

    // Update an existing PriorityPackageRoom
    updatePriorityRoom: async (id, room) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, {
                priorityPackageRoomId: id,
                userId: room.userId,
                roomId: room.roomId,
                categoryPriorityPackageRoomId: room.categoryPriorityPackageRoomId,
                startDate: room.startDate,
                endDate: room.endDate,
                price: room.price,
            });
            const item = response.data || {};
            return {
                priorityPackageRoomId: item.priorityPackageRoomId || id,
                userId: item.userId,
                roomId: item.roomId,
                categoryPriorityPackageRoomId: item.categoryPriorityPackageRoomId,
                startDate: item.startDate,
                endDate: item.endDate,
                price: item.price,
            };
        } catch (error) {
            console.error(`Error updating Priority Room with ID ${id}:`, error);
            throw error;
        }
    },

    // Delete a PriorityPackageRoom
    deletePriorityRoom: async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
        } catch (error) {
            console.error(`Error deleting Priority Room with ID ${id}:`, error);
            throw error;
        }
    },
};

export default PriorityRoomService;