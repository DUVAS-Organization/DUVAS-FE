import { useState, useEffect } from "react";
import AccountsService from "../Services/Admin/AccountServices";
import ServicePost from "../Services/Admin/ServicePost";
import BuildingServices from "../Services/Admin/BuildingServices";
import RoomServices from "../Services/Admin/RoomServices";
import { FaUser, FaFileAlt, FaBuilding, FaDoorOpen } from 'react-icons/fa'; // Importing icons

const Counts = () => {
    const [accountCount, setAccountCount] = useState(17); // Updated count
    const [postCount, setPostCount] = useState(2);      // Updated count
    const [buildingCount, setBuildingCount] = useState(4); // Updated count
    const [roomCount, setRoomCount] = useState(9);       // Updated count

    useEffect(() => {
        fetchData();
    }, []); // Fetch data when component mounts

    const fetchData = () => {
        AccountsService.getAccounts()
            .then(data => setAccountCount(data.length))
            .catch(error => console.error('Error fetching Account:', error));

        ServicePost.getServicePosts()
            .then(data => setPostCount(data.length))
            .catch(error => console.error('Error fetching Posts:', error));

        BuildingServices.getBuildings()
            .then(data => setBuildingCount(data.length))
            .catch(error => console.error('Error fetching Buildings:', error));

        RoomServices.getRooms()
            .then(data => setRoomCount(data.length))
            .catch(error => console.error('Error fetching Rooms:', error));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Tài Khoản */}
            <div className="bg-blue-500 p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-between">
                <div className="text-white">
                    <p className="text-5xl font-bold">{accountCount}</p>
                    <p className="text-xl font-semibold mt-2">Tài Khoản</p>
                </div>
                <FaUser className="text-white text-6xl ml-6" />
            </div>

            {/* Bài Đăng */}
            <div className="bg-green-500 p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-between">
                <div className="text-white">
                    <p className="text-5xl font-bold">{postCount}</p>
                    <p className="text-xl font-semibold mt-2">Bài Đăng</p>
                </div>
                <FaFileAlt className="text-white text-6xl ml-6" />
            </div>

            {/* Tòa Nhà */}
            <div className="bg-purple-600 p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-between">
                <div className="text-white">
                    <p className="text-5xl font-bold">{buildingCount}</p>
                    <p className="text-xl font-semibold mt-2">Tòa Nhà</p>
                </div>
                <FaBuilding className="text-white text-6xl ml-6" />
            </div>

            {/* Phòng */}
            <div className="bg-orange-500 p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-between">
                <div className="text-white">
                    <p className="text-5xl font-bold">{roomCount}</p>
                    <p className="text-xl font-semibold mt-2">Phòng</p>
                </div>
                <FaDoorOpen className="text-white text-6xl ml-6" />
            </div>
        </div>
    );
};

export default Counts;
