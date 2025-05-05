import axios from 'axios';

const API_BASE_URL = 'https://apiduvas1.runasp.net/api/RentRoom';

const UserRentRoomService = {
    // Lấy danh sách phòng "Đang chờ giao dịch" (contract.status = 4)
    getRentalListsByUserId: async (userId, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rental-list-of-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data?.rentalList || [];
        } catch (error) {
            console.error("❌ Error fetching pending rentals:", error);
            return [];
        }
    },

    // Lấy danh sách phòng "Đang thuê" (contract.status = 1)
    getListsRentingByUserId: async (userId, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rental-list-of-rent-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data?.rentalList || [];
        } catch (error) {
            console.error("❌ Error fetching renting rooms:", error);
            return [];
        }
    },

    // Lấy danh sách phòng "Đã thuê" (contract.status = 3)
    getListsRentedByUserId: async (userId, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rental-list-of-rented-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data?.rentalList || [];
        } catch (error) {
            console.error("❌ Error fetching rented rooms:", error);
            return [];
        }
    },

    // Lấy danh sách phòng "Đã hủy" (contract.status = 2)
    getListsCancelRentByUserId: async (userId, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rental-list-of-cancel-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data?.rentalList || [];
        } catch (error) {
            console.error("❌ Error fetching canceled rentals:", error);
            return [];
        }
    },

    // Lấy chi tiết RentalList
    getRentalDetailsById: async (rentalId, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rental-list-by-id/${rentalId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data || null;
        } catch (error) {
            console.error("❌ Error fetching rental details:", error);
            return null;
        }
    },

    // Xác nhận thuê phòng
    confirmRental: async (rentId, token) => {
        try {
            await axios.put(`${API_BASE_URL}/confirm-rental/${rentId}`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error("Error confirming rental:", error);
            throw error;
        }
    },

    // Hủy thuê phòng
    cancelRental: async (rentId, token) => {
        try {
            await axios.put(`${API_BASE_URL}/cancel-rental/${rentId}`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error("Error cancelling rental:", error);
            throw error;
        }
    },
    checkUserPhone: async (userId, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/check-phone/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("❌ Error checking user phone:", error);
            throw error;
        }
    },
    sendFeedback: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/send-review`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    "Content-Type": "application/json",
                }
            });
            return response;
        } catch (error) {
            console.error("❌ Error sending feedback:", error.response?.data || error.message);
            throw error;
        }
    },
    getUserFeedbackByRoomId: async (roomId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/get-feedbacks/${roomId}`);
            return response.data;
        } catch (error) {
            console.error(error.message);
        }
    }
};

export default UserRentRoomService;