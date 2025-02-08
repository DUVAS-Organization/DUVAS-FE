import axios from 'axios';

const API_URL = 'https://localhost:8000/api/Buildings';

const BuildingServices = {
    getBuildings: (searchTerm) =>
        axios.get(`${API_URL}${searchTerm ? `?searchTerm=${searchTerm}` : ''}`).then((res) => res.data),

    getBuildingById: (buildingId) =>
        axios.get(`${API_URL}/${buildingId}`).then((res) => res.data),

    addBuilding: (building, file) => {
        const formData = new FormData();
        formData.append("buildingName", building.buildingName);
        formData.append("location", building.location);
        formData.append("verify", building.verify);

        if (file) {
            formData.append("document", file); // Gửi file lên
        }

        return axios.post(API_URL, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then((res) => res.data);
    },

    updateBuilding: (buildingId, building, file) => {
        const formData = new FormData();
        formData.append("buildingName", building.buildingName);
        formData.append("location", building.location);
        formData.append("verify", building.verify);

        if (file) {
            formData.append("document", file);
        }

        return axios.put(`${API_URL}/${buildingId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then((res) => res.data);
    },

    deleteBuilding: (buildingId) =>
        axios.delete(`${API_URL}/${buildingId}`).then((res) => res.data),
};

export default BuildingServices;
