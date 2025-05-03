import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoomServices from '../../../Services/Admin/RoomServices';
import BuildingServices from '../../../Services/Admin/BuildingServices';
import CategoryRooms from '../../../Services/Admin/CategoryRooms';
import { showCustomNotification } from '../../../Components/Notification';
import { useAuth } from '../../../Context/AuthProvider';
import { FaArrowLeft, FaTimes, FaPlus } from "react-icons/fa";
import Loading from '../../../Components/Loading';
import PriceInput from '../../../Components/Layout/Range/PriceInput';
import OtherService from '../../../Services/User/OtherService';

const RoomForm = () => {
    const [room, setRooms] = useState({});
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [price, setPrice] = useState("");
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
            const data = await OtherService.uploadImage(formData);
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

            if (roomId) {
                await RoomServices.updateRoom(roomId, { ...roomData, roomId: room.roomId });
                showCustomNotification("success", "Chỉnh sửa thành công!");
            } else {
                await RoomServices.addRoom(roomData);
                showCustomNotification("success", "Tạo thành công!");
            }
            navigate('/Admin/Rooms');
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
        <div className="relative">
            {
                loading && (
                    <Loading />
                )
            }
            <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
                <div className='max-w-7xl rounded-2xl mb-2'>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                    >
                        <FaArrowLeft size={20} />
                    </button>
                    <h1 className="text-5xl font-bold mb-6 text-blue-600  text-left">
                        {roomId ? 'Chỉnh Sửa Phòng' : 'Tạo Phòng'}
                    </h1>
                    <div className="border-t-2 border-gray-500 w-full mb-5"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="w-full">
                        <label className="flex text-lg font-bold text-black mb-1">
                            Tòa Nhà: <p className='text-red-500 ml-1'>*</p>
                        </label>
                        <select
                            value={room.buildingId}
                            onChange={(e) => setRooms({ ...room, buildingId: parseInt(e.target.value) })}
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="" disabled>Vui lòng chọn...</option>
                            {buildings.map((building) => (
                                <option key={building.buildingId} value={building.buildingId}>
                                    {building.buildingName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="w-full">
                            <label className="flex text-lg font-bold text-black mb-1">
                                Tiêu Đề: <p className='text-red-500 ml-1'>*</p>
                            </label>
                            <input
                                type="text"
                                value={room.title}
                                onChange={(e) => setRooms({ ...room, title: e.target.value })}
                                required
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập Tiêu đề"
                            />
                        </div>
                        <div className="w-full">
                            <label className="flex text-lg font-bold text-black mb-1">
                                Giá(đ/tháng): <p className='text-red-500 ml-1'>*</p>
                            </label>
                            <PriceInput
                                value={room.price || 0}
                                onChange={(val) => setRooms({ ...room, price: val })} // nếu room là state cho room, hoặc setRoom({...room, price: val})
                            />
                            {/* <input
                                type="text"
                                value={room.price}
                                onChange={(e) => setRooms({ ...room, price: e.target.value })}
                                required
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập Giá"
                            /> */}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="w-full">
                            <label className="flex text-lg font-bold text-black mb-1">
                                Loại Phòng: <p className='text-red-500 ml-1'>*</p>
                            </label>
                            <select
                                value={room.categoryRoomId}
                                onChange={(e) => setRooms({ ...room, categoryRoomId: parseInt(e.target.value) })}
                                required
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="" disabled>Choose One...</option>
                                {categoryRooms.map((categoryRoom) => (
                                    <option key={categoryRoom.categoryRoomId} value={categoryRoom.categoryRoomId}>
                                        {categoryRoom.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full">
                            <label className="flex text-lg font-bold text-black mb-1">
                                Địa chỉ: <p className='text-red-500 ml-1'>*</p>
                            </label>
                            <input
                                type="text"
                                value={room.locationDetail}
                                onChange={(e) => setRooms({ ...room, locationDetail: e.target.value })}
                                required
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập Địa chỉ"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="w-full flex items-center">
                            <label className="text-lg font-bold text-black mr-2 w-1/3">
                                Diện Tích (m²): <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="number"
                                value={room.acreage}
                                onChange={(e) => setRooms({ ...room, acreage: e.target.value })}
                                required
                                className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0"
                            />
                        </div>
                        <div className="w-full flex items-center">
                            <label className="text-lg font-bold text-black mr-2 w-1/3">
                                Nội Thất: <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="text"
                                value={room.furniture}
                                onChange={(e) => setRooms({ ...room, furniture: e.target.value })}
                                required
                                className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            // placeholder=""
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="w-full flex items-center">
                            <label className="text-lg font-bold text-black mr-2 w-1/3">
                                Phòng tắm: <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="number"
                                value={room.numberOfBathroom}
                                onChange={(e) => setRooms({ ...room, numberOfBathroom: e.target.value })}
                                required
                                className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0"
                            />
                        </div>
                        <div className="w-full flex items-center">
                            <label className="text-lg font-bold text-black mr-2 w-1/3">
                                Giường ngủ: <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="number"
                                value={room.numberOfBedroom}
                                onChange={(e) => setRooms({ ...room, numberOfBedroom: e.target.value })}
                                required
                                className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="w-full flex items-center">
                            <label className="text-lg font-bold text-black mr-2 w-1/3">
                                Mô tả:
                            </label>
                            <textarea
                                value={room.description}
                                onChange={(e) => setRooms({ ...room, description: e.target.value })}
                                required
                                className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập Mô tả"
                            />
                        </div>
                        <div className="w-full flex items-center">
                            <label className="text-lg font-bold text-black mr-2 ">
                                Gác Xếp: <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="checkbox"
                                checked={room.garret} // Dùng checked cho checkbox
                                onChange={(e) => setRooms({ ...room, garret: e.target.checked })}
                                className="h-5 w-5"
                            />
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
                                                            // Với ảnh mới, item.index chứa index trong newFiles/newPreviews
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
                            className="bg-blue-500 text-white px-5 py-2 rounded-md shadow-md hover:bg-blue-400 transition duration-200"
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
        </div>

    );
};

export default RoomForm;
