import { useState, useEffect } from "react";
import AccountsService from "../Services/Admin/AccountServices";
import ServicePost from "../Services/Admin/ServicePost";
import BuildingServices from "../Services/Admin/BuildingServices";
import RoomServices from "../Services/Admin/RoomServices";

const Counts = () => {
    const [accountCount, setAccountCount] = useState(0);
    const [postCount, setPostCount] = useState(0);
    const [buildingCount, setBuildingCount] = useState(0);
    const [roomCount, setRoomCount] = useState(0);

    useEffect(() => {
        fetchData();
    }, []); // Chạy fetchData() khi component được mount

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
        <div className="flex space-x-4 mb-4">
            <div className="flex-1 text-white font-medium bg-blue-500 p-4 rounded-lg h-28">
                <p className='font-bold text-3xl'>Tài Khoản</p>
                <p className='font-bold text-2xl mt-2'>{accountCount}</p>
            </div>
            <div className="flex-1 text-white font-medium bg-blue-500 p-4 rounded-lg h-28">
                <p className='font-bold text-3xl'>Bài Đăng</p>
                <p className='font-bold text-2xl mt-2'>{postCount}</p>
            </div>
            <div className="flex-1 text-white font-medium bg-blue-500 p-4 rounded-lg h-28">
                <p className='font-bold text-3xl'>Tòa Nhà</p>
                <p className='font-bold text-2xl mt-2'>{buildingCount}</p>
            </div>
            <div className="flex-1 text-white font-medium bg-blue-500 p-4 rounded-lg h-28">
                <p className='font-bold text-3xl'>Phòng</p>
                <p className='font-bold text-2xl mt-2'>{roomCount}</p>
            </div>
        </div>
    );
};

export default Counts;
