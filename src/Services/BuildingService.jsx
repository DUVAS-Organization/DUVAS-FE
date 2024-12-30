import axios from 'axios';

const API_URL = 'https://localhost:8000/api/Buildings';

const BuildingService = {
    getBuildings: (searchTerm) =>
        axios.get(`${API_URL}${searchTerm ? `?searchTerm=${searchTerm}` : ''}`).then((res) => res.data),

    getBuildingById: (buildingId) =>
        axios.get(`${API_URL}/${buildingId}`).then((res) => res.data),

    addBuilding: (building) => {
        console.log("Payload gửi đến API:", building);
        return axios.post(API_URL, building).then((res) => res.data);
    },

    updateBuilding: (buildingId, building) => {
        console.log("Payload gửi đến API:", building);
        return axios.put(`${API_URL}/${buildingId}`, building).then((res) => res.data);
    },
    deleteBuilding: (buildingId) =>
        axios.delete(`${API_URL}/${buildingId}`).then((res) => res.data),
};

export default BuildingService;
