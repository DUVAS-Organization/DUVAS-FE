import axios from "axios";

// Tạo instance của axios với base URL của BE
const api = axios.create({
    baseURL: "http://localhost:8000", // Đảm bảo BE chạy trên port này
});

const BookingManagementService = {
    confirmReservation: async (roomId, data, token) => {
        try {
            const response = await api.put(
                `/api/landlord/BookingManagement/confirm-reservation/${roomId}`,
                data, // Gửi dữ liệu dưới dạng JSON
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json", // Đổi thành JSON
                    },
                }
            );
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data || "Lỗi khi xác nhận yêu cầu thuê phòng. Vui lòng kiểm tra dữ liệu gửi lên.");
            } else if (error.request) {
                throw new Error("Không nhận được phản hồi từ server. Vui lòng kiểm tra xem server có đang chạy không.");
            } else {
                throw new Error("Lỗi khi gửi yêu cầu: " + error.message);
            }
        }
    },

    cancelReservation: async (rentalId, token) => {
        try {
            const response = await api.put(
                `/api/landlord/BookingManagement/cancel-reservation/${rentalId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data || "Lỗi khi hủy yêu cầu thuê phòng. Vui lòng kiểm tra lại.");
            } else if (error.request) {
                throw new Error("Không nhận được phản hồi từ server. Vui lòng kiểm tra xem server có đang chạy không.");
            } else {
                throw new Error("Lỗi khi gửi yêu cầu: " + error.message);
            }
        }
    },
};

export default BookingManagementService;