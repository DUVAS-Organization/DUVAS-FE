import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PriorityServicePostService from '../../../Services/Admin/PriorityServicePost';
import UserService from '../../../Services/User/UserService';
import RoomService from '../../../Services/User/RoomService';
import CPPRoomsService from '../../../Services/Admin/CPPRoomsService';
import { showCustomNotification } from '../../../Components/Notification';
import CPPServicePostsService from '../../../Services/Admin/CPPServicePostsService';
import ServicePost from '../../../Services/Admin/ServicePost';

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
                    const user = await UserService.getUserById(servicePost.userId).catch(() => ({ name: 'Unknown' }));
                    const servicePostDetails = await ServicePost.getServicePostById(servicePost.servicePostId).catch(() => ({ title: 'Unknown' }));
                    const category = await CPPServicePostsService.getCategoryPriorityPackageServicePostById(servicePost.categoryPriorityPackageServicePostId).catch(() => ({
                        categoryPriorityPackageServicePostValue: 'Unknown',
                    }));

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
                        servicePostTitle: servicePostDetails.title,
                        categoryPriorityPackageServicePostValue: category.categoryPriorityPackageServicePostValue,
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
                            <th className="py-2 px-4 text-left font-semibold text-black w-12 whitespace-nowrap">#</th>
                            <th className="py-2 px-4 text-left font-semibold text-black min-w-[150px] whitespace-nowrap">Người Dùng</th>
                            <th className="py-2 px-4 text-left font-semibold text-black min-w-[300px] whitespace-nowrap">Phòng</th>
                            <th className="py-2 px-4 text-left font-semibold text-black min-w-[150px] whitespace-nowrap">Gói Ưu Tiên</th>
                            <th className="py-2 px-4 text-left font-semibold text-black min-w-[120px] whitespace-nowrap">Ngày Bắt Đầu</th>
                            <th className="py-2 px-4 text-left font-semibold text-black min-w-[120px] whitespace-nowrap">Ngày Kết Thúc</th>
                            <th className="py-2 px-4 text-left font-semibold text-black min-w-[120px] whitespace-nowrap">Giá</th>
                            <th className="py-2 px-4 text-center font-semibold text-black min-w-[120px] whitespace-nowrap">Trạng Thái</th>
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
                                    <td className="py-2 px-4 text-gray-700 border-b min-w-[150px]">{priorityServicePost.userName}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b min-w-[300px]">{priorityServicePost.servicePostTitle}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b min-w-[150px]">{priorityServicePost.categoryPriorityPackageServicePostValue} ngày</td>
                                    <td className="py-2 px-4 text-gray-700 border-b min-w-[120px]">{new Date(priorityServicePost.startDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b min-w-[120px]">{new Date(priorityServicePost.endDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b min-w-[120px]">
                                        {priorityServicePost.price.toLocaleString('vi-VN')} đ
                                    </td>
                                    <td className="py-2 px-4 text-center border-b min-w-[150px]">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full w-[100px] text-white text-sm font-medium ${priorityServicePost.status === 'Hoạt động' ? 'bg-green-500' : 'bg-red-500'}`}
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