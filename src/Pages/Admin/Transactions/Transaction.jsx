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
import { showCustomNotification } from "../../../Components/Notification";

const AdminTransaction = () => {
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [isSortedAscending, setIsSortedAscending] = useState(true);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [qrCode, setQrCode] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const getPaymentLink = async (withdrawId) => {
        try {
            const result = await AdminWithdrawRequestService.getWithdrawRequestPaymentLinkById(withdrawId);
            if (result?.qrCode) {
                setQrCode(result.qrCode);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.log("Error when getting payment link", error);
            //toast error
            await new Promise(resolve => setTimeout(resolve, 5000));
            showCustomNotification("error", "Lỗi khi nhận thông tin thanh toán!");
        }
    };

    const rejectPayment = async (withdrawId) => {
        try {
            const reason = window.prompt("Nhập lý do từ chối:");
            console.log(reason);
            
            if (!reason) return;
            const result = await AdminWithdrawRequestService.rejectWithdrawRequests(withdrawId, reason);
            if (result) {
                //toast
                getTransactions();
                showCustomNotification("success", "Từ chối yêu cầu thành công!");
            }
        } catch (error) {
            console.log("Error update status", error);
            //toast error
            showCustomNotification("error", "Lỗi khi từ chối yêu cầu thanh toán!");
        }
    };

    const handleDeposit = async () => {
        if (!qrCode) return;

        try {
            let params = new URLSearchParams(new URL(qrCode).search);
            const addInfo = params.get("addInfo");

            if (!addInfo) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.error("Invalid QR Code URL: missing addInfo");
                showCustomNotification("error", "Thiếu thông tin trong QR code!");
                return;
            }

            let status = false;
            let retries = 0;
            const maxRetries = 10; // Set a max retry limit (30 seconds)
            await new Promise(resolve => setTimeout(resolve, 20000));
            while (!status && retries < maxRetries) {
                try {
                    const response = await UserService.checkTransactionStatus(addInfo);
                    status = response?.data?.isPaid || false;
                    console.log("Payment Status:", status);

                    if (!status) {
                        retries++;
                    }
                } catch (error) {
                    console.error("Error checking transaction status:", error);
                    showCustomNotification("error", "Lỗi không kiểm tra được trạng thái thanh toán!");
                    break; // Exit the loop if API fails
                }
            }

            if (status) {
                console.log("Payment confirmed!");
                showCustomNotification("success", "Giao dịch đã được xác nhận!");
                setIsModalOpen(false); // Close modal
                getTransactions(); // Refresh transaction records
            } else {
                console.warn("Payment not confirmed within timeout.");
                showCustomNotification("warning", "Giao dịch quá thời hạn!");
            }
        } catch (error) {
            console.error("Error parsing QR Code URL:", error);
            showCustomNotification("error", "Lỗi không xử lý được QR code!");
        }
    };

    useEffect(() => {
        if(qrCode){
            handleDeposit();
        }
    },[qrCode])


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
                    <FiFilter className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Thời Gian</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8"
                    onClick={() => setFilterStatus("Pending")}>
                    <FaUnlock className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Đang Chờ</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8"
                    onClick={() => setFilterStatus("Rejected")}>
                    <FaUnlock className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Đã Từ Chối</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8"
                    onClick={() => setFilterStatus("Approved")}>
                    <FaLock className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Thành Công</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8 bg-gray-300 hover:bg-gray-400"
                    onClick={resetFilters}>
                    <FaRedo className="mr-2 text-xl" />
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
                            <th className="p-3 border">Lý Do</th>
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
                                    <td className="p-3 border text-center">{transaction.reason || "Không"}</td>
                                    <td className="p-3 border text-center">{new Date(transaction.createdAt).toLocaleString()}</td>
                                    <td className="p-3 border text-center">{new Date(transaction.updatedAt).toLocaleString()}</td>
                                    <td className="p-3 border text-center">
                                        <span className={`px-2 py-1 rounded text-white ${transaction.status === "Pending" ? "bg-yellow-500" : transaction.status === "Rejected" ? "bg-red-500": "bg-green-500"}`}>
                                            {transaction.status === "Pending"
                                                ? "Đang xử lý"
                                                : transaction.status === "Rejected"
                                                    ? "Đã Từ Chối"
                                                    : "Đã Xử Lý"}                                        
                                        </span>
                                    </td>
                                    <td className="p-3 border text-center flex justify-evenly">
                                        <button
                                            className={`px-2 py-1 rounded text-white bg-green-500 ${transaction.status !== "Pending" ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                            disabled={transaction.status !== "Pending"}
                                            onClick={() => getPaymentLink(transaction.id)}
                                        >
                                            Chuyển Tiền
                                        </button>
                                        <button
                                            className={`px-2 py-1 rounded text-white bg-red-500 ${transaction.status !== "Pending" ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                            disabled={transaction.status !== "Pending"}
                                            onClick={() => rejectPayment(transaction.id)}>
                                            Từ Chối
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
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                            <h2 className="text-xl font-bold mb-2">Mã QR Chuyển Tiền</h2>
                            <img src={qrCode} alt="QR Code" className="mx-auto" />
                            <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded" onClick={() => setIsModalOpen(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

    )
}
export default AdminTransaction;