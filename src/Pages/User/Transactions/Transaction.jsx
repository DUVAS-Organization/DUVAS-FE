import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../../Components/Layout/Layout";
import Footer from "../../../Components/Layout/Footer";
import UserService from "../../../Services/User/UserService";
import BookingManagementService from "../../../Services/Landlord/BookingManagementService";
import { showCustomNotification } from "../../../Components/Notification";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../../../Context/AuthProvider";

const Transaction = () => {
    const [bankTransactions, setBankTransactions] = useState([]);
    const [insiderTransactions, setInsiderTransactions] = useState([]);
    const [userNames, setUserNames] = useState({});
    const [currentPageBank, setCurrentPageBank] = useState(1);
    const [currentPageInsider, setCurrentPageInsider] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { user } = useAuth();
    const userId = user?.userId;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch bank transactions
                const bankData = await UserService.getTransactions();
                setBankTransactions(bankData.data.transactions.result);

                // Fetch insider transactions
                if (!userId) {
                    throw new Error("User ID không tồn tại");
                }
                const insiderData = await BookingManagementService.getMyInsiderTrading(user.token);
                setInsiderTransactions(insiderData);

                // Fetch user names for remitter and receiver in insider transactions
                const uniqueUserIds = [...new Set(insiderData.flatMap(t => [t.remitter, t.receiver]))];
                const namePromises = uniqueUserIds.map(id =>
                    UserService.getUserById(id)
                        .then(response => ({ id, name: response.name || `User ${id}` }))
                        .catch(() => ({ id, name: `User ${id}` }))
                );
                const nameResults = await Promise.all(namePromises);
                const nameMap = nameResults.reduce((acc, { id, name }) => {
                    acc[id] = name;
                    return acc;
                }, {});
                setUserNames(nameMap);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                // showCustomNotification("error", error.message || "Có lỗi xảy ra!");
            }
        };
        fetchData();
    }, [userId, user?.token]);

    // Pagination for bank transactions
    const indexOfLastBankItem = currentPageBank * itemsPerPage;
    const indexOfFirstBankItem = indexOfLastBankItem - itemsPerPage;
    const currentBankItems = bankTransactions.slice(indexOfFirstBankItem, indexOfLastBankItem);

    // Pagination for insider transactions
    const indexOfLastInsiderItem = currentPageInsider * itemsPerPage;
    const indexOfFirstInsiderItem = indexOfLastInsiderItem - itemsPerPage;
    const currentInsiderItems = insiderTransactions.slice(indexOfFirstInsiderItem, indexOfLastInsiderItem);

    // Chuyển trang
    const paginateBank = (pageNumber) => setCurrentPageBank(pageNumber);
    const paginateInsider = (pageNumber) => setCurrentPageInsider(pageNumber);

    // Format status for bank transactions
    const formatBankStatus = (status) => {
        switch (status) {
            case "Pending":
                return <span className="px-2 py-1 rounded text-white bg-yellow-500">Đang xử lý</span>;
            case "Canceled":
                return <span className="px-2 py-1 rounded text-white bg-red-500">Đã Từ Chối</span>;
            case "Paid":
                return <span className="px-2 py-1 rounded text-white bg-green-500">Đã Xử Lý</span>;
            default:
                return <span className="px-2 py-1 rounded text-white bg-gray-500">{status}</span>;
        }
    };

    // Format status for insider transactions
    const formatInsiderStatus = (status) => {
        switch (status) {
            case 1:
                return <span className="px-2 py-1 rounded-full text-white bg-green-500 whitespace-nowrap">Đã xử lý</span>;
            case 2:
                return <span className="px-2 py-1 rounded-full text-white bg-yellow-500 whitespace-nowrap">Đang xử lý</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-white bg-red-500 whitespace-nowrap">Đã hủy</span>;
        }
    };

    // Format type for insider transactions
    const formatType = (type) => {
        return type === "MonthlyPayment" ? "Thanh toán hàng tháng" : "Thanh toán lần đầu";
    };

    // Format money with proper VND formatting
    const formatMoney = (amount) => {
        const formatted = amount.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " đ";
        return formatted;
    };

    // Replace user IDs and format money in note
    const formatNote = (note) => {
        let formattedNote = note;
        const userIdRegex = /User ID (\d+)/g;
        const matches = note.match(userIdRegex);
        if (matches) {
            matches.forEach(match => {
                const userId = parseInt(match.replace("User ID ", ""));
                const userName = userNames[userId] || `User ${userId}`;
                formattedNote = formattedNote.replace(match, userName);
            });
        }
        // Format money in note (e.g., "202010,00" to "202.010 đ")
        const moneyRegex = /(\d+),(\d+)/g;
        formattedNote = formattedNote.replace(moneyRegex, (match, amountPart, decimalPart) => {
            const amount = parseInt(amountPart);
            return formatMoney(amount);
        });
        return formattedNote;
    };

    return (
        <Layout showNavbar={false} showSidebar={true}>
            <div className="max-w-6xl mx-auto p-4 dark:bg-gray-800 dark:text-white">
                <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:text-white mb-8">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700">Lịch sử nạp rút</h1>
                    <div className="flex justify-center">
                        <div className="overflow-x-auto min-w-[80%]">
                            <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg dark:bg-gray-800 dark:text-white">
                                <thead className="bg-gray-200 dark:bg-gray-800 dark:text-white">
                                    <tr>
                                        <th className="p-3 border text-center whitespace-nowrap">#</th>
                                        <th className="p-3 border text-center whitespace-nowrap">Ngày Tạo</th>
                                        <th className="p-3 border text-center whitespace-nowrap">Số Tiền</th>
                                        <th className="p-3 border text-center whitespace-nowrap">Ngân hàng</th>
                                        <th className="p-3 border text-center whitespace-nowrap">Nội Dung</th>
                                        <th className="p-3 border text-center whitespace-nowrap">Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentBankItems.length > 0 ? (
                                        currentBankItems.map((transaction, index) => (
                                            <tr key={transaction.id} className="hover:bg-gray-100 dark:hover:text-black">
                                                <td className="p-3 border text-center">{indexOfFirstBankItem + index + 1}</td>
                                                <td className="p-3 border text-center">
                                                    {transaction.when
                                                        ? new Date(transaction.when).toLocaleString()
                                                        : transaction.createdAt
                                                            ? new Date(transaction.createdAt).toLocaleString()
                                                            : "N/A"}
                                                </td>
                                                <td className="p-3 border text-center">
                                                    {transaction.amount.toLocaleString("vi-VN", { style: "decimal" })}
                                                </td>
                                                <td className="p-3 border text-center">{transaction.bankName}</td>
                                                <td className="p-3 border text-center">{transaction.description || "N/A"}</td>
                                                <td className="p-3 border text-center">
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${transaction.status === "Pending"
                                                            ? "bg-yellow-500"
                                                            : transaction.status === "Canceled"
                                                                ? "bg-red-500"
                                                                : "bg-green-500"
                                                            }`}
                                                    >
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
                                            <td colSpan="6" className="p-4 text-center text-gray-500">
                                                Không có giao dịch nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Phân trang cho Lịch sử giao dịch */}
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => paginateBank(currentPageBank - 1)}
                            disabled={currentPageBank === 1}
                            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
                        >
                            <FaChevronLeft />
                        </button>
                        {Array.from({ length: Math.ceil(bankTransactions.length / itemsPerPage) }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginateBank(i + 1)}
                                className={`px-4 py-2 mx-1 ${currentPageBank === i + 1 ? "bg-red-600 text-white" : "bg-red-500 text-white"} rounded`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginateBank(currentPageBank + 1)}
                            disabled={currentPageBank === Math.ceil(bankTransactions.length / itemsPerPage)}
                            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700">Lịch sử giao dịch</h1>
                    <div className="flex justify-center">
                        <div className="overflow-x-auto min-w-[80%]">
                            <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg dark:bg-gray-800 dark:text-white">
                                <thead className="bg-gray-200 dark:bg-gray-800 dark:text-white">
                                    <tr>
                                        <th className="p-3 border text-center whitespace-nowrap">#</th>
                                        <th className="p-3 border text-center whitespace-nowrap">Ngày tạo</th>
                                        <th className="p-3 border text-center whitespace-nowrap">Người gửi</th>
                                        <th className="p-3 border text-center whitespace-nowrap">Người nhận</th>
                                        <th className="p-3 border text-center whitespace-nowrap w-24">Số tiền</th>
                                        <th className="p-3 border text-center whitespace-nowrap">Loại</th>
                                        <th className="p-3 border text-center whitespace-nowrap">Ghi chú</th>
                                        {/* <th className="p-3 border text-center whitespace-nowrap w-32">Trạng thái</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentInsiderItems.length > 0 ? (
                                        currentInsiderItems.map((transaction, index) => (
                                            <tr key={transaction.insiderTradingId} className="hover:bg-gray-100 dark:hover:text-black">
                                                <td className="p-3 border text-center">{indexOfFirstInsiderItem + index + 1}</td>
                                                <td className="p-3 border text-center">
                                                    {new Date(transaction.createdDate).toLocaleString("vi-VN", {
                                                        // hour: "2-digit",
                                                        // minute: "2-digit",
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className="p-3 border text-center">{userNames[transaction.remitter] || `User ${transaction.remitter}`}</td>
                                                <td className="p-3 border text-center">{userNames[transaction.receiver] || `User ${transaction.receiver}`}</td>
                                                <td className="p-3 border text-center">{formatMoney(transaction.money)}</td>
                                                <td className="p-3 border text-center">{formatType(transaction.type)}</td>
                                                <td className="p-3 border text-left max-w-xs whitespace-normal break-words">{formatNote(transaction.note)}</td>
                                                {/* <td className="p-3 border text-center">{formatInsiderStatus(transaction.status)}</td> */}
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

                    {/* Phân trang cho Lịch sử giao dịch nội bộ */}
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => paginateInsider(currentPageInsider - 1)}
                            disabled={currentPageInsider === 1}
                            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
                        >
                            <FaChevronLeft />
                        </button>
                        {Array.from({ length: Math.ceil(insiderTransactions.length / itemsPerPage) }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginateInsider(i + 1)}
                                className={`px-4 py-2 mx-1 ${currentPageInsider === i + 1 ? "bg-red-600 text-white" : "bg-red-500 text-white"} rounded`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginateInsider(currentPageInsider + 1)}
                            disabled={currentPageInsider === Math.ceil(insiderTransactions.length / itemsPerPage)}
                            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    );
};

export default Transaction;