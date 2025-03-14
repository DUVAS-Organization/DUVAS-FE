import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoomServices from '../../../Services/Admin/RoomServices';
import BuildingServices from '../../../Services/Admin/BuildingServices';
import CategoryRooms from '../../../Services/Admin/CategoryRooms';
import { showCustomNotification } from '../../../Components/Notification';
import { useAuth } from '../../../Context/AuthProvider';
import { FaArrowLeft, FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import Loading from '../../../Components/Loading';
import PriceInput from '../../../Components/Layout/Range/PriceInput';

const RoomForm = () => {
    const [room, setRooms] = useState({});
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    // State cho ảnh đã lưu (khi edit)
    const [existingImages, setExistingImages] = useState([]);
    // State cho file mới được chọn
    const [newFiles, setNewFiles] = useState([]);
    // State cho preview URL của file mới
    const [newPreviews, setNewPreviews] = useState([]);
    // State hiển thị preview phóng to
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        // Lấy danh sách Categories
        CategoryRooms.getCategoryRooms()
            .then((data) => setCategoryRooms(data))
            .catch((error) => console.error('Error fetching categories:', error));

        // Lấy danh sách Buildings
        BuildingServices.getBuildings()
            .then((data) => setBuildings(data))
            .catch((error) => console.error('Error fetching Buildings:', error));

        if (roomId) {
            RoomServices.getRoomById(roomId)
                .then(data => {
                    let images = [];
                    try {
                        images = data.image ? JSON.parse(data.image) : [];
                    } catch (error) {
                        images = data.image ? [data.image] : [];
                    }
                    setRooms({
                        roomId: data.roomId,
                        userId: data.userId || user.userId,
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
                    });
                    // Ảnh đã lưu từ DB (Cloudinary URL)
                    setExistingImages(images);
                })
                .catch(error => {
                    console.error('Error fetching Room:', error);
                    showCustomNotification("error", "Không thể lấy thông tin Phòng!");
                });
        } else {
            setRooms({
                userId: user.userId,
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
            });
        }
    }, [roomId, user.userId]);

    useEffect(() => {
        if (!roomId && buildings.length > 0 && room.buildingId === null) {
            setRooms(prev => ({ ...prev, buildingId: buildings[0].buildingId }));
        }
    }, [buildings, roomId, room.buildingId]);

    useEffect(() => {
        if (!roomId && categoryRooms.length > 0 && room.categoryRoomId === null) {
            setRooms(prev => ({ ...prev, categoryRoomId: categoryRooms[0].categoryRoomId }));
        }
    }, [categoryRooms, roomId, room.categoryRoomId]);

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
            const response = await fetch('https://localhost:8000/api/Upload/upload-image', {
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
        // Tổng số ảnh bao gồm cả ảnh đã có và file mới
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

            const roomData = {
                buildingId: room.buildingId,
                title: room.title,
                description: room.description,
                locationDetail: room.locationDetail,
                acreage: Number(room.acreage),
                furniture: room.furniture,
                numberOfBathroom: Number(room.numberOfBathroom),
                numberOfBedroom: Number(room.numberOfBedroom),
                garret: room.garret,
                price: Number(room.price),
                categoryRoomId: Number(room.categoryRoomId),
                note: room.note,
                userId: Number(user.userId),
                image: JSON.stringify(finalImageUrls)
            };
            console.log("Dữ liệu gửi đi:", roomData);

            if (roomId) {
                await RoomServices.updateRoom(roomId, { ...roomData, roomId: room.roomId });
                showCustomNotification("success", "Chỉnh sửa thành công!");
            } else {
                await RoomServices.addRoom(roomData);
                showCustomNotification("success", "Tạo thành công!");
            }
            navigate('/Room');
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

    const [step, setStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([false, false, false]);

    const validateStep1 = () => {
        const newErrors = {};
        if (!room.buildingId) newErrors.buildingId = 'Tòa nhà là bắt buộc';
        if (!room.title) newErrors.title = 'Tiêu đề là bắt buộc';
        if (!room.price || isNaN(Number(room.price)) || Number(room.price) <= 0) newErrors.price = 'Giá phải là số dương';
        if (!room.categoryRoomId) newErrors.categoryRoomId = 'Loại phòng là bắt buộc';
        if (!room.locationDetail) newErrors.locationDetail = 'Địa chỉ là bắt buộc';
        if (!room.acreage || isNaN(Number(room.acreage)) || Number(room.acreage) <= 0) newErrors.acreage = 'Diện tích phải là số dương';
        if (!room.furniture) newErrors.furniture = 'Nội thất là bắt buộc';
        if (!room.numberOfBathroom && room.numberOfBathroom !== 0 || isNaN(Number(room.numberOfBathroom)) || Number(room.numberOfBathroom) < 0) newErrors.numberOfBathroom = 'Số phòng tắm phải là số không âm';
        if (!room.numberOfBedroom && room.numberOfBedroom !== 0 || isNaN(Number(room.numberOfBedroom)) || Number(room.numberOfBedroom) < 0) newErrors.numberOfBedroom = 'Số giường ngủ phải là số không âm';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const totalImagesCount = existingImages.length + newFiles.length;
        if (totalImagesCount === 0) {
            setErrors({ ...errors, images: 'Phải tải lên ít nhất một hình ảnh' });
            return false;
        }
        setErrors({ ...errors, images: '' });
        return true;
    };

    const validateStep3 = () => {
        return true; // Bước xác nhận không cần validation
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setCompletedSteps([true, false, false]);
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setCompletedSteps([true, true, false]);
            setStep(3);
        } else if (step === 3 && validateStep3()) {
            handleSubmit(new Event('submit')); // Gọi handleSubmit với event giả
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    // Hàm tăng/giảm số lượng
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

    return (
        <div className="flex min-h-screen bg-white">
            {loading && <div>Loading...</div>}
            <div className="w-64 bg-white p-4 fixed h-full border-r border-gray-200">
                <h1 className="text-2xl font-bold text-red-600 mb-4">{roomId ? 'Chỉnh Sửa Phòng' : 'Tạo Phòng'}</h1>
                <ul className="space-y-2">
                    <li className={`text-lg ${step === 1 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                        Bước 1: Thông tin Phòng
                    </li>
                    <li className={`text-lg ${step === 2 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                        Bước 2: Hình ảnh
                    </li>
                    <li className={`text-lg ${step === 3 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                        Bước 3: Xác nhận
                    </li>
                </ul>
            </div>
            <div className="flex-1 p-8 ml-64">
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-red-600">{roomId ? 'Chỉnh Sửa Phòng - Bước 1' : 'Tạo Phòng - Bước 1'}</h2>
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="space-y-4">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700">Tòa Nhà</label>
                                <select
                                    value={room.buildingId || ''}
                                    onChange={(e) => setRooms({ ...room, buildingId: parseInt(e.target.value) })}
                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                >
                                    <option value="" disabled>Vui lòng chọn...</option>
                                    {buildings.map((building) => (
                                        <option key={building.buildingId} value={building.buildingId}>
                                            {building.buildingName}
                                        </option>
                                    ))}
                                </select>
                                {errors.buildingId && <p className="text-red-500 text-sm">{errors.buildingId}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700">Tiêu Đề</label>
                                    <input
                                        type="text"
                                        value={room.title}
                                        onChange={(e) => setRooms({ ...room, title: e.target.value })}
                                        required
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                        placeholder="Nhập Tiêu đề"
                                    />
                                    {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                                </div>
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700">Giá (đ/tháng)</label>
                                    <PriceInput
                                        value={room.price || 0}
                                        onChange={(val) => setRooms({ ...room, price: val })}
                                    />
                                    {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700">Loại Phòng</label>
                                    <select
                                        value={room.categoryRoomId || ''}
                                        onChange={(e) => setRooms({ ...room, categoryRoomId: parseInt(e.target.value) })}
                                        required
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="" disabled>Chọn loại phòng...</option>
                                        {categoryRooms.map((categoryRoom) => (
                                            <option key={categoryRoom.categoryRoomId} value={categoryRoom.categoryRoomId}>
                                                {categoryRoom.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.categoryRoomId && <p className="text-red-500 text-sm">{errors.categoryRoomId}</p>}
                                </div>
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                                    <input
                                        type="text"
                                        value={room.locationDetail}
                                        onChange={(e) => setRooms({ ...room, locationDetail: e.target.value })}
                                        required
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                        placeholder="Nhập Địa chỉ"
                                    />
                                    {errors.locationDetail && <p className="text-red-500 text-sm">{errors.locationDetail}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="w-full flex items-center">
                                    <label className="block text-sm font-medium text-gray-700 w-1/3">Diện Tích (m²)</label>
                                    <input
                                        type="number"
                                        value={room.acreage}
                                        onChange={(e) => setRooms({ ...room, acreage: e.target.value })}
                                        required
                                        className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                        placeholder="0"
                                    />
                                    {errors.acreage && <p className="text-red-500 text-sm">{errors.acreage}</p>}
                                </div>

                                <div className="w-full flex items-center">
                                    <label className="block text-sm font-medium text-gray-700 w-1/3">Nội Thất</label>
                                    <input
                                        type="text"
                                        value={room.furniture}
                                        onChange={(e) => setRooms({ ...room, furniture: e.target.value })}
                                        required
                                        className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                    />
                                    {errors.furniture && <p className="text-red-500 text-sm">{errors.furniture}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="w-full flex items-center">
                                    <label className="block text-sm font-medium text-gray-700 w-1/3">Phòng tắm</label>
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
                                    {errors.numberOfBathroom && <p className="text-red-500 text-sm">{errors.numberOfBathroom}</p>}
                                </div>
                                <div className="w-full flex items-center">
                                    <label className="block text-sm font-medium text-gray-700 w-1/3">Giường ngủ</label>
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
                                    {errors.numberOfBedroom && <p className="text-red-500 text-sm">{errors.numberOfBedroom}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="w-full flex items-center">
                                    <label className="block text-sm font-medium text-gray-700 w-1/3">Mô tả</label>
                                    <textarea
                                        value={room.description}
                                        onChange={(e) => setRooms({ ...room, description: e.target.value })}
                                        required
                                        className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                        placeholder="Nhập Mô tả"
                                    />
                                </div>
                                {/* <div className="w-full flex items-center">
                                    <label className="block text-sm font-medium text-gray-700 mr-2">Gác Xếp</label>
                                    <input
                                        type="checkbox"
                                        checked={room.garret}
                                        onChange={(e) => setRooms({ ...room, garret: e.target.checked })}
                                        className="h-5 w-5"
                                    />
                                </div> */}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-2 text-red-600">{roomId ? 'Chỉnh Sửa Phòng - Bước 2' : 'Tạo Phòng - Bước 2'}</h2>
                        <div className="border-b-2 border-red-500 w-32 mb-4"></div>
                        <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm w-full text-center">
                            <div className="flex items-center justify-center">
                                <label className="cursor-pointer bg-gray-200 p-3 rounded-lg flex items-center gap-2">
                                    <FaPlus className="text-blue-600" />
                                    <span className="text-gray-700 font-semibold">Thêm ảnh</span>
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
                            {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
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
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
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

export default RoomForm;