import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarUser from '../../Components/Layout/SidebarUser';
import Loading from '../../Components/Loading';
import PriceInput from '../../Components/Layout/Range/PriceInput';
import { FaTimes, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { showCustomNotification } from '../../Components/Notification';
import { useAuth } from '../../Context/AuthProvider';
import ServiceManageService from '../../Services/ServiceOwner/ServiceManageService';
import OtherService from '../../Services/User/OtherService';
import CategoryServices from '../../Services/User/CategoryServices';

const ServicePostEdit = () => {
    const [service, setService] = useState({
        servicePostId: '',
        title: '',
        description: '',
        location: '',
        price: 0,
        categoryServiceId: 1,
        phoneNumber: '',
        image: [],
        isPermission: 1,
    });
    const [existingImages, setExistingImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [invalidImages, setInvalidImages] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [action, setAction] = useState('');
    const { servicePostId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [categoryServices, setCategoryServices] = useState([]);
    const [categoryServiceName, setCategoryServiceName] = useState('');

    // Fetch initial data
    useEffect(() => {
        // Fetch danh sách loại dịch vụ
        const fetchCategoryServices = async () => {
            try {
                const data = await CategoryServices.getCategoryServices();
                console.log('Category Services:', data); // Debug dữ liệu
                setCategoryServices(data);
            } catch (error) {
                console.error('Error fetching category services:', error);
                showCustomNotification('error', 'Không thể lấy danh sách loại dịch vụ!');
            }
        };

        // Fetch dữ liệu dịch vụ hiện tại
        const fetchServiceData = async () => {
            if (!servicePostId) {
                showCustomNotification('error', 'Không tìm thấy ID dịch vụ!');
                navigate('/ServiceOwner/ManageServices');
                return;
            }

            setLoading(true);
            try {
                const data = await ServiceManageService.getMyServices();
                const serviceData = data.services.find((s) => s.servicePostId === parseInt(servicePostId));
                if (!serviceData) {
                    throw new Error('Dịch vụ không tồn tại');
                }
                let images = [];
                try {
                    images = serviceData.image ? JSON.parse(serviceData.image) : [];
                } catch {
                    images = serviceData.image ? [serviceData.image] : [];
                }
                setService({
                    servicePostId: serviceData.servicePostId || '',
                    title: serviceData.title || '',
                    description: serviceData.description || '',
                    location: serviceData.location || '',
                    price: serviceData.price || 0,
                    categoryServiceId: serviceData.categoryServiceId || 1,
                    phoneNumber: serviceData.phoneNumber || '',
                    image: images,
                    isPermission: serviceData.isPermission ?? 1,
                });
                setExistingImages(images);
                if (serviceData.categoryServiceId) {
                    const categoryData = await CategoryServices.getCategoryServiceById(serviceData.categoryServiceId);
                    setCategoryServiceName(categoryData.categoryServiceName);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                showCustomNotification('error', error.message || 'Không thể lấy thông tin dịch vụ!');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryServices();
        fetchServiceData();
    }, [servicePostId, navigate]);

    // Handle file change with checkAzureImage
    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setLoading(true);
            try {
                const previews = selectedFiles.map((file) => URL.createObjectURL(file));
                const checks = await Promise.all(
                    selectedFiles.map(async (file) => {
                        const result = await OtherService.checkImageAzure(file);
                        return {
                            isSafe: result.isSafe !== undefined ? result.isSafe : false,
                            message: result.message || 'Không có thông tin kiểm tra.',
                        };
                    })
                );
                const newInvalidImages = checks.map((result) => !result.isSafe);

                setNewFiles((prev) => [...prev, ...selectedFiles]);
                setNewPreviews((prev) => [...prev, ...previews]);
                setInvalidImages((prev) => [...prev, ...newInvalidImages]);

                if (newInvalidImages.some((invalid) => invalid)) {
                    showCustomNotification('error', 'Ảnh không phù hợp. Vui lòng kiểm tra và thay thế.');
                } else {
                    showCustomNotification('success', 'Tất cả ảnh đã được kiểm tra và hợp lệ.');
                }
            } catch (error) {
                console.error('Lỗi trong handleFileChange:', error);
                showCustomNotification('error', error.message || 'Lỗi khi kiểm tra ảnh.');
            } finally {
                setLoading(false);
            }
        }
    };

    // Remove file
    const handleRemoveFile = (index, isNew) => {
        if (isNew) {
            setNewFiles((prev) => prev.filter((_, i) => i !== index));
            setNewPreviews((prev) => prev.filter((_, i) => i !== index));
            setInvalidImages((prev) => prev.filter((_, i) => i !== index));
        } else {
            setExistingImages((prev) => prev.filter((_, i) => i !== index));
        }
    };

    // Upload file
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const data = await OtherService.uploadImage(formData);
        return data.imageUrl;
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!validateImages()) {
            return;
        }
        if (existingImages.length + newFiles.length === 0) {
            showCustomNotification('error', 'Vui lòng chọn ít nhất 1 ảnh!');
            return;
        }
        if (!service.title || service.title.length < 3) {
            showCustomNotification('error', 'Tiêu đề phải ít nhất 3 ký tự!');
            return;
        }
        // if (!service.description || service.description.length < 50) {
        //     showCustomNotification('error', 'Mô tả phải ít nhất 50 ký tự!');
        //     return;
        // }
        if (!service.categoryServiceId || isNaN(service.categoryServiceId)) {
            showCustomNotification('error', 'Vui lòng chọn loại dịch vụ hợp lệ!');
            return;
        }

        setLoading(true);
        try {
            const uploadedImageUrls = await Promise.all(newFiles.map(uploadFile));
            const finalImageUrls = [...existingImages, ...uploadedImageUrls];

            const serviceData = {
                title: service.title,
                description: service.description,
                location: service.location,
                price: Number(service.price),
                categoryServiceId: Number(service.categoryServiceId),
                phoneNumber: service.phoneNumber,
                image: JSON.stringify(finalImageUrls),
                isPermission: service.isPermission,
            };

            await ServiceManageService.editService(servicePostId, serviceData);
            showCustomNotification('success', 'Cập nhật dịch vụ thành công!');
            navigate('/ServiceOwner/ManageServices');
        } catch (error) {
            showCustomNotification('error', error.message || 'Lỗi khi cập nhật dịch vụ!');
        } finally {
            setLoading(false);
        }
    };

    // Validate images
    const validateImages = () => {
        if (invalidImages.some((invalid) => invalid)) {
            showCustomNotification('error', 'Vui lòng thay thế các ảnh không phù hợp trước khi tiếp tục.');
            return false;
        }
        return true;
    };

    // Validate step
    const validateStep = () => {
        if (step === 1) {
            const newErrors = {};
            if (!service.title) newErrors.title = 'Tiêu đề là bắt buộc';
            else if (service.title.length < 3) newErrors.title = 'Tiêu đề phải ít nhất 3 ký tự';
            if (!service.price || isNaN(Number(service.price)) || Number(service.price) <= 0)
                newErrors.price = 'Giá phải là số dương';
            if (!service.categoryServiceId) newErrors.categoryServiceId = 'Loại dịch vụ là bắt buộc';
            if (!service.location) newErrors.location = 'Địa chỉ là bắt buộc';
            if (!service.description) newErrors.description = 'Mô tả là bắt buộc';
            // else if (service.description.length <= 50) newErrors.description = 'Mô tả phải trên 50 ký tự';
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }
        if (step === 2) {
            if (existingImages.length + newFiles.length === 0) {
                showCustomNotification('error', 'Vui lòng chọn ít nhất 1 ảnh!');
                return false;
            }
            if (!validateImages()) {
                return false;
            }
            setErrors((prev) => ({ ...prev, images: '' }));
            return true;
        }
        return true;
    };

    // Navigation
    const handleNext = () => {
        if (validateStep()) {
            if (step < 3) {
                setStep(step + 1);
            } else {
                handleSubmit();
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    // Toggle permission
    const handleTogglePermission = (type) => {
        setAction(type);
        setShowPopup(true);
    };

    const confirmTogglePermission = async () => {
        setShowPopup(false);
        setLoading(true);
        try {
            if (action === 'lock') {
                await ServiceManageService.lockService(servicePostId);
                setService((prev) => ({ ...prev, isPermission: 0 }));
                showCustomNotification('success', 'Khóa dịch vụ thành công!');
            } else if (action === 'unlock') {
                await ServiceManageService.unlockService(servicePostId);
                setService((prev) => ({ ...prev, isPermission: 1 }));
                showCustomNotification('success', 'Mở khóa dịch vụ thành công!');
            }
        } catch (error) {
            const errorMessage = error.message || `Lỗi khi ${action === 'lock' ? 'khóa' : 'mở khóa'} dịch vụ!`;
            showCustomNotification('error', errorMessage);
            if (errorMessage.includes('Unauthorized')) {
                localStorage.removeItem('authToken');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    // Combine previews
    const combinedPreviews = [
        ...existingImages.map((url) => ({ url, isNew: false })),
        ...newPreviews.map((url, idx) => ({ url, isNew: true, index: idx, isInvalid: invalidImages[idx] })),
    ];

    return (
        <div className="flex min-h-screen bg-white">
            {loading && <Loading />}
            <SidebarUser />
            <div className="w-64 bg-white px-2 py-8 max-w-6xl mx-auto ml-56 h-full border-r border-gray-200">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Chỉnh Sửa Dịch Vụ</h1>
                <ul className="space-y-2">
                    {['Thông tin Dịch Vụ', 'Hình ảnh', 'Xác nhận'].map((label, idx) => (
                        <li
                            key={idx}
                            className={`text-lg ${step === idx + 1 ? 'text-red-600 font-bold' : 'text-gray-600'}`}
                        >
                            Bước {idx + 1}: {label}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 p-8">
                {step === 1 && (
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-700 hover:text-red-600 text-sm font-medium transition-colors"
                        >
                            <FaArrowLeft className="text-lg" />
                        </button>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold mb-2 text-red-600">Chỉnh Sửa Dịch Vụ - Bước 1</h2>
                            <button
                                onClick={() => handleTogglePermission(service.isPermission === 1 ? 'lock' : 'unlock')}
                                className={`py-1 text-lg ${service.isPermission === 1
                                    ? 'text-red-500 w-16 h-12 hover:bg-red-500 hover:text-white'
                                    : 'text-green-500 hover:bg-green-500 hover:text-white w-24 h-12 p-2'
                                    } font-semibold bg-white rounded-full border-2`}
                            >
                                {service.isPermission === 1 ? 'Khóa' : 'Mở Khóa'}
                            </button>
                        </div>
                        {showPopup && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                                    <h2 className="text-lg font-bold mb-4">
                                        {action === 'lock' ? 'Xác nhận khóa dịch vụ' : 'Xác nhận mở khóa dịch vụ'}
                                    </h2>
                                    <p className="mb-6">
                                        Bạn có chắc chắn muốn {action === 'lock' ? 'khóa' : 'mở khóa'} dịch vụ này không?
                                    </p>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            onClick={closePopup}
                                            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={confirmTogglePermission}
                                            className={`px-4 py-2 rounded text-white ${action === 'lock'
                                                ? 'bg-red-500 hover:bg-red-600'
                                                : 'bg-green-500 hover:bg-green-600'
                                                }`}
                                        >
                                            Xác nhận
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Thông tin Dịch Vụ</h3>
                                <div>
                                    {categoryServices.length > 0 ? (
                                        <select
                                            value={service.categoryServiceId}
                                            onChange={(e) =>
                                                setService({ ...service, categoryServiceId: e.target.value })
                                            }
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                        >
                                            <option value="">Chọn loại dịch vụ...</option>
                                            {categoryServices.map((category) => (
                                                <option
                                                    key={category.categoryServiceId}
                                                    value={category.categoryServiceId}
                                                >
                                                    {category.categoryServiceName}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-gray-600">Đang tải danh sách loại dịch vụ...</p>
                                    )}
                                    {/* {categoryServiceName && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Loại dịch vụ hiện tại: {categoryServiceName}
                                        </p>
                                    )} */}
                                    {errors.categoryServiceId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.categoryServiceId}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Giá (đ) <span className="text-red-500">*</span>
                                    </label>
                                    <PriceInput
                                        value={service.price}
                                        onChange={(val) => setService({ ...service, price: val })}
                                    />
                                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Địa chỉ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={service.location}
                                        onChange={(e) => setService({ ...service, location: e.target.value })}
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                        placeholder="Nhập Địa chỉ"
                                    />
                                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={service.phoneNumber}
                                    onChange={(e) => setService({ ...service, phoneNumber: e.target.value })}
                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                            <div className="rounded-lg bg-white shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tiêu đề & Mô tả</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Tiêu Đề <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={service.title}
                                            onChange={(e) => setService({ ...service, title: e.target.value })}
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                            placeholder="Mô tả ngắn gọn về dịch vụ"
                                        />
                                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Mô tả <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={service.description}
                                            onChange={(e) => setService({ ...service, description: e.target.value })}
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                            placeholder="Mô tả chi tiết về dịch vụ..."
                                            rows="5"
                                        />
                                        {errors.description && (
                                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-2 text-red-600">Chỉnh Sửa Dịch Vụ - Bước 2</h2>
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm text-center">
                            <label className="cursor-pointer bg-gray-200 p-3 rounded-lg flex items-center gap-2 justify-center">
                                <FaPlus className="text-blue-600" />
                                <span className="text-gray-700 font-semibold">Thêm ảnh</span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    accept=".jpeg, .png"
                                    className="hidden"
                                />
                            </label>
                            <p className="text-gray-500 text-sm mb-3 font-medium text-center mt-2">
                                Định dạng: JPEG, PNG - Tối đa 5MB
                            </p>
                            {combinedPreviews.length > 0 && (
                                <div className="mt-3">
                                    <p className="font-semibold text-gray-700">Ảnh đã chọn:</p>
                                    <div className="grid grid-cols-3 gap-3 mt-2">
                                        {combinedPreviews.map((item, index) => (
                                            <div
                                                key={index}
                                                className={`relative border p-2 rounded-lg shadow-sm ${item.isInvalid ? 'border-red-500' : ''
                                                    }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(item.isNew ? item.index : index, item.isNew)}
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
                                                {item.isInvalid && (
                                                    <p className="text-red-500 text-xs mt-1">Ảnh không phù hợp</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-2 text-red-600">Chỉnh Sửa Dịch Vụ - Bước 3</h2>
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="space-y-6">
                            <p className="text-lg">Vui lòng kiểm tra lại thông tin trước khi cập nhật dịch vụ.</p>
                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Cập Nhật Dịch Vụ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {step < 3 && (
                    <div className="flex justify-between mt-8">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Quay lại
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Tiếp tục
                        </button>
                    </div>
                )}
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
        </div>
    );
};

export default ServicePostEdit;