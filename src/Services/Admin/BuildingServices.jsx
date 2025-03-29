import axios from 'axios';

const API_URL = 'http://apiduvas1.runasp.net/api/Buildings';

const BuildingServices = {
    getBuildings: (searchTerm) =>
        axios.get(`${API_URL}${searchTerm ? `?searchTerm=${searchTerm}` : ''}`).then((res) => res.data),

    getBuildingById: (buildingId) =>
        axios.get(`${API_URL}/${buildingId}`).then((res) => res.data),

    addBuilding: (building) => {
        return axios.post(API_URL, building).then((res) => res.data);
    },

    updateBuilding: (buildingId, building) => {
        return axios.put(`${API_URL}/${buildingId}`, building).then((res) => res.data);
    },

    deleteBuilding: (buildingId) =>
        axios.delete(`${API_URL}/${buildingId}`).then((res) => res.data),
};

export default BuildingServices;
