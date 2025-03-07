import React, { useEffect, useState } from 'react';
import RoomService from '../../Services/User/RoomService';
import { useNavigate, Link } from 'react-router-dom';
import { FaCamera, FaMapMarkerAlt, FaRegHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const RoomDetails = () => {
    const [rooms, setRooms] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();
    const visibleCards = 3;

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = () => {
        RoomService.getRooms()
            .then(data => setRooms(data))
            .catch(error => console.error('Error fetching Rooms:', error));
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, Math.ceil(rooms.length / visibleCards) - 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    return (
        <div>
            <div className='flex justify-between items-center mb-5'>
                <h3 className='text-xl font-bold'>Phòng trọ dành cho bạn</h3>
                <div className='flex gap-2'>
                    <button onClick={prevSlide} className='bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900'>
                        <FaChevronLeft size={20} />
                    </button>
                    <button onClick={nextSlide} className='bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-900'>
                        <FaChevronRight size={20} />
                    </button>
                </div>
            </div>
            <div className='relative max-w-6xl mx-auto overflow-hidden'>
                <div className='flex transition-transform duration-300 ease-in-out' style={{ transform: `translateX(-${currentIndex * 100}%)`, width: `${Math.ceil(rooms.length / visibleCards) * 100}%` }}>
                    {rooms.map((room) => {
                        let images;
                        try {
                            images = JSON.parse(room.image);
                        } catch (error) {
                            images = room.image;
                        }
                        const imageCount = Array.isArray(images) ? images.length : 1;
                        const firstImage = Array.isArray(images) ? images[0] : images;

                        return (
                            <Link key={room.roomId} to={`/Rooms/Details/${room.roomId}`} className='w-1/5 flex-shrink-0 flex-grow-0'>
                                <div className='bg-white rounded-lg shadow-md overflow-hidden h-[400px] flex flex-col'>
                                    {room.image && room.image !== '' && (
                                        <div className='relative w-full h-52 rounded-lg overflow-hidden'>
                                            <img
                                                src={firstImage}
                                                alt={room.title}
                                                className='absolute inset-0 w-full h-full object-cover'
                                            />
                                        </div>
                                    )}
                                    <div className='p-4 flex-1 flex flex-col'>
                                        <h3 className='text-lg font-semibold mb-2 line-clamp-2'>{room.title}</h3>
                                        <p className='text-red-500 font-semibold mb-2'>
                                            {room.price.toLocaleString('vi-VN')} đ • {room.acreage} m²
                                        </p>
                                        <p className='text-gray-600 mb-2 flex items-center truncate'>
                                            <FaMapMarkerAlt className='mr-1' /> {room.locationDetail}
                                        </p>
                                        <div className='mt-auto flex justify-between items-center border-t pt-2'>
                                            <span className='text-gray-600'>
                                                <FaRegHeart />
                                            </span>
                                            <span className='text-gray-600 flex items-center'>
                                                <FaCamera className='mr-1' /> {imageCount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RoomDetails;