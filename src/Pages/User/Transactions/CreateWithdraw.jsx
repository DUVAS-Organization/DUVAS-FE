import { useState, useEffect } from "react";
import Layout from "../../../Components/Layout/Layout";
import Footer from "../../../Components/Layout/Footer";
import UserService from "../../../Services/User/UserService";
import { showCustomNotification } from "../../../Components/Notification";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const WithdrawPage = () => {
    // State for CreateWithdraw component
    const [amount, setAmount] = useState("");
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedBank, setSelectedBank] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // State for WithdrawTransaction component
    const [withdrawRequests, setWithdrawRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Fetch bank accounts and withdraw requests on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch bank accounts
                const bankResponse = await UserService.getBankAccounts();
                if (bankResponse.status === 200) {
                    const activeBanks = bankResponse.data.filter(bank => bank.status === "Active");
                    setBankAccounts(activeBanks);
                }

                // Fetch withdraw requests
                const withdrawResponse = await UserService.getCurrentUserWithdrawRequest();
                setWithdrawRequests(withdrawResponse.data);
            } catch (error) {
                // setError("Failed to fetch data.");
                // showCustomNotification("error", "Có lỗi xảy ra!");
            }
        };
        const intervalId = setInterval(fetchData, 2000); // every 2 seconds
        return () => {
            clearInterval(intervalId); // clean up on unmount
        };
    }, []);

    // Handle withdraw submission
    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (!amount || !selectedBank) {
            setError("Please enter an amount and select a bank.");
            return;
        }
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await UserService.withdraw(amount, selectedBank);
            if (response.status === 200) {
                showCustomNotification("success", "Tạo đơn rút tiền thành công!");
                setAmount("");
                setSelectedBank("");
                // Refresh withdraw requests after successful submission
                const updatedRequests = await UserService.getCurrentUserWithdrawRequest();
                setWithdrawRequests(updatedRequests.data);
            } else {
                showCustomNotification("error", "Vui lòng kiểm tra lại đơn rút tiền!");
            }
        } catch (err) {
            setError("An error occurred while processing your request.");
        } finally {
            setLoading(false);
        }
    };

    // Pagination logic for WithdrawTransaction
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = withdrawRequests.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <Layout showNavbar={false} showSidebar={true}>
            <div className="max-w-6xl mx-auto p-4 space-y-6 ">
                {/* CreateWithdraw Section */}
                <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700 dark:text-white">Tạo đơn rút tiền</h1>

                    {/* Success & Error Messages */}
                    {message && <p className="text-green-600 bg-green-100 p-3 rounded">{message}</p>}
                    {error && <p className="text-red-600 bg-red-100 p-3 rounded">{error}</p>}

                    <form onSubmit={handleWithdraw} className="space-y-4">
                        {/* Amount Input */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1 dark:text-white">Số tiền cần rút:</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full dark:bg-gray-800 dark:text-white p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Nhập số tiền"
                                min="1000"
                                required
                            />
                        </div>

                        {/* Bank Account Dropdown */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1 dark:text-white">Chọn tài khoản ngân hàng:</label>
                            <select
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                className="w-full p-2 dark:bg-gray-800 dark:text-white border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            >
                                <option value="">Chọn tài khoản</option>
                                {bankAccounts.length > 0 ? (
                                    bankAccounts.map((bank) => (
                                        <option key={bank.id} value={bank.id}>
                                            {bank.bankCode} - {bank.accountName} - {bank.accountNumber}
                                        </option>
                                    ))
                                ) : (
                                    <option>No bank account</option>
                                )}
                            </select>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition duration-200"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Rút tiền"}
                        </button>
                    </form>
                </div>

                {/* WithdrawTransaction Section */}
                <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700 dark:text-white">Lịch sử rút tiền</h1>
                    <div className="flex justify-center">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg dark:bg-gray-800 dark:text-white">
                                <thead className="bg-gray-200 dark:bg-gray-800 dark:text-white">
                                    <tr>
                                        <th className="p-3 border">STT</th>
                                        <th className="p-3 border">Ngân hàng</th>
                                        <th className="px-4 py-2 border">Số tài khoản</th>
                                        <th className="p-3 border">Số Tiền</th>
                                        <th className="p-3 border">Ngày Tạo Đơn</th>
                                        <th className="p-3 border">Ngày Cập Nhật Đơn</th>
                                        <th className="p-3 border">Trạng Thái</th>
                                        <th className="p-3 border">Lý Do</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((transaction, index) => (
                                            <tr key={transaction.id} className="hover:bg-gray-100 dark:hover:text-black">
                                                <td className="p-3 border text-center">{indexOfFirstItem + index + 1}</td>
                                                <td className="p-3 border">{transaction.bankCode}</td>
                                                <td className="px-4 py-2 border">{transaction.accountNumber}</td>
                                                <td className="p-3 border text-center">{transaction.amount}</td>
                                                <td className="p-3 border">{new Date(transaction.createdAt).toLocaleString()}</td>
                                                <td className="p-3 border">{new Date(transaction.updatedAt).toLocaleString()}</td>
                                                <td className="p-3 border text-center">
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${transaction.status === "Pending"
                                                            ? "bg-yellow-500"
                                                            : transaction.status === "Rejected"
                                                                ? "bg-red-500"
                                                                : "bg-green-500"
                                                            }`}
                                                    >
                                                        {transaction.status === "Pending"
                                                            ? "Đang xử lý"
                                                            : transaction.status === "Rejected"
                                                                ? "Đã Từ Chối"
                                                                : "Đã Xử Lý"}
                                                    </span>
                                                </td>
                                                <td className="p-3 border">{transaction.reason || "Không"}</td>
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

                    {/* Pagination */}
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
                        >
                            <FaChevronLeft />
                            {/* Previous */}
                        </button>
                        {Array.from({ length: Math.ceil(withdrawRequests.length / itemsPerPage) }, (_, i) => (
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
                            disabled={currentPage === Math.ceil(withdrawRequests.length / itemsPerPage)}
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

export default WithdrawPage;