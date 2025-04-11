import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Icon from '../../../Components/Icon';
import AccountServices from "../../../Services/Admin/AccountServices";
import Counts from '../../../Components/Counts';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { FaChevronDown, FaLock, FaUnlock } from "react-icons/fa";
import UpRoleService from '../../../Services/User/UpRoleService';

const UpLandlord = () => {
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    useEffect(() => {
        fetchData();
    }, [searchTerm]);

    const fetchData = () => {
        AccountServices.getAccounts(searchTerm)
            .then(data => {
                setAccounts(data);
            })
            .catch(error => console.error('Error fetching Account:', error));

    };
    const handleStatusChange = (userId, currentStatus) => {
        // Gọi API hoặc cập nhật trạng thái trong state
        const newStatus = !currentStatus; // Lật ngược trạng thái
        AccountServices.updateStatus(userId, newStatus)
            .then(() => {
                // Cập nhật lại dữ liệu hoặc làm gì đó sau khi thay đổi trạng thái thành công
                fetchData(); // Cập nhật lại dữ liệu sau khi thay đổi
            })
            .catch(error => console.error('Error updating status:', error));
    };
    const handleConfirmLandlord = (userId) => {
        UpRoleService.updateRoleToLandlord(userId, token)
            .then(() => {
                console.log("🎉 Role updated successfully");
                fetchData(); // Cập nhật lại danh sách sau khi xác nhận
            })
            .catch((error) => {
                console.error("❌ Error updating role:", error);
            });
    };

    return (
        <div className="p-6">
            <div className='max-w-7xl rounded-2xl mb-2'>
                <div className='font-bold text-4xl ml-3 my-8 text-blue-600 flex justify-between'>
                    <h1>Yêu cầu cập nhật Vai trò LandLord</h1>
                </div>
                <div className="border-t-2 border-black w-full mb-5"></div>
            </div>


            <div className="flex items-center mb-6">
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl">
                    <FiFilter className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Name (A-Z)</p>
                </button>
                <div className="relative w-1/3 mx-2 ml-auto">
                    <input
                        className="border w-full h-11 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        type="text"
                        placeholder="  Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Icon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" name="search" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-left font-semibold text-black">#</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Tên</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Email</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">SĐT</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Giấy tờ</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Trạng Thái</th>
                            <th className="py-2 px-4 text-center font-semibold text-black"></th>

                        </tr>
                    </thead>
                    <tbody>
                        {accounts.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-2 text-center text-gray-500">Không tìm thấy kết quả</td>
                            </tr>
                        ) : (
                            accounts.map((account, index) => (
                                <tr key={account.userId} className="hover:bg-gray-200 border-collapse border border-gray-300">
                                    <td className="py-2 px-4 text-gray-700 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{account.name}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{account.gmail}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        {account.phone ? account.phone : "Trống"}
                                    </td>

                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        <NavLink to='/Admin/Landlord/Giayto' className="mr-4 text-blue-600 hover:text-red-500 underline">
                                            Xem giấy tờ
                                        </NavLink>
                                    </td>
                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        <button
                                            onClick={() => handleStatusChange(account.userId, account.status)}
                                            className={`px-4 py-2 rounded-3xl font-semibold 
                                            ${account.status ? 'bg-green-500 text-white hover:bg-green-400' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}
                                        >
                                            {account.status ? 'Active' : 'Pending'}
                                        </button>
                                    </td>
                                    <td className="py-2 px-4 border-b text-blue-600 text-center underline underline-offset-2 ">
                                        <div className="flex justify-around">
                                            <NavLink to='/Admin/Rooms/AcceptRooms' className="mr-4 hover:text-red-500 underline">
                                                Xác Nhận
                                            </NavLink>
                                            <NavLink to='/Admin/Rooms/RejectRooms' className='hover:text-red-500 underline'>
                                                Từ Chối
                                            </NavLink>
                                        </div>
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div >
    );
};

export default UpLandlord;
