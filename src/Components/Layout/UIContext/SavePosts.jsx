import React, { useState, useEffect, useRef } from "react";
import { FaRegHeart } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { BiBookHeart } from "react-icons/bi";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../Context/AuthProvider";
import { useUI } from "./UIContext";
import { useRealtime } from "../../../Context/RealtimeProvider";
import OtherService from "../../../Services/User/OtherService";

const SavedPostList = () => {
    const { openDropdown, toggleDropdown } = useUI();
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [savedPosts, setSavedPosts] = useState([]);
    const dropdownRef = useRef(null);
    const { connectSocket, onEvent, offEvent, isConnected } = useRealtime();

    // Kết nối SignalR và lắng nghe sự kiện
    useEffect(() => {
        if (user) {
            connectSocket(user.userId);

            const handleSavedPostAdded = (message) => {
                const { data } = message;
                if (String(data.userId) === String(user.userId)) { // Chuyển cả hai thành chuỗi
                    setSavedPosts((prev) => {
                        const exists = prev.some(
                            (p) =>
                                (p.roomId && p.roomId === data.roomId) ||
                                (p.servicePostId && p.servicePostId === data.servicePostId)
                        );
                        if (!exists) {
                            return [...prev, data];
                        }
                        return prev;
                    });
                }
            };

            const handleSavedPostRemoved = (message) => {
                const { data } = message;
                if (String(data.userId) === String(user.userId)) { // Chuyển cả hai thành chuỗi
                    setSavedPosts((prev) =>
                        prev.filter(
                            (p) =>
                                !(
                                    (p.roomId && p.roomId === data.roomId) ||
                                    (p.servicePostId && p.servicePostId === data.servicePostId)
                                )
                        )
                    );
                }
            };

            onEvent("savedPostAdded", handleSavedPostAdded);
            onEvent("savedPostRemoved", handleSavedPostRemoved);

            return () => {
                onEvent("savedPostAdded", handleSavedPostAdded);
                onEvent("savedPostRemoved", handleSavedPostRemoved);
            };
        }
    }, [user, connectSocket, onEvent, offEvent]);

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
            const data = await OtherService.getSavedPosts(user.userId);
            setSavedPosts(data);
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách bài đã lưu:", error);
        }
    };

    const removeSavedPost = async (post, e) => {
        e.stopPropagation();
        try {
            const roomId = post.room ? post.roomId : null;
            const servicePostId = post.servicePost ? post.servicePostId : null;
            const data = await OtherService.toggleSavePostRemove(user.userId, roomId, servicePostId);

            if (data.status === "removed") {
                setSavedPosts((prev) =>
                    prev.filter(
                        (p) =>
                            !(
                                (p.room && roomId && p.roomId === roomId) ||
                                (p.servicePost && servicePostId && p.servicePostId === servicePostId)
                            )
                    )
                );
            }
        } catch (error) {
            console.error("❌ Lỗi khi xóa bài đã lưu:", error);
        }
    };

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

    const handleToggleDropdown = () => {
        if (openDropdown !== "savedPosts") {
            toggleDropdown("savedPosts");
        } else {
            toggleDropdown(null);
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative flex flex-col items-center" ref={dropdownRef}>
            <button onClick={handleToggleDropdown} className="relative">
                <FaRegHeart className="text-2xl text-black" />
                {savedPosts.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {savedPosts.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-10 w-96 h-80 bg-white shadow-lg rounded-md border border-gray-200 flex flex-col">
                    <div className="px-4 py-2 border-b text-lg font-semibold text-center">
                        Tin đăng đã lưu
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {savedPosts.length > 0 ? (
                            savedPosts.map((post, index) => {
                                let title = "";
                                let location = "";
                                let image = "";
                                let detailLink = "#";

                                if (post.room) {
                                    title = post.room.title || "Không có tiêu đề";
                                    location = post.room.locationDetail || "Không xác định";
                                    image = post.room.image;
                                    detailLink = `/Rooms/Details/${post.roomId}`;
                                } else if (post.servicePost) {
                                    title = post.servicePost.title || "Không có tiêu đề";
                                    location = post.servicePost.location || "Không xác định";
                                    image = post.servicePost.image;
                                    detailLink = `/ServicePosts/Details/${post.servicePostId}`;
                                } else {
                                    return null;
                                }

                                let images = [];
                                if (typeof image === "string") {
                                    try {
                                        images = JSON.parse(image);
                                    } catch (err) {
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