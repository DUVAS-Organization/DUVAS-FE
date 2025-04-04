import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../Context/AuthProvider';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Image_Logo from '../../Assets/Images/logo2.png';
import Sidebar from './Sidebar';
import {
    FaBook,
    FaUserTie,
    FaGlobe,
    FaLock,
    FaSignOutAlt,
    FaFacebookMessenger,
    FaDoorClosed,
} from 'react-icons/fa';
import { FaHandHoldingDollar, FaHouse } from "react-icons/fa6";
import BellNotifications from './UIContext/BellNotifications';
import SavePosts from './UIContext/SavePosts';
import { UIProvider } from './UIContext/UIContext';
import RoomDropdown from './RoomDropdown';
import ServiceDropdown from './ServiceDropdown';
import { MdBedroomParent, MdCleaningServices } from 'react-icons/md';
import { getUserProfile } from '../../Services/User/UserProfileService'; // Import UserService

const navLinks = [
    { name: "Trang Chủ", path: "/" },
    { name: "Thông tin", path: "/Wiki" },
];

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown của user profile
    const [userProfile, setUserProfile] = useState(null); // State để lưu thông tin chi tiết người dùng
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile menu open state
    const dropdownRef = useRef(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab") || "";

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // Lấy thông tin chi tiết người dùng từ UserService khi user thay đổi
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user && user.userId) { // Giả định user có userId
                try {
                    const profileData = await getUserProfile(user.userId);
                    setUserProfile({
                        userName: profileData.userName || user.username,
                        name: profileData.name || '',
                        profilePicture: profileData.profilePicture || "https://www.gravatar.com/avatar/?d=mp",
                    });
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    // Nếu lỗi, dùng dữ liệu mặc định hoặc từ user
                    setUserProfile({
                        userName: user.username || '',
                        name: '',
                        profilePicture: "https://www.gravatar.com/avatar/?d=mp",
                    });
                }
            }
        };

        fetchUserProfile();
    }, [user]);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (user?.role === 'Admin') {
        return <Sidebar />;
    }

    const getInitial = (username) => username ? username.charAt(0).toUpperCase() : '';

    const renderDropdownItems = () => {
        if (!user) return null;
        return (
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
                {user.role === "Landlord" && (
                    <NavLink
                        to="/Room"
                        className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                    >
                        <MdBedroomParent />
                        <span>Quản lý Phòng</span>
                    </NavLink>
                )}
                {user.role === "Service" && (
                    <NavLink
                        to="/ManageServices"
                        className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                    >
                        <MdCleaningServices />
                        <span>Quản lý Dịch vụ</span>
                    </NavLink>
                )}
                <NavLink
                    to="/RentalList"
                    className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                >
                    <FaDoorClosed />
                    <span>Phòng đã thuê</span>
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
        );
    };

    return (
        <nav className="bg-white shadow-md font-sans sticky top-0 z-50 transition duration-500">
            <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8">
                <div className="relative flex items-center h-16">
                    {/* Logo */}
                    <Link to="/">
                        <div className="flex-shrink-0">
                            <img src={Image_Logo} alt="DUVAS" className="max-w-[110px]" />
                        </div>
                    </Link>
                    {/* Menu chính */}
                    <div className="hidden sm:flex space-x-1">
                        {/* Trang Chủ */}
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `relative px-3 py-1 text-base font-medium text-gray-800 transition-all
                                before:content-[''] before:absolute before:bottom-0 before:left-3 before:w-0 before:h-[2px]
                                before:bg-red-500 before:transition-all before:duration-500 before:ease-in-out
                                hover:before:w-[calc(100%-1.5rem)] ${isActive ? 'before:w-[calc(100%-1.5rem)] text-red-500 font-semibold' : ''}`
                            }
                        >
                            Trang Chủ
                        </NavLink>
                        {/* Dropdown Phòng trọ */}
                        <RoomDropdown />
                        {/* Dropdown Tin Dịch vụ */}
                        <ServiceDropdown />
                        {/* Các link còn lại */}
                        {navLinks.slice(1).map(({ name, path }) => (
                            <NavLink
                                key={name}
                                to={path}
                                className={({ isActive }) =>
                                    `relative px-3 py-1 text-base font-medium text-gray-800 transition-all
                                    before:content-[''] before:absolute before:bottom-0 before:left-3 before:w-0 before:h-[2px]
                                    before:bg-red-500 before:transition-all before:duration-500 before:ease-in-out
                                    hover:before:w-[calc(100%-1.5rem)] ${isActive ? 'before:w-[calc(100%-1.5rem)] text-red-500 font-semibold' : ''}`
                                }
                            >
                                {name}
                            </NavLink>
                        ))}
                    </div>
                    {/* Right side: user actions */}
                    <div className="hidden ml-auto space-x-4 sm:flex">
                        {user ? (
                            <>
                                <UIProvider>
                                    <div className="flex gap-3 items-center">
                                        <SavePosts />
                                        <BellNotifications />
                                    </div>
                                </UIProvider>
                                <div ref={dropdownRef} className="relative flex items-center">
                                    {userProfile?.profilePicture ? (
                                        <img
                                            src={userProfile.profilePicture}
                                            alt={`${userProfile.userName}'s Profile`}
                                            className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                                            onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=mp"; }}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full border border-gray-300 bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-800 font-bold">
                                                {getInitial(userProfile?.userName || user.username)}
                                            </span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="text-gray-800 px-3 py-2 rounded-md text-base font-medium flex items-center"
                                    >
                                        {userProfile?.name || userProfile?.userName || user.username}
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute top-8 right-0 mt-2 w-64 bg-white shadow-lg rounded-md">
                                            {renderDropdownItems()}
                                        </div>
                                    )}
                                </div>
                                <NavLink
                                    to="/Room/Create"
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

                    {/* Mobile menu */}
                    <div className="sm:hidden ml-auto">

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-800 px-3 py-2 rounded-md text-base font-medium"
                        >
                            {mobileMenuOpen ? 'Đóng' : 'Menu'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (

                <div className="sm:hidden bg-white shadow-md p-4">
                    <UIProvider>
                        <div className="flex gap-3 items-center">
                            <SavePosts />
                            <BellNotifications />
                        </div>
                    </UIProvider>
                    <NavLink to="/" className="block px-3 py-2 text-gray-800">
                        Trang Chủ
                    </NavLink>
                    <RoomDropdown />
                    <ServiceDropdown />
                    {navLinks.slice(1).map(({ name, path }) => (
                        <NavLink key={name} to={path} className="block px-3 py-2 text-gray-800">
                            {name}
                        </NavLink>
                    ))}

                    {user ? (
                        <div className="mt-4">
                            {renderDropdownItems()}
                        </div>
                    ) : (
                        <div className="mt-4">
                            <NavLink to="/Logins" className="block px-3 py-2 text-gray-800">
                                Đăng Nhập
                            </NavLink>
                            <NavLink to="/Registers" className="block px-3 py-2 text-gray-800">
                                Đăng Ký
                            </NavLink>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
