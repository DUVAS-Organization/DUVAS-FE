import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBed, FaTools } from 'react-icons/fa';

const PostSelection = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center dark:bg-gray-900">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 dark:text-white">
                    Chọn loại bài đăng
                </h2>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => navigate('/Room/Create')}
                        className="flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-150"
                    >
                        <FaBed className="text-xl" />
                        Đăng Phòng
                    </button>
                    <button
                        onClick={() => navigate('/ServiceOwner/ServicePosts/Create')}
                        className="flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-150"
                    >
                        <FaTools className="text-xl" />
                        Đăng Dịch vụ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostSelection;