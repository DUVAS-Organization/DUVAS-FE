import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaPlus, FaMinus, FaTimes, FaChevronUp, FaChevronDown, FaArrowLeft } from 'react-icons/fa';
import PriceInput from '../../Components/Layout/Range/PriceInput';
import CPPRoomsService from '../../Services/Admin/CPPRoomsService';
import BookingManagementService from '../../Services/Landlord/BookingManagementService';
import RoomLandlordService from '../../Services/Landlord/RoomLandlordService';
import OtherService from '../../Services/User/OtherService';
import { showCustomNotification } from '../../Components/Notification';
import { useNavigate } from 'react-router-dom';
import PriorityRoomService from '../../Services/Admin/PriorityRoomService';

// Helper Functions
const getCategoryName = (value) => {
    if (value === 0) return 'Gói Miễn Phí';
    return `Gói ${Number(value)} ngày`;
};

const getCategoryDescription = (value) => {
    if (value === 0) return 'Gói cơ bản không ưu tiên';
    switch (Number(value)) {
        case 30:
            return 'Hiển thị trên cùng';
        case 14:
            return 'Ưu tiên cao';
        case 7:
            return 'Ưu tiên trung bình';
        case 3:
            return 'Ưu tiên cơ bản';
        default:
            return 'Ưu tiên cơ bản';
    }
};

const getBorderColor = (value) => {
    if (value === 0) return 'border-blue-500';
    switch (Number(value)) {
        case 30:
            return 'border-red-600';
        case 14:
            return 'border-yellow-600';
        case 7:
            return 'border-green-500';
        case 3:
            return 'border-gray-500';
        default:
            return 'border-gray-200';
    }
};

const getBorderDescription = (price, duration) => {
    if (price === 0) return 'Miễn phí';
    return `${(price / duration).toLocaleString('vi-VN')} đ/ngày`;
};

