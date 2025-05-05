import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomLandlordService from '../../../Services/Landlord/RoomLandlordService';
import BuildingServices from '../../../Services/Admin/BuildingServices';
import CategoryRooms from '../../../Services/Admin/CategoryRooms';
import PriorityRoomService from '../../../Services/Admin/PriorityRoomService';
import BookingManagementService from '../../../Services/Landlord/BookingManagementService';
import OtherService from '../../../Services/User/OtherService';
import CPPRoomsService from '../../../Services/Admin/CPPRoomsService';
import { showCustomNotification } from '../../../Components/Notification';
import { useAuth } from '../../../Context/AuthProvider';
import Loading from '../../../Components/Loading';
import SidebarUser from '../../../Components/Layout/SidebarUser';
import PriceInput from '../../../Components/Layout/Range/PriceInput';
import { FaArrowLeft, FaTimes, FaPlus, FaMinus, FaChevronUp, FaChevronDown, FaCalendarAlt } from "react-icons/fa";

// Helper Functions for Step 3
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

const RoomForm = () => {
    const [room, setRoom] = useState({
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
        categoryRoomId: null,
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
        startDate: new Date().toISOString().split('T')[0], // Default start date set to today
        endDate: '',
        priorityPrice: 0,
        categoryPriorityPackageRoomId: 0,
        duration: 0,
    });
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [invalidImages, setInvalidImages] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [isDropOpen, setIsDropOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        setLoading(true);
        Promise.all([
            CategoryRooms.getCategoryRooms(),
            BuildingServices.getBuildings(),
            CPPRoomsService.getCPPRooms(),
        ])
            .then(([categories, buildings, priorityCategories]) => {
                setCategoryRooms(categories);
                setBuildings(buildings);
                if (categories.length > 0) {
                    setRoom(prev => ({ ...prev, categoryRoomId: categories[0].categoryRoomId }));
                }
                const activeCategories = priorityCategories.filter(
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
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                showCustomNotification("error", "Không thể lấy dữ liệu ban đầu!");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setLoading(true);
            try {
                const previews = selectedFiles.map(file => URL.createObjectURL(file));
                let checks;
                try {
                    checks = await Promise.all(
                        selectedFiles.map(file => OtherService.checkImageAzure(file))
                    );
                } catch (azureError) {
                    console.error('Azure AI check failed:', azureError);
                    // Bỏ qua kiểm tra nếu Azure AI lỗi
                    checks = selectedFiles.map(() => ({ isSafe: true }));
                }
                const newInvalidImages = checks.map(result => !result.isSafe);

                setNewFiles(prev => [...prev, ...selectedFiles]);
                setNewPreviews(prev => [...prev, ...previews]);
                setInvalidImages(prev => [...prev, ...newInvalidImages]);

                if (newInvalidImages.some(invalid => invalid)) {
                    showCustomNotification("error", "Ảnh không phù hợp. Vui lòng kiểm tra và thay thế.");
                }
            } catch (error) {
                console.error('Lỗi trong handleFileChange:', error);
                showCustomNotification("error", error.message || "Lỗi khi xử lý ảnh.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRemoveFile = (index, isNew) => {
        if (isNew) {
            setNewFiles(prev => prev.filter((_, i) => i !== index));
            setNewPreviews(prev => prev.filter((_, i) => i !== index));
            setInvalidImages(prev => prev.filter((_, i) => i !== index));
        } else {
            setExistingImages(prev => prev.filter((_, i) => i !== index));
        }
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const data = await OtherService.uploadImage(formData);
        return data.imageUrl;
    };

    const handleGenerateWithAI = async () => {
        setLoading(true);
        try {
            if (!user || !user.userId || !user.token) {
                showCustomNotification("error", "Bạn cần đăng nhập để thực hiện hành động này!");
                navigate('/Logins');
                return;
            }

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
                UserId: user.userId,
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
                RentalLists: []
            };

            if (roomData.Acreage <= 0) throw new Error('Diện tích phải lớn hơn 0.');
            if (roomData.Price <= 0) throw new Error('Giá phải lớn hơn 0.');
            if (!roomData.LocationDetail) throw new Error('Địa chỉ không được để trống.');
            if (!roomData.UserId) throw new Error('UserId không được để trống.');

            const result = await RoomLandlordService.generateRoomDescription(roomData, user.token);
            setRoom(prev => ({
                ...prev,
                title: result.title || prev.title,
                description: result.description || prev.description,
            }));
            showCustomNotification("success", "Tạo tiêu đề và mô tả thành công với AI!");
        } catch (error) {
            console.error('Error in handleGenerateWithAI:', error);
            showCustomNotification("error", error.message || "Lỗi khi tạo với AI!");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        // Kiểm tra các điều kiện hợp lệ trước khi submit
        if (!validateImages()) {
            showCustomNotification("error", "Vui lòng thay thế các ảnh không phù hợp trước khi tiếp tục.");
            return;
        }
        if (existingImages.length + newFiles.length === 0) {
            showCustomNotification("error", "Vui lòng chọn ít nhất 1 ảnh!");
            return;
        }
        if (!room.title || room.title.length < 3) {
            showCustomNotification("error", "Tiêu đề phải ít nhất 3 ký tự!");
            return;
        }
        if (!room.description || room.description.length < 50) {
            showCustomNotification("error", "Mô tả phải ít nhất 50 ký tự!");
            return;
        }
        if (!room.locationDetail) {
            showCustomNotification("error", "Địa chỉ không được để trống!");
            return;
        }
        if (!room.categoryRoomId || isNaN(room.categoryRoomId)) {
            showCustomNotification("error", "Vui lòng chọn loại phòng hợp lệ!");
            return;
        }
        if (room.categoryPriorityPackageRoomId !== 0 && (!room.startDate || !room.endDate)) {
            showCustomNotification("error", "Vui lòng chọn ngày bắt đầu và kết thúc hợp lệ!");
            return;
        }

        if (!user || !user.userId || !user.token) {
            showCustomNotification('error', 'Bạn cần đăng nhập để thực hiện hành động này!');
            navigate('/Logins');
            return;
        }

        setLoading(true);
        let balanceDeducted = false;
        try {
            // Upload ảnh nếu có
            const uploadedImageUrls = await Promise.all(newFiles.map(uploadFile));
            const finalImageUrls = [...existingImages, ...uploadedImageUrls];

            // Dữ liệu room (không gửi PriorityPackageRooms để tránh lỗi)
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
                userId: user.userId,
                PriorityPackageRooms: [], // Gửi mảng rỗng để vượt qua kiểm tra bắt buộc
            };

            // Kiểm tra và trừ tiền nếu có gói ưu tiên
            if (room.categoryPriorityPackageRoomId !== 0 && room.priorityPrice > 0) {
                const checkBalanceData = { UserId: user.userId, Amount: room.priorityPrice };
                // console.log('Kiểm tra số dư với dữ liệu:', checkBalanceData);
                const balanceResponse = await BookingManagementService.checkBalance(checkBalanceData, user.token);
                // console.log('Phản hồi kiểm tra số dư:', balanceResponse);

                const isBalanceSufficient = typeof balanceResponse === 'string' && balanceResponse === 'Bạn đủ tiền.' || balanceResponse.isSuccess;
                if (!isBalanceSufficient) {
                    showCustomNotification('error', 'Bạn không đủ tiền để thực hiện giao dịch này!');
                    navigate('/Moneys');
                    return;
                }

                const updateBalanceData = { UserId: user.userId, Amount: -room.priorityPrice };
                // console.log('Trừ tiền với dữ liệu:', updateBalanceData);
                await BookingManagementService.updateBalance(updateBalanceData, user.token);
                // console.log('Đã trừ tiền cho gói ưu tiên');
                balanceDeducted = true;
            }

            // Gọi API để tạo room
            // console.log('Đang tạo room với dữ liệu:', roomData);
            const roomResponse = await RoomLandlordService.addRoom(roomData);
            // console.log('Phản hồi từ API tạo room:', roomResponse);

            // Lấy roomId từ phản hồi
            const newRoomId = roomResponse.room?.roomId;
            if (!newRoomId) {
                throw new Error('Không thể lấy roomId sau khi tạo room');
            }

            // Tạo Priority Room nếu chọn gói ưu tiên
            if (room.categoryPriorityPackageRoomId !== 0) {
                const formatDate = (dateString) => {
                    const date = new Date(dateString);
                    return date.toISOString().split('T')[0];
                };

                const priorityRoomData = {
                    roomId: newRoomId,
                    userId: user.userId,
                    categoryPriorityPackageRoomId: room.categoryPriorityPackageRoomId,
                    startDate: formatDate(room.startDate),
                    endDate: formatDate(room.endDate),
                    price: room.priorityPrice,
                    status: 1,
                };

                try {
                    // console.log('Đang tạo Priority Room với dữ liệu:', priorityRoomData);
                    const priorityResponse = await PriorityRoomService.createPriorityRoom(priorityRoomData);
                    // console.log('Phản hồi từ API tạo Priority Room:', priorityResponse);
                } catch (priorityError) {
                    console.error('Lỗi khi tạo Priority Room:', priorityError);
                    if (balanceDeducted) {
                        const refundBalanceData = { UserId: user.userId, Amount: room.priorityPrice };
                        // console.log('Hoàn tiền với dữ liệu:', refundBalanceData);
                        await BookingManagementService.updateBalance(refundBalanceData, user.token);
                        // console.log('Đã hoàn tiền do lỗi tạo Priority Room');
                    }
                    throw new Error('Không thể tạo gói ưu tiên: ' + priorityError.message);
                }
            }

            showCustomNotification("success", "Tạo phòng và gói ưu tiên thành công!");
            navigate('/Room');
        } catch (error) {
            console.error('Submit error:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            if (balanceDeducted && error.message !== 'Bạn không đủ tiền để thực hiện giao dịch này!') {
                try {
                    const refundBalanceData = { UserId: user.userId, Amount: room.priorityPrice };
                    // console.log('Hoàn tiền với dữ liệu:', refundBalanceData);
                    await BookingManagementService.updateBalance(refundBalanceData, user.token);
                    // console.log('Đã hoàn tiền do lỗi tạo phòng');
                } catch (refundError) {
                    console.error('Lỗi khi hoàn tiền:', refundError);
                    showCustomNotification('error', 'Lỗi khi hoàn tiền, vui lòng liên hệ hỗ trợ!');
                }
            }
            showCustomNotification("error", error.message || "Không thể tạo phòng!");
        } finally {
            setLoading(false);
        }
    };

    const validateImages = () => {
        if (invalidImages.some(invalid => invalid)) {
            showCustomNotification("error", "Vui lòng thay thế các ảnh không phù hợp trước khi tiếp tục.");
            return false;
        }
        return true;
    };

    const validateStep = () => {
        if (step === 1) {
            const newErrors = {};
            if (!room.title) newErrors.title = 'Tiêu đề là bắt buộc';
            else if (room.title.length < 3) newErrors.title = 'Tiêu đề phải ít nhất 3 ký tự';
            if (!room.price || isNaN(Number(room.price)) || Number(room.price) <= 0) newErrors.price = 'Giá phải là số dương';
            if (!room.categoryRoomId) newErrors.categoryRoomId = 'Loại phòng là bắt buộc';
            if (!room.locationDetail) newErrors.locationDetail = 'Địa chỉ là bắt buộc';
            if (!room.acreage || isNaN(Number(room.acreage)) || Number(room.acreage) < 0) newErrors.acreage = 'Diện tích phải là số không âm';
            if (room.numberOfBathroom < 0 || isNaN(Number(room.numberOfBathroom))) newErrors.numberOfBathroom = 'Số phòng tắm phải là số không âm';
            if (room.numberOfBedroom < 0 || isNaN(Number(room.numberOfBedroom))) newErrors.numberOfBedroom = 'Số giường ngủ phải là số không âm';
            if (!room.description) newErrors.description = 'Mô tả là bắt buộc';
            else if (room.description.length <= 50) newErrors.description = 'Mô tả phải trên 50 ký tự';
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }
        if (step === 2) {
            if (existingImages.length + newFiles.length === 0) {
                showCustomNotification("error", "Vui lòng chọn ít nhất 1 ảnh!");
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

    const handleIncrement = (field) => {
        setRoom(prev => ({ ...prev, [field]: (prev[field] || 0) + 1 }));
    };

    const handleDecrement = (field) => {
        setRoom(prev => ({ ...prev, [field]: Math.max(0, (prev[field] || 0) - 1) }));
    };

    const toggleDropOpen = () => setIsDropOpen(prev => !prev);

    const combinedPreviews = [
        ...existingImages.map(url => ({ url, isNew: false })),
        ...newPreviews.map((url, idx) => ({ url, isNew: true, index: idx, isInvalid: invalidImages[idx] }))
    ];

    const handleCategorySelect = (categoryId) => {
        setRoom(prev => ({ ...prev, categoryPriorityPackageRoomId: categoryId }));
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

        setRoom(prev => ({
            ...prev,
            endDate: endDate.toISOString().split('T')[0],
            priorityPrice: totalPrice,
            duration: duration,
            categoryPriorityPackageRoomId: category.categoryPriorityPackageRoomId,
        }));
    };

    useEffect(() => {
        if (room.startDate && room.categoryPriorityPackageRoomId) {
            const selectedCategory = categories.find(c => c.categoryPriorityPackageRoomId === room.categoryPriorityPackageRoomId);
            if (selectedCategory && selectedCategory.categoryPriorityPackageRoomId !== 0) {
                updateRoomDetails(selectedCategory);
            } else {
                setRoom(prev => ({
                    ...prev,
                    endDate: '',
                    priorityPrice: 0,
                    duration: 0,
                    categoryPriorityPackageRoomId: 0,
                }));
            }
        }
    }, [room.startDate, room.categoryPriorityPackageRoomId, categories]);

    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-800 dark:text-white">
            {loading && <Loading />}
            <SidebarUser />
            <div className="w-64 bg-white dark:bg-gray-800 px-2 py-8 max-w-6xl mx-auto ml-56 h-full border-r border-gray-200">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Tạo Phòng</h1>
                <ul className="space-y-2">
                    {['Thông tin Phòng', 'Hình ảnh', 'Xác nhận'].map((label, idx) => (
                        <li key={idx} className={`text-lg ${step === idx + 1 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                            Bước {idx + 1}: {label}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 p-8">
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-red-600">Tạo Phòng - Bước 1</h2>
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="space-y-4">
                            <div className="w-full">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 dark:text-white">Thông tin Phòng</h3>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">Tòa Nhà</label>
                                <select
                                    value={room.buildingId || ''}
                                    onChange={(e) => setRoom({ ...room, buildingId: parseInt(e.target.value) || null })}
                                    className="block dark:bg-gray-800 dark:text-white w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
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
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                        Giá (đ/tháng) <span className="text-red-500">*</span>
                                    </label>
                                    <PriceInput
                                        value={room.price || ''}
                                        onChange={(val) => setRoom({ ...room, price: val })}
                                    />
                                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                </div>
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                        Loại Phòng <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={room.categoryRoomId || ''}
                                        onChange={(e) => setRoom({ ...room, categoryRoomId: parseInt(e.target.value) })}
                                        required
                                        className="block w-full p-2 dark:bg-gray-800 dark:text-white border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="" disabled>Chọn loại phòng...</option>
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
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                        Địa chỉ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={room.locationDetail}
                                        onChange={(e) => setRoom({ ...room, locationDetail: e.target.value })}
                                        required
                                        className="block w-full p-2 dark:bg-gray-800 dark:text-white border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                        placeholder="Nhập Địa chỉ"
                                    />
                                    {errors.locationDetail && <p className="text-red-500 text-sm mt-1">{errors.locationDetail}</p>}
                                </div>
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                        Diện Tích (m²) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={room.acreage}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || (Number(value) >= 0)) {
                                                setRoom({ ...room, acreage: value });
                                            }
                                        }}
                                        min="0"
                                        required
                                        className="block w-full p-2 dark:bg-gray-800 dark:text-white border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                        placeholder="0"
                                    />
                                    {errors.acreage && <p className="text-red-500 text-sm mt-1">{errors.acreage}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                        Nội Thất
                                    </label>
                                    <select
                                        value={room.furniture}
                                        onChange={(e) => setRoom({ ...room, furniture: e.target.value })}
                                        className="block w-full p-2 dark:bg-gray-800 dark:text-white border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="">Chọn nội thất...</option>
                                        <option value="Đầy đủ">Đầy đủ</option>
                                        <option value="Cơ bản">Cơ bản</option>
                                        <option value="Không nội thất">Không nội thất</option>
                                    </select>
                                </div>
                                <div className="w-full flex items-center">
                                    <label className="block text-sm font-medium text-gray-700 w-1/3 dark:text-white">
                                        Phòng tắm <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex-1 flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleDecrement('numberOfBathroom')}
                                            className="p-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-800 dark:text-white"
                                        >
                                            <FaMinus />
                                        </button>
                                        <span className="text-lg">{room.numberOfBathroom || 0}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleIncrement('numberOfBathroom')}
                                            className="p-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-800 dark:text-white"
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>
                                    {errors.numberOfBathroom && <p className="text-red-500 text-sm mt-1">{errors.numberOfBathroom}</p>}
                                </div>
                                <div className="w-full flex items-center">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                        Giường ngủ <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex-1 flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleDecrement('numberOfBedroom')}
                                            className="p-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-800 dark:text-white"
                                        >
                                            <FaMinus />
                                        </button>
                                        <span className="text-lg">{room.numberOfBedroom || 0}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleIncrement('numberOfBedroom')}
                                            className="p-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-800 dark:text-white"
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>
                                    {errors.numberOfBedroom && <p className="text-red-500 text-sm mt-1">{errors.numberOfBedroom}</p>}
                                </div>
                            </div>
                            <div className="w-full">
                                <div
                                    className="flex items-center justify-between cursor-pointer select-none"
                                    onClick={toggleDropOpen}
                                >
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2 dark:text-white">Chi phí khác</h3>
                                    {isDropOpen ? (
                                        <FaChevronUp className="text-gray-600 dark:text-white" />
                                    ) : (
                                        <FaChevronDown className="text-gray-600 dark:text-white" />
                                    )}
                                </div>
                                {isDropOpen && (
                                    <div className="grid grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Điện (đ/kWh)</label>
                                            <PriceInput
                                                value={room.dien || 0}
                                                onChange={(val) => setRoom({ ...room, dien: Number(val) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Nước (đ/m³)</label>
                                            <PriceInput
                                                value={room.nuoc || 0}
                                                onChange={(val) => setRoom({ ...room, nuoc: Number(val) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Internet (đ/tháng)</label>
                                            <PriceInput
                                                value={room.internet || 0}
                                                onChange={(val) => setRoom({ ...room, internet: Number(val) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Rác (đ/tháng)</label>
                                            <PriceInput
                                                value={room.rac || 0}
                                                onChange={(val) => setRoom({ ...room, rac: Number(val) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Gửi xe (đ/tháng)</label>
                                            <PriceInput
                                                value={room.guiXe || 0}
                                                onChange={(val) => setRoom({ ...room, guiXe: Number(val) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Quản lý (đ/tháng)</label>
                                            <PriceInput
                                                value={room.quanLy || 0}
                                                onChange={(val) => setRoom({ ...room, quanLy: Number(val) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Chi phí khác (đ/tháng)</label>
                                            <PriceInput
                                                value={room.chiPhiKhac || 0}
                                                onChange={(val) => setRoom({ ...room, chiPhiKhac: Number(val) || 0 })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="w-full rounded-lg bg-white shadow-sm dark:bg-gray-800 dark:text-white">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 dark:text-white">Tiêu đề & Mô tả</h3>
                                <div className="w-full flex justify-between items-center">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2 dark:text-white">Tạo nhanh với AI</h3>
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={handleGenerateWithAI}
                                            className="flex items-center space-x-1 px-3 py-2 dark:text-white border border-gray-400 rounded-full shadow-sm text-gray-800 hover:bg-gray-300 w-full font-medium"
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
                                </div>
                                <div className="flex space-x-4">
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                                Tiêu Đề <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={room.title}
                                                onChange={(e) => setRoom({ ...room, title: e.target.value })}
                                                className="block w-full p-2 dark:bg-gray-800 dark:text-white border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                                placeholder="Mô tả ngắn gọn về loại hình phòng, diện tích, địa chỉ"
                                            />
                                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                                Mô tả <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={room.description}
                                                onChange={(e) => setRoom({ ...room, description: e.target.value })}
                                                className="block w-full p-2 dark:bg-gray-800 dark:text-white border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                                placeholder="Mô tả chi tiết về phòng"
                                                rows="5"
                                            />
                                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-red-600">Tạo Phòng - Bước 2</h2>
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm w-full text-center dark:bg-gray-800 dark:text-white">
                            <div className="flex items-center justify-center">
                                <label className="cursor-pointer bg-gray-200 p-3 rounded-lg flex items-center gap-2 dark:bg-gray-800 dark:text-white">
                                    <FaPlus className="text-blue-600" />
                                    <span className="text-gray-700 font-semibold dark:text-white">Thêm ảnh</span>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        accept=".jpeg, .png, .pdf, .mp4"
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-gray-500 text-sm mb-3 font-medium text-center mt-2 dark:text-gray-200">
                                Định dạng: JPEG, PNG - Tối đa 5MB
                            </p>
                            {combinedPreviews.length > 0 && (
                                <div className="mt-3">
                                    <p className="font-semibold text-gray-700 dark:text-white">Ảnh đã chọn:</p>
                                    <div className="grid grid-cols-3 gap-3 mt-2">
                                        {combinedPreviews.map((item, index) => (
                                            <div key={index} className={`relative border p-2 rounded-lg shadow-sm ${item.isInvalid ? 'border-red-500' : ''}`}>
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
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-red-600">Tạo Phòng - Bước 3</h2>
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="space-y-6">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">Chọn loại tin</p>
                            {categories.length === 0 ? (
                                <p className="text-red-500">Không có gói ưu tiên nào khả dụng. Vui lòng thử lại sau!</p>
                            ) : (
                                <div className="grid grid-cols-4 gap-4">
                                    {categories.map((category) => {
                                        const duration = Number(category.categoryPriorityPackageRoomValue);
                                        const totalPrice = Number(category.price);
                                        const pricePerDay = duration > 0 ? totalPrice / duration : 0;
                                        const isSelected = room.categoryPriorityPackageRoomId === category.categoryPriorityPackageRoomId;

                                        return (
                                            <div
                                                key={category.categoryPriorityPackageRoomId}
                                                className={`border-2 ${getBorderColor(category.categoryPriorityPackageRoomValue)} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-700 cursor-pointer ${isSelected ? 'ring-2 ring-gray-400' : ''}`}
                                                onClick={() => handleCategorySelect(category.categoryPriorityPackageRoomId)}
                                            >
                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                    {getCategoryName(category.categoryPriorityPackageRoomValue)}
                                                </h3>
                                                <p className="text-base text-gray-600 dark:text-gray-300 mt-2">
                                                    {getCategoryDescription(category.categoryPriorityPackageRoomValue)}
                                                </p>
                                                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
                                                    {duration > 0 ? `${duration} ngày ưu tiên` : 'Không ưu tiên'}
                                                </p>
                                                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
                                                    {getBorderDescription(totalPrice, duration)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {room.categoryPriorityPackageRoomId !== 0 && (
                                <div className="flex space-x-8 mt-4">
                                    <div className="flex flex-col">
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ngày bắt đầu</p>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={room.startDate}
                                                onChange={(e) => setRoom({ ...room, startDate: e.target.value })}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="border border-gray-300 w-[220px] rounded-lg p-2 pr-2 text-gray-900 dark:text-white dark:bg-gray-800 focus:ring-red-500 focus:border-red-500 appearance-none"
                                            />
                                            <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ngày kết thúc</p>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={room.endDate || ''}
                                                readOnly
                                                className="border border-gray-300 w-[220px] rounded-lg p-2 pr-2 text-gray-900 dark:text-white dark:bg-gray-800 bg-gray-100 cursor-not-allowed"
                                            />
                                            <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-6">
                                <button onClick={handleBack} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500">
                                    Quay lại
                                </button>
                                <div className="flex items-center space-x-4">
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        Tổng tiền: {room.priorityPrice ? room.priorityPrice.toLocaleString('vi-VN') : '0'} đ
                                    </p>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                    >
                                        Tạo Phòng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex justify-between mt-8">
                    {step > 1 && step < 3 && (
                        <button onClick={handleBack} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500">
                            Quay lại
                        </button>
                    )}
                    {step < 3 && (
                        <button onClick={handleNext} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                            Tiếp tục
                        </button>
                    )}
                </div>
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

export default RoomForm;