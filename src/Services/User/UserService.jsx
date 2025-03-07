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
        // Ví dụ nếu bạn lưu user ID trong sessionStorage
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            return axios.get(`${API_URL}/${userId}`).then((res) => res.data);
        } else {
            // Hoặc trả về một giá trị mặc định hoặc lỗi nếu không có userId
            return Promise.reject('No user logged in');
        }
    },
};

export default UserService;
