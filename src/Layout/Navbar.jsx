import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-gray-200 shadow-md font-sans">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                    <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex-shrink-0 max-w-7xl">
                            {/* <a href="/" className="text-gray-800 text-3xl font-bold">DUVAS</a> */}
                            <img src="https://staticfile.batdongsan.com.vn/images/logo/standard/black/logo_gray-5.png"
                                alt="DUVAS"
                                className="max-w-[165px] h-auto border-red-1000"
                            />
                        </div>
                        <div className="hidden sm:block sm:ml-6">
                            <div className="flex space-x-4">
                                <NavLink
                                    to="/"
                                    className={({ isActive }) =>
                                        `text-gray-800 px-3 py-2 rounded-md text-base font-medium 
                                         ${isActive ? ' text-gray-900 underline underline-offset-4 decoration-red-500' :
                                            ' hover:text-black-900 hover:underline underline-offset-4 decoration-red-500'}`
                                    }
                                >
                                    Buildings
                                </NavLink>

                                <NavLink
                                    to="/Rooms"
                                    className={({ isActive }) =>
                                        `text-gray-800 px-3 py-2 rounded-md text-base font-medium 
                                         ${isActive ? '    text-gray-900 underline underline-offset-4 decoration-red-500' :
                                            ` hover:text-black-900 hover:underline underline-offset-4  decoration-red-500`}`
                                    }
                                >
                                    Rooms
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;