// Step 1: Information
const Step1Information = ({
    room,
    setRoom,
    buildings,
    categoryRooms,
    errors,
    roomId,
    handleIncrement,
    handleDecrement,
    isDropOpen,
    toggleDropOpen,
    handleGenerateWithAI,
    handleTogglePermission,
}) => {
    return (
        <div>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold mb-2 text-red-600">{roomId ? 'Chỉnh Sửa Phòng - Bước 1' : 'Tạo Phòng - Bước 1'}</h2>
                {roomId && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePermission(room.isPermission === 1 ? 'lock' : 'unlock');
                        }}
                        className={`py-1 text-lg ${room.isPermission === 1
                            ? 'text-red-500 w-16 h-12 hover:bg-red-500 hover:text-white'
                            : 'text-green-500 hover:bg-green-500 hover:text-white w-24 h-12 p-2'
                            } font-semibold bg-white rounded-full border-2`}
                    >
                        {room.isPermission === 1 ? 'Khóa' : 'Mở Khóa'}
                    </button>
                )}
            </div>
            <div className="border-b-2 border-red-500 w-32 mb-4"></div>
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Thông tin Phòng</h3>
                    <label className="block text-sm font-medium text-gray-700">Tòa Nhà</label>
                    <select
                        value={room.buildingId || ''}
                        onChange={(e) => setRoom({ ...room, buildingId: parseInt(e.target.value) || null })}
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    >
                        <option value="">Không có</option>
                        {buildings.map((building) => (
                            <option key={building.buildingId} value={building.buildingId}>
                                {building.buildingName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Giá (đ/tháng) <span className="text-red-500">*</span>
                        </label>
                        <PriceInput value={room.price || 0} onChange={(val) => setRoom({ ...room, price: val })} />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Loại Phòng <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={room.categoryRoomId || ''}
                            onChange={(e) => setRoom({ ...room, categoryRoomId: parseInt(e.target.value) })}
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="" disabled>
                                Chọn loại phòng...
                            </option>
                            {categoryRooms.map((categoryRoom) => (
                                <option key={categoryRoom.categoryRoomId} value={categoryRoom.categoryRoomId}>
                                    {categoryRoom.categoryName}
                                </option>
                            ))}
                        </select>
                        {errors.categoryRoomId && <p className="text-red-500 text-sm mt-1">{errors.categoryRoomId}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Địa chỉ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={room.locationDetail}
                            onChange={(e) => setRoom({ ...room, locationDetail: e.target.value })}
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                            placeholder="Nhập Địa chỉ"
                        />
                        {errors.locationDetail && <p className="text-red-500 text-sm mt-1">{errors.locationDetail}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Diện Tích (m²) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={room.acreage}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || Number(value) >= 0) {
                                    setRoom({ ...room, acreage: value });
                                }
                            }}
                            min="0"
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                            placeholder="0"
                        />
                        {errors.acreage && <p className="text-red-500 text-sm mt-1">{errors.acreage}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Nội Thất <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={room.furniture}
                            onChange={(e) => setRoom({ ...room, furniture: e.target.value })}
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">Chọn nội thất...</option>
                            {['Đầy đủ', 'Cơ bản', 'Không nội thất'].map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        {errors.furniture && <p className="text-red-500 text-sm mt-1">{errors.furniture}</p>}
                    </div>
                    <div className="flex items-center">
                        <label className="block text-sm font-medium text-gray-700 w-1/3">
                            Phòng tắm <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => handleDecrement('numberOfBathroom')}
                                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                <FaMinus />
                            </button>
                            <span className="text-lg">{room.numberOfBathroom || 0}</span>
                            <button
                                type="button"
                                onClick={() => handleIncrement('numberOfBathroom')}
                                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                <FaPlus />
                            </button>
                        </div>
                        {errors.numberOfBathroom && <p className="text-red-500 text-sm mt-1">{errors.numberOfBathroom}</p>}
                    </div>
                    <div className="flex items-center">
                        <label className="block text-sm font-medium text-gray-700 w-1/3">
                            Giường ngủ <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => handleDecrement('numberOfBedroom')}
                                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                <FaMinus />
                            </button>
                            <span className="text-lg">{room.numberOfBedroom || 0}</span>
                            <button
                                type="button"
                                onClick={() => handleIncrement('numberOfBedroom')}
                                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                <FaPlus />
                            </button>
                        </div>
                        {errors.numberOfBedroom && <p className="text-red-500 text-sm mt-1">{errors.numberOfBedroom}</p>}
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between cursor-pointer select-none" onClick={toggleDropOpen}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Chi phí khác</h3>
                        {isDropOpen ? <FaChevronUp className="text-gray-600" /> : <FaChevronDown className="text-gray-600" />}
                    </div>
                    {isDropOpen && (
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Điện (đ/kWh)', key: 'dien' },
                                { label: 'Nước (đ/m³)', key: 'nuoc' },
                                { label: 'Internet (đ/tháng)', key: 'internet' },
                                { label: 'Rác (đ/tháng)', key: 'rac' },
                                { label: 'Gửi xe (đ/tháng)', key: 'guiXe' },
                                { label: 'Quản lý (đ/tháng)', key: 'quanLy' },
                                { label: 'Chi phí khác (đ/tháng)', key: 'chiPhiKhac' },
                            ].map(({ label, key }) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                                    <PriceInput value={room[key]} onChange={(val) => setRoom({ ...room, [key]: Number(val) || 0 })} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="rounded-lg bg-white shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Tiêu đề & Mô tả</h3>
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Tạo nhanh với AI</h3>
                        <button
                            type="button"
                            onClick={handleGenerateWithAI}
                            className="flex items-center space-x-1 px-3 py-2 border border-gray-400 rounded-full shadow-sm text-gray-600 hover:bg-gray-300 font-medium"
                        >
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
                            </svg>
                            <span>Tạo với AI</span>
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Tiêu Đề <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={room.title}
                                onChange={(e) => setRoom({ ...room, title: e.target.value })}
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                placeholder="Mô tả ngắn gọn về loại hình phòng, diện tích, địa chỉ"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Mô tả <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={room.description}
                                onChange={(e) => setRoom({ ...room, description: e.target.value })}
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                placeholder="Mô tả chi tiết về phòng..."
                                rows="5"
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Step 2: Images
const Step2Images = ({ roomId, handleFileChange, combinedPreviews, handleRemoveFile, setPreviewImage }) => {
    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-2 text-red-600">{roomId ? 'Chỉnh Sửa Phòng - Bước 2' : 'Tạo Phòng - Bước 2'}</h2>
            <div className="border-b-2 border-red-500 w-32 mb-4"></div>
            <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm text-center">
                <label className="cursor-pointer bg-gray-200 p-3 rounded-lg flex items-center gap-2 justify-center">
                    <FaPlus className="text-blue-600" />
                    <span className="text-gray-700 font-semibold">Thêm ảnh</span>
                    <input type="file" multiple onChange={handleFileChange} accept=".jpeg, .png" className="hidden" />
                </label>
                <p className="text-gray-500 text-sm mb-3 font-medium text-center mt-2">Định dạng: JPEG, PNG - Tối đa 5MB</p>
                {combinedPreviews.length > 0 && (
                    <div className="mt-3">
                        <p className="font-semibold text-gray-700">Ảnh đã chọn:</p>
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
                                    {item.isInvalid && <p className="text-red-500 text-xs mt-1">Ảnh không phù hợp</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Step 3: Confirmation
const Step3Confirmation = ({ room, setRoom, handleBack, handleSubmit, roomId, user, currentPriorityPackageId }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(room.categoryPriorityPackageRoomId || 0);
    const [isPackageExpired, setIsPackageExpired] = useState(false);
    const navigate = useNavigate();
    const hasExistingPackage = !!currentPriorityPackageId;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await CPPRoomsService.getCPPRooms();
                if (!Array.isArray(data)) {
                    throw new Error('Dữ liệu gói ưu tiên không hợp lệ');
                }

                const activeCategories = data.filter(
                    (category) =>
                        category.status === 1 &&
                        !isNaN(Number(category.price)) &&
                        !isNaN(Number(category.categoryPriorityPackageRoomValue)) &&
                        category.categoryPriorityPackageRoomId != null
                );

                const freePackage = {
                    categoryPriorityPackageRoomId: 0,
                    categoryPriorityPackageRoomValue: 0,
                    price: 0,
                    status: 1,
                    description: 'Gói Miễn Phí',
                };
                setCategories([freePackage, ...activeCategories]);

                if (activeCategories.length > 0 || !hasExistingPackage) {
                    let defaultCategory;
                    if (hasExistingPackage) {
                        defaultCategory = activeCategories.find(
                            (c) => c.categoryPriorityPackageRoomId === currentPriorityPackageId
                        ) || freePackage;
                    } else {
                        defaultCategory = room.categoryPriorityPackageRoomId
                            ? activeCategories.find(
                                (c) => c.categoryPriorityPackageRoomId === room.categoryPriorityPackageRoomId
                            ) || freePackage
                            : freePackage;
                    }
                    setSelectedCategoryId(defaultCategory.categoryPriorityPackageRoomId);
                    if (!hasExistingPackage && defaultCategory.categoryPriorityPackageRoomId !== 0) {
                        updateRoomDetails(defaultCategory);
                    }
                } else {
                    showCustomNotification('error', 'Không có gói ưu tiên hợp lệ nào!');
                }
            } catch (error) {
                console.error('Lỗi khi lấy danh sách gói ưu tiên:', error);
                showCustomNotification('error', 'Không thể tải danh sách gói ưu tiên!');
            }
        };

        fetchCategories();

        // Kiểm tra nếu ngày hiện tại > endDate
        if (hasExistingPackage && room.endDate) {
            const currentDate = new Date();
            const endDate = new Date(room.endDate);
            if (currentDate > endDate) {
                setIsPackageExpired(true);
            }
        }

        // Đặt startDate mặc định là ngày hiện tại nếu chưa có
        if (!room.startDate && (!hasExistingPackage || isPackageExpired)) {
            const today = new Date().toISOString().split('T')[0];
            setRoom({ ...room, startDate: today });
        }
    }, [setRoom, hasExistingPackage, currentPriorityPackageId, room.endDate, isPackageExpired]);

    useEffect(() => {
        if ((!hasExistingPackage || isPackageExpired) && room.startDate && selectedCategoryId) {
            const selectedCategory = categories.find((c) => c.categoryPriorityPackageRoomId === selectedCategoryId);
            if (selectedCategory && selectedCategory.categoryPriorityPackageRoomId !== 0) {
                updateRoomDetails(selectedCategory);
            } else {
                setRoom({
                    ...room,
                    endDate: '',
                    priorityPrice: 0,
                    duration: 0,
                    categoryPriorityPackageRoomId: 0,
                });
            }
        }
    }, [room.startDate, selectedCategoryId, categories, hasExistingPackage, isPackageExpired]);

    const handleCategorySelect = (categoryId) => {
        if (!hasExistingPackage || isPackageExpired) {
            setSelectedCategoryId(categoryId);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const updateRoomDetails = (category) => {
        if (!room.startDate || isNaN(new Date(room.startDate).getTime())) {
            return;
        }

        const startDate = new Date(room.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + Number(category.categoryPriorityPackageRoomValue));
        const duration = Number(category.categoryPriorityPackageRoomValue);
        const totalPrice = Number(category.price);

        if (isNaN(totalPrice)) {
            showCustomNotification('error', `Dữ liệu không hợp lệ cho gói ${category.categoryPriorityPackageRoomId}`);
            return;
        }

        setRoom({
            ...room,
            endDate: endDate.toISOString().split('T')[0],
            priorityPrice: totalPrice,
            duration: duration,
            categoryPriorityPackageRoomId: category.categoryPriorityPackageRoomId,
        });
    };

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-2 text-red-600">
                {roomId ? 'Chỉnh Sửa Phòng - Bước 3' : 'Tạo Phòng - Bước 3'}
            </h2>
            <div className="border-b-2 border-red-500 w-32 mb-4"></div>
            <div className="space-y-6">
                <p className="text-lg font-semibold text-gray-900">Chọn loại tin</p>

                {hasExistingPackage && !isPackageExpired && (
                    <p className="text-red-500 mb-4">
                        Phòng đang có gói ưu tiên hoạt động. Không thể thay đổi gói ưu tiên hoặc ngày bắt đầu.
                    </p>
                )}

                {hasExistingPackage && isPackageExpired && (
                    <p className="text-green-500 mb-4">
                        Gói ưu tiên hiện tại đã hết hạn. Bạn có thể chọn gói ưu tiên mới.
                    </p>
                )}

                {categories.length === 0 ? (
                    <p className="text-red-500">Không có gói ưu tiên nào khả dụng. Vui lòng thử lại sau!</p>
                ) : (
                    <div className="grid grid-cols-4 gap-4">
                        {categories.map((category) => {
                            const duration = Number(category.categoryPriorityPackageRoomValue);
                            const totalPrice = Number(category.price);
                            const pricePerDay = duration > 0 ? totalPrice / duration : 0;
                            const isSelected = selectedCategoryId === category.categoryPriorityPackageRoomId;
                            const isDisabled = hasExistingPackage && !isPackageExpired && !isSelected;

                            return (
                                <div
                                    key={category.categoryPriorityPackageRoomId}
                                    className={`border-2 ${getBorderColor(category.categoryPriorityPackageRoomValue)} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                        } ${isSelected ? 'ring-2 ring-gray-400' : ''}`}
                                    onClick={() => !isDisabled && handleCategorySelect(category.categoryPriorityPackageRoomId)}
                                >
                                    <h3 className="font-semibold text-lg text-gray-900">
                                        {getCategoryName(category.categoryPriorityPackageRoomValue)}
                                        {isSelected && hasExistingPackage && !isPackageExpired && (
                                            <span className="ml-2 text-green-500">(Đang sử dụng)</span>
                                        )}
                                    </h3>
                                    <p className="text-base text-gray-600 mt-2">
                                        {getCategoryDescription(category.categoryPriorityPackageRoomValue)}
                                    </p>
                                    <p className="text-base text-gray-600 mt-1">
                                        {duration > 0 ? `${duration} ngày ưu tiên` : 'Không ưu tiên'}
                                    </p>
                                    <p className="text-base text-gray-600 mt-1">{getBorderDescription(totalPrice, duration)}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {(!hasExistingPackage || isPackageExpired) && selectedCategoryId !== 0 && (
                    <div className="flex space-x-8 mt-4">
                        <div className="flex flex-col">
                            <p className="text-lg font-semibold text-gray-900 mb-2">Ngày bắt đầu</p>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={room.startDate ? formatDate(room.startDate) : ''}
                                    onChange={(e) => setRoom({ ...room, startDate: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="border border-gray-300 w-[220px] rounded-lg p-2 pr-2 text-gray-900 focus:ring-red-500 focus:border-red-500 appearance-none"
                                />
                                <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-lg font-semibold text-gray-900 mb-2">Ngày kết thúc</p>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={room.endDate || ''}
                                    readOnly
                                    className="border border-gray-300 w-[220px] rounded-lg p-2 pr-2 text-gray-900 bg-gray-100 cursor-not-allowed"
                                />
                                <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mt-6">
                    <button onClick={handleBack} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                        Quay lại
                    </button>
                    <div className="flex items-center space-x-4">
                        <p className="text-lg font-bold text-gray-900">
                            Tổng tiền: {room.priorityPrice ? room.priorityPrice.toLocaleString('vi-VN') : '0'} đ
                        </p>
                        <button
                            onClick={handleSubmit}
                            disabled={categories.length === 0}
                            className={`px-4 py-2 rounded-lg transition-colors ${categories.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                        >
                            {roomId ? 'Cập Nhật Phòng' : 'Tạo Phòng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main StepConfirmation Component
const StepConfirmation = ({
    step,
    room,
    setRoom,
    buildings,
    categoryRooms,
    errors,
    roomId,
    user,
    existingImages,
    newFiles,
    newPreviews,
    invalidImages,
    combinedPreviews,
    isDropOpen,
    previewImage,
    handleFileChange,
    handleRemoveFile,
    handleGenerateWithAI,
    handleIncrement,
    handleDecrement,
    toggleDropOpen,
    setPreviewImage,
    handleBack,
    handleNext,
    handleSubmit,
    handleTogglePermission,
    showPopup,
    action,
    confirmTogglePermission,
    closePopup,
    currentPriorityPackageId,
}) => {
    const navigate = useNavigate();

    const localHandleSubmit = async () => {
        if (invalidImages.some((invalid) => invalid)) {
            showCustomNotification('error', 'Vui lòng thay thế các ảnh không phù hợp trước khi tiếp tục.');
            return;
        }
        if (existingImages.length + newFiles.length === 0) {
            showCustomNotification('error', 'Vui lòng chọn ít nhất 1 ảnh!');
            return;
        }
        if (!room.title || room.title.length < 3) {
            showCustomNotification('error', 'Tiêu đề phải ít nhất 3 ký tự!');
            return;
        }
        if (!room.description || room.description.length < 50) {
            showCustomNotification('error', 'Mô tả phải ít nhất 50 ký tự!');
            return;
        }
        if (!room.categoryRoomId || isNaN(room.categoryRoomId)) {
            showCustomNotification('error', 'Vui lòng chọn loại phòng hợp lệ!');
            return;
        }
        if (room.categoryPriorityPackageRoomId !== 0 && (!room.startDate || !room.endDate || !room.priorityPrice)) {
            showCustomNotification('error', 'Vui lòng chọn gói ưu tiên và ngày bắt đầu hợp lệ!');
            return;
        }

        // console.log('User object:', user);
        if (!user || !user.userId || !user.token) {
            console.error('Authentication failed:', { user });
            showCustomNotification('error', 'Bạn cần đăng nhập để thực hiện hành động này!');
            navigate('/Logins');
            return;
        }

        setRoom((prev) => ({ ...prev, loading: true }));
        try {
            if (room.priorityPrice > 0) {
                // console.log('Checking balance:', { UserId: user.userId, Amount: room.priorityPrice });
                const checkBalanceData = { UserId: user.userId, Amount: room.priorityPrice };
                const balanceResponse = await BookingManagementService.checkBalance(checkBalanceData, user.token);
                // console.log('Balance response:', balanceResponse);

                const isBalanceSufficient =
                    (typeof balanceResponse === 'string' && balanceResponse === 'Bạn đủ tiền.') ||
                    (typeof balanceResponse === 'object' && balanceResponse.isSuccess);

                if (!isBalanceSufficient) {
                    showCustomNotification('error', 'Bạn không đủ tiền để thực hiện giao dịch này!');
                    navigate('/Moneys');
                    return;
                }

                // console.log('Updating balance:', { UserId: user.userId, Amount: -room.priorityPrice });
                const updateBalanceData = { UserId: user.userId, Amount: -room.priorityPrice };
                await BookingManagementService.updateBalance(updateBalanceData, user.token);
            }

            // console.log('Uploading images:', newFiles);
            const uploadedImageUrls = await Promise.all(
                newFiles.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    const data = await OtherService.uploadImage(formData);
                    return data.imageUrl;
                })
            );
            const finalImageUrls = [...existingImages, ...uploadedImageUrls];

            const roomData = {
                title: room.title,
                description: room.description,
                locationDetail: room.locationDetail || '',
                acreage: Number(room.acreage),
                furniture: room.furniture || 'Không nội thất',
                numberOfBathroom: Number(room.numberOfBathroom),
                numberOfBedroom: Number(room.numberOfBedroom),
                garret: room.garret,
                price: Number(room.price),
                categoryRoomId: Number(room.categoryRoomId),
                note: room.note || '',
                buildingId: room.buildingId || null,
                image: JSON.stringify(finalImageUrls),
                status: room.status,
                deposit: Number(room.deposit),
                isPermission: room.isPermission,
                reputation: room.reputation,
                dien: Number(room.dien),
                nuoc: Number(room.nuoc),
                internet: Number(room.internet),
                rac: Number(room.rac),
                guiXe: Number(room.guiXe),
                quanLy: Number(room.quanLy),
                chiPhiKhac: Number(room.chiPhiKhac),
                authorization: Number(room.authorization || 0),
                startDate: room.startDate || null,
                endDate: room.endDate || null,
                priorityPrice: room.priorityPrice || 0,
                categoryPriorityPackageRoomId: room.categoryPriorityPackageRoomId || 0,
            };

            // console.log('Creating room:', roomData);
            const roomResponse = await RoomLandlordService.addRoom(roomData, user.token);
            const newRoomId = roomResponse.roomId;

            if (room.categoryPriorityPackageRoomId !== 0) {
                const priorityRoomData = {
                    roomId: newRoomId,
                    categoryPriorityPackageRoomId: room.categoryPriorityPackageRoomId,
                    startDate: room.startDate,
                    endDate: room.endDate,
                    priorityPrice: room.priorityPrice,
                    userId: user.userId,
                    status: 1,
                };
                // console.log('Creating priority room:', priorityRoomData);
                await PriorityRoomService.createPriorityRoom(priorityRoomData, user.token);
            }

            showCustomNotification('success', 'Tạo phòng và priority room thành công!');
            navigate('/Room');
        } catch (error) {
            console.error('Submit error:', error);
            const apiMessage = error?.response?.data?.message || error.message;
            if (error?.response?.status === 401 || apiMessage.includes('Unauthorized')) {
                showCustomNotification('error', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                localStorage.removeItem('authToken');
                navigate('/Logins');
            } else {
                showCustomNotification('error', apiMessage || 'Không thể tạo phòng hoặc priority room!');
            }
        } finally {
            setRoom((prev) => ({ ...prev, loading: false }));
        }
    };

    return (
        <div>
            {step === 1 && (
                <>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-700 hover:text-red-600 text-sm font-medium transition-colors mb-4"
                    >
                        <FaArrowLeft className="text-lg" />
                    </button>
                    <Step1Information
                        room={room}
                        setRoom={setRoom}
                        buildings={buildings}
                        categoryRooms={categoryRooms}
                        errors={errors}
                        roomId={roomId}
                        handleIncrement={handleIncrement}
                        handleDecrement={handleDecrement}
                        isDropOpen={isDropOpen}
                        toggleDropOpen={toggleDropOpen}
                        handleGenerateWithAI={handleGenerateWithAI}
                        handleTogglePermission={handleTogglePermission}
                    />
                </>
            )}
            {step === 2 && (
                <Step2Images
                    roomId={roomId}
                    handleFileChange={handleFileChange}
                    combinedPreviews={combinedPreviews}
                    handleRemoveFile={handleRemoveFile}
                    setPreviewImage={setPreviewImage}
                />
            )}
            {step === 3 && (
                <Step3Confirmation
                    room={room}
                    setRoom={setRoom}
                    handleBack={handleBack}
                    handleSubmit={roomId ? handleSubmit : localHandleSubmit}
                    roomId={roomId}
                    user={user}
                    currentPriorityPackageId={currentPriorityPackageId}
                />
            )}
            {step < 3 && (
                <div className="flex justify-between mt-8">
                    {step > 1 && (
                        <button onClick={handleBack} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                            Quay lại
                        </button>
                    )}
                    <button onClick={handleNext} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Tiếp tục
                    </button>
                </div>
            )}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                    onClick={() => setPreviewImage(null)}
                >
                    <img src={previewImage} alt="Enlarged Preview" className="max-w-[75%] max-h-[85%] object-cover rounded-lg" />
                </div>
            )}
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-4">
                            {action === 'lock' ? 'Xác nhận khóa phòng' : 'Xác nhận mở khóa phòng'}
                        </h2>
                        <p className="mb-6">
                            Bạn có chắc chắn muốn {action === 'lock' ? 'khóa' : 'mở khóa'} phòng này không?
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
                                className={`px-4 py-2 rounded text-white ${action === 'lock' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                    }`}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StepConfirmation;