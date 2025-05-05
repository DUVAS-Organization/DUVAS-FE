import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ServicePost from '../../../Services/Admin/ServicePost';
import CategoryServices from '../../../Services/Admin/CategoryServices';
import { showCustomNotification } from '../../../Components/Notification';
import { useAuth } from '../../../Context/AuthProvider';
import { FaArrowLeft } from 'react-icons/fa';

const ServicePostDetails = () => {
    const [servicePost, setServicePosts] = useState({});
    const [categoryServices, setCategoryServices] = useState([]);
    const { servicePostId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        CategoryServices.getCategoryServices()
            .then((data) => setCategoryServices(data))
            .catch((error) => console.error('Error fetching categories:', error));

        if (servicePostId) {
            // Nếu có servicePostId => fetch dữ liệu từ API
            ServicePost.getServicePostById(servicePostId)
                .then(data => {
                    let images = [];
                    try {
                        images = data.image ? JSON.parse(data.image) : [];
                    } catch (error) {
                        images = data.image ? [data.image] : [];
                    }
                    setServicePosts({
                        servicePostId: data.servicePostId,
                        userId: data.userId || user.userId,
                        title: data.title,
                        phoneNumber: data.phoneNumber,
                        price: data.price,
                        name: data.name,
                        location: data.location,
                        description: data.description,
                        categoryServiceId: data.categoryServiceId,
                    });
                    setImages(images);
                })
                .catch(error => console.error('Error fetching Category Service:', error));
        } else {
            // Nếu tạo mới, khởi tạo state với giá trị mặc định
            setServicePosts({
                title: '',
                phoneNumber: '',
                price: '',
                name: '',
                location: '',
                description: '',
                categoryServiceId: null,
                userId: user.userId,
            });
        }
    }, [servicePostId]);

    // Hàm tra cứu tên Category dựa vào categoryservicePostId mà không dùng find()
    const getCategoryServiceName = (categoryServiceId) => {
        for (let i = 0; i < categoryServices.length; i++) {
            if (categoryServices[i].categoryServiceId === categoryServiceId) {
                return categoryServices[i].categoryServiceName;
            }
        }
        return 'N/A';
    };

    const handleEdit = () => {
        navigate(`/Admin/ServicePost/Edit/${servicePostId}`);
    };

    const handleDelete = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa Bài Đăng này?")) {
            try {
                await ServicePost.deleteServicePost(servicePostId);
                showCustomNotification("success", "Xóa Bài Đăng thành công!");
                navigate('/Admin/servicePosts');
            } catch (error) {
                showCustomNotification("error", "Xóa Bài Đăng thất bại, vui lòng thử lại!");
            }
        }
    };

    if (!servicePost) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
            {/* Header với nút quay lại */}
            <div className="max-w-3xl mx-auto rounded-2xl mb-2">
                <button
                    onClick={() => navigate(-1)}
                    className="mt-2"
                >
                    <FaArrowLeft size={20} />
                </button>
                <h1 className="text-4xl font-bold text-blue-600 mb-6">Chi tiết Bài Đăng</h1>
                <div className="border-t-2 border-black w-full mb-5"></div>
            </div>

            {/* Bố cục 2 cột: hiển thị các trường thông tin */}
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg py-5 px-10">
                <div className="space-y-6">
                    {/* Tiêu Đề */}
                    <div className="flex justify-between">
                        <p className="text-lg font-medium"><strong>Tiêu Đề: </strong> {servicePost.title}</p>
                    </div>

                    {/* Giá */}
                    <div className="flex justify-between">
                        <p className="text-lg font-medium">
                            <strong>Giá (đ/h):</strong> {servicePost.price?.toLocaleString("vi-VN")} đ
                        </p>
                    </div>

                    {/* Địa chỉ */}
                    <div className="flex justify-between">
                        <p className="text-lg font-medium"><strong>Địa chỉ:</strong> {servicePost.location}</p>
                    </div>

                    {/* Loại Dịch Vụ */}
                    <div className="flex justify-between">
                        <p className="text-lg font-medium"><strong>Loại Dịch Vụ:</strong> {getCategoryServiceName(servicePost.categoryServiceId)}</p>
                    </div>

                    {/* Số điện thoại */}
                    <div className="flex justify-between">
                        <p className="text-lg font-medium"><strong>Số điện thoại:</strong> {servicePost.phoneNumber}</p>
                    </div>

                    {/* Mô tả */}
                    <div className="flex justify-between">
                        <p className="text-lg font-medium"><strong>Mô tả:</strong> {servicePost.description}</p>
                    </div>

                    {/* Ảnh */}
                    <div className="mt-4">
                        <p className="text-lg font-medium mb-2"><strong>Ảnh:</strong></p>
                        {images.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {images.map((url, index) => (
                                    <div key={index} className="relative border p-2 rounded-lg shadow-sm">
                                        <img
                                            src={url}
                                            alt={`Service Post Image ${index}`}
                                            className="w-full h-20 object-cover rounded-md cursor-pointer"
                                            onClick={() => setPreviewImage(url)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Không có ảnh nào.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Các nút chỉnh sửa và xóa */}
            <div className="mt-6 mx-20 flex justify-around">
                <button
                    onClick={handleEdit}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400"
                >
                    Chỉnh sửa
                </button>
                <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400"
                >
                    Xóa
                </button>
            </div>

            {/* Modal để phóng to ảnh */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                    onClick={() => setPreviewImage(null)}
                >
                    <img
                        src={previewImage}
                        alt="Enlarged Preview"
                        className="max-w-[75%] max-h-[85%] object-cover rounded-lg"
                    />
                </div>
            )}
        </div>
    );
};

export default ServicePostDetails;