import axios from 'axios';

const API_URL = 'https://localhost:8000/api/CategoryServices';

const CategoryServices = {
    getCategoryServices: () =>
        axios.get(API_URL).then((res) => res.data),
};

export default CategoryServices;
