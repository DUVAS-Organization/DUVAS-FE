import axios from 'axios';

const API_URL = 'http://apiduvas1.runasp.net/api/CategoryServices';

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
};

export default CategoryServices;
