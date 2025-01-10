import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
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
                                <NavLink
                                    to="/"
                                    className={({ isActive }) =>
                                        `text-gray-800 px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-gray-900 underline underline-offset-4 decoration-red-500' : 'hover:text-black-900 hover:underline underline-offset-4 decoration-red-500'}`
                                    }
                                >
                                    Buildings
                                </NavLink>

                                <NavLink
                                    to="/Rooms"
                                    className={({ isActive }) =>
                                        `text-gray-800 px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-gray-900 underline underline-offset-4 decoration-red-500' : 'hover:text-black-900 hover:underline underline-offset-4 decoration-red-500'}`
                                    }
                                >
                                    Rooms
                                </NavLink>

                                <NavLink
                                    to="/Projects"
                                    className={({ isActive }) =>
                                        `text-gray-800 px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-gray-900 underline underline-offset-4 decoration-red-500' : 'hover:text-black-900 hover:underline underline-offset-4 decoration-red-500'}`
                                    }
                                >
                                    Dự án
                                </NavLink>

                                <NavLink
                                    to="/News"
                                    className={({ isActive }) =>
                                        `text-gray-800 px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-gray-900 underline underline-offset-4 decoration-red-500' : 'hover:text-black-900 hover:underline underline-offset-4 decoration-red-500'}`
                                    }
                                >
                                    Tin tức
                                </NavLink>

                                <NavLink
                                    to="/Wiki"
                                    className={({ isActive }) =>
                                        `text-gray-800 px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-gray-900 underline underline-offset-4 decoration-red-500' : 'hover:text-black-900 hover:underline underline-offset-4 decoration-red-500'}`
                                    }
                                >
                                    Wiki BĐS
                                </NavLink>

                                <NavLink
                                    to="/Analysis"
                                    className={({ isActive }) =>
                                        `text-gray-800 px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-gray-900 underline underline-offset-4 decoration-red-500' : 'hover:text-black-900 hover:underline underline-offset-4 decoration-red-500'}`
                                    }
                                >
                                    Phân tích đánh giá
                                </NavLink>

                                <NavLink
                                    to="/Directory"
                                    className={({ isActive }) =>
                                        `text-gray-800 px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-gray-900 underline underline-offset-4 decoration-red-500' : 'hover:text-black-900 hover:underline underline-offset-4 decoration-red-500'}`
                                    }
                                >
                                    Danh bạ
                                </NavLink>
                            </div>
                        </div>
                        <div className="hidden sm:flex ml-auto space-x-4">
                            <NavLink
                                to="/Logins"
                                className={({ isActive }) =>
                                    `text-gray-800 px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-gray-900 underline underline-offset-4 decoration-red-500' : 'hover:text-black-900 hover:underline underline-offset-4 decoration-red-500'}`
                                }
                            >
                                Login
                            </NavLink>
                            <NavLink
                                to="/Registers"
                                className={({ isActive }) =>
                                    `text-gray-800 px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-gray-900 underline underline-offset-4 decoration-red-500' : 'hover:text-black-900 hover:underline underline-offset-4 decoration-red-500'}`
                                }
                            >
                                Register
                            </NavLink>
                            <NavLink
                                to="/Registers"
                                className={({ isActive }) =>
                                    `text-gray-800 px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-gray-900 underline underline-offset-4 decoration-red-500' : 'hover:text-black-900 hover:underline underline-offset-4 decoration-red-500'}`
                                }
                            >
                                Đăng Tin
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
