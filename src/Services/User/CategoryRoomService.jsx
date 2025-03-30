import axios from 'axios';

const API_URL = 'http://apiduvas1.runasp.net/api/CategoryRooms';

const CategoryRoomService = {
    getCategoryRooms: () =>
        axios.get(API_URL).then((res) => res.data),
};

export default CategoryRoomService;
