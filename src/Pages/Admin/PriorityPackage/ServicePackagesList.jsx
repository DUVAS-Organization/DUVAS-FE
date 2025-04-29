import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PriorityServicePostService from '../../../Services/Admin/PriorityServicePost';
import UserService from '../../../Services/User/UserService';
import RoomService from '../../../Services/User/RoomService';
import CPPRoomsService from '../../../Services/Admin/CPPRoomsService';
import { showCustomNotification } from '../../../Components/Notification';

const ServicePackagesList = () => {
    const [priorityServicePosts, setPriorityServicePosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const servicePosts = await PriorityServicePostService.getPriorityServicePosts();
            const enrichedServicePosts = await Promise.all(
                servicePosts.map(async (servicePost) => {
                    // Fetch user name
                    const user = await UserService.getUserById(servicePost.userId).catch(() => ({ name: 'Unknown' }));
                    // Fetch room title
                    const roomDetails = await RoomService.getRoomById(servicePost.roomId).catch(() => ({ title: 'Unknown' }));
                    // Fetch category priority package room value
                    const category = await CPPRoomsService.getCPPRoomById(servicePost.categoryPriorityPackageRoomId).catch(() => ({
                        categoryPriorityPackageRoomValue: 'Unknown',
                    }));

                    // Determine status based on startDate and endDate
                    const currentDate = new Date();
                    const startDate = new Date(servicePost.startDate);
                    const endDate = new Date(servicePost.endDate);
                    let status;
                    if (currentDate >= startDate && currentDate <= endDate) {
                        status = 'Hoạt động';
                    } else if (currentDate > endDate) {
                        status = 'Hết hạn';
                    } else {
                        status = 'Không xác định';
                    }

                    return {
                        priorityPackageServicePostId: servicePost.priorityPackageServicePostId,
                        userName: user.name,
                        roomTitle: roomDetails.title,
                        categoryPriorityPackageRoomValue: category.categoryPriorityPackageRoomValue,
                        startDate: servicePost.startDate,
                        endDate: servicePost.endDate,
                        price: servicePost.price,
                        status,
                    };
                })
            );
            setPriorityServicePosts(enrichedServicePosts);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách Gói Ưu tiên Dịch vụ:', error);
            showCustomNotification('error', 'Không thể tải danh sách Gói Ưu tiên Dịch vụ!');
        }
    };

    return (
        <div className="p-6">
            <div className='font-bold text-5xl ml-3 my-8 text-blue-500 flex justify-between'>
                <h1>Gói Ưu tiên Dịch vụ</h1>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-left font-semibold text-black w-12">#</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Người Dùng</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Phòng</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Gói Ưu Tiên</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Ngày Bắt Đầu</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Ngày Kết Thúc</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Giá</th>
                            <th className="py-2 px-4 text-center font-semibold text-black">Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {priorityServicePosts.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="py-2 text-center text-gray-500">Không tìm thấy kết quả</td>
                            </tr>
                        ) : (
                            priorityServicePosts.map((priorityServicePost, index) => (
                                <tr key={priorityServicePost.priorityPackageServicePostId} className="hover:bg-gray-200 border-collapse border border-gray-300">
                                    <td className="py-2 px-4 text-gray-700 border-b w-12">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{priorityServicePost.userName}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{priorityServicePost.roomTitle}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{priorityServicePost.categoryPriorityPackageRoomValue}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{new Date(priorityServicePost.startDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{new Date(priorityServicePost.endDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        {priorityServicePost.price.toLocaleString('vi-VN')} đ
                                    </td>
                                    <td className="py-2 px-4 text-center border-b">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${priorityServicePost.status === 'Hoạt động' ? 'bg-green-500' : 'bg-red-500'}`}
                                        >
                                            {priorityServicePost.status}
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

export default ServicePackagesList;