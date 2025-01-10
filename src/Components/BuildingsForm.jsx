import React, { useState, useEffect } from 'react';
import BuildingService from '../Services/BuildingService';
import { useNavigate, useParams } from 'react-router-dom';
import UserService from '../Services/UserService'
import Swal from 'sweetalert2';

const BuildingsForm = () => {
    const [building, setBuilding] = useState({ buildingName: '', userId: 1, location: '', verify: false });
    const { buildingId } = useParams();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    useEffect(() => {
        UserService.getUsers()
            .then((data) => setUsers(data))
            .catch((error) => console.error('Error fetching Users:', error));

        if (buildingId) {
            BuildingService.getBuildingById(buildingId)
                .then(data => {
                    setBuilding({
                        buildingName: data.buildingName || '',
                        userId: data.userId || 1,
                        location: data.location || 0,
                        verify: data.verify || false,
                    });
                })
                .catch(error => console.error('Error fetching Building:', error));
        }
    }, [buildingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const BuildingData = {
            buildingId: buildingId,
            buildingName: building.buildingName,
            userId: building.userId || 1,
            location: building.location,
            verify: building.verify,
        };

        try {
            if (buildingId) {
                await BuildingService.updateBuilding(buildingId, BuildingData);
                Swal.fire({
                    title: 'Updated!',
                    text: 'The Building has been Updated Successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                await BuildingService.addBuilding(BuildingData);
                Swal.fire({
                    title: 'Created!',
                    text: 'The Building has been Created Successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
            navigate('/');
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            Swal.fire({
                title: 'Invalid Input',
                text: 'Invalid Input.',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h1 className="text-2xl font-semibold mb-6 text-center">
                {buildingId ? 'Edit Building' : 'Create Building'}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        UserName
                    </label>
                    <select
                        value={building.userId}
                        onChange={(e) => setBuilding({ ...building, userId: parseInt(e.target.value) })}
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="" disabled>Choose One...</option>
                        {users.map((user) => (
                            <option key={user.userId} value={user.userId}>
                                {user.userName}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Building Name
                    </label>
                    <input
                        type="text"
                        value={building.buildingName}
                        onChange={(e) => setBuilding({ ...building, buildingName: e.target.value })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter Building name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                    </label>
                    <input
                        type="text"
                        value={building.location}
                        onChange={(e) => setBuilding({ ...building, location: e.target.value })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"

                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verify</label>
                    <div className="flex items-center">
                        <label className="mr-4">
                            <input
                                type="radio"
                                name="garret"
                                value="True"
                                checked={building.verify === true}
                                onChange={() => setBuilding({ ...building, verify: true })}
                            />
                            Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="garret"
                                value="False"
                                checked={building.verify === false}
                                onChange={() => setBuilding({ ...building, verify: false })}
                            />
                            No
                        </label>
                    </div>
                </div>


                {/* Buttons */}
                <div className="flex justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-400 transition duration-200"
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-400 transition duration-200"
                        onClick={() => navigate('/')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BuildingsForm;
