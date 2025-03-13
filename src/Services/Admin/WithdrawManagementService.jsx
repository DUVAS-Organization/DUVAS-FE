import axios from 'axios';

const API_URL = 'https://localhost:8000/api/WithdrawRequest';

const AdminWithdrawRequestService = {
    getWithdrawRequestPaymentLinkById: (withdrawRequestId) =>
        axios.get(`${API_URL}/payment-qr?id=${withdrawRequestId}`).then((res) => res.data),
    getWithdrawRequests: (searchTerm) =>
        axios.get(`${API_URL}${searchTerm ? `?searchTerm=${searchTerm}` : ''}`).then((res) => res.data),

};

export default AdminWithdrawRequestService;