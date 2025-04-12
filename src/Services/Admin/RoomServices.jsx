import axios from 'axios';

const API_URL = 'https://localhost:8000/api/Rooms';

const RoomServices = {
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
    // Lấy danh sách phòng bị khóa
    getLockedRooms: () =>
        axios.get(`${API_URL}/room-locked`).then((res) => res.data),

    // Lấy danh sách phòng đang hoạt động
    getActiveRooms: () =>
        axios.get(`${API_URL}/room-active`).then((res) => res.data),

    // Khóa phòng
    lockRoom: (roomId) =>
        axios.put(`${API_URL}/lock/${roomId}`).then((res) => res.data),

    // Mở khóa phòng
    unlockRoom: (roomId) =>
        axios.put(`${API_URL}/unlock/${roomId}`).then((res) => res.data),

    // Chấp nhận tích xanh (reputation)
    acceptReputation: (roomId) =>
        axios.put(`${API_URL}/acceptReputation/${roomId}`).then((res) => res.data),

    // Hủy tích xanh (reputation)
    cancelReputation: (roomId) =>
        axios.put(`${API_URL}/cancelReputation/${roomId}`).then((res) => res.data),

    // Lấy danh sách phòng đăng ký uy tín
    getRoomRegisterReputation: () =>
        axios.get(`${API_URL}/register-reputation`).then((res) => res.data),

    // Lấy thông tin hợp đồng của phòng
    getRoomContract: (roomId) =>
        axios.get(`${API_URL}/${roomId}/contract`).then((res) => res.data),
};

export default RoomServices;
