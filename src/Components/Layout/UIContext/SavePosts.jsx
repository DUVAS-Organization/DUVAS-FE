import React, { useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { useUI } from "./UIContext";
import useOutsideClick from "./useOutsideClick";
import { useNavigate } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { BiBookHeart } from "react-icons/bi";

const savedPostsData = [
    {
        id: 1,
        image: "https://via.placeholder.com/50",
        title: "Phòng trọ tiện nghi có gác, thang máy ngay...",
        time: "Vừa lưu xong",
    },
    {
        id: 2,
        image: "https://via.placeholder.com/50",
        title: "Phòng trọ mini full NT Bình Thạnh, có thang...",
        time: "Vừa lưu xong",
    },
    {
        id: 3,
        image: "https://via.placeholder.com/50",
        title: "Chính chủ cần cho thuê phòng ở hoặc kinh...",
        time: "Vừa lưu xong",
    },
    {
        id: 4,
        image: "https://via.placeholder.com/50",
        title: "Căn hộ dịch vụ trung tâm Quận 1...",
        time: "Vừa lưu xong",
    },
];

const SavePosts = () => {
    const { openDropdown, toggleDropdown } = useUI();
    const isOpen = openDropdown === "savedPosts";
    const dropdownRef = useOutsideClick(() => {
        if (isOpen) toggleDropdown(null);
    });

    const navigate = useNavigate();
    const [savedPosts, setSavedPosts] = useState(savedPostsData);

    const handleRemovePost = (postId) => {
        setSavedPosts((prev) => prev.filter((post) => post.id !== postId));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => toggleDropdown("savedPosts")} className="mt-2 relative">
                <FaRegHeart className="text-2xl mr-2 font-thin" />
                {savedPosts.length > 0 && (
                    <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {savedPosts.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-96 h-80 bg-white shadow-lg 
                rounded-md border border-gray-200 flex flex-col">
                    {/* Tiêu đề cố định */}
                    <div className="px-4 py-1 border-b text-lg font-semibold text-center">
                        Tin đăng đã lưu
                    </div>

                    {/* Danh sách tin đã lưu hoặc hiển thị khi không có tin */}
                    <div className="flex-1 overflow-y-auto">
                        {savedPosts.length > 0 ? (
                            savedPosts.slice(0, 3).map((post) => (
                                <div
                                    key={post.id}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-md relative group"
                                >
                                    <img src={post.image} alt="Phòng trọ" className="w-12 h-12 rounded-md object-cover" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800 truncate">{post.title}</p>
                                        <p className="text-xs text-gray-500">{post.time}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemovePost(post.id)}
                                        className="absolute right-2 p-1 text-black opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MdClose className="text-lg" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                                <BiBookHeart className="text-9xl mb-4 p-3 bg-gray-200 rounded-full" />
                                <p className=" mt-1 flex items-center gap-1">
                                    Bấm <FaRegHeart />để lưu tin
                                </p>
                                <p className=""> và xem lại tin đã lưu tại đây</p>
                            </div>
                        )}
                    </div>

                    {/* Nút xem tất cả cố định */}
                    <div className="p-3 border-t text-center">
                        {savedPosts.length > 0 && (
                            <button
                                onClick={() => navigate("/SavedPosts")}
                                className="text-red-500 text-sm font-medium hover:underline"
                            >
                                Xem tất cả →
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavePosts;
