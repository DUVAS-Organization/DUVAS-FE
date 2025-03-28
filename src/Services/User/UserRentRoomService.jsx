import axios from 'axios';

const API_BASE_URL = 'https://localhost:8000/api/RentRoom';

const UserRentRoomService = {
    // Lấy danh sách phòng "Đang chờ giao dịch" (contract.status = 4)
    getRentalListsByUserId: async (userId, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rental-list-of-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("📌 API Response (Pending Rentals):", response.data);
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
            console.log("📌 API Response (Renting Rooms):", response.data);
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
            console.log("📌 API Response (Rented Rooms):", response.data);
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
            console.log("📌 API Response (Cancelled Rentals):", response.data);
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
            console.log("📌 API Response (Rental Details):", response.data);
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
            console.log("📌 API Response (Check Phone):", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error checking user phone:", error);
            throw error;
        }
    },
};

export default UserRentRoomService;