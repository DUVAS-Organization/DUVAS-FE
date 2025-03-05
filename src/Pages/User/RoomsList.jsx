import React, { useEffect, useState } from 'react';
import RoomService from '../../Services/User/RoomService';
import { useNavigate, Link } from 'react-router-dom';
import { FaRegBell, FaMapMarkerAlt, FaRegHeart, FaCamera } from 'react-icons/fa';
import { FaPhoneVolume } from "react-icons/fa6";
import Searchbar from '../../Components/Searchbar';
import Footer from '../../Components/Layout/Footer';
import { useAuth } from '../../Context/AuthProvider';
import FAQList from '../../Components/FAQ/FAQList';

const RoomsList = () => {
    const [rooms, setRooms] = useState([]);
    const [visibleRooms, setVisibleRooms] = useState(6);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = () => {
        RoomService.getRooms()
            .then((data) => setRooms(data))
            .catch((error) => console.error('Error fetching Rooms:', error));
    };

    const handleLoadMore = () => {
        setVisibleRooms((prev) => prev + 3);
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
                    <div className="w-3/4 bg-white p-4 rounded shadow space-y-3">
                        <h1 className="text-2xl font-semibold">Cho thuê nhà trọ, phòng trọ trên toàn quốc</h1>
                        <div className="flex justify-between">
                            <p className="mb-2">Hiện có {rooms.length} phòng trọ.</p>
                            <div className="flex items-center">
                                <FaRegBell className="bg-yellow-500 text-white px-2 text-4xl rounded-full" />
                                <p className="mx-1">Nhận email tin mới</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-red-600 peer-focus:ring-4 peer-focus:ring-white
                                 dark:peer-focus:ring-red-800 dark:bg-gray-700 peer-checked:after:translate-x-full
                                 after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:bg-white
                                 after:rounded-full after:transition-all peer-checked:after:border-white">
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Danh sách phòng */}
                        {rooms.slice(0, visibleRooms).map((room, index) => {
                            let images;
                            try {
                                images = JSON.parse(room.image);
                            } catch (error) {
                                images = room.image;
                            }
                            if (!Array.isArray(images)) images = [images];
                            const imageCount = images.length;

                            // Layout cũ cho 3 phòng đầu (index < 3)
                            if (index < 3) {
                                return (
                                    <div>
                                        <Link key={room.roomId} to={`/Rooms/Details/${room.roomId}`} className="block">
                                            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                                                {/* Xử lý ảnh hiển thị */}
                                                <div className="relative w-full h-52 overflow-hidden rounded-lg">
                                                    {/* Nếu ít hơn 3 ảnh => hiển thị 1 ảnh */}
                                                    {imageCount < 3 ? (
                                                        <img
                                                            src={images[0]}
                                                            alt={room.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : imageCount === 3 ? (
                                                        // Có 3 ảnh => 1 ảnh trái, 2 ảnh phải
                                                        <div className="flex h-full">
                                                            <div className="w-1/2 h-full">
                                                                <img
                                                                    src={images[0]}
                                                                    alt={room.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="w-1/2 flex flex-col">
                                                                <div className="h-1/2">
                                                                    <img
                                                                        src={images[1]}
                                                                        alt={room.title}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="h-1/2">
                                                                    <img
                                                                        src={images[2]}
                                                                        alt={room.title}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // 4 ảnh trở lên => 1 ảnh trái, 3 ảnh phải
                                                        <div className="flex h-full">
                                                            <div className="w-1/2 h-full">
                                                                <img
                                                                    src={images[0]}
                                                                    alt={room.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="w-1/2 flex flex-col">
                                                                <div className="h-1/3">
                                                                    <img
                                                                        src={images[1]}
                                                                        alt={room.title}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="h-1/3">
                                                                    <img
                                                                        src={images[2]}
                                                                        alt={room.title}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="h-1/3 relative">
                                                                    <img
                                                                        src={images[3]}
                                                                        alt={room.title}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    {imageCount > 4 && (
                                                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-semibold">
                                                                            +{imageCount - 4}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Nhãn categoryName */}
                                                    {room.categoryName && (
                                                        <span className="absolute top-2 left-0 bg-red-600 text-white text-sm font-semibold px-3 py-1 z-10 rounded-r-lg">
                                                            {room.categoryName}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Thông tin */}
                                                <div className="p-4 flex flex-col">
                                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{room.title}</h3>
                                                    <p className="text-red-500 font-semibold mb-2">
                                                        {room.price.toLocaleString('vi-VN')} đ • {room.acreage} m²
                                                    </p>
                                                    <p className="text-gray-600 mb-2 flex items-center">
                                                        <FaMapMarkerAlt className="mr-1" /> {room.locationDetail}
                                                    </p>
                                                    <p className="text-gray-500 mb-2 flex items-center">
                                                        {room.description}
                                                    </p>

                                                    <div className="mt-auto flex justify-between items-center border-t pt-2">
                                                        <div className='flex items-center gap-3'>
                                                            {images[0] && (
                                                                <img
                                                                    src={images[0]}
                                                                    alt={room.title}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            )}
                                                            <div className='flex flex-col'>
                                                                <span className='text-black font-semibold'>Đặng Hữu Tú</span>
                                                                <span className='text-gray-500'>đã đăng lên</span>
                                                            </div>
                                                        </div>
                                                        <div className='flex justify-end gap-3 text-2xl'>
                                                            <button className='text-lg bg-green-600 text-white px-2 py-1 rounded-lg flex gap-2' >
                                                                <FaPhoneVolume className='mt-1' />
                                                                0961213137
                                                            </button>
                                                            <span>|</span>
                                                            <button className="text-gray-600 p-2 border border-gray-300 rounded-lg">
                                                                <FaRegHeart />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            } else {
                                // Layout ngang cho phòng thứ 4 trở đi (index >= 3)
                                return (
                                    <Link key={room.roomId} to={`/Rooms/Details/${room.roomId}`} className="block">
                                        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-row">
                                            {/* Ảnh bên trái */}
                                            <div className="w-2/5 relative h-[200px] overflow-hidden">
                                                {imageCount > 0 && (
                                                    <img
                                                        src={images[0]}
                                                        alt={room.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                {room.categoryName && (
                                                    <span className="absolute top-2 left-0 bg-red-600 text-white text-sm font-semibold px-3 py-1 z-10 rounded-r-lg">
                                                        {room.categoryName}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Nội dung bên phải */}
                                            <div className="w-3/5 p-4 flex flex-col">
                                                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{room.title}</h3>
                                                <p className="text-red-500 font-semibold mb-2">
                                                    {room.price.toLocaleString('vi-VN')} đ • {room.acreage} m²
                                                </p>
                                                <p className="text-gray-600 mb-2 flex items-center">
                                                    <FaMapMarkerAlt className="mr-1" /> {room.locationDetail}
                                                </p>
                                                <p className="text-gray-500 mb-2 flex items-center">
                                                    {room.description}
                                                </p>

                                                {/* Hiển thị thêm ảnh nhỏ (nếu muốn) */}
                                                {imageCount > 1 && (
                                                    <div className="flex gap-1 mb-2">
                                                        {images.slice(1, 4).map((img, i) => (
                                                            <div key={i} className="w-1/3 h-16 overflow-hidden">
                                                                <img src={img} alt={`extra-${i}`} className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                        {imageCount > 4 && (
                                                            <div className="w-1/3 h-16 overflow-hidden relative">
                                                                <img src={images[4]} alt="extra-4" className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-sm font-semibold">
                                                                    +{imageCount - 5}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="mt-auto flex justify-between items-center border-t pt-2">
                                                    <div className='flex items-center gap-3'>
                                                        {images[0] && (
                                                            <img
                                                                src={images[0]}
                                                                alt={room.title}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        )}
                                                        <div className='flex flex-col'>
                                                            <span className='text-black font-semibold'>Đặng Hữu Tú</span>
                                                            <span className='text-gray-500'>đã đăng lên</span>
                                                        </div>
                                                    </div>
                                                    <div className='flex justify-end gap-3 text-2xl'>
                                                        <button className='text-lg bg-green-600 text-white px-2 py-1 rounded-lg flex gap-2' >
                                                            <FaPhoneVolume className='mt-1' />
                                                            0961213137
                                                        </button>
                                                        <span>|</span>
                                                        <button className="text-gray-600 p-2 border border-gray-300 rounded-lg">
                                                            <FaRegHeart />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            }

                        })}

                        {/* Nút Xem thêm / Xem tiếp */}
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
                        <FAQList />
                    </div>

                    {/* Sidebar */}
                    <div className="w-1/4 pl-4">
                        <div className="bg-white p-4 rounded shadow mb-4">
                            <h3 className="font-bold mb-2">Lọc theo khoảng giá</h3>
                            <ul>
                                {["Thỏa thuận", "Dưới 1 triệu", "1 - 3 triệu", "3 - 5 triệu", "5 - 10 triệu", "10 - 20 triệu", "20 - 40 triệu", "40 - 70 triệu", "Trên 70 triệu"].map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-4 rounded shadow">
                            <h3 className="font-bold mb-2">Lọc theo diện tích</h3>
                            <ul>
                                {["Dưới 30 m²", "30 - 50 m²", "50 - 80 m²", "80 - 100 m²", "100 - 150 m²", "150 - 200 m²", "200 - 250 m²", "250 - 300 m²", "300 - 500 m²", "Trên 500 m²"].map((item, index) => (
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
