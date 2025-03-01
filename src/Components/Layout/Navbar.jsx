import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthProvider';
import { NavLink } from 'react-router-dom';
import Image_Logo from '../../Assets/Images/logo2.png'
import Sidebar from './Sidebar';
import { FaBook, FaUserTie, FaGlobe, FaLock, FaSignOutAlt,FaUsers, FaFacebookMessenger } from 'react-icons/fa';
import { FaHandHoldingDollar, FaMessage } from "react-icons/fa6";

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (user?.role === 'Admin') {
        return <Sidebar />;
    }
    const handleMouseEnter = () => {
        setDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        setDropdownOpen(false);
    };

    // Lấy chữ cái đầu của username
    const getInitial = (username) => {
        return username ? username.charAt(0).toUpperCase() : '';
    };

    return (
        <nav className="sticky top-0 z-50 font-sans transition duration-500 bg-white shadow-md">
            <div className="max-w-full px-2 mx-auto sm:px-4 lg:px-8">
                <div className="relative flex items-center h-16">
                    <div className="flex items-center justify-between flex-1">
                        <div className="flex-shrink-0">
                            <img
                                src={Image_Logo}
                                alt="DUVAS"
                                className="max-w-[110px] h-auto"
                            />
                        </div>
                        <div className="hidden sm:block sm:ml-6">
                            <div className="flex space-x-4">
                                <NavLink to="/" className="px-3 py-2 text-base font-medium text-gray-800 rounded-md">
                                    Trang chủ
                                </NavLink>
                                <NavLink to="/Rooms" className="px-3 py-2 text-base font-medium text-gray-800 rounded-md">
                                    Nhà trọ cho thuê
                                </NavLink>
                                <NavLink to="/Projects" className="px-3 py-2 text-base font-medium text-gray-800 rounded-md">
                                    Tin tức
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden ml-auto space-x-4 sm:flex">
                            {user ? (
                                <>
                                    <div
                                        className="relative flex items-center"
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {/* Hiển thị ảnh đại diện hoặc chữ cái đầu */}
                                        {user.ProfilePicture ? (
                                            <img
                                                src={user.ProfilePicture}
                                                alt={`${user.username}'s Profile`}
                                                className="object-cover w-8 h-8 border border-gray-300 rounded-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-8 h-8 bg-gray-200 border border-gray-300 rounded-full">
                                                <span className="font-bold text-gray-800">
                                                    {getInitial(user.username)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Hiển thị tên người dùng */}
                                        <button
                                            className="flex items-center px-3 py-2 text-base font-medium text-gray-800 rounded-md"
                                        >
                                            {user.username}
                                        </button>

                                        {/* Dropdown menu */}
                                        {dropdownOpen && (
                                            <div className="absolute right-0 w-64 mt-2 bg-white rounded-md shadow-lg top-8 ">
                                                <div className="px-4 py-2 text-base text-gray-800">
                                                    <NavLink
                                                        to="/Overview"
                                                        className="flex items-center px-4 py-2 space-x-2 text-gray-800 rounded hover:bg-red-500 hover:text-white whitespace-nowrap"
                                                    >
                                                        <FaGlobe />
                                                        <span>Tổng quan</span>
                                                    </NavLink>
                                                    <NavLink
                                                        to="/Message"
                                                        className="flex items-center px-4 py-2 space-x-2 text-gray-800 rounded hover:bg-red-500 hover:text-white whitespace-nowrap"
                                                    >
                                                        <FaFacebookMessenger />
                                                        <span>Tin nhắn</span>
                                                    </NavLink>
                                                    <NavLink
                                                        to="/ServicePost"
                                                        className="flex items-center px-4 py-2 space-x-2 text-gray-800 rounded hover:bg-red-500 hover:text-white whitespace-nowrap"
                                                    >
                                                        <FaBook />
                                                        <span>Quản lý tin đăng</span>
                                                    </NavLink>
                                                    <NavLink
                                                        to="/ServicePost"
                                                        className="flex items-center px-4 py-2 space-x-2 text-gray-800 rounded hover:bg-red-500 hover:text-white whitespace-nowrap"
                                                    >
                                                        <FaUsers />
                                                        <span>Gói ưu tiên</span>
                                                    </NavLink>
                                                    <NavLink
                                                        to="/Profile?tab=edit"
                                                        className="flex items-center px-4 py-2 space-x-2 text-gray-800 rounded hover:bg-red-500 hover:text-white whitespace-nowrap"
                                                    >
                                                        <FaUserTie />
                                                        <span>Chỉnh Sửa thông tin</span>
                                                    </NavLink>
                                                    <NavLink
                                                        to="/Profile?tab=settings"
                                                        className="flex items-center px-4 py-2 space-x-2 text-gray-800 rounded hover:bg-red-500 hover:text-white whitespace-nowrap"
                                                    >
                                                        <FaLock />
                                                        <span>Thay đổi mật khẩu</span>
                                                    </NavLink>
                                                    <NavLink
                                                        to="/Moneys"
                                                        className="flex items-center px-4 py-2 space-x-2 text-gray-800 rounded hover:bg-red-500 hover:text-white whitespace-nowrap"
                                                    >
                                                        <FaHandHoldingDollar />
                                                        <span>Nạp tiền</span>
                                                    </NavLink>
                                                    <button
                                                        onClick={logout}
                                                        className="flex items-center w-full px-4 py-2 space-x-2 text-left text-gray-800 rounded hover:bg-red-500 hover:text-white whitespace-nowrap"
                                                    >
                                                        <FaSignOutAlt className="transform scale-y-[-1]" />
                                                        <span>Đăng Xuất</span>
                                                    </button>
                                                </div>
                                            </div>

                                        )}
                                    </div>
                                    {/* Nút Đăng Tin được tách riêng ra ngoài container profile */}
                                    <NavLink
                                        to="/Posts"
                                        className="px-3 py-2 text-base font-medium text-red-500 transition-colors duration-150 border border-red-400 rounded-md hover:bg-red-500 hover:text-white"
                                    >
                                        Đăng Tin
                                    </NavLink>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/Logins" className="px-3 py-2 text-base font-medium text-gray-800 rounded-md">
                                        Đăng Nhập
                                    </NavLink>
                                    <NavLink to="/Registers" className="px-3 py-2 text-base font-medium text-gray-800 rounded-md">
                                        Đăng Ký
                                    </NavLink>
                                    <NavLink
                                        to="/ServicePost/Creates"
                                        className="px-3 py-2 text-base font-medium text-red-500 transition-colors duration-150 border border-red-400 rounded-md hover:bg-red-500 hover:text-white"
                                    >
                                        Đăng Tin
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
