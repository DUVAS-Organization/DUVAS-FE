import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoomServices from '../../../Services/Admin/RoomServices';
import CategoryRooms from '../../../Services/Admin/CategoryRooms';
import BuildingServices from '../../../Services/Admin/BuildingServices';
import { showCustomNotification } from '../../../Components/Notification';
import { FaArrowLeft } from 'react-icons/fa';

const RoomDetails = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    // State cho dữ liệu phòng, danh sách category và building
    const [room, setRoom] = useState(null);
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        // Lấy danh sách Category Rooms và Buildings
        CategoryRooms.getCategoryRooms()
            .then((data) => setCategoryRooms(data))
            .catch((error) => console.error('Error fetching categories:', error));

        BuildingServices.getBuildings()
            .then((data) => setBuildings(data))
            .catch((error) => console.error('Error fetching Buildings:', error));

        if (roomId) {
            RoomServices.getRoomById(roomId)
                .then((data) => {
                    setRoom({
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
                        image: data.image || '',
                        note: data.note || ''
                    });
                })
                .catch((error) => {
                    console.error('Error fetching room details:', error);
                    showCustomNotification("error", "Không thể tải thông tin phòng!");
                });
        }
    }, [roomId]);

    // Hàm tra cứu tên Building dựa vào buildingId mà không dùng find()
    const getBuildingName = (buildingId) => {
        for (let i = 0; i < buildings.length; i++) {
            if (buildings[i].buildingId === buildingId) {
                // Giả sử API trả về tên tòa nhà ở thuộc tính buildingName hoặc name
                return buildings[i].buildingName || buildings[i].name;
            }
        }
        return 'N/A';
    };

    // Hàm tra cứu tên Category dựa vào categoryRoomId mà không dùng find()
    const getCategoryName = (categoryRoomId) => {
        for (let i = 0; i < categoryRooms.length; i++) {
            if (categoryRooms[i].categoryRoomId === categoryRoomId) {
                return categoryRooms[i].categoryName;
            }
        }
        return 'N/A';
    };

    const handleEdit = () => {
        navigate(`/Admin/Rooms/Edit/${roomId}`);
    };

    const handleDelete = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa Phòng này?")) {
            try {
                await RoomServices.deleteRoom(roomId);
                showCustomNotification("success", "Xóa Phòng thành công!");
                navigate('/Admin/Rooms');
            } catch (error) {
                console.error('Error deleting room:', error);
                showCustomNotification("error", "Xóa Phòng thất bại, vui lòng thử lại!");
            }
        }
    };

    if (!room) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
            {/* Header với nút quay lại */}
            <div className="max-w-7xl rounded-2xl mb-2">
                <button
                    onClick={() => navigate(-1)}
                    className="mt-2"
                >
                    <FaArrowLeft size={20} />
                </button>
                <h1 className="text-4xl font-bold text-blue-600 mb-6">Chi tiết Phòng</h1>
                <div className="border-t-2 border-black w-full mb-5"></div>
            </div>


            {/* Bố cục 2 cột: hiển thị các trường thông tin */}
            <div className="grid grid-cols bg-white shadow-xl rounded-lg py-5 px-10 ">
                <div className="text-left space-y-4">
                    <div className="grid grid-cols-3 gap-6">
                        <p className="text-lg font-medium">
                            <strong>Tiêu Đề: </strong> {room.title}
                        </p>
                        <p className="text-lg font-medium">
                            <strong>Tòa Nhà:</strong> {getBuildingName(room.buildingId)}
                        </p>
                        <p className="text-lg font-medium">
                            <strong>Giá (đ/h):</strong> {room.price.toLocaleString('vi-VN')} đ
                        </p>

                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <p className="text-lg font-medium">
                            <strong>Địa chỉ:</strong> {room.locationDetail}
                        </p>
                        <p className="text-lg font-medium">
                            <strong>Diện tích:</strong> {room.acreage}
                        </p>

                        <p className="text-lg font-medium">
                            <strong>Loại Phòng:</strong> {getCategoryName(room.categoryRoomId)}
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <p className="text-lg font-medium">
                            <strong>Phòng tắm:</strong> {room.numberOfBathroom}
                        </p>
                        <p className="text-lg font-medium">
                            <strong>Giường ngủ:</strong> {room.numberOfBedroom}
                        </p>
                        <p className="text-lg font-medium">
                            <strong>Gác Xếp:</strong> {room.garret ? 'Có' : 'Không'}
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <p className="text-lg font-medium">
                            <strong>Mô tả:</strong> {room.description}
                        </p>
                        <p className="text-lg font-medium">
                            <strong>Nội thất:</strong> {room.furniture}
                        </p>
                        {/* <p className="text-lg font-medium">
                            <strong>Note:</strong> {room.note}
                        </p> */}
                    </div>
                </div>
            </div>


            {/* Phần hiển thị ảnh (nếu có) - hiển thị 3 ảnh trên 1 hàng */}
            <div className="mt-6 bg-gray-100 shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Ảnh: </h2>
                {room.image && room.image !== '' && (
                    (() => {
                        let images;
                        try {
                            images = JSON.parse(room.image);
                        } catch (error) {
                            images = room.image;
                        }
                        if (Array.isArray(images)) {
                            return (
                                <div className="grid grid-cols-4 gap-4 w-full">
                                    {images.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`Image ${index}`}
                                            className="w-full h-auto object-cover rounded-lg cursor-pointer"
                                            onClick={() => setPreviewImage(img)}
                                        />
                                    ))}
                                </div>
                            );
                        } else {
                            return (
                                <div className="grid grid-cols-4 gap-4 w-full">
                                    <img
                                        src={images}
                                        alt={room.title}
                                        className="w-full h-auto object-cover rounded-lg cursor-pointer"
                                        onClick={() => setPreviewImage(images)}
                                    />
                                </div>
                            );
                        }
                    })()
                )}
            </div>

            {/* Các nút chỉnh sửa và xóa */}
            <div className="mt-6 flex justify-around">
                <button
                    onClick={handleEdit}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400"
                >
                    Chỉnh sửa
                </button>
                <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400"
                >
                    Xóa
                </button>
            </div>

            {/* Modal để phóng to ảnh */}
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
    );
};

export default RoomDetails;
