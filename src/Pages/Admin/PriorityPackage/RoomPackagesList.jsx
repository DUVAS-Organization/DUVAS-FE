import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PriorityRoomService from '../../../Services/Admin/PriorityRoomService';
import UserService from '../../../Services/User/UserService';
import RoomService from '../../../Services/User/RoomService';
import CPPRoomsService from '../../../Services/Admin/CPPRoomsService';
import { FiPlus } from 'react-icons/fi';
import { showCustomNotification } from '../../../Components/Notification';

const RoomPackagesList = () => {
    const [priorityRooms, setPriorityRooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const rooms = await PriorityRoomService.getPriorityRooms();
            const enrichedRooms = await Promise.all(
                rooms.map(async (room) => {
                    const user = await UserService.getUserById(room.userId).catch(() => ({ name: 'Unknown' }));
                    const roomDetails = await RoomService.getRoomById(room.roomId).catch(() => ({ title: 'Unknown' }));
                    const category = await CPPRoomsService.getCPPRoomById(room.categoryPriorityPackageRoomId).catch(() => ({
                        categoryPriorityPackageRoomValue: 'Unknown',
                    }));

                    const currentDate = new Date();
                    const startDate = new Date(room.startDate);
                    const endDate = new Date(room.endDate);
                    let status;
                    if (currentDate >= startDate && currentDate <= endDate) {
                        status = 'Hoạt động';
                    } else if (currentDate > endDate) {
                        status = 'Hết hạn';
                    } else {
                        status = 'Không xác định';
                    }

                    return {
                        priorityPackageRoomId: room.priorityPackageRoomId,
                        userName: user.name,
                        roomTitle: roomDetails.title,
                        categoryPriorityPackageRoomValue: category.categoryPriorityPackageRoomValue,
                        startDate: room.startDate,
                        endDate: room.endDate,
                        price: room.price,
                        status,
                    };
                })
            );
            setPriorityRooms(enrichedRooms);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách Gói Ưu tiên Phòng:', error);
            showCustomNotification('error', 'Không thể tải danh sách Gói Ưu tiên Phòng!');
        }
    };

    const handleCreate = () => {
        navigate('/Admin/PriorityRooms/Creates');
    };

    return (
        <div className="p-6">
            <div className='font-bold text-5xl ml-3 my-8 text-blue-500 flex justify-between'>
                <h1>Gói Ưu tiên Phòng</h1>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-left font-semibold text-black w-12 whitespace-nowrap">#</th>
                            <th className="py-2 px-4 text-left font-semibold text-black whitespace-nowrap">Người Dùng</th>
                            <th className="py-2 px-4 text-left font-semibold text-black whitespace-nowrap">Phòng</th>
                            <th className="py-2 px-4 text-left font-semibold text-black whitespace-nowrap">Gói Ưu Tiên</th>
                            <th className="py-2 px-4 text-left font-semibold text-black whitespace-nowrap">Ngày Bắt Đầu</th>
                            <th className="py-2 px-4 text-left font-semibold text-black whitespace-nowrap">Ngày Kết Thúc</th>
                            <th className="py-2 px-4 text-left font-semibold text-black whitespace-nowrap">Giá</th>
                            <th className="py-2 px-4 text-center font-semibold text-black whitespace-nowrap">Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {priorityRooms.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="py-2 text-center text-gray-500">Không tìm thấy kết quả</td>
                            </tr>
                        ) : (
                            priorityRooms.map((priorityRoom, index) => (
                                <tr key={priorityRoom.priorityPackageRoomId} className="hover:bg-gray-200 border-collapse border border-gray-300">
                                    <td className="py-2 px-4 text-gray-700 border-b w-12">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b min-w-[150px]">{priorityRoom.userName}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b min-w-[300px]">{priorityRoom.roomTitle}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b min-w-[150px]">{priorityRoom.categoryPriorityPackageRoomValue} ngày</td>
                                    <td className="py-2 px-4 text-gray-700 border-b min-w-[120px]">{new Date(priorityRoom.startDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b min-w-[120px]">{new Date(priorityRoom.endDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b min-w-[120px]">
                                        {priorityRoom.price.toLocaleString('vi-VN')} đ
                                    </td>
                                    <td className="py-2 px-4 text-center border-b min-w-[150px]">
                                        <span
                                            className={`inline-block px-2 py-1 rounded-full w-[100px] text-white text-sm font-medium ${priorityRoom.status === 'Hoạt động' ? 'bg-green-500' : 'bg-red-500'}`}
                                        >
                                            {priorityRoom.status}
                                        </span>
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

export default RoomPackagesList;