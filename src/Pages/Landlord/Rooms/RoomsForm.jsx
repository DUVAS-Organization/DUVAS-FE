import React, { useState, useEffect } from 'react';
import RoomService from '../../../Services/User/RoomService';
import { useNavigate, useParams } from 'react-router-dom';
import CategoryRoomService from '../../../Services/User/CategoryRoomService';
import BuildingService from '../../../Services/User/BuildingService';
import UserService from '../../../Services/User/UserService'
import Swal from 'sweetalert2';

const RoomsForm = () => {
    const [room, setRoom] = useState({
        buildingId: 1,
        title: '', description: '', locationDetail: '',
        acreage: 0, furniture: '', numberOfBathroom: 0,
        numberOfBedroom: 0, garret: false, price: 0,
        categoryRoomId: 1, image: null, note: '',
        userId: 1,
    });
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const { roomId } = useParams();
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Lấy danh sách Categories
        CategoryRoomService.getCategoryRooms()
            .then((data) => setCategoryRooms(data))
            .catch((error) => console.error('Error fetching categories:', error));

        // Lấy danh sách Buildings
        BuildingService.getBuildings()
            .then((data) => setBuildings(data))
            .catch((error) => console.error('Error fetching Buildings:', error));

        // Lấy danh sách Users
        UserService.getUsers()
            .then((data) => setUsers(data))
            .catch((error) => console.error('Error fetching Users:', error));

        if (roomId) {
            RoomService.getRoomById(roomId)
                .then(data => {
                    console.log("API response:", data);
                    console.log("Room ID:", roomId);
                    setRoom({
                        buildingId: data.buildingId,
                        title: data.title || '',
                        description: data.description || '',
                        locationDetail: data.locationDetail || '',
                        acreage: data.acreage || 0,
                        furniture: data.furniture || '',
                        numberOfBathroom: data.numberOfBathroom || 0,
                        numberOfBedroom: data.numberOfBedroom || 0,
                        garret: data.garret || false,
                        price: data.price || 0,
                        categoryRoomId: data.categoryRoomId || 1,
                        image: data.image || '',
                        note: data.note || '',
                        userId: data.userId || 1,
                    });
                })
                .catch(error => console.error('Error fetching Room:', error));
        }
    }, [roomId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Chuyển file ảnh sang base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setRoom({ ...room, image: reader.result });
            };
            reader.readAsDataURL(file); // Chuyển file thành base64
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const RoomsData = {
            roomId: roomId,
            buildingId: room.buildingId,
            title: room.title,
            description: room.description,
            locationDetail: room.locationDetail,
            acreage: room.acreage,
            furniture: room.furniture,
            numberOfBathroom: room.numberOfBathroom,
            numberOfBedroom: room.numberOfBedroom,
            garret: room.garret,
            price: room.price,
            categoryRoomId: room.categoryRoomId,
            image: room.image,
            note: room.note,
            isPermission: room.isPermission,
            userId: room.userId,
        };

        try {
            if (roomId) {
                await RoomService.updateRoom(roomId, RoomsData);
                Swal.fire({
                    title: 'Updated!',
                    text: 'The Room has been Updated Successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                await RoomService.addRoom(RoomsData);
                Swal.fire({
                    title: 'Created!',
                    text: 'The Room has been Created Successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
            navigate('/Rooms');
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            Swal.fire({
                title: 'Invalid Input',
                text: 'Price must be a Positive Number.',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h1 className="text-2xl font-semibold mb-6 text-center">
                {roomId ? 'Edit Room' : 'Create Room'}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Images
                    </label>
                    <div className="mb-2">
                        {room.image && (
                            <img
                                src={room.image}
                                alt="Room Preview"
                                className="w-32 h-32 object-cover rounded-md"
                            />
                        )}
                    </div>
                    <input
                        type="file"
                        onChange={handleImageChange}
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        UserName
                    </label>
                    <select
                        value={room.userId}
                        onChange={(e) => setRoom({ ...room, userId: parseInt(e.target.value) })}
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
                    <select
                        value={room.buildingId}
                        onChange={(e) => setRoom({ ...room, buildingId: parseInt(e.target.value) })}
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="" disabled>Choose One...</option>
                        {buildings.map((building) => (
                            <option key={building.buildingId} value={building.buildingId}>
                                {building.buildingName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                    </label>
                    <input
                        type="text"
                        value={room.title}
                        onChange={(e) => setRoom({ ...room, title: e.target.value })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter Title"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <input
                        type="text"
                        value={room.description}
                        onChange={(e) => setRoom({ ...room, description: e.target.value })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter Description"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        LocationDetail
                    </label>
                    <input
                        type="text"
                        value={room.locationDetail}
                        onChange={(e) => setRoom({ ...room, locationDetail: e.target.value })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter Location Detail"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Acreage
                    </label>
                    <input
                        type="number"
                        value={room.acreage}
                        onChange={(e) => setRoom({ ...room, acreage: e.target.value })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter Acreage"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Furniture
                    </label>
                    <input
                        type="text"
                        value={room.furniture}
                        onChange={(e) => setRoom({ ...room, furniture: e.target.value })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter Furniture"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        NumberOfBathroom
                    </label>
                    <input
                        type="number"
                        value={room.numberOfBathroom}
                        onChange={(e) => setRoom({ ...room, numberOfBathroom: e.target.value })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter NumberOfBathroom"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        NumberOfBedroom
                    </label>
                    <input
                        type="number"
                        value={room.numberOfBedroom}
                        onChange={(e) => setRoom({ ...room, numberOfBedroom: e.target.value })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter NumberOfBedroom"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Garret</label>
                    <div className="flex items-center">
                        <label className="mr-4">
                            <input
                                type="radio"
                                name="garret"
                                value="True"
                                checked={room.garret === true}
                                onChange={() => setRoom({ ...room, garret: true })}
                            />
                            Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="garret"
                                value="False"
                                checked={room.garret === false}
                                onChange={() => setRoom({ ...room, garret: false })}
                            />
                            No
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                    </label>
                    <input
                        type="number"
                        value={room.price}
                        onChange={(e) => setRoom({ ...room, price: parseFloat(e.target.value) })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"

                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note
                    </label>
                    <input
                        type="text"
                        value={room.note}
                        onChange={(e) => setRoom({ ...room, note: e.target.value })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter Note"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Room
                    </label>
                    <select
                        value={room.categoryRoomId}
                        onChange={(e) => setRoom({ ...room, categoryRoomId: parseInt(e.target.value) })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="" disabled>Choose One...</option>
                        {categoryRooms.map((categoryRoom) => (
                            <option key={categoryRoom.categoryRoomId} value={categoryRoom.categoryRoomId}>
                                {categoryRoom.categoryName}
                            </option>
                        ))}
                    </select>
                </div>



                {/* Buttons */}
                <div className="flex justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-400 transition duration-200"
                    >
                        Lưu thay đổi
                    </button>
                    <button
                        type="button"
                        className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-400 transition duration-200"
                        onClick={() => navigate(-1)}
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RoomsForm;
