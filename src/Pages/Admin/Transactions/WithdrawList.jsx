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
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const AdminTransaction = () => {
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [isSortedAscending, setIsSortedAscending] = useState(true);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [qrCode, setQrCode] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        getTransactions();
    }, [searchTerm]);

    const getTransactions = () => {
        AdminWithdrawRequestService.getWithdrawRequests(searchTerm)
            .then(data => {
                setTransactions(data);
            })
            .catch(error => console.error('Error fetching transactions'));
    };

    // Tính toán dữ liệu hiển thị
    const sortedTransactions = [...transactions]
        .filter(transaction => (filterStatus ? transaction.status === filterStatus : true))
        .sort((a, b) => isSortedAscending
            ? new Date(a) - new Date(b)
            : new Date(b) - new Date(a)
        );

    // Phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getPaymentLink = async (withdrawId) => {
        try {
            const result = await AdminWithdrawRequestService.getWithdrawRequestPaymentLinkById(withdrawId);
            if (result?.qrCode) {
                setQrCode(result.qrCode);
                setIsModalOpen(true);
            }
        } catch (error) {
            showCustomNotification("error", "Lỗi khi nhận thông tin thanh toán!");
        }
    };

    const rejectPayment = async (withdrawId) => {
        setSelectedTransactionId(withdrawId);
        setIsRejectModalOpen(true);
    };

    const handleRejectConfirm = async () => {
        if (!rejectReason) {
            showCustomNotification("error", "Vui lòng nhập lý do từ chối!");
            return;
        }

        try {
            const result = await AdminWithdrawRequestService.rejectWithdrawRequests(selectedTransactionId, rejectReason);
            if (result) {
                getTransactions();
                showCustomNotification("success", "Từ chối yêu cầu thành công!");
                setIsRejectModalOpen(false);
                setRejectReason('');
            }
        } catch (error) {
            console.log("Error update status", error);
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
            const maxRetries = 10;
            await new Promise(resolve => setTimeout(resolve, 20000));
            while (!status && retries < maxRetries) {
                try {
                    const response = await UserService.checkTransactionStatus(addInfo);
                    status = response?.data?.isPaid || false;

                    if (!status) {
                        retries++;
                    }
                } catch (error) {
                    console.error("Error checking transaction status:", error);
                    showCustomNotification("error", "Lỗi không kiểm tra được trạng thái thanh toán!");
                    break;
                }
            }

            if (status) {
                showCustomNotification("success", "Giao dịch đã được xác nhận!");
                setIsModalOpen(false);
                getTransactions();
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
        if (qrCode) {
            handleDeposit();
        }
    }, [qrCode]);

    const handleSortByDate = () => {
        setIsSortedAscending(!isSortedAscending);
    };

    const resetFilters = () => {
        setFilterStatus(null);
        setIsSortedAscending(true);
        setCurrentPage(1); // Reset về trang đầu khi xóa bộ lọc
    };

    return (
        <div className="p-6">
            <Counts />
            <div className='font-bold text-6xl ml-3 my-8 text-blue-500'>
                <h1>Danh Sách Rút Tiền</h1>
            </div>
            <div className="flex items-center mb-6">
                <button onClick={handleSortByDate} className="border-2 border-gray-500 flex items-center p-2 rounded-xl">
                    <FiFilter className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Thời Gian</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8"
                    onClick={() => {
                        setFilterStatus("Pending");
                        setCurrentPage(1);
                    }}>
                    <FaUnlock className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Đang Chờ</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8"
                    onClick={() => {
                        setFilterStatus("Rejected");
                        setCurrentPage(1);
                    }}>
                    <FaUnlock className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Đã Từ Chối</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8"
                    onClick={() => {
                        setFilterStatus("Approved");
                        setCurrentPage(1);
                    }}>
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
                            <th className="p-3 border">STT</th>
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
                        {currentItems.length > 0 ? (
                            currentItems.map((transaction, index) => (
                                <tr key={transaction.id} className="hover:bg-gray-100">
                                    <td className="p-3 border text-center">{indexOfFirstItem + index + 1}</td>
                                    <td className="p-3 border text-center">{transaction.amount}</td>
                                    <td className="p-3 border text-center">{transaction.accountNumber || "N/A"}</td>
                                    <td className="p-3 border text-center">{transaction.reason || "Không"}</td>
                                    <td className="p-3 border text-center">{new Date(transaction.createdAt).toLocaleString()}</td>
                                    <td className="p-3 border text-center">{new Date(transaction.updatedAt).toLocaleString()}</td>
                                    <td className="p-3 border text-center">
                                        <span className={`px-2 py-1 rounded text-white ${transaction.status === "Pending" ? "bg-yellow-500" : transaction.status === "Rejected" ? "bg-red-500" : "bg-green-500"}`}>
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

                {/* Phân trang */}
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-blue-400 text-gray-600 rounded disabled:bg-gray-300"
                    >
                        <FaChevronLeft className="text-xl" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`px-4 py-2 mx-1 ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-blue-400 text-white"} rounded`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-blue-400 text-gray-600 rounded disabled:bg-gray-300"
                    >
                        <FaChevronRight className="text-xl" />
                    </button>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                            <h2 className="text-xl font-bold mb-2">Mã QR Chuyển Tiền</h2>
                            <img src={qrCode} alt="QR Code" className="mx-auto max-h-[600px]" />
                            <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded" onClick={() => setIsModalOpen(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
                {isRejectModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                            <h2 className="text-xl font-bold mb-4">Từ Chối Yêu Cầu</h2>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                                rows="4"
                                placeholder="Nhập lý do từ chối..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <div className="mt-4 flex justify-end">
                                <button
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg mr-2 hover:bg-gray-400"
                                    onClick={() => setIsRejectModalOpen(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    onClick={handleRejectConfirm}
                                >
                                    Xác Nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AdminTransaction;