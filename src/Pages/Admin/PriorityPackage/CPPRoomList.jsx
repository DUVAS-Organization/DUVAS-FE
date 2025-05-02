import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CPPRoomsService from "../../../Services/Admin/CPPRoomsService";
import { FiPlus } from 'react-icons/fi';
import { showCustomNotification } from '../../../Components/Notification';

const CPPRoomList = () => {
    const [cppRooms, setCppRooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        CPPRoomsService.getCPPRooms()
            .then(data => {
                // console.log('Dữ liệu Gói Ưu tiên Phòng:', data);
                setCppRooms(data);
            })
            .catch(error => {
                console.error('Lỗi khi lấy danh sách Gói Ưu tiên Phòng:', error);
                showCustomNotification('error', 'Không thể tải danh sách Gói Ưu tiên Phòng!');
            });
    };

    const handleCreate = () => {
        navigate('/Admin/CategoryPriorityRooms/Creates');
    };

    const handleDelete = (categoryPriorityPackageRoomId) => {
        if (!categoryPriorityPackageRoomId) {
            console.error('ID Gói Ưu tiên Phòng không hợp lệ:', categoryPriorityPackageRoomId);
            showCustomNotification('error', 'ID Gói Ưu tiên Phòng không hợp lệ!');
            return;
        }
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa Gói Ưu tiên Phòng này?");
        if (isConfirmed) {
            CPPRoomsService.deleteCPPRoom(categoryPriorityPackageRoomId)
                .then(() => {
                    showCustomNotification('success', 'Xóa Gói Ưu tiên Phòng thành công!');
                    fetchData();
                })
                .catch(error => {
                    console.error('Lỗi khi xóa:', error);
                    showCustomNotification('error', 'Lỗi khi xóa Gói Ưu tiên Phòng!');
                });
        }
    };

    const handleLock = (categoryPriorityPackageRoomId) => {
        if (!categoryPriorityPackageRoomId) {
            console.error('ID Gói Ưu tiên Phòng không hợp lệ:', categoryPriorityPackageRoomId);
            showCustomNotification('error', 'ID Gói Ưu tiên Phòng không hợp lệ!');
            return;
        }
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn KHÓA gói này?");
        if (isConfirmed) {
            CPPRoomsService.lockCPPRoom(categoryPriorityPackageRoomId)
                .then(() => {
                    showCustomNotification('success', 'Khóa Gói Ưu tiên Phòng thành công!');
                    fetchData();
                })
                .catch(error => {
                    console.error('Lỗi khi khóa:', error);
                    showCustomNotification('error', 'Lỗi khi khóa Gói Ưu tiên Phòng!');
                });
        }
    };

    const handleUnlock = (categoryPriorityPackageRoomId) => {
        if (!categoryPriorityPackageRoomId) {
            console.error('ID Gói Ưu tiên Phòng không hợp lệ:', categoryPriorityPackageRoomId);
            showCustomNotification('error', 'ID Gói Ưu tiên Phòng không hợp lệ!');
            return;
        }
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn MỞ KHÓA gói này?");
        if (isConfirmed) {
            CPPRoomsService.unlockCPPRoom(categoryPriorityPackageRoomId)
                .then(() => {
                    showCustomNotification('success', 'Mở khóa Gói Ưu tiên Phòng thành công!');
                    fetchData();
                })
                .catch(error => {
                    console.error('Lỗi khi mở khóa:', error);
                    showCustomNotification('error', 'Lỗi khi mở khóa Gói Ưu tiên Phòng!');
                });
        }
    };

    return (
        <div className="p-6">
            <div className='font-bold text-5xl ml-3 my-8 text-blue-500 flex justify-between'>
                <h1>Gói Ưu tiên Phòng</h1>
                <button
                    onClick={handleCreate}
                    className='flex mr-2 items-center text-white bg-blue-500 rounded-3xl h-11 px-2'>
                    <FiPlus className="mr-2 text-xl" />
                    <p className="font-semibold text-lg mr-2">Tạo mới</p>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-left font-semibold text-black">#</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Tên Gói</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Giá</th>
                            <th className="py-2 px-4 text-center font-semibold text-black">Trạng Thái</th>
                            <th className="py-2 px-4 text-center font-semibold text-black">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cppRooms.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="py-2 text-center text-gray-500">Không tìm thấy kết quả</td>
                            </tr>
                        ) : (
                            cppRooms.map((cppRoom, index) => (
                                <tr key={cppRoom.categoryPriorityPackageRoomId} className="hover:bg-gray-200 border-collapse border border-gray-300">
                                    <td className="py-2 px-4 text-gray-700 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{cppRoom.categoryPriorityPackageRoomValue} ngày</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        {cppRoom.price.toLocaleString('vi-VN')} đ
                                    </td>

                                    <td className="py-2 px-4 text-center border-b">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${cppRoom.status === 1 ? 'bg-green-500' : cppRoom.status === 0 ? 'bg-red-500' : 'bg-gray-500'
                                                }`}
                                        >
                                            {cppRoom.status === 1 ? 'Hoạt động' : cppRoom.status === 0 ? 'Đã khóa' : 'Không xác định'}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 text-center border-b">
                                        <div className="flex justify-around gap-2">
                                            <button
                                                className="text-blue-600 hover:text-blue-700"
                                                onClick={() => navigate(`/Admin/CategoryPriorityRooms/${cppRoom.categoryPriorityPackageRoomId}`)}
                                            >
                                                Chỉnh Sửa
                                            </button>
                                            <button
                                                className="text-blue-600 hover:text-blue-700"
                                                onClick={() => handleDelete(cppRoom.categoryPriorityPackageRoomId)}
                                            >
                                                Xóa
                                            </button>
                                            {cppRoom.status === 1 ? (
                                                <button
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleLock(cppRoom.categoryPriorityPackageRoomId)}
                                                >
                                                    Khóa
                                                </button>
                                            ) : (
                                                <button
                                                    className="text-green-600 hover:text-green-700"
                                                    onClick={() => handleUnlock(cppRoom.categoryPriorityPackageRoomId)}
                                                >
                                                    Mở Khóa
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CPPRoomList;