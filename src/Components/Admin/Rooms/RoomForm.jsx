import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoomServices from '../../../Services/Admin/RoomServices';
import { showCustomNotification } from '../../Notification';
import { useAuth } from '../../../Context/AuthProvider';
import { FaArrowLeft, FaTimes, FaPlus } from "react-icons/fa";

const RoomForm = () => {
    const [room, setRooms] = useState({});
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    useEffect(() => {
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
                        image: images,
                        note: data.note || '',
                    });
                })
                .catch(error => console.error('Error fetching Building:', error));
        } else {
            setRooms({
                userId: user.userId,
                buildingId: 1,
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
                image: [],
                note: '',
            });
        }
    }, [roomId, user.userId]);

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("File conversion error"));
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            // Cập nhật state files để hiển thị preview
            setFiles(prev => [...prev, ...selectedFiles]);

            // Chuyển đổi tất cả các file được chọn sang Base64
            Promise.all(selectedFiles.map(file => convertFileToBase64(file)))
                .then(base64Array => {
                    setRooms(prev => ({ ...prev, image: [...prev.image, ...base64Array] }));
                })
                .catch(error => console.error("Error converting files:", error));
        }
    };


    // Hàm xóa file đã chọn
    const handleRemoveFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setRooms(prev => ({ ...prev, image: prev.image.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!room.image || room.image.length === 0) {
            showCustomNotification("error", "Vui lòng chọn ít nhất 1 ảnh!");
            return;
        }
        try {
            let roomData = {
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
                image: JSON.stringify(room.image)
            };
            console.log("Dữ liệu gửi đi:", roomData);

            if (roomId) {
                roomData = {
                    ...roomData, roomId: room.roomId,
                };
                await RoomServices.updateRoom(roomId, roomData);
                showCustomNotification("success", "Chỉnh sửa thành công!");
            } else {
                await RoomServices.addRoom(roomData);
                showCustomNotification("success", "Tạo thành công!");
            }
            navigate('/Admin/Rooms');
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            showCustomNotification("error", "Vui lòng thử lại!");
        }
    };


    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <div className='max-w-7xl rounded-2xl mb-2'>
                <button
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
                    <input
                        type="text"
                        value={room.buildingId}
                        onChange={(e) => setRooms({ ...room, buildingId: e.target.value })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập Tòa Nhà"
                    />
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
                            Giá(đ/h): <p className='text-red-500 ml-1'>*</p>
                        </label>
                        <input
                            type="text"
                            value={room.price}
                            onChange={(e) => setRooms({ ...room, price: e.target.value })}
                            required
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập Giá"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="w-full">
                        <label className="flex text-lg font-bold text-black mb-1">
                            Loại Phòng: <p className='text-red-500 ml-1'>*</p>
                        </label>
                        <input
                            type="text"
                            value={room.categoryRoomId}
                            onChange={(e) => setRooms({ ...room, categoryRoomId: e.target.value })}
                            required
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"

                        />
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
                            Diện Tích: <span className="text-red-500 ml-1">*</span>
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
                                <span className="text-gray-700 font-semibold">Thêm file</span>
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
                            Định dạng: JPEG, PNG, PDF, MP4 - Tối đa 20MB
                        </p>
                        {room.image && room.image.length > 0 && (
                            <div className="mt-3">
                                <p className="font-semibold text-gray-700">File đã chọn:</p>
                                <div className="grid grid-cols-3 gap-3 mt-2">
                                    {room.image.map((img, index) => (
                                        <div key={index} className="relative border p-2 rounded-lg shadow-sm">
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                            <img
                                                src={img}
                                                alt={`File ${index}`}
                                                className="w-full h-20 object-cover rounded-md"
                                                onClick={() => setPreviewImage(img)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* {files.length > 0 && (
                            <div className="mt-3">
                                <p className="font-semibold text-gray-700">File đã chọn:</p>
                                <div className="grid grid-cols-3 gap-3 mt-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="relative border p-2 rounded-lg shadow-sm">
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                            {file.type.startsWith("image/") ? (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    className="w-full h-20 object-cover rounded-md"
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-600 truncate">{file.name}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}
                    </div>
                </div>


                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verify</label>
                    <div className="flex items-center">
                        <label className="mr-4">
                            <input
                                type="radio"
                                name="garret"
                                value="True"
                                checked={building.verify === true}
                                onChange={() => setRooms({ ...building, verify: true })}
                            />
                            Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="garret"
                                value="False"
                                checked={building.verify === false}
                                onChange={() => setRooms({ ...building, verify: false })}
                            />
                            No
                        </label>
                    </div>
                </div> */}

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
    );
};

export default RoomForm;
