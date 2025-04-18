import axios from 'axios';

const API_URL = 'https://apiduvas1.runasp.net/api/CategoryRooms';

const CategoryRooms = {
    getCategoryRooms: () =>
        axios.get(API_URL).then((res) => res.data),

    getCategoryRoomsById: (categoryRoomId) =>
        axios.get(`${API_URL}/${categoryRoomId}`).then((res) => res.data),

    addCategoryRoom: (room) => {
        return axios.post(API_URL, room).then((res) => res.data);
    },

    updateCategoryRoom: (categoryRoomId, room) => {
        return axios.put(`${API_URL}/${categoryRoomId}`, room).then((res) => res.data);
    },
    deleteCategoryRoom: (categoryRoomId) =>
        axios.delete(`${API_URL}/${categoryRoomId}`).then((res) => res.data),
    lockCategoryRoom: (categoryRoomId) =>
        axios.put(`${API_URL}/lock/${categoryRoomId}`).then((res) => res.data),

    unlockCategoryRoom: (categoryRoomId) =>
        axios.put(`${API_URL}/unlock/${categoryRoomId}`).then((res) => res.data),
};

export default CategoryRooms;
