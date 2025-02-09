import React, { useEffect, useState } from 'react';
import RoomService from '../Services/User/RoomService';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import Swal from 'sweetalert2';

const RoomsList = () => {
    const [rooms, setRooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRooms();
    }, [searchTerm]);

    const fetchRooms = () => {
        RoomService.getRooms(searchTerm)
            .then(data => setRooms(data))
            .catch(error => console.error('Error fetching Rooms:', error));
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Notification',
            text: 'Are you sure to Delete this Room?',
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        })
            .then((result) => {
                if (result.isConfirmed) {
                    RoomService.deleteRoom(id)
                        .then(() => fetchRooms())
                        .catch(error => console.error('Error deleting Room:', error));
                }
            });
    };

    const handleCreate = () => {
        navigate('/Rooms/Creates');
    };

    return (
        <div className="p-6">
            {/* Search và Create */}
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

            {/* Card List */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-3/4 mx-44">
                {rooms.map((room) => (
                    <div key={room.roomId} className="border border-gray-300 rounded-lg shadow-md bg-white flex flex-col max-h-[450px]">
                        <img
                            src={
                                (() => {
                                    try {
                                        const images = JSON.parse(room.image);
                                        return images.length > 0 ? images[0] : ""; // Nếu mảng không rỗng, lấy ảnh đầu tiên
                                    } catch (error) {
                                        // Nếu parse thất bại, có thể room.image đã là một chuỗi Base64 hay URL
                                        return room.image;
                                    }
                                })()
                            }
                            alt={room.title}
                            className="w-full h-40 object-cover rounded-md mb-4"
                        />

                        <div className="flex flex-col flex-grow p-4 overflow-y-scroll">
                            <h3 className="text-lg font-semibold mb-2">{room.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Location:</strong> {room.locationDetail}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Bathroom:</strong> {room.numberOfBathroom}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Bedroom:</strong> {room.numberOfBedroom}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Garret:</strong> {room.garret ? 'Yes' : 'No'}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Price:</strong> {room.price.toLocaleString('vi-VN')} đ
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Category:</strong> {room.categoryName}
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                <strong>Building:</strong> {room.buildingName}
                            </p>
                        </div>

                        {/* Fixed buttons */}
                        <div className="flex justify-between px-4 py-2 border-t border-gray-300">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition duration-200"
                                onClick={() => navigate(`/Rooms/${room.roomId}`)}
                            >
                                <Icon name="edit" /> Edit
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400 transition duration-200"
                                onClick={() => handleDelete(room.roomId)}
                            >
                                <Icon name="trash" /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoomsList;
