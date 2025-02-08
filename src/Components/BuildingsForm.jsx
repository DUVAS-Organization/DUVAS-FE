import React, { useState, useEffect } from 'react';
import BuildingService from '../Services/User/BuildingService';
import { useNavigate, useParams } from 'react-router-dom';
import UserService from '../Services/User/UserService'
import { showCustomNotification } from './Notification'
import { useAuth } from '../Context/AuthProvider';

const BuildingsForm = () => {
    const [building, setBuilding] = useState([]);
    const { buildingId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (buildingId) {
            BuildingService.getBuildingById(buildingId)
                .then(data => {
                    setBuilding({
                        buildingName: data.buildingName || '',
                        userId: data.userId || user.userId, // Nếu có userId trong dữ liệu, dùng; nếu không, lấy từ context
                        location: data.location || '',
                        verify: data.verify || false,
                    });
                })
                .catch(error => console.error('Error fetching Building:', error));
        } else {
            setBuilding(prevBuilding => ({
                ...prevBuilding,
                userId: user.userId, // Lấy userId từ context và gán vào form
            }));
        }
    }, [buildingId, user.userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const BuildingData = {
                buildingId: buildingId,
                buildingName: building.buildingName,
                userId: building.userId, // Truyền userId vào form
                location: building.location,
                verify: building.verify,
            };

            if (buildingId) {
                await BuildingService.updateBuilding(buildingId, BuildingData);
                showCustomNotification("success", "Chỉnh sửa thành công!");
            } else {
                await BuildingService.addBuilding(BuildingData);
                showCustomNotification("success", "Tạo thành công!");
            }
            navigate('/');
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            showCustomNotification("error", "Vui lòng thử lại!");
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
