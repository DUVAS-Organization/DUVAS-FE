import React, { useState, useEffect, useRef } from "react";
import { FaRegHeart } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { BiBookHeart } from "react-icons/bi";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../Context/AuthProvider";
import { useUI } from "./UIContext";

const SavePosts = () => {
    const { openDropdown, toggleDropdown } = useUI();
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [savedPosts, setSavedPosts] = useState([]);
    const dropdownRef = useRef(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (user) {
            fetchSavedPosts();
        }
    }, [user]);

    // Lấy danh sách bài đã lưu
    const fetchSavedPosts = async () => {
        try {
            const response = await fetch(`https://localhost:8000/api/SavedPosts`);
            if (!response.ok) throw new Error("Lỗi khi lấy danh sách bài đã lưu");
            const data = await response.json();
            setSavedPosts(data);
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách bài đã lưu:", error);
        }
    };

    // Xóa bài đã lưu
    const removeSavedPost = async (roomId, e) => {
        e.stopPropagation();
        try {
            const response = await fetch("https://localhost:8000/api/SavedPosts", {
                method: "POST", // hoặc DELETE tùy API
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId }),
            });
            fetchSavedPosts();
        } catch (error) {
            console.error("❌ Lỗi khi xóa bài đã lưu:", error);
        }
    };

    return (
        <div className="relative flex flex-col items-center" ref={dropdownRef}>
            {/* Nút mở danh sách tin đã lưu */}
            <button
                onClick={() => {
                    if (openDropdown !== "savedPosts") {
                        toggleDropdown("savedPosts");
                    } else {
                        toggleDropdown(null);
                    }
                    setIsOpen(!isOpen);
                }}
                className="relative"
            >
                <FaRegHeart className="text-2xl text-black" />
                {savedPosts.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {savedPosts.length}
                    </span>
                )}
            </button>

            {/* Hộp thoại danh sách tin đã lưu */}
            {isOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-10 w-96 h-80 bg-white shadow-lg rounded-md border border-gray-200 flex flex-col">
                    <div className="px-4 py-2 border-b text-lg font-semibold text-center">
                        Tin đăng đã lưu
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {savedPosts.length > 0 ? (
                            savedPosts.map((post) => {
                                const title = post.title || "Không có tiêu đề";
                                const owner = post.owner || "Không xác định";
                                let images = [];
                                if (typeof post.image === "string") {
                                    try {
                                        images = JSON.parse(post.image);
                                    } catch (err) {
                                        console.error("Lỗi parse ảnh:", err);
                                        images = [];
                                    }
                                }
                                const firstImg =
                                    Array.isArray(images) && images.length > 0
                                        ? images[0]
                                        : "https://via.placeholder.com/50";

                                return (
                                    <Link
                                        to={`/Rooms/Details/${post.roomId}`}
                                        key={post.roomId}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-md relative"
                                    >
                                        <img
                                            src={firstImg}
                                            alt="Phòng trọ"
                                            className="w-12 h-12 rounded-md object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Chủ phòng: {owner}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeSavedPost(post.roomId, e);
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

export default SavePosts;
