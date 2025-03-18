import React, { useState, useEffect, useRef } from "react";
import { FaRegHeart } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { BiBookHeart } from "react-icons/bi";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../Context/AuthProvider";
// Nếu bạn có context UI riêng để mở dropdown, import vào. 
// Hoặc bỏ qua nếu bạn không dùng:
import { useUI } from "./UIContext";

const SavedPostList = () => {
    const { openDropdown, toggleDropdown } = useUI(); // nếu không dùng, bỏ dòng này
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [savedPosts, setSavedPosts] = useState([]);
    const dropdownRef = useRef(null);

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Lấy danh sách bài đã lưu
    useEffect(() => {
        if (user) {
            fetchSavedPosts();
        }
    }, [user]);

    const fetchSavedPosts = async () => {
        try {
            const response = await fetch(`https://localhost:8000/api/SavedPosts/${user.userId}`);
            if (!response.ok) throw new Error("Lỗi khi lấy danh sách bài đã lưu");
            const data = await response.json();
            setSavedPosts(data);
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách bài đã lưu:", error);
        }
    };

    // Xoá bài đã lưu (toggle)
    const removeSavedPost = async (post, e) => {
        e.stopPropagation();
        try {
            // Tạo payload tương ứng với kiểu bài đăng
            const payload = { userId: user.userId };
            if (post.room) {
                payload.roomId = post.roomId;          // Giữ logic cũ cho Room
            } else if (post.servicePost) {
                payload.servicePostId = post.servicePostId; // Bổ sung cho ServicePost
            }

            const response = await fetch("https://localhost:8000/api/SavedPosts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (data.status === "removed") {
                // Lọc bỏ bài vừa xoá khỏi state
                setSavedPosts((prev) =>
                    prev.filter(
                        (p) =>
                            !(
                                (p.room && payload.roomId && p.roomId === payload.roomId) ||
                                (p.servicePost && payload.servicePostId && p.servicePostId === payload.servicePostId)
                            )
                    )
                );
            }
        } catch (error) {
            console.error("❌ Lỗi khi xóa bài đã lưu:", error);
        }
    };

    // Hàm format thời gian hiển thị
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

    // Toggle dropdown
    const handleToggleDropdown = () => {
        // Nếu có dùng context UI
        if (openDropdown !== "savedPosts") {
            toggleDropdown("savedPosts");
        } else {
            toggleDropdown(null);
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative flex flex-col items-center" ref={dropdownRef}>
            {/* Nút mở dropdown */}
            <button onClick={handleToggleDropdown} className="relative">
                <FaRegHeart className="text-2xl text-black" />
                {savedPosts.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {savedPosts.length}
                    </span>
                )}
            </button>

            {/* Nội dung dropdown */}
            {isOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-10 w-96 h-80 bg-white shadow-lg rounded-md border border-gray-200 flex flex-col">
                    <div className="px-4 py-2 border-b text-lg font-semibold text-center">
                        Tin đăng đã lưu
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {savedPosts.length > 0 ? (
                            savedPosts.map((post, index) => {
                                // Tách dữ liệu
                                let title = "";
                                let location = "";
                                let image = "";
                                let detailLink = "#";

                                // Bài đăng là Room
                                if (post.room) {
                                    title = post.room.title || "Không có tiêu đề";
                                    location = post.room.locationDetail || "Không xác định";
                                    image = post.room.image;  // mảng JSON hoặc URL
                                    detailLink = `/Rooms/Details/${post.roomId}`;
                                }
                                // Bài đăng là ServicePost
                                else if (post.servicePost) {
                                    title = post.servicePost.title || "Không có tiêu đề";
                                    location = post.servicePost.location || "Không xác định";
                                    image = post.servicePost.image;
                                    detailLink = `/ServicePosts/Details/${post.servicePostId}`;
                                }
                                else {
                                    // Nếu cả room và servicePost đều null => Không hiển thị
                                    return null;
                                }

                                // Parse ảnh
                                let images = [];
                                if (typeof image === "string") {
                                    try {
                                        images = JSON.parse(image); // nếu là chuỗi JSON
                                    } catch (err) {
                                        // Nếu parse lỗi, coi như 1 URL
                                        images = [image];
                                    }
                                }
                                const firstImg =
                                    Array.isArray(images) && images.length > 0
                                        ? images[0]
                                        : "https://via.placeholder.com/50";

                                return (
                                    <Link
                                        to={detailLink}
                                        key={index}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-md relative"
                                    >
                                        <img
                                            src={firstImg}
                                            alt="Ảnh bài đăng"
                                            className="w-12 h-12 rounded-md object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800 truncate max-w-[280px]">
                                                {title}
                                            </p>
                                            <p className="text-xs text-gray-500 font-semibold truncate max-w-[250px]">
                                                {location}
                                            </p>
                                            <p className="text-xs text-gray-500 italic">
                                                {post.savedAt ? formatTimeAgo(post.savedAt) : "Không xác định"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeSavedPost(post, e);
                                            }}
                                            className="absolute right-2 p-1 text-black"
                                        >
                                            <MdClose className="text-xl" />
                                        </button>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                                <BiBookHeart className="text-9xl mb-4 p-3 bg-gray-200 rounded-full" />
                                <p className="mt-1 flex items-center gap-1">
                                    Bấm <FaRegHeart className="text-red-500" /> để lưu tin
                                </p>
                                <p>và xem lại tin đã lưu tại đây</p>
                            </div>
                        )}
                    </div>

                    {savedPosts.length > 0 && (
                        <div className="p-3 border-t text-center">
                            <button
                                onClick={() => navigate("/SavedPosts")}
                                className="text-red-500 text-sm font-medium hover:underline"
                            >
                                Xem tất cả →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SavedPostList;
