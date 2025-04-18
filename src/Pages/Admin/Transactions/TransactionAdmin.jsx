import React, { useState, useEffect } from "react";
import { Card } from "@mantine/core";
import { CardContent } from "@mui/material";
import { BiBadgeCheck, BiLoaderCircle, BiXCircle } from "react-icons/bi";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import Icon from "../../../Components/Icon";
import Counts from "../../../Components/Counts";
import TransactionService from "../../../Services/Admin/TransactionService";

const statusStyles = {
    Paid: "text-green-600 bg-green-100",
    Pending: "text-yellow-600 bg-yellow-100",
    Canceled: "text-red-600 bg-red-100",
};

const statusLabels = {
    Paid: "Thành công",
    Pending: "Đang xử lý",
    Canceled: "Thất bại",
};

const TransactionAdmin = () => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState("");
    const [isSortedAscending, setIsSortedAscending] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = () => {
        TransactionService.getAllTransactions()
            .then((data) => setTransactions(data))
            .catch((err) => console.error("Lỗi tải tất cả giao dịch:", err));
    };

    const fetchDeposits = () => {
        TransactionService.getAllDeposits()
            .then((data) => setTransactions(data))
            .catch((err) => console.error("Lỗi tải giao dịch nạp tiền:", err));
    };

    const fetchWithdrawals = () => {
        TransactionService.getAllWithdrawals()
            .then((data) => setTransactions(data))
            .catch((err) => console.error("Lỗi tải giao dịch rút tiền:", err));
    };

    const handleSortByName = () => {
        const sorted = [...transactions].sort((a, b) => {
            return isSortedAscending
                ? a.userName.localeCompare(b.userName)
                : b.userName.localeCompare(a.userName);
        });
        setTransactions(sorted);
        setIsSortedAscending(!isSortedAscending);
    };

    const filteredTransactions = transactions.filter((txn) =>
        txn.userName?.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderStatus = (status) => {
        const label = statusLabels[status] || "Không xác định";
        const color = statusStyles[status] || "bg-gray-200 text-gray-600";
        let icon;
        switch (status) {
            case "Success":
                icon = <BiBadgeCheck className="inline w-4 h-4 mr-1" />;
                break;
            case "Pending":
                icon = <BiLoaderCircle className="inline w-4 h-4 mr-1" />;
                break;
            case "Canceled":
                icon = <BiXCircle className="inline w-4 h-4 mr-1" />;
                break;
            default:
                icon = null;
        }

        return (
            <span className={`px-2 py-1 rounded-full text-base flex items-center justify-center font-semibold ${color}`}>
                {label}
            </span>
        );
    };

    return (
        <div className="p-4 sm:p-6">
            <Counts />
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-500 my-6 sm:my-8">
                Quản lý giao dịch
            </h1>
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
                        <div className="flex gap-2 flex-wrap bg-white">
                            <button
                                onClick={handleSortByName}
                                className="border-2 border-gray-300 flex items-center p-2 rounded-xl"
                            >
                                <FiFilter className="mr-2 text-lg" />
                                <p className="font-medium text-base">Tên (A-Z)</p>
                            </button>
                            <button
                                onClick={fetchDeposits}
                                className="border-2 border-gray-300 flex items-center p-2 rounded-xl"
                            >
                                <p className="font-medium text-base">Nạp tiền</p>
                            </button>
                            <button
                                onClick={fetchWithdrawals}
                                className="border-2 border-gray-300 flex items-center p-2 rounded-xl"
                            >
                                <p className="font-medium text-base">Rút tiền</p>
                            </button>
                            <button
                                onClick={fetchAll}
                                className="border-2 border-gray-300 flex items-center p-2 rounded-xl"
                            >
                                <p className="font-medium text-base">Tất cả</p>
                            </button>
                        </div>
                        <div className="relative w-full sm:w-1/2 lg:w-1/3">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên người dùng..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border w-full p-2 h-11 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                            <Icon
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                name="search"
                            />
                        </div>
                    </div>

                    <div className="shadow rounded-lg border border-gray-200 overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 font-medium text-left">#</th>
                                    <th className="p-3 font-medium text-left">Tên người dùng</th>
                                    <th className="p-3 font-medium text-left hidden md:table-cell">Gmail</th>
                                    <th className="p-3 font-medium text-left">Số tiền</th>
                                    <th className="p-3 font-medium text-left">Nội dung</th>
                                    <th className="p-3 font-medium text-center">Trạng thái</th>
                                    <th className="p-3 font-medium text-left">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTransactions.length > 0 ? (
                                    paginatedTransactions.map((txn, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50 text-sm">
                                            <td className="p-3 text-left break-words">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className="p-3 text-left break-words">{txn.userName}</td>
                                            <td className="p-3 text-left hidden md:table-cell break-words">{txn.gmail}</td>
                                            <td className="p-3 text-left break-words">{txn.amount.toLocaleString()} đ</td>
                                            <td className="p-3 text-left break-words">{txn.description}</td>
                                            <td className="p-3 text-left">{renderStatus(txn.status)}</td>
                                            <td className="p-3 text-left break-words">
                                                {txn.createdAt ? (() => {
                                                    const d = new Date(txn.createdAt);
                                                    const day = d.getDate().toString().padStart(2, "0");
                                                    const month = (d.getMonth() + 1).toString().padStart(2, "0");
                                                    const year = d.getFullYear();
                                                    const hours = d.getHours().toString().padStart(2, "0");
                                                    const minutes = d.getMinutes().toString().padStart(2, "0");
                                                    const seconds = d.getSeconds().toString().padStart(2, "0");
                                                    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                                                })() : "—"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center p-6 text-gray-500">
                                            Không tìm thấy kết quả.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center mt-4 items-center max-w-3xl mx-auto">
                        {/* Previous Button */}
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md border text-sm sm:text-base font-medium flex items-center justify-center ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-blue-100"
                                }`}
                        >
                            <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        {/* Page Numbers with Responsive Logic */}
                        {(() => {
                            const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
                            const maxVisiblePages = window.innerWidth < 640 ? 3 : 5; // Show fewer pages on mobile
                            const pages = [];
                            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                            // Adjust startPage if endPage is at the maximum
                            if (endPage === totalPages) {
                                startPage = Math.max(1, endPage - maxVisiblePages + 1);
                            }

                            // Add ellipsis before if there are skipped pages
                            if (startPage > 1) {
                                pages.push(
                                    <button
                                        key="start-ellipsis"
                                        className="px-3 py-2 sm:px-4 sm:py-2 rounded-md border text-sm sm:text-base font-medium flex items-center justify-center bg-white text-gray-500"
                                        disabled
                                    >
                                        ...
                                    </button>
                                );
                            }

                            // Add page numbers
                            for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i)}
                                        className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-medium flex items-center justify-center ${currentPage === i
                                            ? "bg-blue-500 text-white border-blue-500"
                                            : "bg-white text-gray-500 hover:bg-blue-100"
                                            }`}
                                    >
                                        {i}
                                    </button>
                                );
                            }

                            // Add ellipsis after if there are more pages
                            if (endPage < totalPages) {
                                pages.push(
                                    <button
                                        key="end-ellipsis"
                                        className="px-3 py-2 sm:px-4 sm:py-2 rounded-md border text-sm sm:text-base font-medium flex items-center justify-center bg-white text-gray-500"
                                        disabled
                                    >
                                        ...
                                    </button>
                                );
                            }

                            return pages;
                        })()}

                        {/* Next Button */}
                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, Math.ceil(filteredTransactions.length / itemsPerPage))
                                )
                            }
                            disabled={currentPage === Math.ceil(filteredTransactions.length / itemsPerPage)}
                            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md border text-sm sm:text-base font-medium flex items-center justify-center ${currentPage === Math.ceil(filteredTransactions.length / itemsPerPage)
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-700 hover:bg-blue-100"
                                }`}
                        >
                            <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TransactionAdmin;
