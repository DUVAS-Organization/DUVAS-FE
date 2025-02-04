import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../Icon';
import Swal from 'sweetalert2';
import AccountsService from "../../Services/Admin/AccountServices";
// import PostsService from "../../Services/Admin/PostsService";  // Giả sử có service cho bài đăng
// import BuildingsService from "../../Services/Admin/BuildingsService"; // Giả sử có service cho tòa nhà
// import RoomsService from "../../Services/Admin/RoomsService"; // Giả sử có service cho phòng
import { FiFilter } from 'react-icons/fi';
import { FaLock, FaUnlock } from 'react-icons/fa';

const AccountList = () => {
    const [accounts, setAccounts] = useState([]);
    const [accountCount, setAccountCount] = useState(0); // state số lượng tài khoản
    const [postCount, setPostCount] = useState(0); // state số lượng bài đăng
    const [buildingCount, setBuildingCount] = useState(0); // state số lượng tòa nhà
    const [roomCount, setRoomCount] = useState(0); // state số lượng phòng
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [searchTerm]);

    const fetchData = () => {
        // Lấy tài khoản
        AccountsService.getAccounts(searchTerm)
            .then(data => {
                setAccounts(data);
                setAccountCount(data.length);
            })
            .catch(error => console.error('Error fetching Account:', error));

        // // Lấy bài đăng
        // PostsService.getPosts(searchTerm)
        //     .then(data => setPostCount(data.length))
        //     .catch(error => console.error('Error fetching Posts:', error));

        // // Lấy tòa nhà
        // BuildingsService.getBuildings(searchTerm)
        //     .then(data => setBuildingCount(data.length))
        //     .catch(error => console.error('Error fetching Buildings:', error));

        // // Lấy phòng
        // RoomsService.getRooms(searchTerm)
        //     .then(data => setRoomCount(data.length))
        //     .catch(error => console.error('Error fetching Rooms:', error));
    };

    const handleDelete = (userId) => {
        Swal.fire({
            title: 'Notification',
            text: 'Are you sure to Delete this Account?',
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        })
            .then((result) => {
                if (result.isConfirmed) {
                    AccountsService.deleteAccount(userId)
                        .then(() => fetchData())
                        .catch(error => console.error('Error deleting Account:', error));
                }
            });
    };

    const handleStatusChange = (userId, currentStatus) => {
        // Gọi API hoặc cập nhật trạng thái trong state
        const newStatus = !currentStatus; // Lật ngược trạng thái
        AccountsService.updateStatus(userId, newStatus)
            .then(() => {
                // Cập nhật lại dữ liệu hoặc làm gì đó sau khi thay đổi trạng thái thành công
                fetchData(); // Cập nhật lại dữ liệu sau khi thay đổi
            })
            .catch(error => console.error('Error updating status:', error));
    };


    const handleCreate = () => {
        navigate('/Accounts/Creates');
    };

    const getRole = (user) => {
        if (user.roleAdmin === 1) {
            return "Admin";
        }

        if (user.roleLandlord === 1) {
            return "Landlord";
        }

        if (user.roleService === 1) {
            return "Service";
        }

        return "User";
    };

    return (
        <div className="p-6">
            <div className="flex space-x-4 mb-4">
                <div className="flex-1 text-white font-medium bg-blue-500 p-4 rounded-lg h-28">
                    <p className='font-bold text-3xl'>Tài Khoản</p>
                    <p className='font-bold text-2xl mt-2'>{accountCount}</p>
                </div>
                <div className="flex-1 text-white font-medium bg-blue-500 p-4 rounded-lg h-28">
                    <p className='font-bold text-3xl'>Bài Đăng</p>
                    <p className='font-bold text-2xl mt-2'>{postCount}</p> {/* Hiển thị số lượng bài đăng */}
                </div>
                <div className="flex-1 text-white font-medium bg-blue-500 p-4 rounded-lg h-28">
                    <p className='font-bold text-3xl'>Tòa Nhà</p>
                    <p className='font-bold text-2xl mt-2'>{buildingCount}</p> {/* Hiển thị số lượng tòa nhà */}
                </div>
                <div className="flex-1 text-white font-medium bg-blue-500 p-4 rounded-lg h-28">
                    <p className='font-bold text-3xl'>Phòng</p>
                    <p className='font-bold text-2xl mt-2'>{roomCount}</p> {/* Hiển thị số lượng phòng */}
                </div>
            </div>
            <div className='font-bold text-6xl ml-3 my-8 text-blue-500'>
                <h1 >Tài Khoản</h1>
            </div>
            <div className="flex items-center  mb-6">
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl">
                    <FiFilter className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Name (A-Z)</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8">
                    <FaUnlock className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Active</p>
                </button>
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8">
                    <FaLock className="mr-2 text-xl" />
                    <p className="font-bold text-xl">InActive</p>
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

                {/* <button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-400 transition duration-200"
                    onClick={handleCreate}
                >
                    <Icon name="plus" /> Create
                </button> */}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-left font-semibold text-black">#</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Tên</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Email</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Vai Trò</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account, index) => (
                            <tr
                                key={account.userId}
                                className="hover:bg-gray-200 border-collapse border border-gray-300 "
                            >
                                <td className="py-2 px-4 text-gray-700 border-b">{index + 1}</td>
                                <td className="py-2 px-4 text-gray-700 border-b">{account.name}</td>
                                <td className="py-2 px-4 text-gray-700 border-b">{account.gmail}</td>
                                <td className="py-2 px-4 text-gray-700 border-b">{getRole(account)}</td>
                                <td className="py-2 px-4 text-gray-700 border-b">
                                    <button
                                        onClick={() => handleStatusChange(account.userId, account.status)}
                                        className={`px-4 py-2 rounded-lg font-semibold text-white 
        ${account.status ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'}`}
                                    >
                                        {account.status ? 'Active' : 'Inactive'}
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div >
    );
};

export default AccountList;
