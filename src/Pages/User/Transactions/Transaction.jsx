import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../../Components/Layout/Layout";
import Footer from "../../../Components/Layout/Footer";
import UserService from "../../../Services/User/UserService";
import { showCustomNotification } from "../../../Components/Notification";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Transaction = () => {
    const [transactions, setTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [itemsPerPage, setItemsPerPage] = useState(10); // Số lượng item mỗi trang

    useEffect(() => {
        const getTransactions = async () => {
            try {
                const data = await UserService.getTransactions();
                setTransactions(data.data.transactions.result);
            } catch (error) {
                console.error("Error fetching bank accounts:", error);
                showCustomNotification("error", "Có lỗi xảy ra!");
            }
        };
        getTransactions();
    }, []);

    // Tính toán dữ liệu hiển thị trên trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);

    // Chuyển trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <Layout showNavbar={false} showSidebar={true}>
            <div className="max-w-6xl mx-auto p-4 dark:bg-gray-800 dark:text-white">
                <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700">Lịch sử giao dịch</h1>
                    <div className="flex justify-center">
                        <div className="overflow-x-auto min-w-[80%]">
                            <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg dark:bg-gray-800 dark:text-white">
                                <thead className="bg-gray-200 dark:bg-gray-800 dark:text-white">
                                    <tr>
                                        <th className="p-3 border">STT</th>
                                        <th className="p-3 border">Ngày Tạo</th>
                                        <th className="p-3 border">Số Tiền</th>
                                        <th className="p-3 border">Ngân hàng</th>
                                        <th className="p-3 border">Nội Dung</th>
                                        <th className="p-3 border">Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((transaction, index) => (
                                            <tr key={transaction.id} className="hover:bg-gray-100 dark:hover:text-black">
                                                <td className="p-3 border text-center">{indexOfFirstItem + index + 1}</td> {/* Hiển thị STT */}
                                                <td className="p-3 border">
                                                    {transaction.when
                                                        ? new Date(transaction.when).toLocaleString()
                                                        : transaction.createdAt
                                                            ? new Date(transaction.createdAt).toLocaleString()
                                                            : "N/A"}
                                                </td>
                                                <td className="p-3 border text-center">
                                                    {transaction.amount.toLocaleString("vi-VN", { style: "decimal" })}
                                                </td>
                                                <td className="p-3 border">{transaction.bankName}</td>
                                                <td className="p-3 border">{transaction.description || "N/A"}</td>
                                                <td className="p-3 border text-center">
                                                    <span className={`px-2 py-1 rounded text-white ${transaction.status === "Pending" ? "bg-yellow-500" : transaction.status === "Paid" ? "bg-green-500" : "bg-red-500"}`}>
                                                        {transaction.status === "Pending"
                                                            ? "Đang xử lý"
                                                            : transaction.status === "Canceled"
                                                                ? "Đã Từ Chối"
                                                                : "Đã Xử Lý"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="p-4 text-center text-gray-500">
                                                Không có giao dịch nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Phân trang */}
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
                        >
                            <FaChevronLeft />
                            {/* Previous */}
                        </button>
                        {Array.from({ length: Math.ceil(transactions.length / itemsPerPage) }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`px-4 py-2 mx-1 ${currentPage === i + 1 ? "bg-red-600 text-white" : "bg-red-500 text-white"} rounded`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === Math.ceil(transactions.length / itemsPerPage)}
                            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
                        >
                            <FaChevronRight />
                            {/* Next */}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    );
};

export default Transaction;