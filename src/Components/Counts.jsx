import { useState, useEffect } from "react";
import AccountsService from "../Services/Admin/AccountServices";
import ServicePost from "../Services/Admin/ServicePost";
import BuildingServices from "../Services/Admin/BuildingServices";
import RoomServices from "../Services/Admin/RoomServices";
import { FaUser, FaFileAlt, FaBuilding, FaDoorOpen } from 'react-icons/fa';

const Counts = () => {
    const [accountCount, setAccountCount] = useState(0);
    const [postCount, setPostCount] = useState(0);
    const [buildingCount, setBuildingCount] = useState(0);
    const [roomCount, setRoomCount] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Tài Khoản */}
            <Card count={accountCount} label="Tài Khoản" color="bg-blue-500" Icon={FaUser} />

            {/* Bài Đăng */}
            <Card count={postCount} label="Bài Đăng" color="bg-green-500" Icon={FaFileAlt} />

            {/* Tòa Nhà */}
            <Card count={buildingCount} label="Tòa Nhà" color="bg-purple-600" Icon={FaBuilding} />

            {/* Phòng */}
            <Card count={roomCount} label="Phòng" color="bg-orange-500" Icon={FaDoorOpen} />
        </div>
    );
};

const Card = ({ count, label, color, Icon }) => (
    <div className={`${color} p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-between`}>
        <div className="text-white">
            <p className="text-5xl font-bold">{count}</p>
            <p className="text-xl font-semibold mt-2">{label}</p>
        </div>
        <Icon className="text-white text-6xl ml-6" />
    </div>
);

export default Counts;
