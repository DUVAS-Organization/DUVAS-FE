import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const RoomDropdown = () => {
    const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
    const roomDropdownRef = useRef(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab") || "";
    // Kiểm tra cả trường hợp đường dẫn là /Rooms
    const isActiveDropdown =
        location.pathname === "/Rooms" ||
        tab === "Phòng trọ" ||
        tab === "Căn hộ" ||
        tab === "Nhà nguyên căn";

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (roomDropdownRef.current && !roomDropdownRef.current.contains(event.target)) {
                setRoomDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            className="relative"
            ref={roomDropdownRef}
            onMouseEnter={() => setRoomDropdownOpen(true)}
            onMouseLeave={() => setRoomDropdownOpen(false)}
        >
            <NavLink
                to="/Rooms"
                className={`block mt-0.5 dark:text-white relative px-3 py-0.5 text-base font-medium text-gray-800 transition-all
    before:content-[''] before:absolute before:bottom-0 before:left-3 before:w-0 before:h-[2px]
    before:bg-red-500 before:transition-all before:duration-500 before:ease-in-out
    hover:before:w-[calc(100%-1.5rem)] cursor-pointer 
    ${isActiveDropdown ? "text-red-500 font-semibold before:w-[calc(100%-1.5rem)]" : ""}`}
            >
                Phòng trọ - Căn hộ
            </NavLink>

            {roomDropdownOpen && (
                <div className="absolute top-6 left-0 mt-2 w-48 bg-white shadow-md rounded-md z-50">
                    <NavLink
                        to="/Rooms?tab=Phòng trọ"
                        className="block px-4 py-2 text-gray-800 font-medium hover:bg-red-500 hover:text-white transition-colors"
                    >
                        Phòng trọ
                    </NavLink>
                    <NavLink
                        to="/Rooms?tab=Căn hộ"
                        className="block px-4 py-2 text-gray-800 font-medium hover:bg-red-500 hover:text-white transition-colors"
                    >
                        Căn hộ
                    </NavLink>
                    <NavLink
                        to="/Rooms?tab=Nhà nguyên căn"
                        className="block px-4 py-2 text-gray-800 font-medium hover:bg-red-500 hover:text-white transition-colors"
                    >
                        Nhà nguyên căn
                    </NavLink>
                </div>
            )}
        </div>
    );
};

export default RoomDropdown;