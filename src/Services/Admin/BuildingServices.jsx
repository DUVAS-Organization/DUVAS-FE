import axios from 'axios';

const API_URL = 'https://localhost:8000/api/Buildings';

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
    lockBuilding: (buildingId) =>
        axios.put(`${API_URL}/lock/${buildingId}`).then((res) => res.data),

    unlockBuilding: (buildingId) =>
        axios.put(`${API_URL}/unlock/${buildingId}`).then((res) => res.data),
};

export default BuildingServices;
