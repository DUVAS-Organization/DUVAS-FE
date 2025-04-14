import React, { useState, useEffect } from "react";
import { Card } from "@mantine/core";
import { CardContent } from "@mui/material";
import { BiBadgeCheck, BiLoaderCircle, BiXCircle } from "react-icons/bi";
import Counts from "../../../Components/Counts";
import { FiFilter } from "react-icons/fi";
import Icon from "../../../Components/Icon";

const mockTransactions = [
    {
        id: "TXN001",
        user: "Nguyễn Văn A",
        amount: 250000,
        type: "Thanh toán tiền phòng",
        status: "success",
        date: "2025-04-13",
    },
    {
        id: "TXN002",
        user: "Trần Thị B",
        amount: 100000,
        type: "Nạp tiền",
        status: "pending",
        date: "2025-04-12",
    },
    {
        id: "TXN003",
        user: "Lê Văn C",
        amount: 150000,
        type: "Rút tiền",
        status: "failed",
        date: "2025-04-11",
    },
];

const statusColors = {
    success: "text-green-600 bg-green-100",
    pending: "text-yellow-600 bg-yellow-100",
    failed: "text-red-600 bg-red-100",
};
const TransactionAdmin = () => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState("");
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSortedAscending, setIsSortedAscending] = useState(true);

    useEffect(() => {
        setTransactions(mockTransactions);
    }, []);

    const filteredTransactions = transactions.filter((txn) =>
        txn.user.toLowerCase().includes(search.toLowerCase())
    );

    const renderStatus = (status) => {
        const base = "px-2 py-1 rounded-full text-xs font-semibold";
        switch (status) {
            case "success":
                return <span className={`${base} ${statusColors.success}`}><BiBadgeCheck className="inline w-4 h-4 mr-1" /> Thành công</span>;
            case "pending":
                return <span className={`${base} ${statusColors.pending}`}><BiLoaderCircle className="inline w-4 h-4 mr-1 animate-spin" /> Đang xử lý</span>;
            case "failed":
                return <span className={`${base} ${statusColors.failed}`}><BiXCircle className="inline w-4 h-4 mr-1" /> Thất bại</span>;
            default:
                return <span className={`${base} bg-gray-200 text-gray-600`}>Không xác định</span>;
        }
    };
    const handleSortByName = () => {
        const sortedAccounts = [...transactions].sort((a, b) => {
            return isSortedAscending
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        });
        setAccounts(sortedAccounts);
        setIsSortedAscending(!isSortedAscending);
        // Reload dữ liệu (nếu cần)
        // TransactionService.getTransactions(searchTerm)
        //     .then(data => setTransactions(data))
        //     .catch(error => console.error('Error fetching Transaction:', error));
    };
    return (
        <div className="p-6">
            <Counts />
            <h1 className="text-4xl font-bold text-blue-500 my-8">Quản lý giao dịch</h1>
            <Card>
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-2 bg-white">
                            <button
                                onClick={handleSortByName}
                                className="border-2 border-gray-300 flex items-center p-2 rounded-xl"
                            >
                                <FiFilter className="mr-2 text-lg" />
                                <p className="font-medium text-base">Tên (A-Z)</p>
                            </button>
                            <button
                                className="border-2 border-gray-300 flex items-center p-2 rounded-xl"
                            >
                                <p className="font-medium text-base">Nạp tiền</p>
                            </button>
                            <button
                                className="border-2 border-gray-300 flex items-center p-2 rounded-xl"
                            >
                                <p className="font-medium text-base">Rút tiền</p>
                            </button>
                            <button
                                className="border-2 border-gray-300 flex items-center p-2 rounded-xl"
                            >
                                <p className="font-medium text-base">Tất cả</p>
                            </button>
                        </div>
                        <div className="relative w-1/3 mx-2 ml-auto">
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

                    <div className="shadow rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full table-fixed bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 font-medium">Mã GD</th>
                                    <th className="p-3 font-medium text-left">Người dùng</th>
                                    <th className="p-3 font-medium">Số tiền</th>
                                    <th className="p-3 font-medium text-left">Loại</th>
                                    <th className="p-3 font-medium">Trạng thái</th>
                                    <th className="p-3 font-medium">Ngày</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((txn) => (
                                        <tr key={txn.id} className="border-b hover:bg-gray-50 text-sm">
                                            <td className="p-3 text-center">{txn.id}</td>
                                            <td className="p-3 text-left">{txn.user}</td>
                                            <td className="p-3 text-center">{txn.amount.toLocaleString()} đ</td>
                                            <td className="p-3 text-left">{txn.type}</td>
                                            <td className="p-3 text-center">{renderStatus(txn.status)}</td>
                                            <td className="p-3 text-center">{txn.date}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center p-6 text-gray-500">
                                            Không tìm thấy kết quả.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
export default TransactionAdmin;