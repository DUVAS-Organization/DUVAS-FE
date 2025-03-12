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
            const response = await fetch(`https://localhost:8000/api/SavedPosts/${user.userId}`);
            if (!response.ok) throw new Error("Lỗi khi lấy danh sách bài đăng đã lưu!");

            const data = await response.json();
            // Chuyển đổi thời gian về múi giờ VN (+7h) và parse ảnh
            const updatedPosts = data.map((post) => {
                // Parse ngày giờ
                const localSavedAt = new Date(new Date(post.savedAt).getTime() + 7 * 60 * 60 * 1000);

                // Parse ảnh
                let images = [];
                try {
                    images = JSON.parse(post.room.image || "[]");
                } catch {
                    images = [];
                }

                // Tính giá/m2 (nếu cần)
                // Ví dụ: pricePerM2 = (post.room.price / post.room.acreage) / 1e6 => "X tr/m²"
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
            });

            setSavedPosts(updatedPosts);
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách bài đăng:", error);
        }
    };

    // Xóa bài đăng đã lưu
    const removeSavedPost = async (roomId, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const response = await fetch("https://localhost:8000/api/SavedPosts", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.userId, roomId }),
            });

            if (!response.ok) throw new Error("Lỗi khi xóa bài đăng!");

            // Cập nhật danh sách sau khi xóa
            setSavedPosts((prev) => prev.filter((post) => post.roomId !== roomId));
        } catch (error) {
            console.error("Lỗi khi xóa bài đăng:", error);
        }
    };

    // Tính thời gian đã lưu bài đăng
    const timeAgo = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHrs = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHrs / 24);

        if (diffSec < 60) return "Vừa lưu xong";
        if (diffMin < 60) return `Lưu ${diffMin} phút trước`;
        if (diffHrs < 24) return `Lưu ${diffHrs} giờ trước`;
        return `Lưu ${diffDays} ngày trước`;
    };

    return (
        <div className="max-w-2xl  w-2/3 mx-auto p-4 bg-white min-h-screen">
            <h2 className="text-2xl  font-bold mb-2">Tin đăng đã lưu</h2>
            <p className="text-gray-600 mb-4">Tổng số {savedPosts.length} tin đăng</p>

            {savedPosts.length === 0 ? (
                <p className="text-gray-500">Bạn chưa lưu tin đăng nào.</p>
            ) : (
                <div className="space-y-4">
                    {savedPosts.map((post) => {
                        const { roomId, savedAt, room } = post;
                        // Ảnh đầu tiên
                        const firstImage =
                            room.images && room.images.length > 0
                                ? room.images[0]
                                : "https://via.placeholder.com/150";



                        // Tính price hiển thị: "850 triệu" => (price / 1e6).toFixed(0) + " triệu"
                        // const priceTrieu = (room.price / 1e6).toFixed(0); // "850"
                        // pricePerM2 => "2.83" => "2.83 tr/m²"
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
                                    {/* Dòng 1: Tiêu đề */}
                                    <h3 className="font-semibold text-2xl line-clamp-1">
                                        {room.title}
                                    </h3>
                                    {/* Dòng 2: Price - acreage - pricePerM2 */}
                                    <div className="text-red-500 text-xl font-semibold flex items-center">
                                        {room.price.toLocaleString('vi-VN')} đ - {room.acreage} m²{" "}
                                        {/* <p className="text-gray-500 text-lg">  {pricePerM2Str && <>- {pricePerM2Str}</>}</p> */}
                                    </div>
                                    {/* Dòng 3: Location */}
                                    <p className="text-gray-600 text-base flex items-center">
                                        <FaMapMarkerAlt className="mr-1" /> {room.locationDetail}
                                    </p>
                                    {/* Dòng 4: Thời gian */}
                                    <p className="text-gray-400 text-base">
                                        {timeAgo(savedAt)}
                                    </p>
                                </div>

                                {/* Nút xóa */}
                                <button
                                    onClick={(e) => removeSavedPost(roomId, e)}
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
    );
};

export default SavedPostList;
