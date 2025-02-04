import axios from 'axios';

const API_URL = 'https://localhost:8000/api/Users';

const AccountsService = {
    getAccounts: () =>
        axios.get(API_URL).then((res) => res.data),

    getAccountById: (userId) =>
        axios.get(`${API_URL}/${userId}`).then((res) => res.data),

    addAccount: (user) => {
        return axios.post(API_URL, user).then((res) => res.data);
    },

    updateAccount: (userId, user) => {
        return axios.put(`${API_URL}/${userId}`, user).then((res) => res.data);
    },
    deleteAccount: (userId) =>
        axios.delete(`${API_URL}/${userId}`).then((res) => res.data),
};

export default AccountsService;
