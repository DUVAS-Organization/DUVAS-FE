import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoomServices from '../../../Services/User/RoomService';
import CategoryRooms from '../../../Services/User/CategoryRoomService';
import BuildingServices from '../../../Services/User/BuildingService';
import UserService from '../../../Services/User/UserService';
import { showCustomNotification } from '../../../Components/Notification';
import RoomsHome from '../../../Components/ComponentPage/RoomsHome';
import {
    FaBath,
    FaBed,
    FaBuilding,
    FaCouch,
    FaMoneyBillWave,
    FaRegHeart,
    FaRegListAlt,
    FaRulerCombined,
    FaMapMarkerAlt,
    FaAngleLeft,
    FaAngleRight,
    FaHeart,
} from 'react-icons/fa';
import { FaPhoneVolume } from 'react-icons/fa6';
import { BsExclamationTriangle } from 'react-icons/bs';
import Footer from '../../../Components/Layout/Footer';
import Loading from '../../../Components/Loading';

// Import Swiper components and CSS
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import { useAuth } from '../../../Context/AuthProvider';

const RoomDetailsUser = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const [savedPosts, setSavedPosts] = useState(() => {
        return JSON.parse(localStorage.getItem("savedPosts")) || [];
    });
    // State cho dữ liệu phòng, category và building
    const [room, setRoom] = useState(null);
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);

    // Ảnh chính & modal
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previewImage, setPreviewImage] = useState(null);

    // Hiển thị số điện thoại
    const [showFullPhone, setShowFullPhone] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            CategoryRooms.getCategoryRooms()
                .then((data) => setCategoryRooms(data))
                .catch((error) => console.error('Error fetching categories:', error)),

            BuildingServices.getBuildings()
                .then((data) => setBuildings(data))
                .catch((error) => console.error('Error fetching Buildings:', error)),

            roomId
                ? RoomServices.getRoomById(roomId)
                    .then((data) => {
                        // Tạo đối tượng room
                        const roomData = {
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
                            note: data.note || '',
                            userId: data.userId
                        };
                        // Fetch thông tin người đăng dựa theo userId
                        return UserService.getUserById(data.userId)
                            .then((userData) => ({ ...roomData, User: userData }))
                            .catch((error) => {
                                console.error('Error fetching user:', error);
                                return roomData;
                            });
                    })
                    .then((roomDataWithUser) => {
                        setRoom(roomDataWithUser);
                    })
                    .catch((error) => {
                        console.error('Error fetching room details:', error);
                        showCustomNotification("error", "Không thể tải thông tin phòng!");
                    })
                : Promise.resolve()
        ]).finally(() => {
            setLoading(false);
        });
    }, [roomId]);

    // Hàm tra cứu tên Building
    const getBuildingName = (buildingId) => {
        const found = buildings.find(b => b.buildingId === buildingId);
        return found ? (found.buildingName || found.name) : 'N/A';
    };

    // Hàm tra cứu tên Category
    const getCategoryName = (categoryRoomId) => {
        const found = categoryRooms.find(c => c.categoryRoomId === categoryRoomId);
        return found ? found.categoryName : 'N/A';
    };
    const toggleSavePost = async () => {
        if (!user || !roomId) {
            console.error("Lỗi: userId hoặc roomId không hợp lệ!", { user, roomId });
            return;
        }

        try {
            const response = await fetch("https://localhost:8000/api/SavedPosts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.userId, roomId: parseInt(roomId) }),
            });

            if (!response.ok) {
                throw new Error("Lỗi khi lưu/xóa bài đăng");
            }

            // Cập nhật danh sách bài đã lưu
            setSavedPosts((prev) => {
                if (prev.includes(parseInt(roomId))) {
                    return prev.filter((id) => id !== parseInt(roomId)); // Xóa khỏi danh sách
                } else {
                    return [...prev, parseInt(roomId)]; // Thêm vào danh sách
                }
            });
        } catch (error) {
            console.error("❌ Lỗi khi lưu / xóa bài:", error);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <Loading />
            </div>
        );
    }

    if (!room) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <p className="text-red-500 font-semibold">Không tìm thấy thông tin phòng.</p>
            </div>
        );
    }

    // Xử lý ảnh
    let imagesArray = [];
    try {
        imagesArray = JSON.parse(room.image);
    } catch (error) {
        imagesArray = room.image;
    }
    if (!Array.isArray(imagesArray)) {
        imagesArray = [imagesArray];
    }

    // Next/Prev ảnh chính
    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + imagesArray.length) % imagesArray.length);
    };
    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % imagesArray.length);
    };

    // Mở modal ảnh to
    const openPreview = () => {
        setPreviewImage(imagesArray[currentIndex]);
    };

    // Chỉ tính toán phone sau khi room != null
    const userPhone = room?.User?.phone || ''; // nếu không có thì chuỗi rỗng
    // Nếu userPhone rỗng hoặc không đủ dài, ta đặt mask tạm là 'N/A'
    const maskedPhone =
        userPhone && userPhone.length > 3
            ? userPhone.slice(0, userPhone.length - 3) + '***'
            : 'N/A';

    const handleRentRoom = () => {
        // ...Xử lý logic thuê phòng (gọi API, kiểm tra v.v.)
        navigate('/Rooms/BookingSuccess');
    };
    return (
        <div className="max-w-6xl mx-auto p-4 bg-white">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Cột trái */}
                <div className="w-full md:w-3/4 bg-white p-4 rounded-lg shadow space-y-4">
                    {/* Ảnh chính (carousel) */}
                    {imagesArray.length > 0 && (
                        <div className="relative w-full h-96 overflow-hidden rounded-lg">
                            {/* Ảnh đang hiển thị */}
                            <img
                                src={imagesArray[currentIndex]}
                                alt={`Image-${currentIndex}`}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={openPreview}
                            />

                            {/* Nút prev/next cho ảnh chính */}
                            {imagesArray.length > 1 && (
                                <>
                                    <button
                                        className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-black bg-opacity-30 text-white px-2 py-1 rounded"
                                        onClick={handlePrev}
                                    >
                                        <FaAngleLeft className='text-2xl' />
                                    </button>
                                    <button
                                        className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-black bg-opacity-30 text-white px-2 py-1 rounded"
                                        onClick={handleNext}
                                    >
                                        <FaAngleRight className='text-2xl' />
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Thumbnails với drag to scroll */}
                    {imagesArray.length > 1 && (
                        <div className="mt-2">
                            <Swiper
                                slidesPerView={5}
                                spaceBetween={10}
                                grabCursor={true}
                                onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
                            >
                                {imagesArray.map((img, idx) => (
                                    <SwiperSlide key={idx}>
                                        <img
                                            src={img}
                                            alt={`Thumbnail-${idx}`}
                                            className={`w-full h-20 object-cover rounded-md ${idx === currentIndex ? 'border-2 border-blue-500' : ''
                                                }`}
                                            onClick={() => setCurrentIndex(idx)}
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
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
                        <div className="flex items-center justify-between">
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
                            <div className="flex gap-4 text-2xl text-gray-600">
                                <button>
                                    <BsExclamationTriangle />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleSavePost(); // Gọi hàm mà không cần truyền `roomId` vì đã lấy từ `useParams()`
                                    }}
                                    className="text-2xl"
                                >
                                    {savedPosts.includes(parseInt(roomId)) ? (
                                        <FaHeart className="text-red-500" />
                                    ) : (
                                        <FaRegHeart className="text-gray-600" />
                                    )}
                                </button>


                            </div>
                        </div>
                    </div>

                    {/* Thông tin mô tả */}
                    <div>
                        <h3 className="text-xl font-semibold mb-1">Mô tả</h3>
                        <p className="text-gray-700">{room.description}</p>
                    </div>

                    {/* Liên hệ */}
                    <div className="flex items-center gap-x-2">
                        <p className='text-xl font-semibold '>Liên hệ:</p>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowFullPhone(true);
                            }}
                            className="text-base bg-white text-gray-800 px-2 mt-1 flex items-center gap-1"
                        >
                            {showFullPhone ? (
                                userPhone || 'N/A'
                            ) : (
                                <>
                                    {maskedPhone}
                                    <span className="bg-green-500 ml-1 text-white px-2 py-0.5 rounded-md">
                                        Hiện số
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                    <p>Cám ơn tất cả mọi người đã xem ai có nhu cầu   <button
                        className="text-red-500 hover:underline font-medium ml-1"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Chuyển đến trang Message và truyền partnerId và partnerName qua state
                            navigate('/Message', {
                                state: {
                                    partnerId: room.User.userId,
                                    partnerName: room.User.name,
                                    partnerAvatar: room.User.profilePicture
                                }
                            });
                        }}
                    >
                        Nhắn Tin
                    </button> giúp mình nhé.</p>

                    {/* Đặc điểm phòng */}
                    <div>
                        <h2 className='text-xl font-semibold mb-5'>Chi tiết</h2>
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
                        </div>
                    </div>
                </div>

                {/* Cột phải (sidebar liên hệ) */}
                <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow space-y-4 sticky top-">
                    <div className="flex items-center gap-3">
                        {room.User && room.User.profilePicture ? (
                            <img
                                src={room.User.profilePicture}
                                alt={room.User.name}
                                className="w-14 h-14 object-cover rounded-full"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-xl font-semibold text-gray-800">
                                    {room.User && room.User.name
                                        ? room.User.name.charAt(0).toUpperCase()
                                        : "U"}
                                </span>
                            </div>
                        )}
                        <div>
                            <p className="font-semibold">
                                {room.User && room.User.name ? room.User.name : "Chưa xác định"}
                            </p>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowFullPhone(true);
                                }}
                                className='text-sm text-black pr-2 py-1 rounded-lg flex gap-2'
                            >
                                {showFullPhone ? (userPhone || 'N/A') : maskedPhone}
                            </button>
                        </div>
                    </div>
                    <div className=' flex justify-center'>
                        <button
                            onClick={handleRentRoom}
                            className='w-52 bg-red-500 text-white font-medium px-5 py-1 rounded-xl hover:bg-red-400'>
                            Thuê
                        </button>
                    </div>
                    <div className="bg-gray-100 py-3 rounded-md text-sm text-gray-600 leading-6">
                        Hãy cho chủ nhà biết bạn thấy phòng này trên <strong>DUVAS </strong>
                        bằng cách
                        <button
                            className="text-red-500 hover:underline font-medium ml-1"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Chuyển đến trang Message và truyền partnerId và partnerName qua state
                                navigate('/Message', {
                                    state: {
                                        partnerId: room.User.userId,
                                        partnerName: room.User.name,
                                        partnerAvatar: room.User.profilePicture
                                    }
                                });
                            }}
                        >
                            Nhắn Tin
                        </button>
                        <p>  để nhận ưu đãi tốt nhất.</p>
                        <br />
                    </div>
                </div>
            </div>

            {/* Modal phóng to ảnh */}
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

            <div>
                <h3 className='text-xl font-semibold ml-5 mt-4'>Phòng trọ</h3>
                <RoomsHome />
            </div>
            <Footer />
        </div>
    );
};

export default RoomDetailsUser;