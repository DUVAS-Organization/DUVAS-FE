import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoomLandlordService from '../../../Services/Landlord/RoomLandlordService';
import BuildingServices from '../../../Services/Admin/BuildingServices';
import CategoryRooms from '../../../Services/Admin/CategoryRooms';
import { showCustomNotification } from '../../../Components/Notification';
import { useAuth } from '../../../Context/AuthProvider';
import { FaArrowLeft, FaTimes, FaPlus, FaMinus, FaChevronUp, FaChevronDown } from "react-icons/fa";
import Loading from '../../../Components/Loading';
import PriceInput from '../../../Components/Layout/Range/PriceInput';
import SidebarUser from '../../../Components/Layout/SidebarUser';
import OtherService from '../../../Services/User/OtherService';

const RoomForm = () => {
    const [room, setRooms] = useState({});
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [existingImages, setExistingImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [isDropOpen, setIsDropOpen] = useState(false);
    const [invalidImages, setInvalidImages] = useState([]);

    useEffect(() => {
        CategoryRooms.getCategoryRooms()
            .then((data) => setCategoryRooms(data))
            .catch((error) => console.error('Error fetching categories:', error));

        BuildingServices.getBuildings()
            .then((data) => setBuildings(data))
            .catch((error) => console.error('Error fetching Buildings:', error));

        if (roomId) {
            RoomLandlordService.getRoom(roomId)
                .then(data => {
                    let images = [];
                    try {
                        images = data.image ? JSON.parse(data.image) : [];
                    } catch (error) {
                        images = data.image ? [data.image] : [];
                    }
                    setRooms({
                        roomId: data.roomId,
                        buildingId: data.buildingId,
                        title: data.title || '',
                        description: data.description || '',
                        locationDetail: data.locationDetail || '',
                        acreage: data.acreage || 0,
                        furniture: data.furniture || '',
                        numberOfBathroom: data.numberOfBathroom || 0,
                        numberOfBedroom: data.numberOfBedroom || 0,
                        garret: data.garret || false,
                        price: data.price || 0,
                        categoryRoomId: data.categoryRoomId || 1,
                        note: data.note || '',
                        status: data.status || 1,
                        deposit: data.deposit || 0,
                        isPermission: data.isPermission || 1,
                        reputation: data.reputation || 0,
                        dien: data.dien || 0,
                        nuoc: data.nuoc || 0,
                        internet: data.internet || 0,
                        rac: data.rac || 0,
                        guiXe: data.guiXe || 0,
                        quanLy: data.quanLy || 0,
                        chiPhiKhac: data.chiPhiKhac || 0,
                        authorization: data.authorization || 0,
                    });
                    setExistingImages(images);
                })
                .catch(error => {
                    console.error('Error fetching Room:', error);
                    showCustomNotification("error", error.message || "Không thể lấy thông tin Phòng!");
                    if (error.message.includes("Unauthorized")) navigate('/login');
                });
        } else {
            setRooms({
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
            });
        }
    }, [roomId, navigate]);

    useEffect(() => {
        if (!roomId && buildings.length > 0 && room.buildingId === null) {
            setRooms(prev => ({ ...prev, buildingId: null }));
        }
    }, [buildings, roomId, room.buildingId]);

    useEffect(() => {
        if (!roomId && categoryRooms.length > 0 && room.categoryRoomId === null) {
            setRooms(prev => ({ ...prev, categoryRoomId: categoryRooms[0].categoryRoomId }));
        }
    }, [categoryRooms, roomId, room.categoryRoomId]);

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setLoading(true);
            try {
                // Generate previews
                const previews = selectedFiles.map(file => URL.createObjectURL(file));

                // Check images immediately
                const checks = await Promise.all(selectedFiles.map(file => RoomLandlordService.checkImageAzure(file)));
                const newInvalidImages = checks.map(result => !result.isSafe);

                // Update state only if all images are valid or to show invalid ones
                setNewFiles(prev => [...prev, ...selectedFiles]);
                setNewPreviews(prev => [...prev, ...previews]);
                setInvalidImages(prev => [...prev, ...newInvalidImages]);

                if (newInvalidImages.some(invalid => invalid)) {
                    showCustomNotification("error", "Ảnh không phù hợp. Vui lòng kiểm tra và thay thế.");
                }
            } catch (error) {
                showCustomNotification("error", error.message || "Lỗi khi kiểm tra ảnh.");
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
        try {
            const data = await OtherService.uploadImage(formData);
            return data.imageUrl;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    };

    const validateImages = () => {
        // Since images are validated on upload, check if there are any invalid images
        if (invalidImages.some(invalid => invalid)) {
            showCustomNotification("error", "Vui lòng thay thế các ảnh không phù hợp trước khi tiếp tục.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalImagesCount = existingImages.length + newFiles.length;
        if (totalImagesCount === 0) {
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
        if (!room.categoryRoomId || isNaN(room.categoryRoomId)) {
            showCustomNotification("error", "Vui lòng chọn loại phòng hợp lệ!");
            return;
        }

        setLoading(true);
        try {
            const uploadedImageUrls = await Promise.all(newFiles.map(file => uploadFile(file)));
            const finalImageUrls = [...existingImages, ...uploadedImageUrls];

            const roomData = {
                title: room.title,
                description: room.description,
                locationDetail: room.locationDetail || '',
                acreage: Number(room.acreage),
                furniture: room.furniture || 'Không nội thất',
                numberOfBathroom: Number(room.numberOfBathroom),
                numberOfBedroom: Number(room.numberOfBedroom),
                garret: room.garret || false,
                price: Number(room.price),
                categoryRoomId: Number(room.categoryRoomId),
                note: room.note || '',
                buildingId: room.buildingId || null,
                image: JSON.stringify(finalImageUrls),
                status: room.status || 1,
                deposit: Number(room.deposit || 0),
                isPermission: room.isPermission || 1,
                reputation: room.reputation || 0,
                dien: Number(room.dien || 0),
                nuoc: Number(room.nuoc || 0),
                internet: Number(room.internet || 0),
                rac: Number(room.rac || 0),
                guiXe: Number(room.guiXe || 0),
                quanLy: Number(room.quanLy || 0),
                chiPhiKhac: Number(room.chiPhiKhac || 0),
                authorization: Number(room.authorization || 0),
                userId: user.userId,
                PriorityPackageRooms: []
            };

            // if (roomId) {
            //     await RoomLandlordService.updateRoom(roomId, roomData);
            //     showCustomNotification("success", "Chỉnh sửa thành công!");
            // }

            const response = await RoomLandlordService.addRoom(roomData);
            showCustomNotification("success", response.message || "Tạo thành công!");

            navigate('/Room');
        } catch (error) {
            console.error('Error in handleSubmit:', error);

            const apiMessage = error?.response?.data?.message || error.message;

            if (error?.response?.status === 409 && apiMessage.includes("Mô tả phòng đã từng được sử dụng")) {
                showCustomNotification("error", "Mô tả này đã bị trùng với phòng khác trong hệ thống. Vui lòng chỉnh sửa.");
                return;
            }

            if (error?.response?.status === 409 && apiMessage.includes("tiêu đề")) {
                showCustomNotification("error", "Phòng với tiêu đề này đã được đăng. Hãy kiểm tra lại.");
                return;
            }

            // if (error?.response?.status === 409 && apiMessage.includes("Địa chỉ phòng đã được sử dụng")) {
            //     showCustomNotification("error", "Địa chỉ phòng đã được dùng trong hệ thống. Vui lòng nhập địa chỉ khác.");
            //     return;   
            // }

            if (error?.response?.status === 400 && apiMessage.includes("spam")) {
                showCustomNotification("error", "Mô tả có thể bị spam hoặc trùng với AI. Hãy chỉnh sửa để khác biệt hơn.");
                return;
            }

            showCustomNotification("error", apiMessage || "Đã xảy ra lỗi, vui lòng thử lại!");

            if (apiMessage.includes("Unauthorized")) {
                localStorage.removeItem('authToken');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const combinedPreviews = [
        ...existingImages.map(url => ({ url, isNew: false })),
        ...newPreviews.map((url, idx) => ({ url, isNew: true, index: idx, isInvalid: invalidImages[idx] }))
    ];

    const [step, setStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([false, false, false]);

    const validateStep1 = () => {
        const newErrors = {};
        if (!room.title) newErrors.title = 'Tiêu đề là bắt buộc';
        else if (room.title.length < 3) newErrors.title = 'Tiêu đề phải ít nhất 3 ký tự';
        if (!room.price || isNaN(Number(room.price)) || Number(room.price) <= 0) newErrors.price = 'Giá phải là số dương';
        if (!room.categoryRoomId) newErrors.categoryRoomId = 'Loại phòng là bắt buộc';
        if (!room.locationDetail) newErrors.locationDetail = 'Địa chỉ là bắt buộc';
        if (!room.acreage || isNaN(Number(room.acreage)) || Number(room.acreage) < 0) newErrors.acreage = 'Diện tích phải là số không âm';
        if (!room.numberOfBathroom && room.numberOfBathroom !== 0 || isNaN(Number(room.numberOfBathroom)) || Number(room.numberOfBathroom) < 0) newErrors.numberOfBathroom = 'Số phòng tắm phải là số không âm';
        if (!room.numberOfBedroom && room.numberOfBedroom !== 0 || isNaN(Number(room.numberOfBedroom)) || Number(room.numberOfBedroom) < 0) newErrors.numberOfBedroom = 'Số giường ngủ phải là số không âm';
        if (!room.description) newErrors.description = 'Mô tả là bắt buộc';
        else if (room.description.length <= 50) newErrors.description = 'Mô tả phải trên 50 ký tự';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const totalImagesCount = existingImages.length + newFiles.length;
        if (totalImagesCount === 0) {
            showCustomNotification("error", "Vui lòng chọn ít nhất 1 ảnh!");
            return false;
        }
        return validateImages();
    };

    const validateStep3 = () => {
        return true;
    };

    const handleNext = async () => {
        if (step === 1 && validateStep1()) {
            setCompletedSteps([true, false, false]);
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setCompletedSteps([true, true, false]);
            setStep(3);
        } else if (step === 3 && validateStep3()) {
            handleSubmit(new Event('submit'));
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleIncrement = (field) => {
        setRooms(prev => ({
            ...prev,
            [field]: (prev[field] || 0) + 1
        }));
    };

    const handleDecrement = (field) => {
        setRooms(prev => ({
            ...prev,
            [field]: Math.max(0, (prev[field] || 0) - 1)
        }));
    };

    const handleGenerateWithAI = async () => {
        setLoading(true);
        try {
            if (!user || !user.userId || !user.token) {
                showCustomNotification("error", "Bạn cần đăng nhập để thực hiện hành động này!");
                navigate('/login');
                return;
            }

            const roomData = {
                Title: room.title || '',
                Description: room.description || '',
                LocationDetail: room.locationDetail || '',
                Image: room.image || JSON.stringify(existingImages) || '',
                Acreage: Number(room.acreage) || 0,
                Furniture: room.furniture || 'Không nội thất',
                NumberOfBedroom: Number(room.numberOfBedroom) || 0,
                NumberOfBathroom: Number(room.numberOfBathroom) || 0,
                Price: Number(room.price) || 0,
                Note: room.note || '',
                UserId: user.userId,
                BuildingId: room.buildingId || null,
                CategoryRoomId: room.categoryRoomId || 1,
                Garret: room.garret || false,
                IsPermission: room.isPermission || 1,
                Deposit: Number(room.deposit) || 0,
                status: room.status || 1,
                reputation: room.reputation || 0,
                Dien: Number(room.dien || 0),
                Nuoc: Number(room.nuoc || 0),
                Internet: Number(room.internet || 0),
                Rac: Number(room.rac || 0),
                GuiXe: Number(room.guiXe || 0),
                QuanLy: Number(room.quanLy || 0),
                ChiPhiKhac: Number(room.chiPhiKhac || 0),
                Authorization: Number(room.authorization || 0),
                PriorityPackageRooms: [],
                RentalLists: []
            };

            if (roomData.Acreage <= 0) {
                throw new Error('Diện tích phải lớn hơn 0.');
            }
            if (roomData.Price <= 0) {
                throw new Error('Giá phải lớn hơn 0.');
            }
            const validFurnitureValues = ['Đầy đủ', 'Cơ bản', 'Không nội thất'];
            if (!validFurnitureValues.includes(roomData.Furniture)) {
                throw new Error('Vui lòng chọn nội thất hợp lệ (Đầy đủ, Cơ bản, hoặc Không nội thất).');
            }
            if (!roomData.LocationDetail) {
                throw new Error('Địa chỉ không được để trống.');
            }
            if (!roomData.UserId) {
                throw new Error('UserId không được để trống.');
            }

            const result = await RoomLandlordService.generateRoomDescription(roomData, user.token);
            setRooms(prev => ({
                ...prev,
                title: result.title || prev.title,
                description: result.description || prev.description,
            }));

            showCustomNotification("success", "Tạo tiêu đề và mô tả thành công với AI!");
        } catch (error) {
            console.error('Error in handleGenerateWithAI:', error);

            const apiMessage = error?.response?.data?.message || error.message;

            if (error?.response?.status === 409 && apiMessage.includes("Mô tả phòng đã từng được sử dụng")) {
                showCustomNotification("error", "Mô tả này đã bị trùng với phòng khác trong hệ thống. Vui lòng chỉnh sửa.");
                return;
            }

            if (error?.response?.status === 409 && apiMessage.includes("tiêu đề")) {
                showCustomNotification("error", "Phòng với tiêu đề này đã được đăng. Hãy kiểm tra lại.");
                return;
            }

            if (error?.response?.status === 400 && apiMessage.includes("spam")) {
                showCustomNotification("error", "Mô tả có thể bị spam hoặc trùng với AI. Hãy chỉnh sửa để khác biệt hơn.");
                return;
            }

            showCustomNotification("error", apiMessage || "Đã xảy ra lỗi, vui lòng thử lại!");

            if (apiMessage.includes("Unauthorized")) {
                localStorage.removeItem('authToken');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleDropOpen = () => {
        setIsDropOpen(prev => !prev);
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-800 dark:text-white">
            {loading && <Loading />}
            <SidebarUser />
            <div className="w-64 bg-white dark:bg-gray-800  px-2 py-8 max-w-6xl mx-auto ml-56 h-full border-r border-gray-200">
                <h1 className="text-2xl font-bold text-red-600 mb-4">{roomId ? 'Chỉnh Sửa Phòng' : 'Tạo Phòng'}</h1>
                <ul className="space-y-2">
                    <li className={`text-lg ${step === 1 ? 'text-red-600 font-bold ' : 'text-gray-600 dark:text-white'}`}>
                        Bước 1: Thông tin Phòng
                    </li>
                    <li className={`text-lg ${step === 2 ? 'text-red-600 font-bold' : 'text-gray-600 dark:text-white'}`}>
                        Bước 2: Hình ảnh
                    </li>
                    <li className={`text-lg ${step === 3 ? 'text-red-600 font-bold' : 'text-gray-600 dark:text-white'}`}>
                        Bước 3: Xác nhận
                    </li>
                </ul>
            </div>
            <div className="flex-1 p-8">
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-red-600">{roomId ? 'Chỉnh Sửa Phòng - Bước 1' : 'Tạo Phòng - Bước 1'}</h2>
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="space-y-4">
                            <div className="w-full">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 dark:text-white">Thông tin Phòng</h3>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">Tòa Nhà</label>
                                <select
                                    value={room.buildingId || ''}
                                    onChange={(e) => setRooms({ ...room, buildingId: parseInt(e.target.value) || null })}
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
                                        value={room.price || 0}
                                        onChange={(val) => setRooms({ ...room, price: val })}
                                    />
                                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                </div>
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                        Loại Phòng <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={room.categoryRoomId || ''}
                                        onChange={(e) => setRooms({ ...room, categoryRoomId: parseInt(e.target.value) })}
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
                                        onChange={(e) => setRooms({ ...room, locationDetail: e.target.value })}
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
                                                setRooms({ ...room, acreage: value });
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
                                        onChange={(e) => setRooms({ ...room, furniture: e.target.value })}
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
                                                onChange={(val) => setRooms({ ...room, dien: Number(val) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Nước (đ/m³)</label>
                                            <PriceInput
                                                value={room.nuoc || 0}
                                                onChange={(val) => setRooms({ ...room, nuoc: Number(val) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Internet (đ/tháng)</label>
                                            <PriceInput
                                                value={room.internet || 0}
                                                onChange={(val) => setRooms({ ...room, internet: Number(val) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Rác (đ/tháng)</label>
                                            <PriceInput
                                                value={room.rac || 0}
                                                onChange={(val) => setRooms({ ...room, rac: Number(val) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Gửi xe (đ/tháng)</label>
                                            <PriceInput
                                                value={room.guiXe || 0}
                                                onChange={(val) => setRooms({ ...room, guiXe: Number(val) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Quản lý (đ/tháng)</label>
                                            <PriceInput
                                                value={room.quanLy || 0}
                                                onChange={(val) => setRooms({ ...room, quanLy: Number(val) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Chi phí khác (đ/tháng)</label>
                                            <PriceInput
                                                value={room.chiPhiKhac || 0}
                                                onChange={(val) => setRooms({ ...room, chiPhiKhac: Number(val) || 0 })}
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
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white" >
                                                Tiêu Đề <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={room.title}
                                                onChange={(e) => setRooms({ ...room, title: e.target.value })}
                                                className="block w-full p-2 dark:bg-gray-800 dark:text-white border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                                placeholder="Mô tả ngắn gọn về loại hình phòng, diện tích, địa chỉ (VD: cho thuê phòng trọ 20m2 tại Hải Châu, Đà Nẵng)"
                                            />
                                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                                Mô tả <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={room.description}
                                                onChange={(e) => setRooms({ ...room, description: e.target.value })}
                                                className="block w-full p-2 dark:bg-gray-800 dark:text-white border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                                placeholder="Mô tả chi tiết về:
                                                            • Loại hình cho thuê
                                                            • Vị trí
                                                            • Diện tích
                                                            • Tình trạng nội thất
                                                            ...
                                                            (VD: Phòng trọ có vị trí thuận lợi, gần công viên, trường học...)"
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
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-2 text-red-600">{roomId ? 'Chỉnh Sửa Phòng - Bước 2' : 'Tạo Phòng - Bước 2'}</h2>
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm w-full text-center dark:bg-gray-800 dark:text-white">
                            <div className="flex items-center justify-center">
                                <label className="cursor-pointer bg-gray-200 p-3 rounded-lg flex items-center gap-2 dark:bg-gray-800 dark:text-white">
                                    <FaPlus className="text-blue-600" />
                                    <span className="text-gray-700 font-semibold bỏ dark:text-white ">Thêm ảnh</span>
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
                        <h2 className="text-xl font-bold mb-2 text-red-600">{roomId ? 'Chỉnh Sửa Phòng - Bước 3' : 'Tạo Phòng - Bước 3'}</h2>
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="space-y-6">
                            <p className="text-lg">Vui lòng kiểm tra lại thông tin trước khi tạo phòng.</p>
                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-800 dark:text-white border dark:border-white"
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    {roomId ? 'Cập Nhật Phòng' : 'Tạo Phòng'}
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
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-800 border dark:border-white"
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

export default RoomForm;