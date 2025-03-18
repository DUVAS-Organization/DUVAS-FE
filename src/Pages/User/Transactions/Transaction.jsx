import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../../Components/Layout/Layout";
import Footer from "../../../Components/Layout/Footer";
import UserService from "../../../Services/User/UserService";
import { showCustomNotification } from "../../../Components/Notification";

const Transaction = () => {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        const getTransactions = async () => {
            try {
                const data = await UserService.getTransactions();
                setTransactions(data.data.transactions.result);
            } catch (error) {
                console.error("Error fetching bank accounts:", error);
                // showCustomNotification("error", "Có lỗi xảy ra!");
            }
        }
        getTransactions();
    }, []);
    function checkData() {
        console.log(transactions);
    }
    return (
        <Layout showNavbar={false} showSidebar={true}>
            <div className="max-w-6xl mx-auto p-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700">
                        Quản lý tài khoản của bạn.
                    </h1>
                    <div className="flex justify-center">
                        <div className="overflow-x-auto min-w-[80%]">
                            <table className="min-w-full table-fixed bg-white border border-gray-300 shadow-md rounded-lg">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="p-3 border w-[100px]">Mã</th>
                                        <th className="p-3 border w-[120px]">Số Tiền</th>
                                        <th className="p-3 border w-[150px]">Ngân Hàng</th>
                                        <th className="p-3 border w-[250px]">Nội Dung</th>
                                        <th className="p-3 border w-[180px]">Ngày Tạo</th>
                                        <th className="p-3 border w-[130px]">Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length > 0 ? (
                                        transactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-100">
                                                <td className="p-3 border text-center">{transaction.id}</td>
                                                <td className="p-3 border text-center whitespace-nowrap">{transaction.amount}</td>
                                                <td className="p-3 border whitespace-nowrap">{transaction.bankName || "N/A"}</td>
                                                <td className="p-3 border truncate">{transaction.description || "N/A"}</td>
                                                <td className="p-3 border">
                                                    {transaction.when
                                                        ? new Date(transaction.when).toLocaleString()
                                                        : transaction.createdAt
                                                            ? new Date(transaction.createdAt).toLocaleString()
                                                            : "N/A"}
                                                </td>
                                                <td className="p-3 border text-center">
                                                    <span
                                                        className={`px-2 py-1 rounded text-white ${transaction.status === "Pending" ? "bg-yellow-500" : "bg-green-500"
                                                            }`}
                                                    >
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="p-4 text-center text-gray-500">
                                                Không có giao dịch nào khả dụng.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    );

}
export default Transaction;