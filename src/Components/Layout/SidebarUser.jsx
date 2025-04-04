import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBook, FaUserTie, FaGlobe, FaDoorClosed } from 'react-icons/fa';
import { FaHandHoldingDollar } from "react-icons/fa6";
import { MdBedroomParent, MdCleaningServices } from 'react-icons/md';
import { useAuth } from '../../Context/AuthProvider';

const SidebarUser = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const currentTab = params.get("tab");
    const currentPath = location.pathname; // Lấy đường dẫn hiện tại
    const isWithdrawActive = location.pathname === "/Withdraw";
    const isWithdrawCreateActive = location.pathname === "/Withdraw/Create";
    const { user } = useAuth();

    if (!user) return null;

    let postTitle = "Bài Đăng";
    let createLink = "/ServicePost/Creates";
    let listLink = "/ServicePost";

    if (user.role === "Landlord") {
        postTitle = "Phòng";
        createLink = "/Room/Create";
        listLink = "/Room";
    } else if (user.role === "Service") {
        postTitle = "Dịch vụ";
        createLink = "/ServicePost/Creates";
        listLink = "/ServicePost";
    }

    return (
        <div className="fixed flex flex-col h-screen pt-5 overflow-y-auto text-black bg-white border-r-2 w-52 select-none">
            <ul className="text-base font-medium text-justify">
                <li>
                    <NavLink
                        to="/Overview"
                        className={({ isActive }) =>
                            `block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                        }
                    >
                        <FaGlobe className="inline-block mb-1 mr-2" />
                        Tổng Quan
                    </NavLink>
                </li>

                {/* Tài khoản */}
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
                                    `block py-2 px-4 mb-0.5 hover:bg-red-400 hover:text-white rounded-3xl ${currentTab === "edit" ? "bg-red-500 text-white" : "text-black"}`
                                }
                            >
                                Chỉnh sửa thông tin
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/Profile?tab=settings"
                                className={() =>
                                    `block py-2 px-4 mb-0.5 hover:bg-red-400 hover:text-white rounded-3xl ${currentTab === "settings" ? "bg-red-500 text-white" : "text-black"}`
                                }
                            >
                                Cài đặt tài khoản
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/Profile?tab=registerLandlord"
                                className={() =>
                                    `block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${currentTab === "registerLandlord" ? "bg-red-500 text-white" : "text-black"}`
                                }
                            >
                                Đăng ký thành chủ
                            </NavLink>
                        </li>
                    </ul>
                </li>

                {/* Bài đăng / Phòng / Dịch vụ - Chỉ hiển thị cho Landlord và Service */}
                {(user.role === "Landlord" || user.role === "Service") && (
                    <li>
                        <div className="block px-4 py-2 rounded-3xl">
                            {user.role === "Landlord" ? (
                                <MdBedroomParent className="inline-block mb-1 mr-2" />
                            ) : user.role === "Service" ? (
                                <MdCleaningServices className="inline-block mb-1 mr-2" />
                            ) : (
                                <FaBook className="inline-block mb-1 mr-2" />
                            )}
                            {postTitle}
                        </div>
                        <ul className="pl-4">
                            <li>
                                <NavLink
                                    to={createLink}
                                    className={`block py-2 px-4 mb-0.5 hover:bg-red-400 hover:text-white rounded-3xl ${currentPath === createLink ? "bg-red-500 text-white" : ""}`}
                                >
                                    Đăng mới
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={listLink}
                                    className={`block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${currentPath === listLink ? "bg-red-500 text-white" : ""}`}
                                >
                                    {user.role === "Landlord" ? "Quản Lý Phòng" : user.role === "Service" ? "Quản Lý Dịch vụ" : "Quản Lý Tin"}
                                </NavLink>
                            </li>
                        </ul>
                    </li>
                )}

                {/* Phòng đã thuê */}
                <li>
                    <NavLink
                        to="/RentalList"
                        className={({ isActive }) =>
                            `block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                        }
                    >
                        <FaDoorClosed className="inline-block mb-1 mr-2" />
                        Phòng đã thuê
                    </NavLink>
                </li>

                {/* Tài chính */}
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
                                    `block py-2 px-4 mb-0.5 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                                }
                            >
                                Lịch sử giao dịch
                            </NavLink>
                        </li>
                        {/* <li>
                            <NavLink
                                to="/Withdraw"
                                className={`block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isWithdrawActive ? 'bg-red-500 text-white' : ''}`}
                            >
                                Lịch sử rút tiền
                            </NavLink>
                        </li> */}
                        <li>
                            <NavLink
                                to="/Moneys"
                                className={({ isActive }) =>
                                    `block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                                }
                            >
                                Nạp tiền
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/Withdraw/Create"
                                className={`block py-2 px-4 hover:bg-red-500 hover:text-white rounded-3xl ${isWithdrawCreateActive ? 'bg-red-500 text-white' : ''}`}
                            >
                                Rút tiền
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/BankAccounts"
                                className={({ isActive }) =>
                                    `block py-2 px-4 hover:bg-red-500 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                                }
                            >
                                Tài khoản của bạn
                            </NavLink>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    );
};

export default SidebarUser;