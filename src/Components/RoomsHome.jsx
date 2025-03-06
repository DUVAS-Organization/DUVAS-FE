import React, { useEffect, useState } from 'react';
import RoomService from '../Services/User/RoomService';
import { useNavigate, Link } from 'react-router-dom';
import { FaCamera, FaMapMarkerAlt, FaRegHeart } from 'react-icons/fa';

const RoomsHome = () => {
    const [rooms, setRooms] = useState([]);
    const [visibleRooms, setVisibleRooms] = useState(4);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = () => {
        RoomService.getRooms()
            .then(data => setRooms(data))
            .catch(error => console.error('Error fetching Rooms:', error));
    };

    const handleLoadMore = () => {
        setVisibleRooms(prev => prev + 4);
    };

    const handleViewMore = () => {
        navigate('/Rooms');
    };

    return (
        <div>
            <div
                className="grid gap-6 max-w-6xl mx-auto my-4"
                style={{
                    gridTemplateColumns: `repeat(${rooms.length === 3 ? 3 : 4}, minmax(0, 1fr))`
                }}
            >
                {rooms.slice(0, visibleRooms).map((room) => {
                    let images;
                    try {
                        images = JSON.parse(room.image);
                    } catch (error) {
                        images = room.image;
                    }
                    const imageCount = Array.isArray(images) ? images.length : 1;
                    const firstImage = Array.isArray(images) ? images[0] : images;

                    return (
                        <Link key={room.roomId} to={`/Rooms/Details/${room.roomId}`} className="block">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden h-[400px] flex flex-col">
                                {room.image && room.image !== '' && (
                                    <div className="relative w-full h-52 rounded-lg overflow-hidden">
                                        <img
                                            src={firstImage}
                                            alt={room.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{room.title}</h3>
                                    <p className="text-red-500 font-semibold mb-2">
                                        {room.price.toLocaleString('vi-VN')} đ • {room.acreage} m²
                                    </p>
                                    <p className="text-gray-600 mb-2 flex items-center truncate">
                                        <FaMapMarkerAlt className="mr-1" /> {room.locationDetail}
                                    </p>
                                    <div className="mt-auto flex justify-between items-center border-t pt-2">
                                        <span className="text-gray-600">
                                            <FaRegHeart />
                                        </span>
                                        <span className="text-gray-600 flex items-center">
                                            <FaCamera className="mr-1" /> {imageCount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Nút Xem thêm hoặc Xem tiếp */}
            {visibleRooms < rooms.length && (
                <div className="flex justify-center mt-6">
                    {visibleRooms < 16 ? (
                        <button
                            onClick={handleLoadMore}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            Xem thêm
                        </button>
                    ) : (
                        <button
                            onClick={handleViewMore}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            Xem tiếp
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoomsHome;
