import React, { useEffect, useState } from 'react';
import RoomService from '../Services/RoomService';
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
                <div className='relative w-1/3 mx-auto'>
                    <input
                        className=" border w-full border-gray-300 rounded-lg  focus:outline-none focus:ring focus:ring-blue-300"
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

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse border border-gray-300 shadow-md">
                    <thead>
                        <tr className="bg-gray-100 text-balance">
                            {/* <th className="border border-gray-300 px-4 py-2">ID</th> */}
                            <th className="border border-gray-300 px-4 py-2">Image</th>
                            <th className="border border-gray-300 px-4 py-2">Title</th>
                            <th className="border border-gray-300 px-4 py-2">Description</th>
                            <th className="border border-gray-300 px-4 py-2">Location Detail</th>
                            {/* <th className="border border-gray-300 px-4 py-2">Acreage</th>
                            <th className="border border-gray-300 px-4 py-2">Furniture</th> */}
                            <th className="border border-gray-300 px-4 py-2">Bathroom</th>
                            <th className="border border-gray-300 px-4 py-2">Bedroom</th>
                            <th className="border border-gray-300 px-4 py-2">Garret</th>
                            <th className="border border-gray-300 px-4 py-2">Price</th>
                            <th className="border border-gray-300 px-4 py-2">Category Room</th>
                            <th className="border border-gray-300 px-4 py-2">Building Name</th>
                            <th className="border border-gray-300 px-4 py-2">Note</th>
                            <th className="border border-gray-300 px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room, index) => (
                            <tr
                                key={room.roomId}
                                className={`text-balance ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    } hover:bg-gray-100`}
                            >
                                <td className="border border-gray-300 px-4 py-2">
                                    <img
                                        src={room.image}
                                        alt={room.title}
                                        className="w-20 h-20 object-cover rounded-md"
                                    />
                                </td>
                                <td className="border border-gray-300 px-4 py-2">{room.title}</td>
                                <td className="border border-gray-300 px-4 py-2">{room.description}</td>
                                <td className="border border-gray-300 px-4 py-2">{room.locationDetail}</td>
                                {/* <td className="border border-gray-300 px-4 py-2">{room.acreage}</td>
                                <td className="border border-gray-300 px-4 py-2">{room.furniture}</td> */}
                                <td className="border border-gray-300 px-4 py-2">{room.numberOfBathroom}</td>
                                <td className="border border-gray-300 px-4 py-2">{room.numberOfBedroom}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {room.garret ? 'Yes' : 'No'}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">{room.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                <td className="border border-gray-300 px-4 py-2">{room.categoryName}</td>
                                <td className="border border-gray-300 px-4 py-2">{room.buildingName}</td>
                                <td className="border border-gray-300 px-4 py-2">{room.note}</td>

                                <td className="border border-gray-300 px-4 py-2 space-x-2">
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-400 transition duration-200"
                                        onClick={() => navigate(`/Rooms/${room.roomId}`)}
                                    >
                                        <Icon name="edit" />
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-400 transition duration-200"
                                        onClick={() => handleDelete(room.roomId)}
                                    >
                                        <Icon name="trash" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoomsList;
