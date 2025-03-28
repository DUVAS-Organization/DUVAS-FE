import axios from "axios";

const API_URL = "https://localhost:8000/api/landlord/BookingManagement";

const BookingManagementService = {
    // Get rooms for the landlord
    getRooms: async (token) => {
        try {
            const response = await axios.get(`${API_URL}/rooms`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message || "Không thể lấy danh sách phòng"
            );
        }
    },

    getRentalListOfLandlord: async (landlordId, token) => {
        try {
            const response = await axios.get(
                `${API_URL}/rentalList-of-landlord?landlordId=${landlordId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message || "Không thể lấy danh sách thuê của landlord"
            );
        }
    },

    getRentalListOfUser: async (userId, token) => {
        try {
            const response = await axios.get(
                `${API_URL}/rentalList-of-user?userId=${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data.rentalList; // Trả về rentalList trực tiếp
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.response?.data ||
                "Không thể lấy danh sách thuê của người dùng";
            throw new Error(errorMessage);
        }
    },

    // Confirm a reservation
    confirmReservation: async (roomId, data, token) => {
        if (!token) {
            throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
        }
        try {
            const response = await axios.put(
                `${API_URL}/confirm-reservation/${roomId}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            const errorData = error.response?.data;
            let errorMessage = "Không thể xác nhận yêu cầu thuê phòng";
            if (errorData) {
                if (typeof errorData === "string") {
                    errorMessage = errorData;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.errors) {
                    errorMessage = JSON.stringify(errorData.errors);
                } else {
                    errorMessage = JSON.stringify(errorData);
                }
            }
            throw new Error(errorMessage);
        }
    },

    // Cancel a reservation
    cancelReservation: async (rentalId, token) => {
        if (!token) {
            throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
        }
        try {
            const response = await axios.put(
                `${API_URL}/cancel-reservation/${rentalId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data ||
                "Không thể hủy yêu cầu thuê phòng";
            throw new Error(errorMessage);
        }
    },

    // Check user balance
    checkBalance: async (data, token) => {
        try {
            const response = await axios.post(`${API_URL}/check-balance`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || "Không thể kiểm tra số dư");
        }
    },

    // Update user balance
    updateBalance: async (data, token) => {
        try {
            const response = await axios.put(`${API_URL}/update-balance`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || "Không thể cập nhật số dư");
        }
    },

    // Create insider trading
    createInsiderTrading: async (data, type, token) => {
        try {
            const response = await axios.post(
                `${API_URL}/create-insider-trading?type=${type}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data || "Không thể tạo giao dịch nội bộ"
            );
        }
    },

    // Get insider trading by ID
    getInsiderTradingById: async (id, token) => {
        try {
            const response = await axios.get(
                `${API_URL}/get-insider-trading-by-id${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data || "Không thể lấy thông tin giao dịch nội bộ"
            );
        }
    },
};

export default BookingManagementService;