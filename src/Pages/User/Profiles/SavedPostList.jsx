import React, { useEffect, useState } from "react";
import { FaHeart, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Context/AuthProvider";

const SavedPostList = () => {
    const { user } = useAuth(); // Lấy user từ context
    const [savedPosts, setSavedPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.userId) {
            console.error("Người dùng chưa đăng nhập!");
            return;
        }
        fetchSavedPosts();
    }, [user]);

    // Gọi API lấy danh sách tin đã lưu
    const fetchSavedPosts = async () => {
        try {
            const response = await fetch(`https://apiduvas1.runasp.net/api/SavedPosts/${user.userId}`);
            if (!response.ok) throw new Error("Lỗi khi lấy danh sách bài đăng đã lưu!");

            const data = await response.json();
            // Cập nhật thời gian theo múi giờ VN (+7h) và parse ảnh (chỉ xử lý với tin phòng)
            const updatedPosts = data.map((post) => {
                // Convert savedAt về múi giờ VN
                const localSavedAt = new Date(new Date(post.savedAt).getTime() + 7 * 60 * 60 * 1000);
                // Nếu là tin phòng, parse ảnh và tính price/m²
                if (post.room) {
                    let images = [];
                    try {
                        images = JSON.parse(post.room.image || "[]");
                    } catch {
                        images = [];
                    }
                    const pricePerM2 =
                        post.room.acreage > 0
                            ? ((post.room.price / post.room.acreage) / 1e6).toFixed(2)
                            : null;
                    return {
                        ...post,
                        savedAt: localSavedAt,
                        room: {
                            ...post.room,
                            images,
                            pricePerM2
                        }
                    };
                }
                return { ...post, savedAt: localSavedAt };
            });

            setSavedPosts(updatedPosts);
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách bài đăng:", error);
        }
    };

    // Xóa bài đăng đã lưu
    // Tham số isRoom: true nếu tin là tin phòng, false nếu tin dịch vụ.
    const removeSavedPost = async (id, isRoom, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const payload = { userId: user.userId };
            if (isRoom) {
                payload.roomId = id;
            } else {
                payload.servicePostId = id;
            }
            const response = await fetch("https://apiduvas1.runasp.net/api/SavedPosts", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Lỗi khi xóa bài đăng!");

            setSavedPosts((prev) =>
                prev.filter((post) => {
                    if (isRoom) {
                        return post.roomId !== id;
                    } else {
                        return post.servicePostId !== id;
                    }
                })
            );
        } catch (error) {
            console.error("Lỗi khi xóa bài đăng:", error);
        }
    };

    // Tính thời gian đã lưu bài đăng
    const formatTimeAgo = (savedAt) => {
        const savedTime = new Date(savedAt);
        const now = new Date();
        const diffInSeconds = Math.floor((now - savedTime) / 1000);
        if (diffInSeconds < 60) return "Vừa lưu xong";
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `Vừa lưu ${diffInMinutes} phút trước`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Vừa lưu ${diffInHours} giờ trước`;
        return savedTime.toLocaleString("vi-VN");
    };

    // Phân loại tin: tin phòng và tin dịch vụ
    const roomPosts = savedPosts.filter((post) => post.room !== null);
    const servicePosts = savedPosts.filter((post) => post.servicePost !== null);

    return (
        <div className="max-w-2xl w-2/3 mx-auto p-4 bg-white min-h-screen">
            <h2 className="text-2xl font-bold mb-2">Tin đăng đã lưu</h2>
            <p className="text-gray-600 mb-4">Tổng số {savedPosts.length} tin đăng</p>

            {savedPosts.length === 0 ? (
                <p className="text-gray-500">Bạn chưa lưu tin đăng nào.</p>
            ) : (
                <div className="space-y-4">
                    {roomPosts.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Tin Phòng trọ – Căn hộ</h3>
                            {roomPosts.map((post) => {
                                const { roomId, savedAt, room } = post;
                                // Ảnh đầu tiên
                                const firstImage =
                                    room.images && room.images.length > 0
                                        ? room.images[0]
                                        : "https://via.placeholder.com/150";
                                const pricePerM2Str = room.pricePerM2
                                    ? `${room.pricePerM2} tr/m²`
                                    : "";
                                return (
                                    <div
                                        key={roomId}
                                        className="relative flex border rounded-lg shadow-md overflow-hidden cursor-pointer"
                                        onClick={() => navigate(`/Rooms/Details/${roomId}`)}
                                    >
                                        {/* Ảnh */}
                                        <img
                                            src={firstImage}
                                            alt={room.title}
                                            className="w-48 h-32 object-cover"
                                        />

                                        {/* Nội dung */}
                                        <div className="p-3 flex-1">
                                            <h3 className="font-semibold text-2xl line-clamp-1">
                                                {room.title}
                                            </h3>
                                            <div className="text-red-500 text-xl font-semibold flex items-center">
                                                {room.price.toLocaleString('vi-VN')} đ - {room.acreage} m²{" "}
                                                {pricePerM2Str && <>- {pricePerM2Str}</>}
                                            </div>
                                            <div className="text-gray-600 text-base flex items-center truncate max-w-[400px]">
                                                <FaMapMarkerAlt className="mr-1" />
                                                <span>{room.locationDetail}</span>
                                            </div>
                                            <p className="text-gray-400 text-base">
                                                {post.savedAt ? formatTimeAgo(post.savedAt) : "Không xác định"}
                                            </p>
                                        </div>

                                        {/* Nút xóa */}
                                        <button
                                            onClick={(e) => removeSavedPost(roomId, true, e)}
                                            className="absolute right-2 top-2 p-1 text-black"
                                        >
                                            <FaHeart className="text-red-500 text-xl" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {servicePosts.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Tin Dịch Vụ</h3>
                            {servicePosts.map((post) => {
                                const { servicePostId, savedAt, servicePost } = post;
                                // Parse ảnh cho dịch vụ
                                let images = [];
                                try {
                                    images = JSON.parse(servicePost.image || "[]");
                                } catch {
                                    images = [];
                                }
                                const firstImage =
                                    images && images.length > 0 ? images[0] : "https://via.placeholder.com/150";
                                return (
                                    <div
                                        key={servicePostId}
                                        className="relative flex border rounded-lg shadow-md overflow-hidden cursor-pointer"
                                        onClick={() => navigate(`/ServicePosts/Details/${servicePostId}`)}
                                    >
                                        {/* Ảnh */}
                                        <img
                                            src={firstImage}
                                            alt={servicePost.title}
                                            className="w-48 h-32 object-cover"
                                        />

                                        {/* Nội dung */}
                                        <div className="p-3 flex-1">
                                            <h3 className="font-semibold text-2xl line-clamp-1">
                                                {servicePost.title}
                                            </h3>
                                            <div className="text-red-500 text-xl font-semibold">
                                                {servicePost.price.toLocaleString('vi-VN')} đ
                                            </div>
                                            <div className="text-gray-600 text-base flex items-center truncate max-w-[400px]">
                                                <FaMapMarkerAlt className="mr-1" />
                                                <span>{servicePost.location}</span>
                                            </div>
                                            <p className="text-gray-400 text-base">
                                                {post.savedAt ? formatTimeAgo(post.savedAt) : "Không xác định"}
                                            </p>
                                        </div>

                                        {/* Nút xóa */}
                                        <button
                                            onClick={(e) => removeSavedPost(servicePostId, false, e)}
                                            className="absolute right-2 top-2 p-1 text-black"
                                        >
                                            <FaHeart className="text-red-500 text-xl" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SavedPostList;
