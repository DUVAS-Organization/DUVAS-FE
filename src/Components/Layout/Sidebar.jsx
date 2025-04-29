import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthProvider';
import logoAdmin from '../../Assets/Images/logoAdmin.png';
import { FaUserCircle, FaFileAlt, FaHome, FaBuilding, FaSignOutAlt, FaClone, FaUserEdit, FaChevronDown, FaChevronUp, FaFacebookMessenger, FaStar } from 'react-icons/fa';
import { MdOutlineCategory } from "react-icons/md";
import { FaMoneyBillTransfer } from 'react-icons/fa6';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation(); // Sử dụng useLocation để lấy thông tin route hiện tại

    // Tạo trạng thái riêng cho mỗi dropdown
    const [dropdownStates, setDropdownStates] = useState({
        roleUpdate: false,
        orderProcessing: false,
        category: false,
    });

    // Tạo trạng thái cho menu admin
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

    const toggleDropdown = (dropdown) => {
        setDropdownStates((prevStates) => ({
            ...prevStates,
            [dropdown]: !prevStates[dropdown], // Toggle trạng thái của dropdown cụ thể
        }));
    };

    const toggleAdminMenu = () => {
        setIsAdminMenuOpen(!isAdminMenuOpen); // Toggle menu của Admin
    };

    const getInitial = (username) => {
        return username ? username.charAt(0).toUpperCase() : '';
    };

    // Kiểm tra xem route hiện tại có phải là route con của một mục dropdown không
    const isActiveRoute = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    // Kiểm tra xem route hiện tại có thuộc ngữ cảnh "Phòng Ủy Quyền" không
    const isAuthorizedRoomsContext = () => {
        return (
            isActiveRoute('/Admin/rooms/list') || // Route chính của "Phòng Ủy Quyền"
            location.pathname.match(/^\/Admin\/edit\/\d+$/) // Route chỉnh sửa phòng, ví dụ: /Admin/edit/123
        );
    };
    // const onClickMenu = () => {
    //     document.getElementById("root").classList.toggle("short");
    // }
    return (
        <div className="w-56 text-black h-screen fixed border-r-2 flex flex-col overflow-y-auto ">
            <div className="flex-shrink-0">
                <img
                    src={logoAdmin}
                    alt="DUVAS"
                    className="w-full h-40 border-b-2"
                // onClick={onClickMenu}
                />
            </div>
            <ul className="flex-1 text-justify text-base font-medium">
                <li>
                    <NavLink
                        to="/Admin/Dashboard"
                        className={({ isActive }) =>
                            `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                        }
                    >
                        <FaHome className="inline-block mr-2" />
                        Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/Admin/Accounts"
                        className={({ isActive }) =>
                            `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                        }
                    >
                        <FaUserCircle className="inline-block mr-2" />
                        Tài Khoản
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/Admin/Message"
                        className={({ isActive }) =>
                            `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                        }
                    >
                        <FaFacebookMessenger className="inline-block mr-2" />
                        Tin Nhắn
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/Admin/ServicePosts"
                        className={({ isActive }) =>
                            `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                        }
                    >
                        <FaFileAlt className="inline-block mr-2" />
                        Bài Đăng
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/Admin/Rooms"
                        className={({ isActive }) =>
                            `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive && !isActiveRoute('/Admin/rooms/list') && !location.pathname.match(/^\/Admin\/edit\/\d+$/) ? 'bg-blue-500 text-white' : ''}`
                        }
                    >
                        <FaHome className="inline-block mr-2" />
                        Phòng
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/Admin/Buildings"
                        className={({ isActive }) =>
                            `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                        }
                    >
                        <FaBuilding className="inline-block mr-2" />
                        Tòa Nhà
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/Admin/Transactions"
                        className={({ isActive }) =>
                            `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                        }
                    >
                        <FaMoneyBillTransfer className="inline-block mr-2" />
                        Giao dịch
                    </NavLink>
                </li>
                <li>
                    <div
                        className={`cursor-pointer block py-2 px-4 hover:bg-blue-400 rounded-3xl relative `}
                        onClick={() => toggleDropdown('roleUpdate')}
                    >
                        <FaUserEdit className="inline-block mr-2" />
                        Cập Nhật vai trò
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            {dropdownStates.roleUpdate ? (
                                <FaChevronUp />
                            ) : (
                                <FaChevronDown />
                            )}
                        </div>
                    </div>
                    {dropdownStates.roleUpdate && (
                        <ul className="pl-4 mt-2">
                            <li>
                                <NavLink
                                    to="/Admin/Landlord"
                                    className={({ isActive }) =>
                                        `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                                    }
                                >
                                    LandLord
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/Admin/Service"
                                    className={({ isActive }) =>
                                        `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                                    }
                                >
                                    Service
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>
                <li>
                    <div
                        className={`cursor-pointer block py-2 px-4 hover:bg-blue-400 rounded-3xl relative `}
                        onClick={() => toggleDropdown('orderProcessing')}
                    >
                        <FaClone className="inline-block mr-2" />
                        Xử Lý Đơn
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            {dropdownStates.orderProcessing ? (
                                <FaChevronUp />
                            ) : (
                                <FaChevronDown />
                            )}
                        </div>
                    </div>
                    {dropdownStates.orderProcessing && (
                        <ul className="pl-4 mt-2">
                            <li>
                                <NavLink
                                    to="/Admin/Reports"
                                    className={({ isActive }) =>
                                        `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                                    }
                                >
                                    Đơn Tố Cáo
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/Admin/Authorization"
                                    className={({ isActive }) =>
                                        `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                                    }
                                >
                                    Đơn Ủy Quyền
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/Admin/rooms/list"
                                    className={({ isActive }) =>
                                        `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive || location.pathname.match(/^\/Admin\/edit\/\d+$/) ? 'bg-blue-500 text-white' : ''}`
                                    }
                                >
                                    Phòng Ủy Quyền
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/Admin/Withdraws"
                                    className={({ isActive }) =>
                                        `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                                    }
                                >
                                    Rút tiền
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>
                <li>
                    <div
                        className="cursor-pointer flex items-center justify-between py-2 px-4 hover:bg-blue-400 rounded-3xl relative"
                        onClick={() => toggleDropdown('priorityPackage')}
                    >
                        <div className="flex items-center space-x-2">
                            <FaStar className="text-black-400" />
                            <span>Gói ưu tiên</span>
                        </div>
                        <div>
                            {dropdownStates.priorityPackage ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                    </div>

                    {dropdownStates.priorityPackage && (
                        <ul className="pl-8 mt-2 space-y-2">
                            <li>
                                <NavLink
                                    to="/Admin/RoomPackages"
                                    className={({ isActive }) =>
                                        `flex items-center space-x-2 py-2 px-4 rounded-3xl hover:bg-blue-400 ${isActive ? 'bg-blue-500 text-white' : ''
                                        }`
                                    }
                                >
                                    <span>Gói phòng</span>
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    to="/Admin/ServicePackages"
                                    className={({ isActive }) =>
                                        `flex items-center space-x-2 py-2 px-4 rounded-3xl hover:bg-blue-400 ${isActive ? 'bg-blue-500 text-white' : ''
                                        }`
                                    }
                                >
                                    <span>Gói dịch vụ</span>
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>
                <li>
                    <div
                        className={`cursor-pointer block py-2 px-4 hover:bg-blue-400 rounded-3xl relative `}
                        onClick={() => toggleDropdown('category')}
                    >
                        <MdOutlineCategory className="inline-block mr-2" />
                        Loại
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            {dropdownStates.category ? (
                                <FaChevronUp />
                            ) : (
                                <FaChevronDown />
                            )}
                        </div>
                    </div>
                    {dropdownStates.category && (
                        <ul className="pl-4 mt-2">
                            <li>
                                <NavLink
                                    to="/Admin/CategoryRooms"
                                    className={({ isActive }) =>
                                        `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                                    }
                                >
                                    Loại Phòng
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/Admin/CategoryServices"
                                    className={({ isActive }) =>
                                        `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                                    }
                                >
                                    Loại Dịch Vụ
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    to="/Admin/CategoryPriorityRooms"
                                    className={({ isActive }) =>
                                        `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                                    }
                                >
                                    Ưu tiên Phòng
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/Admin/CategoryPriorityServices"
                                    className={({ isActive }) =>
                                        `block py-2 px-4 hover:bg-blue-400 rounded-3xl ${isActive ? 'bg-blue-500 text-white' : ''}`
                                    }
                                >
                                    Ưu tiên Dịch vụ
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>
            </ul >
            <div className="mt-2 px-4 py-2 border-t border-gray-700">
                <div className="flex items-center cursor-pointer" onClick={toggleAdminMenu}>
                    <div className="w-8 h-8 rounded-full border border-gray-300 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-800 font-bold">
                            {getInitial(user.username)}
                        </span>
                    </div>
                    <button
                        className="text-gray-800 px-3 py-2 rounded-md text-base font-bold flex items-center"
                    >
                        {user.username}
                    </button>
                </div>
                {isAdminMenuOpen && (
                    <ul className="pl-4 mb-2 z-10">
                        <li>
                            <button
                                onClick={logout}
                                className="block w-full px-4 py-2 hover:bg-gray-100 text-left text-gray-800 text-base whitespace-nowrap"
                            >
                                <FaSignOutAlt className='inline-block mr-2' />
                                Đăng Xuất
                            </button>
                        </li>
                    </ul>
                )}
            </div>
        </div >
    );
};

export default Sidebar;