import axios from 'axios';

const API_URL = 'https://localhost:8000/api/Users';

const UserService = {
    getUsers: () =>
        axios.get(API_URL).then((res) => res.data),

    getUserById: (userId) =>
        axios.get(`${API_URL}/${userId}`).then((res) => res.data),

    addUser: (user) => {
        return axios.post(API_URL, user).then((res) => res.data);
    },

    updateUser: (userId, user) => {
        return axios.put(`${API_URL}/${userId}`, user).then((res) => res.data);
    },

    deleteUser: (userId) =>
        axios.delete(`${API_URL}/${userId}`).then((res) => res.data),

    getCurrentUser: () => {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            return axios.get(`${API_URL}/${userId}`).then((res) => res.data);
        } else {
            return Promise.reject('No user logged in');
        }
    },

    deposit: (amount) => {
        const token = localStorage.getItem("authToken");
        return axios.post('https://localhost:8000/api/Transaction', { "amount": amount }, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    },

    checkTransactionStatus: (description) => {
        const token = localStorage.getItem("authToken");
        return axios.get('https://localhost:8000/api/Transaction?description=' + description, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    },

    getBankAccounts: () => {
        const token = localStorage.getItem("authToken");
        return axios.get('https://localhost:8000/api/UserProfile/BankAccount', {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    },

    getBankCodes: () => {
        return axios.get("https://api.vietqr.io/v2/banks");
    },

    genOtp: () => {
        const token = localStorage.getItem("authToken");
        return axios.get('https://localhost:8000/api/UserProfile/otp', {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    },

    addNewBank: (data, otp) => {
        const token = localStorage.getItem("authToken");
        return axios.post('https://localhost:8000/api/UserProfile/BankAccount?otp=' + otp, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    },

    getTransactions: () => {
        const token = localStorage.getItem("authToken");
        return axios.get('https://localhost:8000/api/Transaction/GetTransactions', {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    },

    withdraw: async (amount, bankAccountId) => {
        try {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                throw new Error("No authentication token found.");
            }

            const response = await axios.post(
                'https://localhost:8000/api/Withdraw',
                {
                    amount: parseFloat(amount),
                    bankAccountId: bankAccountId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response;
        } catch (error) {
            console.error("Withdraw request failed:", error);
            return { status: error.response?.status || 500, data: error.response?.data || "An error occurred" };
        }
    },

    updateBankAccountStatus: (bankAccountId, active, otp = "0") => {
        const token = localStorage.getItem("authToken");
        const url = `https://localhost:8000/api/UserProfile/BankAccount`;
        const data = { bankAccountId, active, otp };

        return axios.put(url, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    },

    getCurrentUserWithdrawRequest: () => {
        const token = localStorage.getItem("authToken");
        const url = `https://localhost:8000/api/WithDraw/user`;
        return axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    },
};

export default UserService;