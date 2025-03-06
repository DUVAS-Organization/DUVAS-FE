import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoomServices from '../../Services/User/RoomService';
import CategoryRooms from '../../Services/User/CategoryRoomService';
import BuildingServices from '../../Services/User/BuildingService';
import { showCustomNotification } from '../../Components/Notification';
import { FaBath, FaBed, FaBuilding, FaCouch, FaMoneyBillWave, FaRegHeart, FaRegListAlt, FaRulerCombined } from 'react-icons/fa';
import { FaPhoneVolume } from 'react-icons/fa6';
import { BsExclamationTriangle } from "react-icons/bs";
import Footer from '../../Components/Layout/Footer';
import { FaMapMarkerAlt } from 'react-icons/fa';

const RoomDetailsUser = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    // State cho dữ liệu phòng, danh sách category và building
    const [room, setRoom] = useState(null);
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);

    const [showFullPhone, setShowFullPhone] = useState(false);

    const phoneNumber = "0961213137";
    const maskedPhone = phoneNumber.slice(0, phoneNumber.length - 3) + "***";

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

    // Hàm tra cứu tên Building dựa vào buildingId
    const getBuildingName = (buildingId) => {
        for (let i = 0; i < buildings.length; i++) {
            if (buildings[i].buildingId === buildingId) {
                return buildings[i].buildingName || buildings[i].name;
            }
        }
        return 'N/A';
    };

    // Hàm tra cứu tên Category dựa vào categoryRoomId
    const getCategoryName = (categoryRoomId) => {
        for (let i = 0; i < categoryRooms.length; i++) {
            if (categoryRooms[i].categoryRoomId === categoryRoomId) {
                return categoryRooms[i].categoryName;
            }
        }
        return 'N/A';
    };

    const handleEdit = () => {
        navigate(`/Rooms/${roomId}`);
    };

    const handleDelete = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa Phòng này?")) {
            try {
                await RoomServices.deleteRoom(roomId);
                showCustomNotification("success", "Xóa Phòng thành công!");
                navigate('/Rooms');
            } catch (error) {
                console.error('Error deleting room:', error);
                showCustomNotification("error", "Xóa Phòng thất bại, vui lòng thử lại!");
            }
        }
    };

    if (!room) {
        return <div>Loading...</div>;
    }

    // Tách ảnh ra mảng
    let imagesArray = [];
    try {
        imagesArray = JSON.parse(room.image);
    } catch (error) {
        imagesArray = room.image;
    }
    if (!Array.isArray(imagesArray)) {
        imagesArray = [imagesArray];
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            {/* Nút quay lại */}
            {/* <div className="mb-2 flex items-center gap-2">
                <button onClick={() => navigate(-1)}>
                    <FaArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-blue-600">Chi tiết Phòng</h1>
            </div>
            <div className="border-t-2 border-gray-300 w-full mb-4"></div> */}

            {/* Bố cục 2 cột: Cột trái (ảnh + thông tin mô tả), Cột phải (sidebar liên hệ) */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Cột trái */}
                <div className="w-full md:w-4/5 bg-white p-4 rounded-lg shadow space-y-4">
                    {/* Hiển thị ảnh (carousel hoặc grid) */}
                    {imagesArray && imagesArray.length > 0 && (
                        <div className="w-full">
                            {/* Ảnh đầu to, phía dưới là các ảnh nhỏ (nếu muốn) */}
                            <div className="mb-2 w-full h-60 overflow-hidden rounded-lg">
                                <img
                                    src={previewImage || imagesArray[0]}
                                    alt="Preview"
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() =>
                                        setPreviewImage(previewImage ? null : imagesArray[0])
                                    }
                                />
                            </div>
                            {/* Danh sách ảnh nhỏ (nếu có) */}
                            {imagesArray.length > 1 && (
                                <div className="flex gap-2">
                                    {imagesArray.slice(0, 4).map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`Thumbnail ${idx}`}
                                            className="w-20 h-16 object-cover rounded-md cursor-pointer"
                                            onClick={() => setPreviewImage(img)}
                                        />
                                    ))}
                                    {imagesArray.length > 4 && (
                                        <div className="flex items-center justify-center w-20 h-16 bg-black bg-opacity-50 text-white rounded-md">
                                            +{imagesArray.length - 4}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tiêu đề + địa chỉ */}
                    <h2 className="text-2xl font-bold text-gray-800">
                        {room.title || 'Tiêu đề phòng'}
                    </h2>
                    <div className="text-gray-600 flex items-center mb-2">
                        <FaMapMarkerAlt className="mr-1" />
                        {room.locationDetail}
                    </div>

                    {/* Giá + diện tích */}
                    <div className="mb-4">
                        {/* Dòng đầu: Mức giá - Diện tích (xám) + icon bên phải */}
                        <div className="flex items-center justify-between">
                            {/* Nhãn Mức giá, Diện tích */}
                            <div className="flex space-x-5">
                                <div className="flex flex-col text-black text-lg">
                                    <span className='font-semibold'>Mức giá</span>
                                    <span className="text-red-500 font-medium">
                                        {room.price.toLocaleString('vi-VN')} đ/tháng
                                    </span>
                                </div>
                                <div className="flex flex-col text-black text-lg">
                                    <span className='font-semibold'>Diện tích</span>
                                    <span className="text-red-500 font-medium">
                                        {room.acreage} m²
                                    </span>
                                </div>
                            </div>
                            {/* Icon bên phải */}
                            <div className="flex gap-4 text-2xl text-gray-600">
                                <button>
                                    <BsExclamationTriangle />
                                </button>
                                <button>
                                    <FaRegHeart />
                                </button>
                            </div>
                        </div>



                    </div>

                    {/* Thông tin mô tả */}
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Thông tin mô tả</h3>
                        <p className="text-gray-700">{room.description}</p>
                    </div>

                    {/* Thông tin chi tiết khác (có thể đặt bên dưới mô tả) */}
                    {/* <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="text-md font-semibold mb-2">Thông tin chi tiết</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                            <li><strong>Tòa Nhà:</strong> {getBuildingName(room.buildingId)}</li>
                            <li><strong>Loại Phòng:</strong> {getCategoryName(room.categoryRoomId)}</li>
                            <li><strong>Phòng tắm:</strong> {room.numberOfBathroom}</li>
                            <li><strong>Giường ngủ:</strong> {room.numberOfBedroom}</li>
                            <li><strong>Gác Xếp:</strong> {room.garret ? 'Có' : 'Không'}</li>
                            <li><strong>Nội thất:</strong> {room.furniture || 'Không'}</li>
                        </ul>
                    </div> */}
                    <div className="flex items-center gap-x-2">
                        <p>Mọi chi tiết xin liên hệ:</p>
                        <button
                            onClick={(e) => {
                                e.preventDefault();     // Ngăn Link điều hướng
                                e.stopPropagation();    // Ngăn sự kiện nổi bọt
                                setShowFullPhone(true); // Hiện full số
                            }}
                            className="text-base bg-white text-gray-800 px-2 py-1 flex items-center gap-1"
                        >
                            {showFullPhone ? (
                                phoneNumber
                            ) : (
                                <>
                                    {maskedPhone}
                                    {/* Tách "Hiện số" ra, có bg + rounded khác */}
                                    <span className="bg-green-500 ml-1 text-white px-2 py-0.5 rounded-md">
                                        Hiện số
                                    </span>
                                </>
                            )}
                        </button>

                    </div>
                    <p>Cám ơn tất cả mọi người đã xem ai có nhu cầu giúp mình nhé.</p>

                    <div>
                        <h2 className='text-xl font-bold mb-5'>Đặc điểm phòng trọ</h2>
                        <div className="grid grid-cols-2 ml-5 gap-y-2">
                            <div className="flex gap-x-1 items-center">
                                <FaMoneyBillWave className="text-lg text-gray-600" />
                                <strong>Mức giá: </strong>
                                {room.price.toLocaleString('vi-VN')} đ/tháng
                            </div>
                            <div className="flex gap-x-1 items-center">
                                <FaBuilding className="text-lg text-gray-600" />
                                <strong>Tòa Nhà:</strong> {getBuildingName(room.buildingId)}
                            </div>
                            <div className="flex gap-x-1 items-center">
                                <FaRulerCombined className="text-lg text-gray-600" />
                                <strong>Diện tích: </strong>{room.acreage} m²
                            </div>
                            <div className="flex gap-x-1 items-center">
                                <FaCouch className="text-lg text-gray-600" />
                                <strong>Nội thất:</strong> {room.furniture || 'Không'}
                            </div>
                            <div className="flex gap-x-1 items-center">
                                <FaBath className="text-lg text-gray-600" />
                                <strong>Phòng tắm:</strong> {room.numberOfBathroom}
                            </div>
                            <div className="flex gap-x-1 items-center">
                                <FaBed className="text-lg text-gray-600" />
                                <strong>Giường ngủ:</strong> {room.numberOfBedroom}
                            </div>
                            <div className="flex gap-x-1 items-center">
                                <FaRegListAlt className="text-lg text-gray-500" />
                                <strong>Loại Phòng:</strong> {getCategoryName(room.categoryRoomId)}
                            </div>
                            {/* <div className="flex gap-x-1 items-center">
                                <FaArrowUp className="text-lg text-gray-600" />
                                <strong>Gác Xếp:</strong> {room.garret ? 'Có' : 'Không'}
                            </div> */}
                        </div>
                    </div>
                </div>

                {/* Cột phải (sidebar liên hệ) */}
                <div className="w-full md:w-1/5 bg-white p-4 rounded-lg shadow space-y-4">
                    {/* Thông tin chủ nhà (tạm cứng) - bạn có thể sửa theo API */}
                    <div className="flex items-center gap-3">
                        <img
                            src="https://via.placeholder.com/60x60"
                            alt="Avatar"
                            className="w-14 h-14 object-cover rounded-full"
                        />
                        <div>
                            <p className="font-semibold">Lê Thanh Hải</p>
                            <button className="text-blue-600 text-sm underline">
                                Chat qua Zalo
                            </button>
                        </div>
                    </div>

                    {/* Nút điện thoại */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();     // Ngăn Link điều hướng
                            e.stopPropagation();    // Ngăn sự kiện nổi bọt
                            setShowFullPhone(true); // Hiện full số
                        }}
                        className='text-lg bg-green-600 text-white px-2 py-1 rounded-lg flex gap-2' >
                        <FaPhoneVolume className='mt-1' />
                        {showFullPhone ? phoneNumber : `${maskedPhone}`}
                    </button>

                    {/* Một số thông tin phụ */}
                    <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-600 leading-6">
                        Hãy cho chủ nhà biết bạn thấy tin này trên <strong>Trang web ABC</strong> để
                        nhận ưu đãi tốt nhất.
                        <br />
                        <span className="text-gray-500">
                            (Tin đăng còn hạn, cập nhật lần cuối: 1 ngày trước)
                        </span>
                    </div>

                    {/* Nút chỉnh sửa & xóa (nếu cần) */}
                    {/* <div className="flex justify-between pt-3 border-t">
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
                    </div> */}
                </div>
            </div>

            {/* Modal phóng to ảnh (nếu cần) */}
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

            <Footer />
        </div>
    );
};

export default RoomDetailsUser;
