import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../../Components/Layout/Layout";
import Footer from "../../../Components/Layout/Footer";
import UserService from "../../../Services/User/UserService";
import Counts from '../../../Components/Counts';

import { FiFilter } from 'react-icons/fi';
import { FaLock, FaRedo, FaUnlock } from 'react-icons/fa';
import AccountsService from "../../../Services/Admin/AccountServices";
import Icon from "../../../Components/Icon";
import AdminWithdrawRequestService from "../../../Services/Admin/WithdrawManagementService";

const AdminTransaction = () => {
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [isSortedAscending, setIsSortedAscending] = useState(true);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filteredTransactions, setFilteredTransactions] = useState([]);


    useEffect(() => {
        getTransactions();
    }, [searchTerm])
    const getTransactions = () => {
        AdminWithdrawRequestService.getWithdrawRequests(searchTerm)
            .then(data => {
                setTransactions(data);
            })
            .catch(error => console.error('Error fetching transactions'));
    };

    const sortedTransactions = [...transactions]
    .filter(transaction => (filterStatus ? transaction.status === filterStatus : true))
    .sort((a, b) => isSortedAscending 
        ? new Date(a) - new Date(b) 
        : new Date(b) - new Date(a)
    );

    const handleSortByDate = () => {
        setIsSortedAscending(!isSortedAscending);
    };

    const resetFilters = () => {
        setFilterStatus(null);
        setIsSortedAscending(true);
    };


    return (
        <div className="p-6">
            <Counts />
            <div className='font-bold text-6xl ml-3 my-8 text-blue-500'>
                <h1 >Danh Sách Rút Tiền</h1>
            </div>
            <div className="flex items-center mb-6">
                <button onClick={handleSortByDate} className="border-2 border-gray-500 flex items-center p-2 rounded-xl">
                    <FiFilter c lassName="mr-2 text-xl" />
                    <p className="font-bold text-xl">Thời Gian</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8"
                    onClick={() => setFilterStatus("Pending")}>
                    <FaUnlock className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Đang Chờ</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8"
                    onClick={() => setFilterStatus("Approved")}>
                    <FaLock className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Thành Công</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8 bg-gray-300"
                    onClick={resetFilters}>
                    <FaRedo  className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Tất Cả</p>
                </button>

                <div className="relative w-1/3 mx-2 ml-auto">
                    <input
                        className="border w-full h-11 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        type="text"
                        placeholder="  Tìm số tài khoản"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Icon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" name="search" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-3 border">Mã</th>
                            <th className="p-3 border">Số Tiền</th>
                            <th className="p-3 border">Số Tài Khoản</th>
                            <th className="p-3 border">Ngày Tạo Đơn</th>
                            <th className="p-3 border">Ngày Cập Nhật Đơn</th>
                            <th className="p-3 border">Trạng Thái</th>
                            <th className="p-3 border">Link QR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            sortedTransactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-100">
                                    <td className="p-3 border text-center">{transaction.id}</td>
                                    <td className="p-3 border text-center">{transaction.amount}</td>
                                    <td className="p-3 border text-center">{transaction.accountNumber || "N/A"}</td>
                                    <td className="p-3 border text-center">{new Date(transaction.createdAt).toLocaleString()}</td>
                                    <td className="p-3 border text-center">{new Date(transaction.updatedAt).toLocaleString()}</td>
                                    <td className="p-3 border text-center">
                                        <span className={`px-2 py-1 rounded text-white ${transaction.status === "Pending" ? "bg-yellow-500" : "bg-green-500"}`}>
                                            {transaction.status === "Pending" ? "Đang xử lý" : "Thành công"}
                                        </span>
                                    </td>
                                    <td className="p-3 border text-center">
                                        <button
                                            className={`px-2 py-1 rounded text-white bg-green-500 ${transaction.status === "Approved" ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                            disabled={transaction.status === "Approved"}
                                        >
                                            Chuyển Tiền
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="p-4 text-center text-gray-500">
                                    No transactions available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export default AdminTransaction;