import axios from "axios";

const BookingManagementService = {
    confirmReservation: async (roomId, formData, token) => {
        const response = await axios.put(
            `/api/landlord/BookingManagement/confirm-reservation/${roomId}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },

    cancelReservation: async (rentalId, token) => {
        const response = await axios.put(
            `/api/landlord/BookingManagement/cancel-reservation/${rentalId}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    },
};

export default BookingManagementService;