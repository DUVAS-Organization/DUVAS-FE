import React, { useEffect, useState } from 'react';
import Icon from '../../../Components/Icon';
import UserService from "../../../Services/User/UserService";
import Counts from '../../../Components/Counts';

import { FiFilter } from 'react-icons/fi';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { display } from '@mui/system';
import { useAuth } from '../../../Context/AuthProvider';

const ConfirmModal = ({ title, message, actionText, onConfirm, onCancel }) => {
    const titleClass = actionText === 'Khóa' ? 'text-red-500' : 'text-green-500';

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Overlay */}
            <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
            <div className="bg-white rounded-lg p-6 z-10 max-w-sm w-full">
                <h2 className={`mb-4 text-left text-xl font-medium ${titleClass}`}>{title}</h2>
                <p className="mb-4 text-left">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};


const AccountList = () => {
    const { user, logout } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSortedAscending, setIsSortedAscending] = useState(true);
    const [filterStatus, setFilterStatus] = useState(null);

    // State quản lý popup xác nhận
    const [confirmPopup, setConfirmPopup] = useState({
        visible: false,
        title: '',
        message: '',
        actionText: '',
        onConfirm: null,
    });

    useEffect(() => {
        fetchData();
    }, [searchTerm, filterStatus]);

    const fetchData = () => {
        if (filterStatus === null) {
            UserService.getUsers(searchTerm)
                .then(data => setAccounts(data))
                .catch(error => console.error('Error fetching accounts:', error));
        } else if (filterStatus === true) {
            // Lấy danh sách user active (roleUser === 1)
            UserService.getActiveUsers()
                .then(data => setAccounts(data))
                .catch(error => console.error('Error fetching active users:', error));
        } else if (filterStatus === false) {
            // Lấy danh sách user bị khóa (roleUser === 0)
            UserService.getLockedUsers()
                .then(data => setAccounts(data))
                .catch(error => console.error('Error fetching locked users:', error));
        }
    };

    const handleGetActiveUsers = () => {
        setFilterStatus(true);
        UserService.getActiveUsers()
            .then(data => setAccounts(data))
            .catch(error => console.error('Error fetching active users:', error));
    };

    const handleGetLockedUsers = () => {
        setFilterStatus(false);
        UserService.getLockedUsers()
            .then(data => setAccounts(data))
            .catch(error => console.error('Error fetching locked users:', error));
    };

    const handleStatusChange = (userId, roleUser) => {
        const actionText = roleUser === 1 ? 'Khóa' : 'Mở khóa';
        // Mở popup xác nhận với message và hành động cụ thể
        setConfirmPopup({
            visible: true,
            title: roleUser === 1 ? 'Xác nhận Khóa tài khoản' : 'Xác nhận Mở khóa tài khoản',
            actionText,
            message: `Bạn có chắc chắn muốn ${actionText} tài khoản này không?`,
            onConfirm: () => {
                // Ẩn popup sau khi xác nhận
                setConfirmPopup({ visible: false, title: '', message: '', actionText: '', onConfirm: null });
                if (roleUser === 1) {
                    // Khóa user
                    UserService.lockUser(userId)
                        .then(() => {
                            filterStatus === true ? handleGetActiveUsers() : fetchData();
                        })
                        .catch(error => console.error('Error locking user:', error));
                } else {
                    // Mở khóa user
                    UserService.unlockUser(userId)
                        .then(() => {
                            filterStatus === false ? handleGetLockedUsers() : fetchData();
                        })
                        .catch(error => console.error('Error unlocking user:', error));
                }
            }
        });
    };

    const handleSortByName = () => {
        const sortedAccounts = [...accounts].sort((a, b) => {
            return isSortedAscending
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        });
        setAccounts(sortedAccounts);
        setIsSortedAscending(!isSortedAscending);
        // Reload dữ liệu (nếu cần)
        UserService.getUsers(searchTerm)
            .then(data => setAccounts(data))
            .catch(error => console.error('Error fetching accounts:', error));
    };

    const getRole = (user) => {
        if (user.roleAdmin === 1) return "Admin";
        if (user.roleLandlord === 1) return "Landlord";
        if (user.roleService === 1) return "Service";
        return "User";
    };

    return (
        <div className="p-6">
            <Counts />
            <div className="font-bold text-4xl ml-3 my-8 text-blue-500">
                <h1>Tài Khoản</h1>
            </div>
            <div className="flex items-center mb-6 bg-white gap-2">
                <button
                    onClick={handleSortByName}
                    className="border-2 border-gray-300 flex items-center p-2 rounded-xl"
                >
                    <FiFilter className="mr-2 text-base" />
                    <p className="font-medium text-base">Tên (A-Z)</p>
                </button>
                <button
                    className="border-2 border-gray-300 flex items-center p-2 rounded-xl"
                    onClick={handleGetActiveUsers}
                >
                    {/* <FaUnlock className="mr-2 text-base" /> */}
                    <p className="font-medium text-base">Hoạt Động</p>
                </button>
                <button
                    className="border-2 border-gray-300 flex items-center p-2 rounded-xl"
                    onClick={handleGetLockedUsers}
                >
                    {/* <FaLock className="mr-2 text-base" /> */}
                    <p className="font-medium text-base">Đã bị khóa</p>
                </button>
                <div className="relative w-1/3 mx-2 ml-auto">
                    <input
                        className="border w-full p-2 h-11 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Icon
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        name="search"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full px-2 bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-center font-semibold text-black">#</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Tên</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Email</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Vai Trò</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-2 text-center text-gray-500">
                                    Không tìm thấy kết quả
                                </td>
                            </tr>
                        ) : (
                            accounts.map((account, index) => (
                                <tr
                                    key={account.userId}
                                    className="hover:bg-gray-200 border-collapse border border-gray-300"
                                >
                                    <td className="py-2 px-4 text-center text-gray-700 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{account.name}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{account.gmail}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{getRole(account)}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b text-left">
                                        {account.roleAdmin === 1 ? (
                                            <span className="text-gray-500"></span>
                                        ) : (
                                            <button
                                                onClick={() => handleStatusChange(account.userId, account.roleUser)}
                                                className={`py-2 rounded-3xl font-semibold ${account.roleUser === 1
                                                    ? 'text-red-500 hover:underline'
                                                    : 'text-green-500 hover:underline'
                                                    }`}
                                            >
                                                {account.roleUser === 1 ? 'Khóa' : 'Mở Khóa'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Popup xác nhận */}
            {confirmPopup.visible && (
                <ConfirmModal
                    title={confirmPopup.title}
                    message={confirmPopup.message}
                    actionText={confirmPopup.actionText}
                    onConfirm={confirmPopup.onConfirm}
                    onCancel={() => setConfirmPopup({ visible: false, title: '', message: '', actionText: '', onConfirm: null })}
                />
            )}
        </div>
    );
};

export default AccountList;
