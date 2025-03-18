import axios from 'axios';

const API_URL = 'https://localhost:8000';

const AdminWithdrawRequestService = {
    getWithdrawRequestPaymentLinkById: (withdrawRequestId) =>
        axios.get(`${API_URL}/api/WithDraw/payment-qr?id=${withdrawRequestId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                "Content-Type": "application/json",
            }
        }).then((res) => res.data),
    getWithdrawRequests: (searchTerm) =>
        axios.get(`${API_URL}/api/WithdrawRequest${searchTerm ? `?searchTerm=${searchTerm}` : ''}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                "Content-Type": "application/json",
            }
        }).then((res) => res.data),
    rejectWithdrawRequests: (withdrawRequestId, reason) =>
        axios.patch(
            `${API_URL}/api/WithdrawRequest/${withdrawRequestId}/status`,
            {
                reason,
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    "Content-Type": "application/json",
                }
            }
        ).then((res) => res.data)

};

export default AdminWithdrawRequestService;