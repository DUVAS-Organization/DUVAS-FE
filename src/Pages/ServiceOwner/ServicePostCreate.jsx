import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarUser from '../../Components/Layout/SidebarUser';
import Loading from '../../Components/Loading';
import PriceInput from '../../Components/Layout/Range/PriceInput';
import { FaTimes, FaPlus } from 'react-icons/fa';
import { showCustomNotification } from '../../Components/Notification';
import { useAuth } from '../../Context/AuthProvider';
import ServiceManageService from '../../Services/ServiceOwner/ServiceManageService';
import OtherService from '../../Services/User/OtherService';
import CategoryServices from '../../Services/User/CategoryServices';

const ServicePostCreate = () => {
    const [service, setService] = useState({
        title: '',
        description: '',
        location: '',
        price: 0,
        categoryServiceId: null,
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
    const navigate = useNavigate();
    const { user } = useAuth();
    const [categoryServices, setCategoryServices] = useState([]);

    // Fetch category services on mount
    useEffect(() => {
        const fetchCategoryServices = async () => {
            try {
                const data = await CategoryServices.getCategoryServices();
                setCategoryServices(data);
                if (data.length > 0 && !service.categoryServiceId) {
                    setService((prev) => ({ ...prev, categoryServiceId: data[0].categoryServiceId }));
                }
            } catch (error) {
                console.error('Error fetching category services:', error);
                showCustomNotification('error', 'Không thể lấy danh sách loại dịch vụ!');
            }
        };
        fetchCategoryServices();
    }, [service.categoryServiceId]);

    // Handle file change with Azure image check
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
                console.error('Error in handleFileChange:', error);
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

    // Validate images
    const validateImages = () => {
        if (invalidImages.some((invalid) => invalid)) {
            showCustomNotification('error', 'Vui lòng thay thế các ảnh không phù hợp trước khi tiếp tục.');
            return false;
        }
        return true;
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

            const response = await ServiceManageService.addService(serviceData);
            showCustomNotification('success', 'Tạo dịch vụ thành công!');
            navigate('/ServiceOwner/ManageServices');
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            const apiMessage = error?.response?.data?.message || error.message;

            if (error?.response?.status === 409 && apiMessage.includes('tiêu đề')) {
                showCustomNotification('error', 'Dịch vụ với tiêu đề này đã được đăng. Hãy kiểm tra lại.');
                return;
            }
            if (error?.response?.status === 400 && apiMessage.includes('spam')) {
                showCustomNotification('error', 'Mô tả có thể bị spam hoặc trùng với AI. Hãy chỉnh sửa để khác biệt hơn.');
                return;
            }
            showCustomNotification('error', apiMessage || 'Đã xảy ra lỗi, vui lòng thử lại!');

            if (apiMessage.includes('Unauthorized')) {
                localStorage.removeItem('authToken');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
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
            // else if (service.description.length < 50) newErrors.description = 'Mô tả phải trên 50 ký tự';
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

    // Combine previews
    const combinedPreviews = [
        ...existingImages.map((url) => ({ url, isNew: false })),
        ...newPreviews.map((url, idx) => ({ url, isNew: true, index: idx, isInvalid: invalidImages[idx] })),
    ];

    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-800 dark:text-white">
            {loading && <Loading />}
            <SidebarUser />
            <div className="w-64 bg-white dark:bg-gray-800 px-2 py-8 max-w-6xl mx-auto ml-56 h-full border-r border-gray-200">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Tạo Dịch Vụ</h1>
                <ul className="space-y-2">
                    {['Thông tin Dịch Vụ', 'Hình ảnh', 'Xác nhận'].map((label, idx) => (
                        <li
                            key={idx}
                            className={`text-lg ${step === idx + 1 ? 'text-red-600 font-bold' : 'text-gray-600 dark:text-white'}`}
                        >
                            Bước {idx + 1}: {label}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 p-8">
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-red-600">Tạo Dịch Vụ - Bước 1</h2>
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 dark:text-white">Thông tin Dịch Vụ</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                        Loại Dịch Vụ <span className="text-red-500">*</span>
                                    </label>
                                    {categoryServices.length > 0 ? (
                                        <select
                                            value={service.categoryServiceId || ''}
                                            onChange={(e) =>
                                                setService({ ...service, categoryServiceId: parseInt(e.target.value) || null })
                                            }
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="" disabled>Chọn loại dịch vụ...</option>
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
                                        <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách loại dịch vụ...</p>
                                    )}
                                    {errors.categoryServiceId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.categoryServiceId}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                        Giá (đ) <span className="text-red-500">*</span>
                                    </label>
                                    <PriceInput
                                        value={service.price}
                                        onChange={(val) => setService({ ...service, price: val })}
                                    />
                                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                        Địa chỉ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={service.location}
                                        onChange={(e) => setService({ ...service, location: e.target.value })}
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white"
                                        placeholder="Nhập Địa chỉ"
                                    />
                                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={service.phoneNumber}
                                    onChange={(e) => setService({ ...service, phoneNumber: e.target.value })}
                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                            <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800 dark:text-white">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 dark:text-white">Tiêu đề & Mô tả</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                            Tiêu Đề <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={service.title}
                                            onChange={(e) => setService({ ...service, title: e.target.value })}
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white"
                                            placeholder="Mô tả ngắn gọn về dịch vụ"
                                        />
                                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                            Mô tả <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={service.description}
                                            onChange={(e) => setService({ ...service, description: e.target.value })}
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white"
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
                        <h2 className="text-xl font-bold mb-2 text-red-600">Tạo Dịch Vụ - Bước 2</h2>
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm text-center dark:bg-gray-800 dark:text-white">
                            <label className="cursor-pointer bg-gray-200 p-3 rounded-lg flex items-center gap-2 justify-center dark:bg-gray-700 dark:text-white">
                                <FaPlus className="text-blue-600" />
                                <span className="text-gray-700 font-semibold dark:text-white">Thêm ảnh</span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    accept=".jpeg, .png"
                                    className="hidden"
                                />
                            </label>
                            <p className="text-gray-500 text-sm mb-3 font-medium text-center mt-2 dark:text-gray-400">
                                Định dạng: JPEG, PNG - Tối đa 5MB
                            </p>
                            {combinedPreviews.length > 0 && (
                                <div className="mt-3">
                                    <p className="font-semibold text-gray-700 dark:text-white">Ảnh đã chọn:</p>
                                    <div className="grid grid-cols-3 gap-3 mt-2">
                                        {combinedPreviews.map((item, index) => (
                                            <div
                                                key={index}
                                                className={`relative border p-2 rounded-lg shadow-sm ${item.isInvalid ? 'border-red-500' : ''}`}
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
                        <h2 className="text-xl font-bold mb-2 text-red-600">Tạo Dịch Vụ - Bước 3</h2>
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="space-y-6">
                            <p className="text-lg">Vui lòng kiểm tra lại thông tin trước khi tạo dịch vụ.</p>
                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Tạo Dịch Vụ
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
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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

export default ServicePostCreate;