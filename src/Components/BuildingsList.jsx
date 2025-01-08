import React, { useEffect, useState } from 'react';
import BuildingService from '../Services/BuildingService';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import Swal from 'sweetalert2';

const BuildingsList = () => {
    const [buildings, setBuildings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchBuildings();
    }, [searchTerm]);

    const fetchBuildings = () => {
        BuildingService.getBuildings(searchTerm)
            .then(data => setBuildings(data))
            .catch(error => console.error('Error fetching Buildings:', error));
    };

    const handleDelete = (buildingId) => {
        Swal.fire({
            title: 'Notification',
            text: 'Are you sure to Delete this Building?',
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        })
            .then((result) => {
                if (result.isConfirmed) {
                    BuildingService.deleteBuilding(buildingId)
                        .then(() => fetchBuildings())
                        .catch(error => console.error('Error deleting Building:', error));
                }
            });
    };

    const handleCreate = () => {
        navigate('/Buildings/Creates');
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="relative w-1/3 mx-auto">
                    <input
                        className="border w-full border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        type="text"
                        placeholder="  Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Icon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" name="search" />
                </div>
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-400 transition duration-200"
                    onClick={handleCreate}
                >
                    <Icon name="plus" /> Create
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {buildings.map((building) => (
                    <div
                        key={building.buildingId}
                        className="bg-white border border-gray-300 rounded-lg shadow-md p-4 hover:shadow-lg transition duration-200"
                    >
                        <h3 className="text-lg font-semibold text-gray-800">{building.buildingName}</h3>

                        <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Location: </span>{building.location}
                        </p>

                        <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Verify: </span>
                            {building.verify ? 'Yes' : 'No'}
                        </p>

                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-400 transition duration-200"
                                onClick={() => navigate(`/Buildings/${building.buildingId}`)}
                            >
                                <Icon name="edit" />
                            </button>
                            <button
                                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-400 transition duration-200"
                                onClick={() => handleDelete(building.buildingId)}
                            >
                                <Icon name="trash" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

};

export default BuildingsList;
