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
    addReport: (report) => {
        const token = localStorage.getItem("authToken");
        const url = `https://localhost:8000/api/Report`;
        return axios.post(url, report, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    },
    getLockedUsers: () => {
        const token = localStorage.getItem('authToken');
        return axios.get(`${API_URL}/locked-users`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }).then((res) => res.data);
    },

    // New: Get list of active users
    getActiveUsers: () => {
        const token = localStorage.getItem('authToken');
        return axios.get(`${API_URL}/active-users`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }).then((res) => res.data);
    },

    // New: Lock a user by ID
    lockUser: (userId) => {
        const token = localStorage.getItem('authToken');
        return axios.put(`${API_URL}/lock/${userId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }).then((res) => res.data);
    },

    // New: Unlock a user by ID
    unlockUser: (userId) => {
        const token = localStorage.getItem('authToken');
        return axios.put(`${API_URL}/unlock/${userId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }).then((res) => res.data);
    },

    // New: Accept upgrade to Landlord role
    acceptUpRoleLandlord: (userId) => {
        const token = localStorage.getItem('authToken');
        return axios.put(`${API_URL}/acceptUpRoleLandLord/${userId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }).then((res) => res.data);
    },

    // New: Get list of users requesting Service role upgrade
    getUpRoleService: () => {
        const token = localStorage.getItem('authToken');
        return axios.get(`${API_URL}/upRole-Service`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }).then((res) => res.data);
    },

    // New: Accept upgrade to Service role
    acceptUpRoleService: (userId) => {
        const token = localStorage.getItem('authToken');
        return axios.put(`${API_URL}/acceptUpRoleService/${userId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }).then((res) => res.data);
    },

    // New: Get list of users requesting Landlord role upgrade
    getUpRoleLandlord: () => {
        const token = localStorage.getItem('authToken');
        return axios.get(`${API_URL}/upRole-LandLord`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }).then((res) => res.data);
    },

    // New: Cancel upgrade to Landlord role
    cancelUpRoleLandlord: (userId) => {
        const token = localStorage.getItem('authToken');
        return axios.put(`${API_URL}/cancelUpRoleLandLord/${userId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }).then((res) => res.data);
    },

    // New: Cancel upgrade to Service role
    cancelUpRoleService: (userId) => {
        const token = localStorage.getItem('authToken');
        return axios.put(`${API_URL}/cancelUpRoleService/${userId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }).then((res) => res.data);
    },
    getServiceLicenseByUserId: async (userId, token) => {
        try {
            const response = await axios.get(`${API_URL}/service-license/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy thông tin giấy phép dịch vụ:', error.response?.data || error.message);
            throw error;
        }
    },
    getServiceLicenseByUserId: async (userId, token) => {
        try {
            const response = await axios.get(`${API_URL}/service-license/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy thông tin giấy phép dịch vụ:', error.response?.data || error.message);
            throw error;
        }
    },
    getLandlordLicenseByUserId: async (userId, token) => {
        try {
            const response = await axios.get(`${API_URL}/landlord-license/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy thông tin giấy phép dịch vụ:', error.response?.data || error.message);
            throw error;
        }
    },
    getOneLicenseByUserId: async (userId, token) => {
        try {
            const response = await axios.get(`${API_URL}/one-landlord-license/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy thông tin giấy phép dịch vụ:', error.response?.data || error.message);
            throw error;
        }
    },
};

export default UserService;