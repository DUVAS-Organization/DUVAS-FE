import React, { useEffect, useState } from 'react';
import { FaCamera, FaMapMarkerAlt, FaRegHeart, FaHeart } from 'react-icons/fa';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthProvider';
import RoomManagementService from '../../Services/User/RoomManagementService';
import { showCustomNotification } from '../Notification';
import { styled } from '@mui/material/styles';
import OtherService from '../../Services/User/OtherService';

const CardItem = styled('div')(({ theme }) => ({
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    boxShadow: theme.shadows[3],
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: theme.shadows[6],
    },
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
}));

const RoomsHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [savedPosts, setSavedPosts] = useState(new Set());
    const defaultVisible = 4;
    const [visibleRoomsByCategory, setVisibleRoomsByCategory] = useState({});

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const categoryQuery = queryParams.get("category") || "";
    const minPriceQuery = queryParams.get("minPrice") ? Number(queryParams.get("minPrice")) : 0;
    const maxPriceQuery = queryParams.get("maxPrice") ? Number(queryParams.get("maxPrice")) : Infinity;
    const minAreaQuery = queryParams.get("minArea") ? Number(queryParams.get("minArea")) : 0;
    const maxAreaQuery = queryParams.get("maxArea") ? Number(queryParams.get("maxArea")) : Infinity;

    const categoryMap = {
        1: "Phòng trọ",
        2: "Căn hộ",
        3: "Nhà nguyên căn",
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        if (user && user.userId) {
            fetchSavedPosts();
        }
    }, [user]);

    const fetchRooms = async () => {
        try {
            const data = await RoomManagementService.getAvailableRooms();
            setRooms(data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng trống:', error);
            showCustomNotification("error", error.message || "Không thể tải danh sách phòng!");
        }
    };

    const fetchSavedPosts = async () => {
        try {
            const response = await OtherService.getSavedPosts(user.userId);
            if (!response.ok) throw new Error("Lỗi khi lấy danh sách bài đã lưu!");
            const data = await response.json();
            const savedRoomIds = new Set(data.map(item => item.roomId));
            setSavedPosts(savedRoomIds);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bài đã lưu:", error);
        }
    };

    const toggleSavePost = async (roomId, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user || !roomId) {
            showCustomNotification("error", "Bạn cần đăng nhập để lưu tin!");
            return;
        }
        try {
            const result = await OtherService.toggleSavePost(user.userId, roomId);
            setSavedPosts((prevSaved) => {
                const newSaved = new Set(prevSaved);
                if (result.status === "removed") {
                    newSaved.delete(parseInt(roomId));
                } else if (result.status === "saved") {
                    newSaved.add(parseInt(roomId));
                }
                return newSaved;
            });
            if (result.status === "saved") {
                showCustomNotification("success", "Lưu tin thành công!");
            }
        } catch (error) {
            console.error("Lỗi khi lưu / xóa bài:", error);
            showCustomNotification("error", "Đã xảy ra lỗi, vui lòng thử lại!");
        }
    };

    const filteredRooms = rooms.filter(room => {
        const categoryMatch = categoryQuery ? String(room.categoryRoomId) === categoryQuery : true;
        const priceMatch = room.price >= minPriceQuery && room.price <= maxPriceQuery;
        const areaMatch = room.acreage >= minAreaQuery && room.acreage <= maxAreaQuery;
        return categoryMatch && priceMatch && areaMatch;
    });

    let groupedRooms;
    if (categoryQuery) {
        const groupName = categoryMap[filteredRooms[0]?.categoryRoomId] || "Khác";
        groupedRooms = { [groupName]: filteredRooms };
    } else {
        groupedRooms = filteredRooms.reduce((acc, room) => {
            const category = categoryMap[room.categoryRoomId] || "Khác";
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(room);
            return acc;
        }, {});
    }

    if (!rooms.length) {
        return (
            <div className="bg-white p-4 flex justify-center">
                <p className="text-black font-semibold">Không tìm thấy phòng trống nào.</p>
            </div>
        );
    }

    return (
        <div className="bg-white mt-2">
            <div className="container mx-auto px-4">
                {Object.entries(groupedRooms).map(([category, roomsInCategory]) => {
                    const visibleCount = visibleRoomsByCategory[category] || defaultVisible;
                    return (
                        <div key={category} className="mb-8">
                            <h1 className="text-xl font-bold mb-4 text-gray-800">{category}</h1>
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                                {roomsInCategory.slice(0, visibleCount).map((room) => {
                                    let images;
                                    try {
                                        images = JSON.parse(room.image);
                                    } catch (error) {
                                        images = room.image;
                                    }
                                    const imageCount = Array.isArray(images) ? images.length : 1;
                                    const firstImage = Array.isArray(images) ? images[0] : images;
                                    const isSaved = savedPosts.has(room.roomId);
                                    const categoryName = categoryMap[room.categoryRoomId] || "Khác";
                                    return (
                                        <Link key={room.roomId} to={`/Rooms/Details/${room.roomId}`} className="block">
                                            <CardItem className="bg-white rounded-lg shadow-md overflow-hidden h-[400px] flex flex-col">
                                                {room.image && room.image !== '' && (
                                                    <div className="relative w-full h-52 rounded-lg overflow-hidden">
                                                        <img
                                                            src={firstImage}
                                                            alt={room.title}
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                        />
                                                        <span className="absolute top-2 left-0 bg-red-600 text-white text-sm font-semibold px-3 py-1 z-10 rounded-r-lg">
                                                            {categoryName}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="p-4 flex-1 flex flex-col">
                                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{room.title}</h3>
                                                    <p className="text-red-500 font-semibold mb-2">
                                                        {room.price.toLocaleString('vi-VN')} đ • {room.acreage} m²
                                                    </p>
                                                    <p className="text-gray-600 mb-2 flex items-center truncate max-w-[240px]">
                                                        <FaMapMarkerAlt className="mr-1 absolute" />
                                                        <p className="ml-5">{room.locationDetail}</p>
                                                    </p>
                                                    <div className="mt-auto flex justify-between items-center border-t pt-2">
                                                        <button
                                                            onClick={(e) => toggleSavePost(room.roomId, e)}
                                                            className="text-2xl"
                                                        >
                                                            {isSaved ? (
                                                                <FaHeart className="text-red-500" />
                                                            ) : (
                                                                <FaRegHeart className="text-gray-600" />
                                                            )}
                                                        </button>
                                                        <span className="text-gray-600 flex items-center">
                                                            <FaCamera className="mr-1" /> {imageCount}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardItem>
                                        </Link>
                                    );
                                })}
                            </div>
                            {visibleCount < roomsInCategory.length && (
                                <div className="flex justify-center mt-6">
                                    <button
                                        onClick={() => setVisibleRoomsByCategory(prev => ({
                                            ...prev,
                                            [category]: (prev[category] || defaultVisible) + 4,
                                        }))}
                                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                                    >
                                        Xem thêm
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RoomsHome;