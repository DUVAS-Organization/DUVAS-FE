import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../Context/AuthProvider';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
    FaWallet,
    FaBed,
    FaTools,
} from 'react-icons/fa';
import { FaHandHoldingDollar, FaHouse } from 'react-icons/fa6';
import BellNotifications from './UIContext/BellNotifications';
import SavePosts from './UIContext/SavePosts';
import { UIProvider } from './UIContext/UIContext';
import RoomDropdown from './RoomDropdown';
import ServiceDropdown from './ServiceDropdown';
import { MdBedroomParent, MdCleaningServices } from 'react-icons/md';
import { getUserProfile } from '../../Services/User/UserProfileService';
import UserService from '../../Services/User/UserService';
import Loading from '../Loading';
import ThemeToggleButton from './UIContext/ThemeToggleButton';

const navLinks = [
    { name: 'Trang Chủ', path: '/' },
    { name: 'Thông tin', path: '/Wiki' },
];

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showRolePopup, setShowRolePopup] = useState(false);
    const [showPostSelectionModal, setShowPostSelectionModal] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab') || '';

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownRef]);

    // Lấy thông tin chi tiết người dùng
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user && user.userId) {
                try {
                    const profileData = await getUserProfile(user.userId);
                    setUserProfile({
                        userName: profileData.userName || user.username,
                        name: profileData.name || '',
                        profilePicture: profileData.profilePicture || 'https://www.gravatar.com/avatar/?d=mp',
                        money: profileData.money || 0,
                    });
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUserProfile({
                        userName: user.username || '',
                        name: '',
                        profilePicture: 'https://www.gravatar.com/avatar/?d=mp',
                        money: 0,
                    });
                }
            }
        };

        fetchUserProfile();
    }, [user]);

    if (loading) {
        return <div><Loading /></div>;
    }
    if (user?.role === 'Admin') {
        return <Sidebar />;
    }

    const getInitial = (username) => (username ? username.charAt(0).toUpperCase() : '');

    const renderDropdownItems = () => {
        if (!user) return null;
        return (
            <div className="px-4 py-2 text-gray-800 dark:bg-gray-800 text-base">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md my-1 dark:bg-gray-800">
                    <div className="flex justify-between mb-2">
                        <h2 className="text-sm font-semibold dark:text-white">Số dư tài khoản: </h2>
                        <span className="text-sm font-bold text-red-600 dark:text-red-500">
                            {userProfile?.money.toLocaleString() || '0'} đ
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between w-full gap-2 pl-4 pr-2 dark:text-white">
                    <p className="font-medium">Giao diện: </p>
                    <ThemeToggleButton />
                </div>
                <NavLink
                    to="/Overview"
                    className="dark:text-white flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                >
                    <FaGlobe />
                    <span>Tổng quan</span>
                </NavLink>
                <NavLink
                    to="/Message"
                    className="dark:text-white flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                >
                    <FaFacebookMessenger />
                    <span>Tin nhắn</span>
                </NavLink>
                {user.role === 'Landlord' && (
                    <NavLink
                        to="/Room"
                        className="dark:text-white flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                    >
                        <MdBedroomParent />
                        <span>Quản lý Phòng</span>
                    </NavLink>
                )}
                {user.role === 'Service' && (
                    <NavLink
                        to="/ServiceOwner/ManageServices"
                        className="dark:text-white flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                    >
                        <MdCleaningServices />
                        <span>Quản lý Dịch vụ</span>
                    </NavLink>
                )}
                <NavLink
                    to="/RentalList"
                    className="dark:text-white flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                >
                    <FaDoorClosed />
                    <span>Phòng đã thuê</span>
                </NavLink>
                <NavLink
                    to="/Profile?tab=edit"
                    className="dark:text-white flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                >
                    <FaUserTie />
                    <span>Chỉnh Sửa thông tin</span>
                </NavLink>
                <NavLink
                    to="/Profile?tab=settings"
                    className="dark:text-white flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                >
                    <FaLock />
                    <span>Thay đổi mật khẩu</span>
                </NavLink>
                <NavLink
                    to="/Moneys"
                    className="dark:text-white flex items-center space-x-2 px-4 py-2 rounded hover:bg-red-500 hover:text-white text-gray-800 whitespace-nowrap"
                >
                    <FaHandHoldingDollar />
                    <span>Nạp tiền</span>
                </NavLink>
                <button
                    onClick={logout}
                    className="dark:text-white flex items-center space-x-2 w-full px-4 py-2 rounded hover:bg-red-500 hover:text-white text-left text-gray-800 whitespace-nowrap"
                >
                    <FaSignOutAlt className="transform scale-y-[-1]" />
                    <span>Đăng Xuất</span>
                </button>
            </div>
        );
    };

    // Hàm xử lý khi nhấn nút "Đăng tin"
    const handlePostClick = async () => {
        if (!user) {
            setShowRolePopup(true);
            return;
        }

        try {
            // Gọi UserService.getUserById để lấy thông tin người dùng
            const userData = await UserService.getUserById(user.userId);
            console.log('User Data:', userData); // Debug

            // Kiểm tra vai trò dựa trên RoleLandlord và RoleService
            const isLandlord = userData.RoleLandlord === 1;
            const isService = userData.RoleService === 1;

            if (isLandlord && isService) {
                setShowPostSelectionModal(true);
            } else if (user.role === 'Landlord') {
                navigate('/Room/Create');
            } else if (user.role === 'Service') {
                navigate('/ServiceOwner/ServicePosts/Create');
            } else {
                setShowRolePopup(true);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setShowRolePopup(true); // Hiển thị popup nếu lỗi
        }
    };

    // Hàm xử lý chọn loại bài đăng trong modal
    const handlePostSelection = (type) => {
        setShowPostSelectionModal(false);
        if (type === 'room') {
            navigate('/Room/Create');
        } else if (type === 'service') {
            navigate('/ServiceOwner/ServicePosts/Create');
        }
    };

    return (
        <nav className="bg-white shadow-md font-sans sticky top-0 z-50 transition duration-500 dark:bg-gray-800">
            <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8">
                <div className="relative flex items-center h-16">
                    {/* Logo */}
                    <Link to="/">
                        <div className="flex-shrink-0">
                            <img src={Image_Logo} alt="DUVAS" className="max-w-[110px]" />
                        </div>
                    </Link>
                    {/* Menu chính */}
                    <div className="hidden sm:flex space-x-0.5">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `dark:text-white relative px-3 py-1 text-base font-medium text-gray-800 transition-all
                                before:content-[''] before:absolute before:bottom-0 before:left-3 before:w-0 before:h-[2px]
                                before:bg-red-500 before:transition-all before:duration-500 before:ease-in-out
                                hover:before:w-[calc(100%-1.5rem)] ${isActive ? 'before:w-[calc(100%-1.5rem)] text-red-500 font-semibold' : ''}`
                            }
                        >
                            Trang Chủ
                        </NavLink>
                        <RoomDropdown />
                        <ServiceDropdown />
                        {navLinks.slice(1).map(({ name, path }) => (
                            <NavLink
                                key={name}
                                to={path}
                                className={({ isActive }) =>
                                    `dark:text-white relative px-3 py-1 text-base font-medium text-gray-800 transition-all
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
                                            onError={(e) => {
                                                e.target.src = 'https://www.gravatar.com/avatar/?d=mp';
                                            }}
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
                                        className="text-gray-800 px-3 py-2 rounded-md text-base font-medium flex items-center dark:text-white"
                                    >
                                        {userProfile?.name || userProfile?.userName || user.username}
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute top-8 right-0 mt-2 w-64 bg-white shadow-lg rounded-md">
                                            {renderDropdownItems()}
                                        </div>
                                    )}
                                </div>
                                {/* Nút Đăng tin */}
                                <button
                                    onClick={handlePostClick}
                                    className="dark:text-white dark:bg-red-500 text-red-500 px-3 py-2 rounded-md text-base font-medium border border-red-400 hover:bg-red-500 hover:text-white transition-colors duration-150"
                                >
                                    Đăng Tin
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink
                                    to="/Logins"
                                    className="text-gray-800 px-3 py-2 rounded-md text-base font-medium dark:text-white"
                                >
                                    Đăng Nhập
                                </NavLink>
                                <NavLink
                                    to="/Registers"
                                    className="text-gray-800 px-3 py-2 rounded-md text-base font-medium dark:text-white"
                                >
                                    Đăng Ký
                                </NavLink>
                                <button
                                    onClick={handlePostClick}
                                    className="text-red-500 px-3 py-2 rounded-md text-base font-medium border border-red-400 hover:bg-red-500 hover:text-white transition-colors duration-150"
                                >
                                    Đăng Tin
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu */}
                    <div className="sm:hidden ml-auto">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-800 px-3 py-2 rounded-md text-base font-medium dark:text-white"
                        >
                            {mobileMenuOpen ? 'Đóng' : 'Menu'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="sm:hidden bg-white shadow-md p-4 dark:bg-gray-800 dark:text-white">
                    <UIProvider>
                        <div className="flex gap-3 items-center">
                            <SavePosts />
                            <BellNotifications />
                        </div>
                    </UIProvider>
                    <NavLink to="/" className="block px-3 py-2 text-gray-800 dark:text-white">
                        Trang Chủ
                    </NavLink>
                    <RoomDropdown />
                    <ServiceDropdown />
                    {navLinks.slice(1).map(({ name, path }) => (
                        <NavLink key={name} to={path} className="block px-3 py-2 text-gray-800 dark:text-white">
                            {name}
                        </NavLink>
                    ))}
                    {user ? (
                        <div className="mt-4">
                            {renderDropdownItems()}
                            <button
                                onClick={handlePostClick}
                                className="dark:text-white dark:bg-red-500 block px-3 py-2 text-red-500 border border-red-400 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-150"
                            >
                                Đăng Tin
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <NavLink to="/Logins" className="block px-3 py-2 text-gray-800 dark:text-white">
                                Đăng Nhập
                            </NavLink>
                            <NavLink to="/Registers" className="block px-3 py-2 text-gray-800 dark:text-white">
                                Đăng Ký
                            </NavLink>
                            <button
                                onClick={handlePostClick}
                                className="block px-3 py-2 text-red-500 border border-red-400 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-150"
                            >
                                Đăng Tin
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Popup thông báo vai trò */}
            {showRolePopup && (
                <div className="fixed inset-0 top-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 dark:bg-gray-800">
                        <h3 className="text-lg font-bold mb-4 text-red-600 dark:text-white">
                            Thông báo: Bạn chưa đủ vai trò
                        </h3>
                        <p className="mb-4 text-gray-700 dark:text-white">
                            Vui lòng đăng ký vai trò Landlord hoặc Service để thực hiện chức năng này.
                        </p>
                        <div className="flex justify-between">
                            <button
                                onClick={() => setShowRolePopup(false)}
                                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 transition dark:text-white"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => {
                                    setShowRolePopup(false);
                                    navigate('/Profile?tab=registerLandlord');
                                }}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition dark:text-white"
                            >
                                Đăng Ký
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal chọn loại bài đăng */}
            {showPostSelectionModal && (
                <div className="fixed inset-0 top-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-96 dark:bg-gray-800">
                        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
                            Chọn loại bài đăng
                        </h3>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => handlePostSelection('room')}
                                className="flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-150"
                            >
                                <FaBed className="text-xl" />
                                Đăng Phòng
                            </button>
                            <button
                                onClick={() => handlePostSelection('service')}
                                className="flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-150"
                            >
                                <FaTools className="text-xl" />
                                Đăng Dịch vụ
                            </button>
                            <button
                                onClick={() => setShowPostSelectionModal(false)}
                                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 transition dark:text-white mt-2"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;