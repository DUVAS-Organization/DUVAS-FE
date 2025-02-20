import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthProvider';
import { NavLink } from 'react-router-dom';
import Image_Logo from '../../Assets/Images/logo2.png'
import Sidebar from './Sidebar';
import { FaBook, FaUserTie, FaGlobe, FaLock, FaSignOutAlt } from 'react-icons/fa';
import { FaHandHoldingDollar } from "react-icons/fa6";

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
        <nav className="bg-white shadow-md font-sans sticky top-0 z-50 transition duration-500">
            <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8">
                <div className="relative flex items-center h-16">
                    <div className="flex-1 flex items-center justify-between">
                        <div className="flex-shrink-0">
                            <img
                                src={Image_Logo}
                                alt="DUVAS"
                                className="max-w-[110px] h-auto"
                            />
                        </div>
                        <div className="hidden sm:block sm:ml-6">
                            <div className="flex space-x-4">
                                <NavLink to="/" className="text-gray-800 px-3 py-2 rounded-md text-base font-medium">
                                    Trang chủ
                                </NavLink>
                                <NavLink to="/Rooms" className="text-gray-800 px-3 py-2 rounded-md text-base font-medium">
                                    Nhà trọ cho thuê
                                </NavLink>
                                <NavLink to="/Projects" className="text-gray-800 px-3 py-2 rounded-md text-base font-medium">
                                    Tin tức
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:flex ml-auto space-x-4">
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
                                                className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full border border-gray-300 bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-800 font-bold">
                                                    {getInitial(user.username)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Hiển thị tên người dùng */}
                                        <button
                                            className="text-gray-800 px-3 py-2 rounded-md text-base font-medium flex items-center"
                                        >
                                            {user.username}
                                        </button>

                                        {/* Dropdown menu */}
                                        {dropdownOpen && (
                                            <div className="absolute top-8 right-0 mt-2 w-64 bg-white shadow-lg rounded-md ">
                                                <div className="px-4 py-2 text-gray-800 text-base">
                                                    <NavLink
                                                        to="/Overview"
                                                        className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                                                    >
                                                        <FaGlobe />
                                                        <span>Tổng quan</span>
                                                    </NavLink>
                                                    <NavLink
                                                        to="/ServicePost"
                                                        className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                                                    >
                                                        <FaBook />
                                                        <span>Quản lý tin đăng</span>
                                                    </NavLink>
                                                    <NavLink
                                                        to="/Profile?tab=edit"
                                                        className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                                                    >
                                                        <FaUserTie />
                                                        <span>Chỉnh Sửa thông tin</span>
                                                    </NavLink>
                                                    <NavLink
                                                        to="/Profile?tab=settings"
                                                        className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                                                    >
                                                        <FaLock />
                                                        <span>Thay đổi mật khẩu</span>
                                                    </NavLink>
                                                    <NavLink
                                                        to="/Moneys"
                                                        className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                                                    >
                                                        <FaHandHoldingDollar />
                                                        <span>Nạp tiền</span>
                                                    </NavLink>
                                                    <button
                                                        onClick={logout}
                                                        className="flex items-center space-x-2 w-full px-4 py-2 rounded hover:bg-red-500 hover:text-white text-left text-gray-800 whitespace-nowrap"
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
                                        className="text-red-500 px-3 py-2 rounded-md text-base font-medium
                                         border border-red-400 hover:bg-red-500 hover:text-white transition-colors duration-150"
                                    >
                                        Đăng Tin
                                    </NavLink>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/Logins" className="text-gray-800 px-3 py-2 rounded-md text-base font-medium">
                                        Đăng Nhập
                                    </NavLink>
                                    <NavLink to="/Registers" className="text-gray-800 px-3 py-2 rounded-md text-base font-medium">
                                        Đăng Ký
                                    </NavLink>
                                    <NavLink
                                        to="/ServicePost/Creates"
                                        className="text-red-500 px-3 py-2 rounded-md text-base font-medium 
                                        border border-red-400 hover:bg-red-500 hover:text-white transition-colors duration-150"
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
