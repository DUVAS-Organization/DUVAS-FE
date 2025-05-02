import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CPPServicePostsService from "../../../Services/Admin/CPPServicePostsService";
import { FiPlus } from 'react-icons/fi';
import { showCustomNotification } from '../../../Components/Notification';

const CPPServicePostList = () => {
    const [cppServicePosts, setCppServicePosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        CPPServicePostsService.getAllCategoryPriorityPackageServicePosts()
            .then(data => {
                setCppServicePosts(data);
            })
            .catch(error => {
                console.error('Lỗi khi lấy danh sách Gói Ưu tiên Dịch Vụ:', error);
                showCustomNotification('error', 'Không thể tải danh sách Gói Ưu tiên Dịch Vụ!');
            });
    };

    const handleCreate = () => {
        navigate('/Admin/CategoryPriorityServices/Creates');
    };

    const handleDelete = (id) => {
        if (!id) {
            console.error('ID Gói Ưu tiên Dịch Vụ không hợp lệ:', id);
            showCustomNotification('error', 'ID Gói Ưu tiên Dịch Vụ không hợp lệ!');
            return;
        }
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa Gói Ưu tiên Dịch Vụ này?");
        if (isConfirmed) {
            CPPServicePostsService.deleteCategoryPriorityPackageServicePost(id)
                .then(() => {
                    showCustomNotification('success', 'Xóa Gói Ưu tiên Dịch Vụ thành công!');
                    fetchData();
                })
                .catch(error => {
                    console.error('Lỗi khi xóa:', error);
                    showCustomNotification('error', 'Lỗi khi xóa Gói Ưu tiên Dịch Vụ!');
                });
        }
    };

    const handleLock = (id) => {
        if (!id) {
            console.error('ID Gói Ưu tiên Dịch Vụ không hợp lệ:', id);
            showCustomNotification('error', 'ID Gói Ưu tiên Dịch Vụ không hợp lệ!');
            return;
        }
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn KHÓA gói này?");
        if (isConfirmed) {
            CPPServicePostsService.lockCategoryPriorityPackageServicePost(id)
                .then(() => {
                    showCustomNotification('success', 'Khóa Gói Ưu tiên Dịch Vụ thành công!');
                    fetchData();
                })
                .catch(error => {
                    console.error('Lỗi khi khóa:', error);
                    showCustomNotification('error', 'Lỗi khi khóa Gói Ưu tiên Dịch Vụ!');
                });
        }
    };

    const handleUnlock = (id) => {
        if (!id) {
            console.error('ID Gói Ưu tiên Dịch Vụ không hợp lệ:', id);
            showCustomNotification('error', 'ID Gói Ưu tiên Dịch Vụ không hợp lệ!');
            return;
        }
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn MỞ KHÓA gói này?");
        if (isConfirmed) {
            CPPServicePostsService.unlockCategoryPriorityPackageServicePost(id)
                .then(() => {
                    showCustomNotification('success', 'Mở khóa Gói Ưu tiên Dịch Vụ thành công!');
                    fetchData();
                })
                .catch(error => {
                    console.error('Lỗi khi mở khóa:', error);
                    showCustomNotification('error', 'Lỗi khi mở khóa Gói Ưu tiên Dịch Vụ!');
                });
        }
    };

    return (
        <div className="p-6">
            <div className='font-bold text-5xl ml-3 my-8 text-blue-500 flex justify-between'>
                <h1>Gói Ưu tiên Dịch Vụ</h1>
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
                        {cppServicePosts.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-2 text-center text-gray-500">Không tìm thấy kết quả</td>
                            </tr>
                        ) : (
                            cppServicePosts.map((servicePost, index) => (
                                <tr key={servicePost.categoryPriorityPackageServicePostId} className="hover:bg-gray-200 border-collapse border border-gray-300">
                                    <td className="py-2 px-4 text-gray-700 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{servicePost.categoryPriorityPackageServicePostValue} ngày</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        {servicePost.price?.toLocaleString('vi-VN')} đ
                                    </td>
                                    <td className="py-2 px-4 text-center border-b">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${servicePost.status === 1 ? 'bg-green-500' : servicePost.status === 0 ? 'bg-red-500' : 'bg-gray-500'
                                                }`}
                                        >
                                            {servicePost.status === 1 ? 'Hoạt động' : servicePost.status === 0 ? 'Đã khóa' : 'Không xác định'}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 text-center border-b">
                                        <div className="flex justify-around gap-2">
                                            <button
                                                className="text-blue-600 hover:text-blue-700"
                                                onClick={() => navigate(`/Admin/CategoryPriorityServices/${servicePost.categoryPriorityPackageServicePostId}`)}
                                            >
                                                Chỉnh Sửa
                                            </button>
                                            <button
                                                className="text-blue-600 hover:text-blue-700"
                                                onClick={() => handleDelete(servicePost.categoryPriorityPackageServicePostId)}
                                            >
                                                Xóa
                                            </button>
                                            {servicePost.status === 1 ? (
                                                <button
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleLock(servicePost.categoryPriorityPackageServicePostId)}
                                                >
                                                    Khóa
                                                </button>
                                            ) : (
                                                <button
                                                    className="text-green-600 hover:text-green-700"
                                                    onClick={() => handleUnlock(servicePost.categoryPriorityPackageServicePostId)}
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

export default CPPServicePostList;
