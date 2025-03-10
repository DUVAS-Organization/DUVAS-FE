import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthProvider';
import { Link, NavLink } from 'react-router-dom';
import Image_Logo from '../../Assets/Images/logo2.png';
import Sidebar from './Sidebar';
import {
    FaBook,
    FaUserTie,
    FaGlobe,
    FaLock,
    FaSignOutAlt,
    FaUsers,
    FaFacebookMessenger,
    FaRegHeart,
    FaRegBell,
    FaRegBellSlash,
} from 'react-icons/fa';
import { FaHandHoldingDollar, FaMessage } from "react-icons/fa6";
import BellNotifications from './UIContext/BellNotifications';
import SavePosts from './UIContext/SavePosts';
import { UIProvider } from './UIContext/UIContext';

const navLinks = [
    { name: "Trang Chủ", path: "/" },
    { name: "Nhà trọ cho thuê", path: "/Rooms" },
    { name: "Tin Dịch vụ", path: "/ServicePosts" },
    { name: "Thông tin", path: "/thongtin" },
];

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

    // Hàm lấy chữ cái đầu của username
    const getInitial = (username) => {
        return username ? username.charAt(0).toUpperCase() : '';
    };

    return (
        <nav className="bg-white shadow-md font-sans sticky top-0 z-50 transition duration-500">
            <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8">
                <div className="relative flex items-center h-16">
                    <div className="flex items-center justify-between flex-1">
                        <Link to='/'>
                            <div className="flex-shrink-0">
                                <img
                                    src={Image_Logo}
                                    alt="DUVAS"
                                    className="max-w-[110px] h-auto"
                                />
                            </div>
                        </Link>
                        <div className="hidden sm:flex space-x-1">
                            {navLinks.map(({ name, path }) => (
                                <NavLink
                                    key={name}
                                    to={path}
                                    className={({ isActive }) =>
                                        `relative px-3 py-1 text-base font-medium text-gray-800 transition-all
                     before:content-[''] before:absolute before:bottom-0 before:left-3 before:w-0 before:h-[2px] 
                     before:bg-red-500 before:transition-all before:duration-500 before:ease-in-out
                     hover:before:w-[calc(100%-1.5rem)] ${isActive ? 'before:w-[calc(100%-1.5rem)] text-red-500 font-semibold' : ''
                                        }`
                                    }
                                >
                                    {name}
                                </NavLink>
                            ))}
                        </div>

                        <div className="hidden ml-auto space-x-4 sm:flex">
                            {user ? (
                                <>
                                    <UIProvider>
                                        <div className='flex gap-3 items-center'>
                                            <SavePosts />
                                            <BellNotifications />
                                        </div>
                                    </UIProvider>

                                    <div
                                        className="relative flex items-center"
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {/* Xử lý ảnh profile: nếu có user.profilePicture thì hiển thị ảnh,
                        nếu không hiển thị fallback với chữ cái đầu */}
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
                                        <button className="text-gray-800 px-3 py-2 rounded-md text-base font-medium flex items-center">
                                            {user.username}
                                        </button>

                                        {/* Dropdown menu */}
                                        {dropdownOpen && (
                                            <div className="absolute top-8 right-0 mt-2 w-64 bg-white shadow-lg rounded-md">
                                                <div className="px-4 py-2 text-gray-800 text-base">
                                                    <NavLink
                                                        to="/Overview"
                                                        className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                                                    >
                                                        <FaGlobe />
                                                        <span>Tổng quan</span>
                                                    </NavLink>
                                                    <NavLink
                                                        to="/Message"
                                                        className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                                                    >
                                                        <FaFacebookMessenger />
                                                        <span>Tin nhắn</span>
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
                                    {/* Nút Đăng Tin */}
                                    <NavLink
                                        to="/Posts"
                                        className="text-red-500 px-3 py-2 rounded-md text-base font-medium border border-red-400 hover:bg-red-500 hover:text-white transition-colors duration-150"
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
                                        className="text-red-500 px-3 py-2 rounded-md text-base font-medium border border-red-400 hover:bg-red-500 hover:text-white transition-colors duration-150"
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
