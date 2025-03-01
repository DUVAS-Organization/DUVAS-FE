import React, { useState } from 'react';
import { useAuth } from '../Context/AuthProvider';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    if (loading) {
        return <div>Loading...</div>;
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
                                src="https://staticfile.batdongsan.com.vn/images/logo/standard/black/logo_gray-5.png"
                                alt="DUVAS"
                                className="max-w-[165px] h-auto"
                            />
                        </div>
                        <div className="hidden sm:block sm:ml-6">
                            <div className="flex space-x-4">
                                <NavLink to="/" className="text-gray-800 px-3 py-2 rounded-md text-base font-medium">
                                    Buildings
                                </NavLink>
                                <NavLink to="/Rooms" className="text-gray-800 px-3 py-2 rounded-md text-base font-medium">
                                    Rooms
                                </NavLink>
                                <NavLink to="/Projects" className="text-gray-800 px-3 py-2 rounded-md text-base font-medium">
                                    Dự án
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:flex ml-auto space-x-4">
                            {user ? (
                                <div
                                    className="relative flex items-center"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {/* Hiển thị ảnh đại diện hoặc chữ cái đầu */}``
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
                                        <div className="absolute top-8 right-16 mt-2 w-64 bg-white shadow-lg rounded-md">
                                            <div className="px-4 py-2 text-gray-800 text-base">
                                                <NavLink
                                                    to="/Profiles"
                                                    className="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-base whitespace-nowrap"
                                                >
                                                    Chỉnh Sửa thông tin cá nhân
                                                </NavLink>
                                                <button
                                                    onClick={logout}
                                                    className="block w-full px-4 py-2 hover:bg-gray-100 text-left text-gray-800 text-base whitespace-nowrap"
                                                >
                                                    Đăng Xuất
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <NavLink to="/Posts" className="text-gray-800 px-3 py-2 rounded-md text-base font-medium">
                                        Đăng Tin
                                    </NavLink>
                                </div>
                            ) : (
                                <>
                                    <NavLink to="/Logins" className="text-gray-800 px-3 py-2 rounded-md text-base font-medium">
                                        Login
                                    </NavLink>
                                    <NavLink to="/Registers" className="text-gray-800 px-3 py-2 rounded-md text-base font-medium">
                                        Register
                                    </NavLink>
                                    <NavLink to="/Posts" className="text-gray-800 px-3 py-2 rounded-md text-base font-medium">
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
