import axios from 'axios';

const API_URL = 'https://localhost:8000/api/Transaction';

const TransactionService = {
    // Tạo giao dịch nạp tiền
    createTransaction: (transaction) =>
        axios.post(`${API_URL}`, transaction).then((res) => res.data),

    // Kiểm tra trạng thái thanh toán (theo mô tả giao dịch / mã UUID)
    checkTransactionStatus: (description) =>
        axios.get(`${API_URL}?description=${description}`).then((res) => res.data),

    // Lấy danh sách giao dịch của user (cần token)
    getUserTransactions: () =>
        axios.get(`${API_URL}/GetTransactions`).then((res) => res.data),

    // Lấy toàn bộ giao dịch cho admin (public)
    getAllTransactions: () =>
        axios.get(`${API_URL}/getAll-Transaction`).then((res) => res.data),

    // Lấy danh sách các giao dịch nạp tiền
    getAllDeposits: () =>
        axios.get(`${API_URL}/deposits`).then((res) => res.data),

    // Lấy danh sách các giao dịch rút tiền
    getAllWithdrawals: () =>
        axios.get(`${API_URL}/withdrawals`).then((res) => res.data),

    // Tổng số tiền đã nạp
    getTotalDeposits: () =>
        axios.get(`${API_URL}/total-deposit`).then((res) => res.data),

    // Tổng số tiền đã rút
    getTotalWithdrawals: () =>
        axios.get(`${API_URL}/total-withdrawal`).then((res) => res.data),

    // Tổng doanh thu
    getTotalRevenue: () =>
        axios.get(`${API_URL}/total-revenue`).then((res) => res.data),

    // Doanh thu theo từng tháng
    getMonthlyRevenue: () =>
        axios.get(`${API_URL}/monthly-revenue`).then((res) => res.data),
};

export default TransactionService;
