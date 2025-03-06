import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBook, FaUserTie, FaGlobe } from 'react-icons/fa';
import { FaHandHoldingDollar } from "react-icons/fa6";

const SidebarUser = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const currentTab = params.get("tab");

    return (
        <div className="w-56 text-black h-screen bg-white fixed border-r-2 flex flex-col pt-5 overflow-y-auto">
            <ul className="text-justify text-base font-medium">
                <li>
                    <NavLink
                        to="/Overview"
                        className={({ isActive }) =>
                            `block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                        }
                    >
                        <FaGlobe className="inline-block mr-2 mb-1" />
                        Tổng Quan
                    </NavLink>
                </li>
                <li>
                    <div className="block py-2 px-4 rounded-3xl">
                        <FaUserTie className="inline-block mr-2 mb-2" />
                        Tài Khoản
                    </div>
                    <ul className="ml-4">
                        <li>
                            <NavLink
                                to="/Profile?tab=edit"
                                className={() =>
                                    `block py-2 px-4 mb-0.5 hover:bg-red-400 hover:text-white rounded-3xl ${currentTab === "edit" ? "bg-red-500 text-white" : "text-black"
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
                                    `block py-2 px-4 mb-0.5 hover:bg-red-400 hover:text-white rounded-3xl ${currentTab === "settings" ? "bg-red-500 text-white" : "text-black"
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
                                    `block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${currentTab === "registerLandlord" ? "bg-red-500 text-white" : "text-black"
                                    }`
                                }
                            >
                                Đăng ký thành chủ
                            </NavLink>
                        </li>
                    </ul>
                </li>
                <li>
                    <div className="block py-2 px-4 rounded-3xl">
                        <FaBook className="inline-block mr-2 mb-1" />
                        Bài Đăng
                    </div>
                    <ul className="pl-4">
                        <li>
                            <NavLink
                                to="/ServicePost/Creates"
                                className={({ isActive }) =>
                                    `block py-2 px-4 mb-0.5 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''
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
                                    `block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''
                                    }`
                                }
                            >
                                Danh sách Tin
                            </NavLink>
                        </li>
                    </ul>
                </li>
                <li>
                    <div className="block py-2 px-4 rounded-3xl">
                        <FaHandHoldingDollar className="inline-block mr-2 mb-1" />
                        Tài Chính
                    </div>
                    <ul className="pl-4">
                        <li>
                            <NavLink
                                to="/Transaction"
                                className={({ isActive }) =>
                                    `block py-2 px-4 mb-0.5 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''
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
                                    `block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''
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
