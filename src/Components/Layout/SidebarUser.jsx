import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBook, FaUserTie, FaGlobe } from 'react-icons/fa';
import { FaHandHoldingDollar } from "react-icons/fa6";

const SidebarUser = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const currentTab = params.get("tab");

    return (
        <div className="fixed flex flex-col h-screen pt-5 overflow-y-auto text-black bg-white border-r-2 w-52">
            <ul className="text-base font-medium text-justify">
                <li>
                    <NavLink
                        to="/Overview"
                        className={({ isActive }) =>
                            `block py-2 px-4 hover:bg-red-500 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                        }
                    >
                        <FaGlobe className="inline-block mb-1 mr-2" />
                        Tổng Quan
                    </NavLink>
                </li>
                <li>
                    <div className="block px-4 py-2 rounded-3xl">
                        <FaUserTie className="inline-block mb-2 mr-2" />
                        Tài Khoản
                    </div>
                    <ul className="ml-4">
                        <li>
                            <NavLink
                                to="/Profile?tab=edit"
                                className={() =>
                                    `block mb-1 py-2 px-4 hover:bg-red-500 hover:text-white rounded-3xl ${currentTab === "edit" ? "bg-red-500 text-white" : "text-black"
                                    }`
                                }
                            >
                                Chỉnh sửa thông tin
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/Profile?tab=settings"
                                className={() =>
                                    `block mb-1 py-2 px-4 hover:bg-red-500 hover:text-white rounded-3xl ${currentTab === "settings" ? "bg-red-500 text-white" : "text-black"
                                    }`
                                }
                            >
                                Cài đặt tài khoản
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/Profile?tab=registerLandlord"
                                className={() =>
                                    `block py-2 px-4 hover:bg-red-500 hover:text-white rounded-3xl ${currentTab === "registerLandlord" ? "bg-red-500 text-white" : "text-black"
                                    }`
                                }
                            >
                                Đăng ký thành chủ
                            </NavLink>
                        </li>
                    </ul>
                </li>
                <li>
                    <div className="block px-4 py-2 rounded-3xl">
                        <FaBook className="inline-block mb-1 mr-2" />
                        Bài Đăng
                    </div>
                    <ul className="pl-4">
                        <li>
                            <NavLink
                                to="/ServicePost/Creates"
                                className={({ isActive }) =>
                                    `block mb-1 py-2 px-4 hover:bg-red-500 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''
                                    }`
                                }
                            >
                                Đăng mới
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/ServicePost"
                                className={({ isActive }) =>
                                    `block py-2 px-4 hover:bg-red-500 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''
                                    }`
                                }
                            >
                                Danh sách Tin
                            </NavLink>
                        </li>
                    </ul>
                </li>
                <li>
                    <div className="block px-4 py-2 rounded-3xl">
                        <FaHandHoldingDollar className="inline-block mb-1 mr-2" />
                        Tài Chính
                    </div>
                    <ul className="pl-4">
                        <li>
                            <NavLink
                                to="/Transaction"
                                className={({ isActive }) =>
                                    `block mb-1 py-2 px-4 hover:bg-red-500 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''
                                    }`
                                }
                            >
                                Lịch sử giao dịch
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/Withdraws"
                                className={({ isActive }) =>
                                    `block py-2 px-4 hover:bg-red-500 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''
                                    }`
                                }
                            >
                                Nạp tiền
                            </NavLink>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    );
};

export default SidebarUser;
