import React, { useState, useEffect } from 'react';
import ServicePost from '../../../Services/Admin/ServicePost';
import CategoryServices from '../../../Services/Admin/CategoryServices';
import { useNavigate, useParams } from 'react-router-dom';
import { showCustomNotification } from '../../../Components/Notification';
import { useAuth } from '../../../Context/AuthProvider';
import { FaArrowLeft, FaTimes, FaPlus } from "react-icons/fa";
import PriceInput from '../../../Components/Layout/Range/PriceInput';
import Loading from '../../../Components/Loading';

const ServicePostForm = () => {
    const [servicePost, setServicePosts] = useState({});
    const [categoryServices, setCategoryServices] = useState([]);
    const { servicePostId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    // State cho ảnh đã lưu (khi edit)
    const [existingImages, setExistingImages] = useState([]);
    // State cho file mới được chọn
    const [newFiles, setNewFiles] = useState([]);
    // State cho preview URL của file mới
    const [newPreviews, setNewPreviews] = useState([]);
    // State hiển thị preview phóng to
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        CategoryServices.getCategoryServices()
            .then((data) => setCategoryServices(data))
            .catch((error) => console.error('Error fetching categories:', error));

        if (servicePostId) {
            // Nếu có servicePostId => chỉnh sửa, fetch dữ liệu từ API
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
                        location: data.location,
                        description: data.description,
                        categoryServiceId: data.categoryServiceId,
                    });
                    // Ảnh đã lưu từ DB (Cloudinary URL)
                    setExistingImages(images);
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

    // Khi người dùng chọn file mới, cập nhật newFiles và newPreviews
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setNewFiles(prev => [...prev, ...selectedFiles]);
            const previews = selectedFiles.map(file => URL.createObjectURL(file));
            setNewPreviews(prev => [...prev, ...previews]);
        }
    };

    // Xóa file khỏi danh sách: nếu isNew=true thì xóa file mới, ngược lại xóa ảnh đã có
    const handleRemoveFile = (index, isNew) => {
        if (isNew) {
            setNewFiles(prev => prev.filter((_, i) => i !== index));
            setNewPreviews(prev => prev.filter((_, i) => i !== index));
        } else {
            setExistingImages(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Hàm upload file mới lên API xử lý upload ảnh lên Cloudinary
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('https://apiduvas1.runasp.net/api/Upload/upload-image', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            const data = await response.json();
            return data.imageUrl;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalImagesCount = existingImages.length + newFiles.length;
        if (totalImagesCount === 0) {
            showCustomNotification("error", "Vui lòng chọn ít nhất 1 ảnh!");
            return;
        }
        setLoading(true);
        try {
            // Upload file mới song song để giảm thời gian chờ
            const uploadedImageUrls = await Promise.all(newFiles.map(file => uploadFile(file)));
            // Kết hợp URL từ ảnh đã có và ảnh mới upload
            const finalImageUrls = [...existingImages, ...uploadedImageUrls];

            // Lấy dữ liệu từ state servicePost
            let servicePostData = {
                title: servicePost.title,
                phoneNumber: servicePost.phoneNumber,
                price: servicePost.price,
                location: servicePost.location,
                description: servicePost.description,
                categoryServiceId: servicePost.categoryServiceId,
                userId: user.userId,
                image: JSON.stringify(finalImageUrls),
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
        } finally {
            setLoading(false);
        }
    };

    // Tạo mảng kết hợp preview: ảnh từ server (existingImages) và ảnh mới (newPreviews)
    const combinedPreviews = [
        ...existingImages.map(url => ({ url, isNew: false })),
        ...newPreviews.map((url, idx) => ({ url, isNew: true, index: idx }))
    ];

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            {loading &&
                <Loading />
            }
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
                            value={servicePost.categoryServiceId || ''}
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
                <div className="mt-4">
                    <label className="flex text-lg text-left font-bold text-black mb-2">
                        Ảnh: <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm w-full text-center">
                        <div className="flex items-center justify-center">
                            <label className="cursor-pointer bg-gray-200 p-3 rounded-lg flex items-center gap-2">
                                <FaPlus className="text-blue-600" />
                                <span className="text-gray-700 font-semibold">Thêm Ảnh</span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    accept=".jpeg, .png, .pdf, .mp4"
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="text-gray-500 text-sm mb-3 font-medium text-center mt-2">
                            Định dạng: JPEG, PNG - Tối đa 5MB
                        </p>
                        {combinedPreviews.length > 0 && (
                            <div className="mt-3">
                                <p className="font-semibold text-gray-700">Ảnh đã chọn:</p>
                                <div className="grid grid-cols-3 gap-3 mt-2">
                                    {combinedPreviews.map((item, index) => (
                                        <div key={index} className="relative border p-2 rounded-lg shadow-sm">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (item.isNew) {
                                                        handleRemoveFile(item.index, true);
                                                    } else {
                                                        handleRemoveFile(index, false);
                                                    }
                                                }}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                            <img
                                                src={item.url}
                                                alt={`File ${index}`}
                                                className="w-full h-20 object-cover rounded-md cursor-pointer"
                                                onClick={() => setPreviewImage(item.url)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Buttons */}
                <div className="flex items-center flex-col">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-1 rounded-md shadow-md hover:bg-blue-400"
                    >
                        Lưu
                    </button>
                </div>
            </form>
            {/* Modal để phóng to ảnh */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                    onClick={() => setPreviewImage(null)}
                >
                    <img
                        src={previewImage}
                        alt="Enlarged Preview"
                        className="max-w-[75%] max-h-[85%]"
                    />
                </div>
            )}
        </div>
    );
};

export default ServicePostForm;