import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../../Components/Layout/Layout";
import Footer from "../../../Components/Layout/Footer";
import UserService from "../../../Services/User/UserService";
import { showCustomNotification } from "../../../Components/Notification";

const WithdrawTransaction = () => {
    const [withdrawRequests, setWithdrawRequests] = useState([]);
    useEffect(() => {
        const getTransactions = async () => {
            try {
                const data = await UserService.getCurrentUserWithdrawRequest();
                setWithdrawRequests(data.data);
            } catch (error) {
                console.error("Error fetching bank accounts:", error);
                // showCustomNotification("error", "Có lỗi xảy ra!");
            }
        }
        getTransactions();
    }, []);

    return (
        <Layout showNavbar={false} showSidebar={true}>
            <div className="max-w-6xl mx-auto p-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700">Quản lý tài khoản của bạn.</h1>
                    <div className="flex justify-center">
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-fixed bg-white border border-gray-300 shadow-md rounded-lg">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="p-3 border w-[80px] text-left">Mã</th>
                                        <th className="p-3 border w-[150px] text-left">Mã Giao Dịch</th>
                                        <th className="p-3 border w-[120px] text-left">Ngân hàng</th>
                                        <th className="p-3 border w-[180px] text-left">Ngày Tạo Đơn</th>
                                        <th className="p-3 border w-[180px] text-left">Ngày Cập Nhật Đơn</th>
                                        <th className="p-3 border w-[120px] text-left">Trạng Thái</th>
                                        <th className="p-3 border w-[200px] text-left">Lý Do</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {withdrawRequests.length > 0 ? (
                                        withdrawRequests.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-100">
                                                <td className="p-3 border text-left">{transaction.id}</td>
                                                <td className="p-3 border text-left">{transaction.transactionId}</td>
                                                <td className="p-3 border text-left">{transaction.bankCode}</td>
                                                <td className="p-3 border text-left whitespace-nowrap">{new Date(transaction.createdAt).toLocaleString()}</td>
                                                <td className="p-3 border text-left whitespace-nowrap">{new Date(transaction.updatedAt).toLocaleString()}</td>
                                                <td className="p-3 border text-left w-32">
                                                    <span className={`px-2 py-1 rounded text-white ${transaction.status === "Pending" ? "bg-yellow-500" : "bg-green-500"}`}>
                                                        {transaction.status === "Pending" ? "Đang xử lý" : "Thành Công"}
                                                    </span>
                                                </td>
                                                <td className="p-3 border text-left truncate">{transaction.reason || "Không"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="p-4 text-center text-gray-500">
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
    )
}
export default WithdrawTransaction;