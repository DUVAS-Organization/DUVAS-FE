import axios from 'axios';

const API_URL = 'http://apiduvas1.runasp.net/api/ServicePosts';

const ServicePost = {
    getServicePosts: (searchTerm) =>
        axios.get(`${API_URL}${searchTerm ? `?searchTerm=${searchTerm}` : ''}`).then((res) => res.data),

    getServicePostById: (servicePostId) =>
        axios.get(`${API_URL}/${servicePostId}`).then((res) => res.data),

    addServicePost: (servicePost) => {
        return axios.post(API_URL, servicePost).then((res) => res.data);
    },

    updateServicePost: (servicePostId, servicePost) => {
        return axios.put(`${API_URL}/${servicePostId}`, servicePost).then((res) => res.data);
    },
    deleteServicePost: (servicePostId) =>
        axios.delete(`${API_URL}/${servicePostId}`).then((res) => res.data),
};

export default ServicePost;
