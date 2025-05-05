import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminManageRoomService from '../../../../Services/Admin/AdminManageRoomService';
import BuildingServices from '../../../../Services/Admin/BuildingServices';
import CategoryRooms from '../../../../Services/Admin/CategoryRooms';
import OtherService from '../../../../Services/User/OtherService';
import { showCustomNotification } from '../../../../Components/Notification';
import { useAuth } from '../../../../Context/AuthProvider';
import { FaTimes, FaPlus, FaMinus, FaChevronUp, FaChevronDown, FaArrowLeft } from 'react-icons/fa';
import Loading from '../../../../Components/Loading';
import PriceInput from '../../../../Components/Layout/Range/PriceInput';
import RoomService from '../../../../Services/User/RoomService';

const RoomAdminEdit = () => {
    const [room, setRoom] = useState({
        roomId: '',
        buildingId: null,
        title: '',
        description: '',
        locationDetail: '',
        acreage: 0,
        furniture: '',
        numberOfBathroom: 0,
        numberOfBedroom: 0,
        garret: false,
        price: 0,
        categoryRoomId: 1,
        note: '',
        status: 1,
        deposit: 0,
        isPermission: 1,
        reputation: 0,
        dien: 0,
        nuoc: 0,
        internet: 0,
        rac: 0,
        guiXe: 0,
        quanLy: 0,
        chiPhiKhac: 0,
        authorization: 0,
    });
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [invalidImages, setInvalidImages] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [isDropOpen, setIsDropOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [action, setAction] = useState('');
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Hàm xử lý lỗi chung
    const handleApiError = (error, customMessage = 'Đã xảy ra lỗi, vui lòng thử lại!') => {
        const apiMessage = error?.response?.data?.message || error.message;
        if (error?.response?.status === 409) {
            if (apiMessage.includes('Mô tả phòng đã từng được sử dụng')) {
                showCustomNotification('error', 'Mô tả này đã bị trùng với phòng khác trong hệ thống. Vui lòng chỉnh sửa.');
            } else if (apiMessage.includes('tiêu đề và địa chỉ')) {
                showCustomNotification('error', 'Phòng với tiêu đề và địa chỉ này đã được đăng. Hãy kiểm tra lại.');
            } else if (apiMessage.includes('Địa chỉ phòng đã được sử dụng')) {
                showCustomNotification('error', 'Địa chỉ phòng đã được dùng trong hệ thống. Vui lòng nhập địa chỉ khác.');
            }
        } else if (error?.response?.status === 400 && apiMessage.includes('spam')) {
            showCustomNotification('error', 'Mô tả có thể bị spam hoặc trùng với AI. Hãy chỉnh sửa để khác biệt hơn.');
        } else {
            showCustomNotification('error', apiMessage || customMessage);
        }
        if (apiMessage.includes('Unauthorized')) {
            localStorage.removeItem('authToken');
            navigate('/login');
        }
    };

    // Fetch dữ liệu ban đầu
    useEffect(() => {
        if (!roomId || isNaN(roomId)) {
            showCustomNotification('error', 'ID phòng không hợp lệ!');
            navigate('/Admin/Authorization');
            return;
        }

        setLoading(true);
        Promise.all([
            CategoryRooms.getCategoryRooms(),
            BuildingServices.getBuildings(),
            RoomService.getRoomById(roomId),
        ])
            .then(([categories, buildings, roomData]) => {
                setCategoryRooms(categories);
                setBuildings(buildings);
                let images = [];
                try {
                    images = roomData.image ? JSON.parse(roomData.image) : [];
                } catch {
                    images = roomData.image ? [roomData.image] : [];
                }
                setRoom({
                    roomId: roomData.roomId || '',
                    buildingId: roomData.buildingId || null,
                    title: roomData.title || '',
                    description: roomData.description || '',
                    locationDetail: roomData.locationDetail || '',
                    acreage: roomData.acreage || 0,
                    furniture: roomData.furniture || '',
                    numberOfBathroom: roomData.numberOfBathroom || 0,
                    numberOfBedroom: roomData.numberOfBedroom || 0,
                    garret: roomData.garret || false,
                    price: roomData.price || 0,
                    categoryRoomId: roomData.categoryRoomId || 1,
                    note: roomData.note || '',
                    status: roomData.status || 1,
                    deposit: roomData.deposit || 0,
                    isPermission: roomData.isPermission ?? 1,
                    reputation: roomData.reputation || 0,
                    dien: roomData.dien || 0,
                    nuoc: roomData.nuoc || 0,
                    internet: roomData.internet || 0,
                    rac: roomData.rac || 0,
                    guiXe: roomData.guiXe || 0,
                    quanLy: roomData.quanLy || 0,
                    chiPhiKhac: roomData.chiPhiKhac || 0,
                    authorization: roomData.authorization || 0,
                });
                setExistingImages(images);
            })
            .catch(error => {
                console.error('Lỗi khi lấy dữ liệu:', error);
                handleApiError(error, 'Không thể lấy thông tin phòng!');
            })
            .finally(() => setLoading(false));
    }, [roomId, navigate]);

    // Xử lý file ảnh mới
    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setLoading(true);
            try {
                const previews = selectedFiles.map(file => URL.createObjectURL(file));
                const checks = await Promise.all(
                    selectedFiles.map(async file => {
                        const result = await OtherService.checkImageAzure(file);
                        return {
                            isSafe: result.isSafe !== undefined ? result.isSafe : false,
                            message: result.message || 'Không có thông tin kiểm tra.',
                        };
                    })
                );
                const newInvalidImages = checks.map(result => !result.isSafe);

                setNewFiles(prev => [...prev, ...selectedFiles]);
                setNewPreviews(prev => [...prev, ...previews]);
                setInvalidImages(prev => [...prev, ...newInvalidImages]);

                if (newInvalidImages.some(invalid => invalid)) {
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

    // Xóa file ảnh
    const handleRemoveFile = (index, isNew) => {
        if (isNew) {
            setNewFiles(prev => prev.filter((_, i) => i !== index));
            setNewPreviews(prev => prev.filter((_, i) => i !== index));
            setInvalidImages(prev => prev.filter((_, i) => i !== index));
        } else {
            setExistingImages(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Upload file ảnh
    const uploadFile = async file => {
        const formData = new FormData();
        formData.append('file', file);
        const data = await OtherService.uploadImage(formData);
        return data.imageUrl;
    };

    // Xử lý tạo tiêu đề và mô tả với AI
    const handleGenerateWithAI = async () => {
        setLoading(true);
        try {
            const roomData = {
                Title: room.title,
                Description: room.description,
                LocationDetail: room.locationDetail,
                Image: JSON.stringify(existingImages),
                Acreage: Number(room.acreage),
                Furniture: room.furniture || 'Không nội thất',
                NumberOfBedroom: Number(room.numberOfBedroom),
                NumberOfBathroom: Number(room.numberOfBathroom),
                Price: Number(room.price),
                Note: room.note,
                UserId: user?.UserId || 1,
                BuildingId: room.buildingId,
                CategoryRoomId: Number(room.categoryRoomId),
                Garret: room.garret,
                IsPermission: room.isPermission,
                Deposit: Number(room.deposit),
                status: room.status,
                reputation: room.reputation,
                Dien: Number(room.dien),
                Nuoc: Number(room.nuoc),
                Internet: Number(room.internet),
                Rac: Number(room.rac),
                GuiXe: Number(room.guiXe),
                QuanLy: Number(room.quanLy),
                ChiPhiKhac: Number(room.chiPhiKhac),
                authorization: Number(room.authorization || 0),
                PriorityPackageRooms: [],
                User: {
                    UserId: user?.UserId || 1,
                    UserName: user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Admin',
                },
                RentalLists: [],
            };

            if (roomData.Acreage <= 0) throw new Error('Diện tích phải lớn hơn 0.');
            if (roomData.Price <= 0) throw new Error('Giá phải lớn hơn 0.');
            if (!['Đầy đủ', 'Cơ bản', 'Không nội thất'].includes(roomData.Furniture)) {
                throw new Error('Vui lòng chọn nội thất hợp lệ.');
            }
            if (!roomData.LocationDetail) throw new Error('Địa chỉ không được để trống.');
            if (!roomData.User.UserId) throw new Error('UserId không được để trống.');

            const result = await AdminManageRoomService.generateRoomDescription(roomData);
            setRoom(prev => ({
                ...prev,
                title: result.title || prev.title,
                description: result.description || prev.description,
            }));
            showCustomNotification('success', 'Tạo tiêu đề và mô tả thành công với AI!');
        } catch (error) {
            handleApiError(error, 'Lỗi khi tạo với AI!');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khóa/mở khóa phòng
    const handleTogglePermission = type => {
        setAction(type);
        setShowPopup(true);
    };

    const confirmTogglePermission = async () => {
        setShowPopup(false);
        setLoading(true);
        try {
            if (action === 'lock') {
                await AdminManageRoomService.lockRoom(roomId);
                setRoom(prev => ({ ...prev, isPermission: 0 }));
                showCustomNotification('success', 'Khóa phòng thành công!');
            } else if (action === 'unlock') {
                await AdminManageRoomService.unlockRoom(roomId);
                setRoom(prev => ({ ...prev, isPermission: 1 }));
                showCustomNotification('success', 'Mở khóa phòng thành công!');
            }
        } catch (error) {
            handleApiError(error, `Lỗi khi ${action === 'lock' ? 'khóa' : 'mở khóa'} phòng!`);
        } finally {
            setLoading(false);
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    // Xử lý submit form
    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateImages()) {
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

        setLoading(true);
        try {
            const uploadedImageUrls = await Promise.all(newFiles.map(uploadFile));
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
                PriorityPackageRooms: []
            };

            await AdminManageRoomService.updateRoom(roomId, roomData);
            showCustomNotification('success', 'Cập nhật phòng thành công!');
            navigate('/Admin/rooms/list');
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // Validation ảnh
    const validateImages = () => {
        if (invalidImages.some(invalid => invalid)) {
            showCustomNotification('error', 'Vui lòng thay thế các ảnh không phù hợp trước khi tiếp tục.');
            return false;
        }
        return true;
    };

    // Validation bước
    const validateStep = () => {
        if (step === 1) {
            const newErrors = {};
            if (!room.title) newErrors.title = 'Tiêu đề là bắt buộc';
            else if (room.title.length < 3) newErrors.title = 'Tiêu đề phải ít nhất 3 ký tự';
            if (!room.price || isNaN(Number(room.price)) || Number(room.price) <= 0)
                newErrors.price = 'Giá phải là số dương';
            if (!room.categoryRoomId) newErrors.categoryRoomId = 'Loại phòng là bắt buộc';
            if (!room.locationDetail) newErrors.locationDetail = 'Địa chỉ là bắt buộc';
            if (!room.acreage || isNaN(Number(room.acreage)) || Number(room.acreage) < 0)
                newErrors.acreage = 'Diện tích phải là số không âm';
            if (room.numberOfBathroom < 0 || isNaN(Number(room.numberOfBathroom)))
                newErrors.numberOfBathroom = 'Số phòng tắm phải là số không âm';
            if (room.numberOfBedroom < 0 || isNaN(Number(room.numberOfBedroom)))
                newErrors.numberOfBedroom = 'Số giường ngủ phải là số không âm';
            if (!room.description) newErrors.description = 'Mô tả là bắt buộc';
            else if (room.description.length <= 50) newErrors.description = 'Mô tả phải trên 50 ký tự';
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
            setErrors(prev => ({ ...prev, images: '' }));
            return true;
        }
        return true;
    };

    // Điều hướng bước
    const handleNext = () => {
        if (validateStep()) {
            if (step < 3) {
                setStep(step + 1);
            } else {
                handleSubmit(new Event('submit'));
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    // Tăng/giảm số lượng
    const handleIncrement = field => {
        setRoom(prev => ({ ...prev, [field]: (prev[field] || 0) + 1 }));
    };

    const handleDecrement = field => {
        setRoom(prev => ({ ...prev, [field]: Math.max(0, (prev[field] || 0) - 1) }));
    };

    // Toggle chi phí khác
    const toggleDropOpen = () => setIsDropOpen(prev => !prev);

    // Kết hợp ảnh preview
    const combinedPreviews = [
        ...existingImages.map(url => ({ url, isNew: false })),
        ...newPreviews.map((url, idx) => ({
            url,
            isNew: true,
            index: idx,
            isInvalid: invalidImages[idx],
        })),
    ];

    return (
        <div className="flex min-h-screen bg-white">
            {loading && <Loading />}
            <div className="w-64 bg-white px-2 py-8 max-w-6xl mx-auto h-full border-r border-gray-200">
                {/* <h1 className="text-2xl font-bold text-blue-600"> (Admin) </h1> */}
                <h1 className="text-2xl font-bold text-blue-600 mb-4"> Chỉnh Sửa Phòng</h1>
                <ul className="space-y-2">
                    {['Thông tin Phòng', 'Hình ảnh', 'Xác nhận'].map((label, idx) => (
                        <li
                            key={idx}
                            className={`text-lg ${step === idx + 1 ? 'text-blue-600 font-bold' : 'text-gray-600'}`}
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
                            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors"
                        >
                            <FaArrowLeft className="text-lg" />
                        </button>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold mb-2 text-blue-600">Chỉnh Sửa Phòng - Bước 1</h2>
                            <button
                                onClick={e => {
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
                        </div>
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
                        <div className="border-b-2 border-blue-500 w-32 mb-4"></div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Thông tin Phòng</h3>
                                <label className="block text-sm font-medium text-gray-700">Tòa Nhà</label>
                                <select
                                    value={room.buildingId || ''}
                                    onChange={e =>
                                        setRoom({ ...room, buildingId: parseInt(e.target.value) || null })
                                    }
                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Không có</option>
                                    {buildings.map(building => (
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
                                    <PriceInput
                                        value={room.price}
                                        onChange={val => setRoom({ ...room, price: val })}
                                    />
                                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Loại Phòng <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={room.categoryRoomId}
                                        onChange={e =>
                                            setRoom({ ...room, categoryRoomId: parseInt(e.target.value) })
                                        }
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="" disabled>
                                            Chọn loại phòng...
                                        </option>
                                        {categoryRooms.map(category => (
                                            <option key={category.categoryRoomId} value={category.categoryRoomId}>
                                                {category.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.categoryRoomId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.categoryRoomId}</p>
                                    )}
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
                                        onChange={e => setRoom({ ...room, locationDetail: e.target.value })}
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Nhập Địa chỉ"
                                    />
                                    {errors.locationDetail && (
                                        <p className="text-red-500 text-sm mt-1">{errors.locationDetail}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Diện Tích (m²) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={room.acreage}
                                        onChange={e => {
                                            const value = e.target.value;
                                            if (value === '' || Number(value) >= 0) {
                                                setRoom({ ...room, acreage: value });
                                            }
                                        }}
                                        min="0"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0"
                                    />
                                    {errors.acreage && <p className="text-red-500 text-sm mt-1">{errors.acreage}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nội Thất</label>
                                    <select
                                        value={room.furniture}
                                        onChange={e => setRoom({ ...room, furniture: e.target.value })}
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Chọn nội thất...</option>
                                        {['Đầy đủ', 'Cơ bản', 'Không nội thất'].map(option => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
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
                                        <span className="text-lg">{room.numberOfBathroom}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleIncrement('numberOfBathroom')}
                                            className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>
                                    {errors.numberOfBathroom && (
                                        <p className="text-red-500 text-sm mt-1">{errors.numberOfBathroom}</p>
                                    )}
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
                                        <span className="text-lg">{room.numberOfBedroom}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleIncrement('numberOfBedroom')}
                                            className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>
                                    {errors.numberOfBedroom && (
                                        <p className="text-red-500 text-sm mt-1">{errors.numberOfBedroom}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div
                                    className="flex items-center justify-between cursor-pointer select-none"
                                    onClick={toggleDropOpen}
                                >
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Chi phí khác</h3>
                                    {isDropOpen ? (
                                        <FaChevronUp className="text-gray-600" />
                                    ) : (
                                        <FaChevronDown className="text-gray-600" />
                                    )}
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
                                                <label className="block text-sm font-medium text-gray-700">
                                                    {label}
                                                </label>
                                                <PriceInput
                                                    value={room[key]}
                                                    onChange={val => setRoom({ ...room, [key]: Number(val) || 0 })}
                                                />
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
                                        className="flex items-center space-x-1 px-3 py-2 border border-gray-400 rounded-full shadow-sm text-gray-800 hover:bg-gray-300 font-medium"
                                    >
                                        <svg
                                            className="w-4 h-4 text-green-500"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
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
                                            onChange={e => setRoom({ ...room, title: e.target.value })}
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                                            onChange={e => setRoom({ ...room, description: e.target.value })}
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Mô tả chi tiết về phòng..."
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
                        <h2 className="text-xl font-bold mb-2 text-blue-600">Chỉnh Sửa Phòng - Bước 2</h2>
                        <div className="border-b-2 border-blue-500 w-32 mb-4"></div>
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
                        <h2 className="text-xl font-bold mb-2 text-blue-600">Chỉnh Sửa Phòng - Bước 3</h2>
                        <div className="border-b-2 border-blue-500 w-32 mb-4"></div>
                        <div className="space-y-6">
                            <p className="text-lg">Vui lòng kiểm tra lại thông tin trước khi cập nhật phòng.</p>
                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Cập Nhật Phòng
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
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

export default RoomAdminEdit;