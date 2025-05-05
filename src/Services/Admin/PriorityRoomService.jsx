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
                roomId: item.roomId,
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
                roomId: item.roomId,
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

    // Get PriorityPackageRooms by userId
    getPriorityRoomByUserId: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);
            console.log('Priority rooms API response:', response.data); // Debug response
            return response.data.map(item => ({
                priorityPackageRoomId: item.priorityPackageRoomId,
                userId: item.userId,
                roomId: item.roomId,
                categoryPriorityPackageRoomId: item.categoryPriorityPackageRoomId,
                startDate: item.startDate,
                endDate: item.endDate,
                price: item.price,
            }));
        } catch (error) {
            console.error(`Error fetching Priority Rooms for userId ${userId}:`, error);
            throw error;
        }
    },

    // Create a new PriorityPackageRoom
    createPriorityRoom: async (room) => {
        // Log dữ liệu gửi lên để kiểm tra
        console.log('Dữ liệu gửi lên /api/PriorityPackageRoom:', room);

        // Kiểm tra các trường bắt buộc
        const requiredFields = ['userId', 'roomId', 'categoryPriorityPackageRoomId', 'startDate', 'endDate', 'price'];
        const missingFields = requiredFields.filter(field => !room[field]);
        if (missingFields.length > 0) {
            console.error('Thiếu các trường bắt buộc:', missingFields);
            throw new Error(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
        }

        // Kiểm tra định dạng startDate và endDate
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(room.startDate) || !dateRegex.test(room.endDate)) {
            console.error('startDate hoặc endDate không đúng định dạng YYYY-MM-DD');
            throw new Error('startDate hoặc endDate không đúng định dạng');
        }

        try {
            const response = await axios.post(API_URL, {
                userId: room.userId,
                roomId: room.roomId,
                categoryPriorityPackageRoomId: room.categoryPriorityPackageRoomId,
                startDate: room.startDate,
                endDate: room.endDate,
                price: room.price,
            });
            const item = response.data;
            return {
                priorityPackageRoomId: item.priorityPackageRoomId,
                userId: item.userId,
                roomId: item.roomId,
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