import React, { useEffect, useState } from 'react';
import RoomService from '../../Services/User/RoomService';
import { useNavigate, Link } from 'react-router-dom';
import { FaBell, FaCamera, FaMapMarkerAlt, FaRegBell, FaRegHeart } from 'react-icons/fa';
import Searchbar from '../../Components/Searchbar';
import Footer from '../../Components/Layout/Footer';

const RoomsList = () => {
    const [rooms, setRooms] = useState([]);
    const [visibleRooms, setVisibleRooms] = useState(6);
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
        setVisibleRooms(prev => prev + 3);
    };

    const handleViewMore = () => {
        navigate('/Rooms');
    };

    return (
        <div className="bg-white min-h-screen p-4">
            <div className="container mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="w-full">
                        <Searchbar />
                    </div>
                </div>
                {/* Filters */}
                {/* <div className="flex items-center space-x-2 mb-4 max-w-6xl mx-auto">
                    <button className="bg-white px-4 py-2 rounded">Lọc</button>
                    <select className="border rounded p-2">
                        <option>Nhà trọ, phòng trọ</option>
                    </select>
                    <select className="border rounded p-2">
                        <option>Mức giá</option>
                    </select>
                </div> */}


                {/* Main Content */}
                <div className="flex max-w-6xl mx-auto">
                    {/* Danh sách phòng */}
                    <div className="w-3/4 bg-white p-4 rounded shadow">

                        <h1 className="text-2xl font-semibold">Cho thuê nhà trọ, phòng trọ trên toàn quốc</h1>
                        <div className="flex justify-between">
                            <p className='my-2'>Hiện có {rooms.length} phòng trọ.</p>
                            <div className="flex items-center">
                                <FaRegBell className='bg-yellow-500 text-white p-2 text-4xl rounded-full' />
                                <p className=' mx-1'>Nhận email tin mới</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-red-600 peer-focus:ring-4 peer-focus:ring-white 
                                                    dark:peer-focus:ring-red-800 dark:bg-gray-700 peer-checked:after:translate-x-full after:absolute 
                                                    after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:bg-white after:rounded-full 
                                                    after:transition-all peer-checked:after:border-white">
                                    </div>
                                </label>

                            </div>
                        </div>

                        {/* Danh sách phòng */}
                        <div className="grid gap-6 mt-4"
                            style={{
                                gridTemplateColumns: `repeat(${rooms.length === 2 ? 2 : 3}, minmax(0, 1fr))`
                            }}>
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
                                                <div className="relative w-full h-52 overflow-hidden rounded-lg">
                                                    {/* Ảnh phủ khung */}
                                                    <img
                                                        src={firstImage}
                                                        alt={room.title}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />

                                                    {/* Nhãn bo tròn, đẩy 1 phần ra ngoài */}
                                                    <span
                                                        className="absolute top-2 text-white text-lg font-medium rounded-r-lg bg-red-600 px-4 py-1 z-10"

                                                    >
                                                        {room.categoryName}
                                                    </span>
                                                </div>
                                            )}


                                            <div className="p-4 flex-1 flex flex-col">
                                                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{room.title}</h3>
                                                <p className="text-red-500 font-semibold mb-2">
                                                    {room.price.toLocaleString('vi-VN')} đ • {room.acreage} m²
                                                </p>
                                                <p className="text-gray-600 mb-2 flex items-center">
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
                                {visibleRooms < 99 ? (
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

                    {/* Sidebar */}
                    <div className="w-1/4 pl-4">
                        <div className="bg-white p-4 rounded shadow mb-4">
                            <h3 className="font-bold mb-2">Lọc theo khoảng giá</h3>
                            <ul>
                                {["Thỏa thuận", "Dưới 1 triệu", "1 - 3 triệu", "3 - 5 triệu",
                                    "5 - 10 triệu", "10 - 20 triệu", "20 - 40 triệu", "40 - 70 triệu",
                                    "Trên 70 triệu"].map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                            </ul>
                        </div>
                        <div className="bg-white p-4 rounded shadow">
                            <h3 className="font-bold mb-2">Lọc theo diện tích</h3>
                            <ul>
                                {["Dưới 30 m²", "30 - 50 m²", "50 - 80 m²", "80 - 100 m²",
                                    "100 - 150 m²", "150 - 200 m²", "200 - 250 m²", "250 - 300 m²",
                                    "300 - 500 m²", "Trên 500 m²",].map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default RoomsList;
