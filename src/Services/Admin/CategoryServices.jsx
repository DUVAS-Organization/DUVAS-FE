import axios from 'axios';

const API_URL = 'https://localhost:8000/api/CategoryServices';

const CategoryServices = {
    getCategoryServices: () =>
        axios.get(API_URL).then((res) => res.data),

    getCategoryServiceById: (categoryServiceId) =>
        axios.get(`${API_URL}/${categoryServiceId}`).then((res) => res.data),

    addCategoryService: (categoryService) => {
        return axios.post(API_URL, categoryService).then((res) => res.data);
    },

    updateCategoryService: (categoryServiceId, categoryService) => {
        return axios.put(`${API_URL}/${categoryServiceId}`, categoryService).then((res) => res.data);
    },
    deleteCategoryService: (categoryServiceId) =>
        axios.delete(`${API_URL}/${categoryServiceId}`).then((res) => res.data),
    lockCategoryService: (categoryServiceId) =>
        axios.put(`${API_URL}/lock/${categoryServiceId}`).then((res) => res.data),

    unlockCategoryService: (categoryServiceId) =>
        axios.put(`${API_URL}/unlock/${categoryServiceId}`).then((res) => res.data),
};

export default CategoryServices;
