import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    FaBook,
    FaUserTie,
    FaGlobe,
    FaDoorClosed,
    FaIdCard,
    FaChevronDown,
    FaChevronUp,
    FaExclamationCircle,
} from 'react-icons/fa';
import { FaHandHoldingDollar } from 'react-icons/fa6';
import { MdBedroomParent, MdCleaningServices } from 'react-icons/md';
import { useAuth } from '../../Context/AuthProvider';

const SidebarUser = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const currentTab = params.get('tab');
    const currentPath = location.pathname;
    const isWithdrawCreateActive = currentPath === '/Withdraw/Create';
    const isAuthorizationActive = currentPath === '/Landlord/Authorization';

    // Set account and finance to open by default, posts to closed
    const [dropdownStates, setDropdownStates] = useState({
        account: true,
        posts: false,
        finance: true,
    });

    const { user } = useAuth();
    if (!user) return null;

    let postTitle = 'Bài Đăng';
    let createLink = '/ServicePost/Creates';
    let listLink = '/ServicePost';

    if (user.role === 'Landlord') {
        postTitle = 'Phòng';
        createLink = '/Room/Create';
        listLink = '/Room';
    } else if (user.role === 'Service') {
        postTitle = 'Dịch vụ';
        createLink = '/ServiceOwner/ServicePosts/Create';
        listLink = '/ServiceOwner/ManageServices';
    }

    // Check if any child route is active to keep dropdown open
    const isDropdownActive = (dropdown, childPaths) => {
        if (dropdown === 'account') {
            return ['edit', 'settings', 'registerLandlord'].includes(currentTab);
        }
        return childPaths.some(path => currentPath === path);
    };

    const toggleDropdown = (dropdown) => {
        setDropdownStates((prevStates) => ({
            ...prevStates,
            [dropdown]: !prevStates[dropdown],
        }));
    };

    return (
        <div className="fixed flex flex-col h-[655px] pt-2 overflow-y-auto text-black bg-white border-r-2 w-56 select-none dark:bg-gray-800 dark:text-white">
            <ul className="flex-1 text-justify text-base font-medium">
                <li>
                    <NavLink
                        to="/Overview"
                        className={({ isActive }) =>
                            `block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                        }
                    >
                        <FaGlobe className="inline-block mr-2" />
                        Tổng Quan
                    </NavLink>
                </li>

                {/* Tài khoản */}
                <li>
                    <div
                        className={`cursor-pointer block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl relative ${isDropdownActive('account', ['edit', 'settings', 'registerLandlord']) ? 'bg-red-500 text-white' : ''}`}
                        onClick={() => toggleDropdown('account')}
                    >
                        <FaUserTie className="inline-block mr-2" />
                        Tài Khoản
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            {isDropdownActive('account', ['edit', 'settings', 'registerLandlord']) || dropdownStates.account ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                    </div>
                    {(dropdownStates.account || isDropdownActive('account', ['edit', 'settings', 'registerLandlord'])) && (
                        <ul className="pl-4">
                            <li>
                                <NavLink
                                    to="/Profile?tab=edit"
                                    className={({ isActive }) =>
                                        ` mt-0.5 block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${currentTab === 'edit' ? 'bg-red-500 text-white' : ''}`
                                    }
                                >
                                    Chỉnh sửa thông tin
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/Profile?tab=settings"
                                    className={({ isActive }) =>
                                        `block mt-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${currentTab === 'settings' ? 'bg-red-500 text-white' : ''}`
                                    }
                                >
                                    Cài đặt tài khoản
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/Profile?tab=registerLandlord"
                                    className={({ isActive }) =>
                                        `block mt-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${currentTab === 'registerLandlord' ? 'bg-red-500 text-white' : ''}`
                                    }
                                >
                                    Đăng ký thành chủ
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                <li>
                    <NavLink
                        to="/my-reports"
                        className={({ isActive }) =>
                            `block mt-0.5 mb-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                        }
                    >
                        <FaExclamationCircle className="inline-block mr-2" />
                        Báo cáo của tôi
                    </NavLink>
                </li>

                {/* Bài đăng / Phòng / Dịch vụ */}
                {(user.role === 'Landlord' || user.role === 'Service') && (
                    <li>
                        <div
                            className={`cursor-pointer block py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl relative ${isDropdownActive('posts', [createLink, listLink, '/Landlord/Authorization', '/Landlord/Reports']) ? 'bg-red-500 text-white' : ''}`}
                            onClick={() => toggleDropdown('posts')}
                        >
                            {user.role === 'Landlord' ? (
                                <MdBedroomParent className="inline-block mr-2" />
                            ) : user.role === 'Service' ? (
                                <MdCleaningServices className="inline-block mr-2" />
                            ) : (
                                <FaBook className="inline-block mr-2" />
                            )}
                            {postTitle}
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                {isDropdownActive('posts', [createLink, listLink, '/Landlord/Authorization', '/Landlord/Reports']) || dropdownStates.posts ? <FaChevronUp /> : <FaChevronDown />}
                            </div>
                        </div>
                        {(dropdownStates.posts || isDropdownActive('posts', [createLink, listLink, '/Landlord/Authorization', '/Landlord/Reports'])) && (
                            <ul className="pl-4">
                                <li>
                                    <NavLink
                                        to={createLink}
                                        className={({ isActive }) =>
                                            `block mt-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${currentPath === createLink ? 'bg-red-500 text-white' : ''}`
                                        }
                                    >
                                        Đăng mới
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to={listLink}
                                        className={({ isActive }) =>
                                            `block mt-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${currentPath === listLink ? 'bg-red-500 text-white' : ''}`
                                        }
                                    >
                                        {user.role === 'Landlord' ? 'Quản Lý Phòng' : 'Quản Lý Dịch vụ'}
                                    </NavLink>
                                </li>
                                {user.role === 'Landlord' && (
                                    <>
                                        <li>
                                            <NavLink
                                                to="/Landlord/Authorization"
                                                className={({ isActive }) =>
                                                    `block mt-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${currentPath === '/Landlord/Authorization' ? 'bg-red-500 text-white' : ''}`
                                                }
                                            >
                                                Đơn ủy quyền
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink
                                                to="/Landlord/Reports"
                                                className={({ isActive }) =>
                                                    `block mt-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${currentPath === '/Landlord/Reports' ? 'bg-red-500 text-white' : ''}`
                                                }
                                            >
                                                Báo cáo phòng
                                            </NavLink>
                                        </li>
                                    </>
                                )}
                            </ul>
                        )}
                    </li>
                )}

                {/* Phòng đã thuê */}
                <li>
                    <NavLink
                        to="/RentalList"
                        className={({ isActive }) =>
                            `block mt-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                        }
                    >
                        <FaDoorClosed className="inline-block mr-2" />
                        Phòng đã thuê
                    </NavLink>
                </li>

                {/* Đơn đăng ký */}
                <li>
                    <NavLink
                        to="/ViewUpRole"
                        className={({ isActive }) =>
                            `block mt-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                        }
                    >
                        <FaIdCard className="inline-block mr-2" />
                        Đơn đăng ký
                    </NavLink>
                </li>

                {/* Tài chính */}
                <li>
                    <div
                        className={`cursor-pointer block mt-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl relative ${isDropdownActive('finance', ['/Transaction', '/Moneys', '/Withdraw/Create', '/BankAccounts']) ? 'bg-red-500 text-white' : ''}`}
                        onClick={() => toggleDropdown('finance')}
                    >
                        <FaHandHoldingDollar className="inline-block mr-2" />
                        Tài Chính
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            {isDropdownActive('finance', ['/Transaction', '/Moneys', '/Withdraw/Create', '/BankAccounts']) || dropdownStates.finance ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                    </div>
                    {(dropdownStates.finance || isDropdownActive('finance', ['/Transaction', '/Moneys', '/Withdraw/Create', '/BankAccounts'])) && (
                        <ul className="pl-4">
                            <li>
                                <NavLink
                                    to="/Transaction"
                                    className={({ isActive }) =>
                                        `block mt-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                                    }
                                >
                                    Lịch sử giao dịch
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/Moneys"
                                    className={({ isActive }) =>
                                        `block mt-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                                    }
                                >
                                    Nạp tiền
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/Withdraw/Create"
                                    className={({ isActive }) =>
                                        `block mt-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive || isWithdrawCreateActive ? 'bg-red-500 text-white' : ''}`
                                    }
                                >
                                    Rút tiền
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/BankAccounts"
                                    className={({ isActive }) =>
                                        `block mt-0.5 py-2 px-4 hover:bg-red-400 hover:text-white rounded-3xl ${isActive ? 'bg-red-500 text-white' : ''}`
                                    }
                                >
                                    Tài khoản của bạn
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>
            </ul>
        </div>
    );
};

export default SidebarUser;