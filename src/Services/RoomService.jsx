import axios from 'axios';

const API_URL = 'https://localhost:8000/api/Rooms';

const RoomService = {
    getRooms: (searchTerm) =>
        axios.get(`${API_URL}${searchTerm ? `?searchTerm=${searchTerm}` : ''}`).then((res) => res.data),

    getRoomById: (roomId) =>
        axios.get(`${API_URL}/${roomId}`).then((res) => res.data),

    addRoom: (room) => {
        return axios.post(API_URL, room).then((res) => res.data);
    },

    updateRoom: (roomId, room) => {
        return axios.put(`${API_URL}/${roomId}`, room).then((res) => res.data);
    },
    deleteRoom: (roomId) =>
        axios.delete(`${API_URL}/${roomId}`).then((res) => res.data),
};

export default RoomService;
