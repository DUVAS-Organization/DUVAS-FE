import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../../Components/Layout/Layout";
import Footer from "../../../Components/Layout/Footer";
import UserService from "../../../Services/User/UserService";

const Transaction = () => {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        const getTransactions = async () => {
            try {
                const data = await UserService.getTransactions();
                setTransactions(data.data.transactions.result);
            } catch (error) {
                console.error("Error fetching bank accounts:", error);
            }
        }
        getTransactions();
    }, []);
    function checkData(){
        console.log(transactions);
    }
    return (
        <Layout showNavbar={false} showSidebar={true}>
            <div className="max-w-6xl mx-auto p-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700">Quản lý tài khoản rút tiền của bạn.</h1>
                    <div className="flex">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="p-3 border">ID</th>
                                    <th className="p-3 border">Amount</th>
                                    <th className="p-3 border">Status</th>
                                    <th className="p-3 border">Description</th>
                                    <th className="p-3 border">Created At</th>
                                    <th className="p-3 border">Bank Name</th>
                                    <th className="p-3 border">Corresponding Bank</th>
                                    <th className="p-3 border">Corresponding Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length > 0 ? (
                                    transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-100">
                                            <td className="p-3 border text-center">{transaction.id}</td>
                                            <td className="p-3 border text-center">{transaction.amount}</td>
                                            <td className="p-3 border text-center">
                                                <span className={`px-2 py-1 rounded text-white ${transaction.status === "Pending" ? "bg-yellow-500" : "bg-green-500"}`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="p-3 border">{transaction.description || "N/A"}</td>
                                            <td className="p-3 border">{new Date(transaction.createdAt).toLocaleString()}</td>
                                            <td className="p-3 border">{transaction.bankName || "N/A"}</td>
                                            <td className="p-3 border">{transaction.corresponsiveBankName || "N/A"}</td>
                                            <td className="p-3 border">{transaction.corresponsiveName || "N/A"}</td>
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
                </div>
            </div>
            <Footer />
        </Layout>
    )
}
export default Transaction;