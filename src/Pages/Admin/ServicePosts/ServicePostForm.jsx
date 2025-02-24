import React, { useState, useEffect } from 'react';
import ServicePost from '../../../Services/Admin/ServicePost';
import CategoryServices from '../../../Services/Admin/CategoryServices';
import { useNavigate, useParams } from 'react-router-dom';
import { showCustomNotification } from '../../../Components/Notification';
import { useAuth } from '../../../Context/AuthProvider';
import { FaArrowLeft } from "react-icons/fa";
import PriceInput from '../../../Components/PriceInput';

const ServicePostForm = () => {
    const [servicePost, setServicePosts] = useState({});
    const [categoryServices, setCategoryServices] = useState([]);
    const { servicePostId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        CategoryServices.getCategoryServices()
            .then((data) => setCategoryServices(data))
            .catch((error) => console.error('Error fetching categories:', error));

        if (servicePostId) {
            // Nếu có servicePostId => chỉnh sửa, fetch dữ liệu từ API
            ServicePost.getServicePostById(servicePostId)
                .then(data => {
                    setServicePosts({
                        servicePostId: data.servicePostId,
                        userId: data.userId || user.userId,
                        title: data.title,
                        phoneNumber: data.phoneNumber,
                        price: data.price,
                        location: data.location,
                        description: data.description,
                        categoryServiceId: data.categoryServiceId,
                    });
                })
                .catch(error => console.error('Error fetching Category Service:', error));
        } else {
            // Nếu tạo mới, khởi tạo state với giá trị mặc định
            setServicePosts({
                title: '',
                phoneNumber: '',
                price: '',
                location: '',
                description: '',
                categoryServiceId: null,
                userId: user.userId,
            });
        }
    }, [servicePostId, user.userId]);

    useEffect(() => {
        if (!servicePostId && categoryServices.length > 0 && servicePost.categoryServiceId === null) {
            setServicePosts(prev => ({ ...prev, categoryServiceId: categoryServices[0].categoryServiceId }));
        }
    }, [categoryServices, servicePostId, servicePost.categoryServiceId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Lấy dữ liệu từ state servicePost
            let servicePostData = {
                title: servicePost.title,
                phoneNumber: servicePost.phoneNumber,
                price: servicePost.price,
                location: servicePost.location,
                description: servicePost.description,
                categoryServiceId: servicePost.categoryServiceId,
                userId: user.userId,
            };

            if (servicePostId) {
                servicePostData = {
                    ...servicePostData,
                    servicePostId: servicePost.servicePostId,
                };
                await ServicePost.updateServicePost(servicePostId, servicePostData);
                showCustomNotification("success", "Chỉnh sửa thành công!");
            } else {
                await ServicePost.addServicePost(servicePostData);
                showCustomNotification("success", "Tạo thành công!");
            }
            navigate('/Admin/ServicePosts');
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            showCustomNotification("error", "Vui lòng thử lại!");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <div className='max-w-7xl rounded-2xl mb-2'>
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                >
                    <FaArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold mb-6 text-blue-600 text-left">
                    {servicePostId ? 'Chỉnh sửa Bài Đăng' : 'Tạo Bài Đăng'}
                </h1>
                <div className="border-t-2 border-gray-500 w-full mb-5"></div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="w-full">
                        <label className="flex text-lg font-bold text-black mb-1">
                            Tiêu Đề: <p className='text-red-500 ml-1'>*</p>
                        </label>
                        <input
                            type="text"
                            value={servicePost.title}
                            onChange={(e) => setServicePosts({ ...servicePost, title: e.target.value })}
                            required
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập Tiêu đề"
                        />
                    </div>
                    <div className="w-full">
                        <label className="flex text-lg font-bold text-black mb-1">
                            Giá (đ/h): <p className='text-red-500 ml-1'>*</p>
                        </label>
                        <PriceInput
                            value={servicePost.price || 0}
                            onChange={(val) => setServicePosts({ ...servicePost, price: val })}
                        />
                    </div>

                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="w-full">
                        <label className="flex text-lg font-bold text-black mb-1">
                            Số điện thoại: <p className='text-red-500 ml-1'>*</p>
                        </label>
                        <input
                            type="text"
                            value={servicePost.phoneNumber}
                            onChange={(e) => setServicePosts({ ...servicePost, phoneNumber: e.target.value })}
                            required
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập Số điện thoại"
                        />
                    </div>
                    <div className="w-full">
                        <label className="flex text-lg font-bold text-black mb-1">
                            Địa chỉ: <p className='text-red-500 ml-1'>*</p>
                        </label>
                        <input
                            type="text"
                            value={servicePost.location}
                            onChange={(e) => setServicePosts({ ...servicePost, location: e.target.value })}
                            required
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập Địa chỉ"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="w-full">
                        <label className="flex text-lg font-bold text-black mb-1">
                            Mô tả:
                        </label>
                        <textarea
                            type="text"
                            value={servicePost.description}
                            onChange={(e) => setServicePosts({ ...servicePost, description: e.target.value })}
                            required
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập Mô tả"
                        />
                    </div>
                    <div className="w-full">
                        <label className="flex text-lg font-bold text-black mb-1">
                            Loại Dịch Vụ: <p className='text-red-500 ml-1'>*</p>
                        </label>
                        <select
                            value={servicePost.categoryServiceId}
                            onChange={(e) => setServicePosts({ ...servicePost, categoryServiceId: parseInt(e.target.value) })}
                            required
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="" disabled>Vui lòng chọn...</option>
                            {categoryServices.map((categoryService) => (
                                <option key={categoryService.categoryServiceId} value={categoryService.categoryServiceId}>
                                    {categoryService.categoryServiceName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* Các trường input khác bạn có thể thêm tương tự */}
                <div className="flex items-center flex-col">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-1 rounded-md shadow-md hover:bg-blue-400 "
                    >
                        Lưu
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServicePostForm;
