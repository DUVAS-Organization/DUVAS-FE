import React, { useEffect, useState } from 'react';
import { FaCamera, FaMapMarkerAlt, FaRegHeart, FaHeart } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthProvider';
import RoomService from '../../Services/User/RoomService';

const RoomsHome = () => {
    const { user } = useAuth(); // Lấy user từ context
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [visibleRooms, setVisibleRooms] = useState(4);
    const [savedPosts, setSavedPosts] = useState(new Set()); // Dùng Set để tối ưu lưu trữ

    // Lấy danh sách phòng khi component mount
    useEffect(() => {
        fetchRooms();
    }, []);

    // Nếu user đăng nhập => Lấy danh sách phòng đã lưu
    useEffect(() => {
        if (user && user.userId) {
            fetchSavedPosts();
        }
    }, [user]);

    // Lấy danh sách phòng
    const fetchRooms = async () => {
        try {
            const data = await RoomService.getRooms();
            setRooms(data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng:', error);
        }
    };

    // Lấy danh sách bài đăng đã lưu của user
    const fetchSavedPosts = async () => {
        try {
            const response = await fetch(`https://localhost:8000/api/SavedPosts/${user.userId}`);
            if (!response.ok) throw new Error("Lỗi khi lấy danh sách bài đã lưu!");
            const data = await response.json();
            const savedRoomIds = new Set(data.map(item => item.roomId)); // Dùng Set để tối ưu
            setSavedPosts(savedRoomIds);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bài đã lưu:", error);
        }
    };

    // Xử lý lưu/bỏ lưu bài đăng
    const toggleSavePost = async (roomId, e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || !roomId) {
            alert("Bạn cần đăng nhập để lưu bài.");
            return;
        }

        try {
            const response = await fetch("https://localhost:8000/api/SavedPosts/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.userId, roomId: parseInt(roomId) }),
            });

            if (!response.ok) {
                throw new Error("Lỗi khi lưu/xóa bài đăng");
            }

            const result = await response.json();

            // Cập nhật state dựa trên kết quả API
            setSavedPosts((prevSaved) => {
                const newSaved = new Set(prevSaved);
                if (result.status === "removed") {
                    newSaved.delete(parseInt(roomId));
                } else if (result.status === "saved") {
                    newSaved.add(parseInt(roomId));
                }
                return newSaved;
            });
        } catch (error) {
            console.error("Lỗi khi lưu / xóa bài:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại.");
        }
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

                    const isSaved = savedPosts.has(room.roomId); // Kiểm tra có trong Set không

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
                            </div>
                        </Link>
                    );
                })}
            </div>

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
