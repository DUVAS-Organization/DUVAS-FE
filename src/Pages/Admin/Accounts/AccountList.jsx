import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../Components/Icon';
import AccountsService from "../../../Services/Admin/AccountServices";
import Counts from '../../../Components/Counts';

import { FiFilter } from 'react-icons/fi';
import { FaLock, FaUnlock } from 'react-icons/fa';

const AccountList = () => {
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [isSortedAscending, setIsSortedAscending] = useState(true);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filteredAccounts, setFilteredAccounts] = useState([]);

    useEffect(() => {
        fetchData();
    }, [searchTerm]);
    useEffect(() => {
        // Áp dụng bộ lọc khi thay đổi trạng thái lọc
        if (filterStatus === null) {
            setFilteredAccounts(accounts); // Nếu không lọc, hiển thị tất cả tài khoản
        } else {
            setFilteredAccounts(accounts.filter(account => account.status === filterStatus)); // Lọc theo trạng thái
        }
    }, [filterStatus, accounts]);
    const fetchData = () => {
        // Lấy tài khoản
        AccountsService.getAccounts(searchTerm)
            .then(data => {
                setAccounts(data);
            })
            .catch(error => console.error('Error fetching Account:', error));

    };

    const handleStatusChange = (userId, currentStatus) => {
        // Gọi API hoặc cập nhật trạng thái trong state
        const newStatus = !currentStatus; // Lật ngược trạng thái
        AccountsService.updateStatus(userId, newStatus)
            .then(() => {
                // Cập nhật lại dữ liệu hoặc làm gì đó sau khi thay đổi trạng thái thành công
                fetchData(); // Cập nhật lại dữ liệu sau khi thay đổi
            })
            .catch(error => console.error('Error updating status:', error));
    };

    const handleSortByName = () => {
        // Đảo ngược hướng sắp xếp
        const sortedAccounts = [...accounts];
        sortedAccounts.sort((a, b) => {
            if (isSortedAscending) {
                return a.name.localeCompare(b.name); // A-Z
            } else {
                return b.name.localeCompare(a.name); // Z-A
            }
        });
        // // setAccounts(sortedAccounts); // Cập nhật lại danh sách tài khoản đã sắp xếp
        setFilteredAccounts(sortedAccounts);
        setIsSortedAscending(!isSortedAscending); // Đảo ngược hướng sắp xếp
    };

    const getRole = (user) => {
        if (user.roleAdmin === 1) {
            return "Admin";
        }

        if (user.roleLandlord === 1) {
            return "Landlord";
        }

        if (user.roleService === 1) {
            return "Service";
        }

        return "User";
    };

    return (
        <div className="p-6">
            <Counts />
            <div className='font-bold text-6xl ml-3 my-8 text-blue-500'>
                <h1 >Tài Khoản</h1>
            </div>
            <div className="flex items-center mb-6">
                <button onClick={handleSortByName} className="border-2 border-gray-500 flex items-center p-2 rounded-xl">
                    <FiFilter className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Tên (A-Z)</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8"
                    onClick={() => setFilterStatus(true)}>
                    <FaUnlock className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Active</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8"
                    onClick={() => setFilterStatus(false)}>
                    <FaLock className="mr-2 text-xl" />
                    <p className="font-bold text-xl">InActive</p>
                </button>
                <div className="relative w-1/3 mx-2 ml-auto">
                    <input
                        className="border w-full h-11 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        type="text"
                        placeholder="  Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Icon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" name="search" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-left font-semibold text-black">#</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Tên</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Email</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Vai Trò</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAccounts.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-2 text-center text-gray-500">Không tìm thấy kết quả</td>
                            </tr>
                        ) : (
                            filteredAccounts.map((account, index) => (
                                <tr
                                    key={account.userId}
                                    className="hover:bg-gray-200 border-collapse border border-gray-300"
                                >
                                    <td className="py-2 px-4 text-gray-700 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{account.name}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{account.gmail}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{getRole(account)}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        <button
                                            onClick={() => handleStatusChange(account.userId, account.status)}
                                            className={`px-4 py-2 rounded-3xl font-semibold text-white
                                            ${account.status ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'}`}
                                        >
                                            {account.status ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccountList;
