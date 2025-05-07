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
import Modal from 'react-modal';

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
                console.log('Fetched transactions:', data); // Log để kiểm tra dữ liệu
                setTransactions(data);
            })
            .catch(error => console.error('Error fetching transactions:', error));
    };

    // Tính toán dữ liệu hiển thị
    const sortedTransactions = [...transactions]
        .filter(transaction => (filterStatus ? transaction.status === filterStatus : true))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Mới nhất lên đầu

    // Phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getPaymentLink = async (withdrawId) => {
        try {
            const result = await AdminWithdrawRequestService.getWithdrawRequestPaymentLinkById(withdrawId);
            console.log('Payment link result:', result); // Log để kiểm tra
            if (result?.qrCode) {
                setQrCode(result.qrCode);
                setIsModalOpen(true);
            } else {
                showCustomNotification("error", "Không nhận được mã QR!");
            }
        } catch (error) {
            console.error('Error getting payment link:', error);
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
            console.error("Error updating status:", error);
            showCustomNotification("error", "Lỗi khi từ chối yêu cầu thanh toán!");
        }
    };

    const handleDeposit = async () => {
        if (!qrCode) {
            console.warn('No QR code available');
            return;
        }

        try {
            let params = new URLSearchParams(new URL(qrCode).search);
            const addInfo = params.get("addInfo");
            console.log('addInfo extracted:', addInfo); // Log để kiểm tra

            if (!addInfo) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.error("Invalid QR Code URL: missing addInfo");
                showCustomNotification("error", "Thiếu thông tin trong QR code!");
                return;
            }

            let status = false;
            let retries = 0;
            const maxRetries = 30; // Tăng lên 30 để kéo dài thời gian polling
            while (!status && retries < maxRetries) {
                try {
                    const startTime = Date.now();
                    const response = await UserService.checkTransactionStatus(addInfo);
                    console.log(`Polling attempt ${retries + 1}:`, {
                        response,
                        timeTaken: `${Date.now() - startTime}ms`
                    }); // Log chi tiết phản hồi API
                    status = response?.data?.isPaid || false;

                    if (!status) {
                        retries++;
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Chờ 1 giây
                    }
                } catch (error) {
                    console.error(`Polling error at attempt ${retries + 1}:`, error);
                    showCustomNotification("error", "Lỗi không kiểm tra được trạng thái thanh toán!");
                    break;
                }
            }

            if (status) {
                console.log('Transaction confirmed successfully');
                showCustomNotification("success", "Giao dịch đã được xác nhận!");
                setTimeout(() => {
                    setIsModalOpen(false);
                    getTransactions(); // Làm mới danh sách sau 0.5 giây
                }, 500);
            } else {
                console.warn(`Polling stopped after ${maxRetries} attempts`);
                showCustomNotification("warning", "Giao dịch quá thời hạn!");
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error("Error parsing QR Code URL:", error);
            showCustomNotification("error", "Lỗi không xử lý được QR code!");
            setIsModalOpen(false);
        }
    };

    useEffect(() => {
        if (qrCode) {
            console.log('Starting polling for QR code:', qrCode);
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
        <div className="container mx-auto px-4 py-6">
            <Counts />
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 my-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-500 mb-4 sm:mb-0">
                    Danh Sách Rút Tiền
                </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                {/* Các nút lọc trạng thái */}
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
                    <button
                        onClick={() => {
                            setFilterStatus("Pending");
                            setCurrentPage(1);
                        }}
                        className="flex items-center border bg-white border-gray-400 rounded-md px-3 py-2 hover:bg-gray-100 transition"
                    >
                        <FaUnlock className="mr-2 text-lg" />
                        <span className="font-medium text-sm">Đang Chờ</span>
                    </button>
                    <button
                        onClick={() => {
                            setFilterStatus("Rejected");
                            setCurrentPage(1);
                        }}
                        className="flex items-center border bg-white border-gray-400 rounded-md px-3 py-2 hover:bg-gray-100 transition"
                    >
                        <FaUnlock className="mr-2 text-lg" />
                        <span className="font-medium text-sm">Đã Từ Chối</span>
                    </button>
                    <button
                        onClick={() => {
                            setFilterStatus("Approved");
                            setCurrentPage(1);
                        }}
                        className="flex items-center border bg-white border-gray-400 rounded-md px-3 py-2 hover:bg-gray-100 transition"
                    >
                        <FaLock className="mr-2 text-lg" />
                        <span className="font-medium text-sm">Thành Công</span>
                    </button>
                    <button
                        onClick={resetFilters}
                        className="flex items-center border bg-gray-200 border-gray-400 rounded-md px-3 py-2 hover:bg-gray-300 transition"
                    >
                        <FaRedo className="mr-2 text-lg" />
                        <span className="font-medium text-sm">Tất Cả</span>
                    </button>
                </div>

                {/* Ô tìm kiếm */}
                <div className="relative w-full sm:w-1/3">
                    <input
                        type="text"
                        placeholder="Tìm số tài khoản..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-md pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <Icon name="search" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
            </div>

            <div className="shadow rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full table-fixed bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-[5%] px-2 py-2 text-center text-sm font-medium text-gray-600">STT</th>
                            <th className="w-[15%] px-2 py-2 text-center text-sm font-medium text-gray-600">Số Tiền</th>
                            <th className="w-[15%] px-2 py-2 text-center text-sm font-medium text-gray-600">Số Tài Khoản</th>
                            <th className="w-[15%] px-2 py-2 text-center text-sm font-medium text-gray-600">Lý Do</th>
                            <th className="w-[15%] px-2 py-2 text-center text-sm font-medium text-gray-600">Ngày Tạo Đơn</th>
                            <th className="w-[15%] px-2 py-2 text-center text-sm font-medium text-gray-600">Ngày Cập Nhật Đơn</th>
                            <th className="w-[10%] px-2 py-2 text-center text-sm font-medium text-gray-600">Trạng Thái</th>
                            <th className="w-[10%] px-2 py-2 text-center text-sm font-medium text-gray-600">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((transaction, index) => (
                                <tr key={transaction.id} className="border-t border-gray-200 hover:bg-gray-100">
                                    <td className="px-2 py-2 text-center text-sm text-gray-700">{indexOfFirstItem + index + 1}</td>
                                    <td className="px-2 py-2 text-center text-sm text-gray-700">{transaction.amount}</td>
                                    <td className="px-2 py-2 text-center text-sm text-gray-700">{transaction.accountNumber || "N/A"}</td>
                                    <td className="px-2 py-2 text-center text-sm text-gray-700">{transaction.reason || "Không"}</td>
                                    <td className="px-2 py-2 text-center text-sm text-gray-700">{new Date(transaction.createdAt).toLocaleString()}</td>
                                    <td className="px-2 py-2 text-center text-sm text-gray-700">{new Date(transaction.updatedAt).toLocaleString()}</td>
                                    <td className="px-2 py-2 text-center text-sm">
                                        <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${transaction.status === "Pending" ? "bg-yellow-500" :
                                            transaction.status === "Rejected" ? "bg-red-500" :
                                                "bg-green-500"
                                            }`}>
                                            {transaction.status === "Pending"
                                                ? "Đang xử lý"
                                                : transaction.status === "Rejected"
                                                    ? "Đã Từ Chối"
                                                    : "Đã Xử Lý"}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <div className="flex justify-center items-center gap-2 text-sm whitespace-nowrap">
                                            <button
                                                className={`text-blue-600 hover:underline ${transaction.status !== "Pending" ? "opacity-50 cursor-not-allowed" : ""
                                                    }`}
                                                disabled={transaction.status !== "Pending"}
                                                onClick={() => getPaymentLink(transaction.id)}
                                            >
                                                Chuyển Tiền
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button
                                                className={`text-blue-600 hover:underline ${transaction.status !== "Pending" ? "opacity-50 cursor-not-allowed" : ""
                                                    }`}
                                                disabled={transaction.status !== "Pending"}
                                                onClick={() => rejectPayment(transaction.id)}
                                            >
                                                Từ Chối
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-4 py-4 text-center text-gray-500 text-sm">
                                    Không tìm thấy kết quả
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Phân trang */}
                <div className="flex justify-center mt-4 p-4">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px  px-4 py-2 bg-blue-400 text-white rounded disabled:bg-gray-300"
                    >
                        <FaChevronLeft className="text-xl" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`px-4 py-2 mx-1 ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-blue-400 text-white"
                                } rounded`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-blue-400 text-white rounded disabled:bg-gray-300"
                    >
                        <FaChevronRight className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Modal QR Code */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="Mã QR Chuyển Tiền"
                className="w-11/12 sm:w-1/2 mx-auto my-6 p-6 bg-white rounded-lg shadow-lg outline-none"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <h1 className="text-xl font-bold text-blue-600 mb-4">Mã QR Chuyển Tiền</h1>
                <img src={qrCode} alt="QR Code" className="mx-auto max-h-[500px] mb-6" />
                <div className="flex justify-center">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                        Đóng
                    </button>
                </div>
            </Modal>

            {/* Modal Từ Chối */}
            <Modal
                isOpen={isRejectModalOpen}
                onRequestClose={() => setIsRejectModalOpen(false)}
                contentLabel="Từ Chối Yêu Cầu"
                className="w-11/12 sm:w-1/3 mx-auto my-6 p-6 bg-white rounded-lg shadow-lg outline-none"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <h1 className="text-xl font-bold text-red-600 mb-4">Từ Chối Yêu Cầu</h1>
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 mb-4"
                    rows="4"
                    placeholder="Nhập lý do từ chối..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex justify-end">
                    <button
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition mr-3"
                        onClick={() => setIsRejectModalOpen(false)}
                    >
                        Hủy
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                        onClick={handleRejectConfirm}
                    >
                        Xác Nhận
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminTransaction;