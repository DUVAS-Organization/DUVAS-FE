import React, { useEffect, useState } from 'react';
import { FaCamera, FaMapMarkerAlt, FaRegHeart, FaHeart } from 'react-icons/fa';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthProvider';
import RoomManagementService from '../../Services/User/RoomManagementService';
import PriorityRoomService from '../../Services/Admin/PriorityRoomService';
import CPPRoomsService from '../../Services/Admin/CPPRoomsService';
import { showCustomNotification } from '../Notification';
import { styled } from '@mui/material/styles';
import OtherService from '../../Services/User/OtherService';

const CardItem = styled('div')(({ theme }) => {
    const defaultColor = '#D1D5DB'; // Màu mặc định gray-200

    return {
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        zIndex: 0,
        background: 'white',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',

        '&::before': {
            content: '""',
            position: 'absolute',
            top: '-3px',
            left: '-3px',
            right: '-3px',
            bottom: '-3px',
            zIndex: -1,
            borderRadius: '14px',
            background: 'transparent',
            backgroundSize: '400% 400%',
            opacity: 1,
        },

        '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: `0 0 20px ${defaultColor}55`,
            '&::before': {
                background: `linear-gradient(135deg, ${defaultColor}, transparent, ${defaultColor})`,
                filter: `drop-shadow(0 0 8px ${defaultColor})`,
                animation: 'neon-glow 6s linear infinite',
            },
        },

        '@keyframes neon-glow': {
            '0%': {
                backgroundPosition: '0% 50%',
            },
            '50%': {
                backgroundPosition: '100% 50%',
            },
            '100%': {
                backgroundPosition: '0% 50%',
            },
        },

        ...theme.applyStyles('dark', {
            backgroundColor: '#1A2027',
        }),
    };
});

const RoomsHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [priorityPackages, setPriorityPackages] = useState([]);
    const [cppRooms, setCppRooms] = useState([]);
    const [savedPosts, setSavedPosts] = useState(new Set());
    const [loading, setLoading] = useState(true);
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
        const fetchData = async () => {
            try {
                const [roomsData, priorityData, cppData] = await Promise.all([
                    RoomManagementService.getAvailableRooms(),
                    PriorityRoomService.getPriorityRooms(),
                    CPPRoomsService.getCPPRooms(),
                ]);
                setRooms(roomsData);
                setPriorityPackages(priorityData);
                setCppRooms(cppData);
                setLoading(false);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
                showCustomNotification("error", error.message || "Không thể tải dữ liệu!");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (user && user.userId) {
            fetchSavedPosts();
        }
    }, [user]);

    const fetchSavedPosts = async () => {
        try {
            const data = await OtherService.getSavedPosts(user.userId);
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

    const getPriorityInfo = (roomId) => {
        const priorityRoom = priorityPackages.find(pr => pr.roomId === roomId);
        if (priorityRoom) {
            const currentDate = new Date();
            const startDate = new Date(priorityRoom.startDate);
            const endDate = new Date(priorityRoom.endDate);
            const isActive = currentDate >= startDate && currentDate <= endDate;

            if (isActive) {
                const cppRoom = cppRooms.find(
                    cpp => cpp.categoryPriorityPackageRoomId === priorityRoom.categoryPriorityPackageRoomId
                );
                if (cppRoom) {
                    return {
                        value: cppRoom.categoryPriorityPackageRoomValue || 0,
                        description: getCategoryDescription(cppRoom.categoryPriorityPackageRoomValue),
                        borderColor: getBorderColor(cppRoom.categoryPriorityPackageRoomValue),
                    };
                }
            }
        }
        return {
            value: 0,
            description: "",
            borderColor: "#D1D5DB", // Default gray-200
        };
    };

    const getCategoryDescription = (value) => {
        if (Number(value) > 0) {
            return 'Tin ưu tiên';
        }
        return '';
    };

    const getBorderColor = (value) => {
        if (Number(value) > 0) {
            return '#EF4444'; // red-500
        }
        return '#D1D5DB'; // gray-200
    };

    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const filteredRooms = rooms
        .filter(room => {
            const categoryMatch = categoryQuery ? String(room.categoryRoomId) === categoryQuery : true;
            const priceMatch = room.price >= minPriceQuery && room.price <= maxPriceQuery;
            const areaMatch = room.acreage >= minAreaQuery && room.acreage <= maxAreaQuery;
            return categoryMatch && priceMatch && areaMatch;
        })
        .sort((a, b) => {
            const aPriority = getPriorityInfo(a.roomId).value;
            const bPriority = getPriorityInfo(b.roomId).value;
            return bPriority - aPriority;
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

    if (loading) {
        return (
            <div className="bg-white p-4 flex justify-center">
                <p className="text-black font-semibold">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (!rooms.length) {
        return (
            <div className="bg-white p-4 flex justify-center">
                <p className="text-black font-semibold">Không tìm thấy phòng trống nào.</p>
            </div>
        );
    }

    return (
        <div className="bg-white mt-2 dark:bg-gray-800 dark:text-white">
            <style>
                {`
                    @keyframes contentGlow {
                        0% {
                            backgroundPosition: 0% 50%;
                        }
                        50% {
                            backgroundPosition: 100% 50%;
                        }
                        100% {
                            backgroundPosition: 0% 50%;
                        }
                    }
                    .content-section {
                        transition: background 0.3s ease;
                    }
                    .neumorph-card:hover .content-section {
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))',
                        backgroundSize: '400% 400%',
                        animation: 'contentGlow 6s linear infinite',
                    }
                    .dark .content-section {
                        background: 'transparent',
                    }
                    .dark .neumorph-card:hover .content-section {
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                        backgroundSize: '400% 400%',
                        animation: 'contentGlow 6s linear infinite',
                    }
                `}
            </style>
            <div className="container mx-auto px-4">
                {Object.entries(groupedRooms).map(([category, roomsInCategory]) => {
                    const visibleCount = visibleRoomsByCategory[category] || defaultVisible;
                    return (
                        <div key={category} className="mb-8">
                            <h1 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{category}</h1>
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
                                    const priorityInfo = getPriorityInfo(room.roomId);

                                    return (
                                        <Link key={room.roomId} to={`/Rooms/Details/${room.roomId}`} className="block">
                                            <CardItem
                                                className={`neumorph-card bg-white rounded-lg overflow-hidden h-[415px] flex flex-col dark:bg-gray-800 dark:neumorph-card-dark`}
                                            >
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
                                                <div className="px-4 py-3 flex-1 flex flex-col dark:text-white content-section">
                                                    <p className="text-sm font-semibold bg-red-500 text-white w-20 px-1 rounded-lg">
                                                        {priorityInfo.description}
                                                    </p>
                                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{room.title}</h3>

                                                    <p className="text-red-500 font-semibold mb-2">
                                                        {room.price.toLocaleString('vi-VN')} đ • {room.acreage} m²
                                                    </p>

                                                    <p className="text-gray-600 mb-2 flex items-center truncate max-w-[240px] dark:text-white">
                                                        <FaMapMarkerAlt className="mr-1 absolute" />
                                                        <p className="ml-5">{room.locationDetail}</p>
                                                    </p>
                                                    <div className="mt-auto flex justify-between items-center border-t pt-2">
                                                        <button
                                                            onClick={(e) => toggleSavePost(room.roomId, e)}
                                                            className="text-2xl"
                                                        >
                                                            {isSaved ? (
                                                                <FaHeart className="text-red-500 dark:text-white" />
                                                            ) : (
                                                                <FaRegHeart className="text-gray-600 dark:text-white" />
                                                            )}
                                                        </button>
                                                        <span className="text-gray-600 flex items-center dark:text-white">
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