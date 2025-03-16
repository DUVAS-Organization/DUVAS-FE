import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MdBarChart } from "react-icons/md";
import SidebarUser from "../../../Components/Layout/SidebarUser";
import { FaChevronDown } from "react-icons/fa6";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);

    return (
        <>
            <SidebarUser />
            <div className="ml-56 max-w-6xl mx-auto pt-6 bg-gray-50">
                {/* Header */}
                <h1 className="text-2xl font-semibold text-gray-900">Lịch sử giao dịch</h1>

                {/* Bộ lọc */}
                <div className="mt-4 flex flex-wrap gap-3">
                    {/* Ô tìm kiếm */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm theo mã tin, mã giao dịch"
                            className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-md focus:ring focus:ring-gray-200 focus:outline-none"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>

                    {/* Bộ lọc ngày */}
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
                        <FaRegCalendarAlt />
                        Mặc định
                    </button>

                    {/* Bộ lọc trạng thái */}
                    <button className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 flex items-center">
                        Tất cả <FaChevronDown className="ml-1 mt-0.5" />
                    </button>

                    {/* Nút xuất Excel */}
                    {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
                    <IoMdDownload />
                    Excel
                </button> */}
                </div>

                {/* Nội dung chính */}
                <div className="flex flex-col items-center justify-center h-80 mt-12 text-gray-500">
                    <MdBarChart className="text-6xl" />
                    <p className="mt-4">Hiện tại bạn không có thông tin lịch sử giao dịch nào</p>
                </div>
            </div>
        </>
    );
};

export default Transactions;
