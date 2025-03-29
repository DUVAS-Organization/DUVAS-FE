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
    FaTimes,
    FaBolt,
    FaWater,
    FaWifi,
    FaTrash,
    FaCar,
    FaUserTie,
    FaMoneyBill,
} from 'react-icons/fa';
import { FaPhoneVolume } from 'react-icons/fa6';
import { BsExclamationTriangle } from 'react-icons/bs';
import Footer from '../../../Components/Layout/Footer';
import Loading from '../../../Components/Loading';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import { useAuth } from '../../../Context/AuthProvider';
import UserRentRoomService from '../../../Services/User/UserRentRoomService';

const RoomDetailsUser = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isRenting, setIsRenting] = useState(false);
    const { user } = useAuth();
    const [savedPosts, setSavedPosts] = useState(() => {
        return JSON.parse(localStorage.getItem("savedPosts")) || [];
    });
    const [room, setRoom] = useState(null);
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previewImage, setPreviewImage] = useState(null);
    const [showFullPhone, setShowFullPhone] = useState(false);
    const [showRentModal, setShowRentModal] = useState(false);
    const [moveInDate, setMoveInDate] = useState('');
    const [duration, setDuration] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [showPhoneAlert, setShowPhoneAlert] = useState(false);

    const getUserName = () => {
        if (user && user.name) return user.name;
        try {
            const token = user?.token || localStorage.getItem("token");
            if (token) {
                const payload = token.split('.')[1];
                const decodedPayload = decodeURIComponent(escape(atob(payload)));
                const decoded = JSON.parse(decodedPayload);
                const name = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Anonymous";
                return name;
            }
        } catch (e) {
            console.error("Error decoding token:", e);
        }
        return "Anonymous";
    };

    const getUserPhone = () => {
        if (user && user.phone) return user.phone;
        try {
            const token = user?.token || localStorage.getItem("token");
            if (token) {
                const payload = token.split('.')[1];
                const decodedPayload = decodeURIComponent(escape(atob(payload)));
                const decoded = JSON.parse(decodedPayload);
                return decoded["sub"] || "Chưa có thông tin";
            }
        } catch (e) {
            console.error("Error decoding token for phone:", e);
        }
        return "Chưa có thông tin";
    };

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
                            userId: data.userId,
                            dien: data.dien || 0,
                            nuoc: data.nuoc || 0,
                            internet: data.internet || 0,
                            rac: data.rac || 0,
                            guiXe: data.guiXe || 0,
                            quanLy: data.quanLy || 0,
                            chiPhiKhac: data.chiPhiKhac || 0,
                        };
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
                : Promise.resolve(),
        ]).finally(() => {
            setLoading(false);
        });
    }, [roomId]);

    useEffect(() => {
        if (moveInDate && duration) {
            const moveIn = new Date(moveInDate);
            const months = parseInt(duration, 10);
            if (!isNaN(months) && months > 0) {
                const expiration = new Date(moveIn);
                expiration.setMonth(expiration.getMonth() + months);
                const day = String(expiration.getDate()).padStart(2, '0');
                const month = String(expiration.getMonth() + 1).padStart(2, '0');
                const year = expiration.getFullYear();
                setExpirationDate(`${day}/${month}/${year}`);
            } else {
                setExpirationDate('');
            }
        } else {
            setExpirationDate('');
        }
    }, [moveInDate, duration]);

    const getBuildingName = (buildingId) => {
        const found = buildings.find((b) => b.buildingId === buildingId);
        return found ? found.buildingName || found.name : 'N/A';
    };

    const getCategoryName = (categoryRoomId) => {
        const found = categoryRooms.find((c) => c.categoryRoomId === categoryRoomId);
        return found ? found.categoryName : 'N/A';
    };

    const toggleSavePost = async () => {
        if (!user || !roomId) {
            console.error("Lỗi: userId hoặc roomId không hợp lệ!", { user, roomId });
            return;
        }
        try {
            const response = await fetch("http://apiduvas1.runasp.net/api/SavedPosts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.userId, roomId: parseInt(roomId) }),
            });
            if (!response.ok) {
                throw new Error("Lỗi khi lưu/xóa bài đăng");
            }
            setSavedPosts((prev) => {
                if (prev.includes(parseInt(roomId))) {
                    return prev.filter((id) => id !== parseInt(roomId));
                } else {
                    return [...prev, parseInt(roomId)];
                }
            });
        } catch (error) {
            console.error("❌ Lỗi khi lưu / xóa bài:", error);
        }
    };

    const handleSubmitRentForm = async (e) => {
        e.preventDefault();

        // Lấy token của user
        const token = user.token || localStorage.getItem("token");

        try {
            // Sử dụng hàm checkUserPhone cục bộ để gọi API kiểm tra số điện thoại của user
            const phoneCheckResponse = await UserRentRoomService.checkUserPhone(user.userId, token);
            // Kiểm tra thuộc tính "hasValidPhone" thay vì "HasValidPhone"
            if (!phoneCheckResponse.hasValidPhone) {
                // Hiển thị popup giữa màn hình nếu số điện thoại không hợp lệ
                setShowPhoneAlert(true);
                return; // Dừng xử lý nếu số điện thoại không hợp lệ
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra số điện thoại:", error);
            return;
        }

        // Nếu số điện thoại hợp lệ, tiếp tục xử lý form thuê phòng
        const formData = new FormData(e.target);
        const rentDetails = {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            moveInDate: formData.get('moveInDate'),
            duration: formData.get('duration'),
            expirationDate: expirationDate,
        };

        setShowRentModal(false);
        await handleRentRoom(rentDetails);
    };



    const handleRentRoom = async (details) => {
        if (!room || !user) {
            console.log("room hoặc user không hợp lệ:", room, user);
            showCustomNotification("error", "Vui lòng đăng nhập để tiếp tục!");
            return;
        }
        setIsRenting(true);
        try {
            const token = user.token || localStorage.getItem("token");

            const trackRoomResponse = await fetch(`http://apiduvas1.runasp.net/api/RoomManagement/track-room/${roomId}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (trackRoomResponse.ok) {
                const roomStatusObj = await trackRoomResponse.json();
                console.log("Room status:", roomStatusObj);
                if (roomStatusObj.status === 2) {
                    showCustomNotification("error", "Phòng này đã được thuê!");
                    return;
                }
            } else {
                console.log("Không thể lấy thông tin room status, trạng thái:", trackRoomResponse.status);
            }

            const rentPayload = {
                RoomId: parseInt(roomId),
                RenterID: user.userId,
                RentDate: details.moveInDate ? new Date(details.moveInDate).toISOString() : new Date().toISOString(),
                MonthForRent: details.duration ? parseInt(details.duration) : 1,
            };
            console.log("Đang gửi payload thuê phòng:", rentPayload);
            const rentResponse = await fetch("http://apiduvas1.runasp.net/api/RoomManagement/rent-room", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify(rentPayload),
            });
            console.log("rentResponse status:", rentResponse.status);
            if (!rentResponse.ok) {
                const rentErrorData = await rentResponse.json();
                throw new Error(rentErrorData.message || "Lỗi khi thực hiện thuê phòng");
            }

            const renterName = details.fullName || getUserName();
            const additionalInfo = `Tên người thuê: ${renterName}, Số điện thoại: ${details.phone}, Ngày dọn vào: ${details.moveInDate || 'Không có thông tin'}, Thời gian thuê: ${details.duration ? details.duration + ' tháng' : 'Không có thông tin'}, Ngày kết thúc: ${details.expirationDate || 'Không có thông tin'}`;
            const sendMailPayload = {
                userIdLandlord: room.User.userId,
                roomId: parseInt(roomId),
                renterName: renterName,
                additionalInfo: additionalInfo,
            };
            console.log("Đang gửi payload send-mail:", sendMailPayload);
            const sendMailResponse = await fetch("http://apiduvas1.runasp.net/api/RoomManagement/send-mail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(sendMailPayload),
            });
            console.log("sendMailResponse status:", sendMailResponse.status);
            if (!sendMailResponse.ok) {
                const sendMailErrorData = await sendMailResponse.json();
                throw new Error(sendMailErrorData.message || "Lỗi khi gửi email cho chủ phòng");
            }

            showCustomNotification("success", "Yêu cầu thuê phòng và gửi mail thành công!");
            navigate('/Rooms/BookingSuccess');
        } catch (error) {
            console.log("Error in handleRentRoom catch block:", error);
            showCustomNotification("error", error.message || "Có lỗi xảy ra");
        } finally {
            setIsRenting(false);
        }
    };
    const PhoneAlertPopup = () => {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
                    <p className="text-gray-800 mb-4">
                        Bạn chưa cập nhật số điện thoại hợp lệ. Vui lòng cập nhật số điện thoại trước khi đặt phòng.
                    </p>
                    <button
                        onClick={() => {
                            setShowPhoneAlert(false);
                            navigate('/Profile?tab=edit');
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        OK
                    </button>
                </div>
            </div>
        );
    };
    const RentModal = () => {
        const today = new Date().toISOString().split('T')[0];

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Thông tin thuê phòng</h3>
                        <button
                            onClick={() => setShowRentModal(false)}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmitRentForm}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 font-semibold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                readOnly
                                className="w-full p-2 border rounded-md bg-gray-100"
                                defaultValue={getUserName()}
                                style={{ fontFamily: 'Arial, sans-serif' }}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 font-semibold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                readOnly
                                className="w-full p-2 border rounded-md bg-gray-100"
                                defaultValue={getUserPhone()}
                                style={{ fontFamily: 'Arial, sans-serif' }}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 font-semibold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Ngày dọn vào
                            </label>
                            <input
                                type="date"
                                name="moveInDate"
                                required
                                min={today}
                                className="w-full p-2 border rounded-md"
                                value={moveInDate}
                                onChange={(e) => setMoveInDate(e.target.value)}
                                style={{ fontFamily: 'Arial, sans-serif' }}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 font-semibold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Thời gian thuê (tháng)
                            </label>
                            <input
                                type="number"
                                name="duration"
                                min="1"
                                required
                                className="w-full p-2 border rounded-md"
                                placeholder="Số tháng muốn thuê"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                style={{ fontFamily: 'Arial, sans-serif' }}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 font-semibold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Ngày kết thúc
                            </label>
                            <input
                                type="text"
                                value={expirationDate}
                                readOnly
                                className="w-full p-2 border rounded-md bg-gray-100"
                                style={{ fontFamily: 'Arial, sans-serif' }}
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setShowRentModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <Loading />
            </div>
        );
    }

    if (isRenting) {
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

    let imagesArray = [];
    try {
        imagesArray = JSON.parse(room.image);
    } catch (error) {
        imagesArray = room.image;
    }
    if (!Array.isArray(imagesArray)) {
        imagesArray = [imagesArray];
    }

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + imagesArray.length) % imagesArray.length);
    };
    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % imagesArray.length);
    };
    const openPreview = () => {
        setPreviewImage(imagesArray[currentIndex]);
    };

    const userPhone = room?.User?.phone || '';
    const maskedPhone =
        userPhone && userPhone.length > 3
            ? userPhone.slice(0, userPhone.length - 3) + '***'
            : 'N/A';

    // Kiểm tra xem người dùng có phải là chủ phòng không
    const isLandlord = user && room && String(user.userId) === String(room.User.userId);
    console.log("Current user ID:", user?.userId);
    console.log("Room owner ID:", room?.User?.userId);
    console.log("Is landlord:", isLandlord);

    return (
        <div className="max-w-6xl mx-auto p-4 bg-white">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-3/4 bg-white p-4 rounded-lg shadow space-y-4">
                    {imagesArray.length > 0 && (
                        <div className="relative w-full h-96 overflow-hidden rounded-lg">
                            <img
                                src={imagesArray[currentIndex]}
                                alt={`Image-${currentIndex}`}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={openPreview}
                            />
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
                                            className={`w-full h-20 object-cover rounded-md ${idx === currentIndex ? 'border-2 border-blue-500' : ''}`}
                                            onClick={() => setCurrentIndex(idx)}
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-gray-800">
                        {room.title || 'Tiêu đề phòng'}
                    </h2>
                    <div className="text-gray-600 flex items-center mb-2">
                        <FaMapMarkerAlt className="mr-1" />
                        {room.locationDetail}
                    </div>
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
                                        toggleSavePost();
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
                    <div>
                        <h3 className="text-xl font-semibold mb-1">Mô tả</h3>
                        <p className="text-gray-700">{room.description}</p>
                    </div>
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
                    <p>
                        Cám ơn tất cả mọi người đã xem ai có nhu cầu
                        <button
                            className="text-red-500 hover:underline font-medium ml-1"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate('/Message', {
                                    state: {
                                        partnerId: room.User.userId,
                                        partnerName: room.User.name,
                                        partnerAvatar: room.User.profilePicture,
                                    },
                                });
                            }}
                        >
                            Nhắn Tin&nbsp;
                        </button>
                        giúp mình nhé.
                    </p>
                    <div>
                        <h2 className='text-xl font-semibold mb-5'>Chi tiết</h2>
                        <div className="grid grid-cols-2 ml-5 gap-y-2">
                            <div className="flex gap-x-1 items-center">
                                <FaMoneyBillWave className="text-lg text-gray-600" />
                                <strong>Mức giá: </strong>
                                {room.price.toLocaleString('vi-VN')} đ/tháng
                            </div>
                            {room.buildingId !== null && (
                                <div className="flex gap-x-1 items-center">
                                    <FaBuilding className="text-lg text-gray-600" />
                                    <strong>Tòa Nhà:</strong> {getBuildingName(room.buildingId)}
                                </div>
                            )}
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

                            {/* Thêm các trường chi phí khác, chỉ hiển thị nếu giá trị > 0 */}
                            {room.dien > 0 && (
                                <div className="flex gap-x-1 items-center">
                                    <FaBolt className="text-lg text-gray-600" />
                                    <strong>Điện: </strong>{room.dien.toLocaleString('vi-VN')} đ/kWh
                                </div>
                            )}
                            {room.nuoc > 0 && (
                                <div className="flex gap-x-1 items-center">
                                    <FaWater className="text-lg text-gray-600" />
                                    <strong>Nước: </strong>{room.nuoc.toLocaleString('vi-VN')} đ/m³
                                </div>
                            )}
                            {room.internet > 0 && (
                                <div className="flex gap-x-1 items-center">
                                    <FaWifi className="text-lg text-gray-600" />
                                    <strong>Internet: </strong>{room.internet.toLocaleString('vi-VN')} đ/tháng
                                </div>
                            )}
                            {room.rac > 0 && (
                                <div className="flex gap-x-1 items-center">
                                    <FaTrash className="text-lg text-gray-600" />
                                    <strong>Rác: </strong>{room.rac.toLocaleString('vi-VN')} đ/tháng
                                </div>
                            )}
                            {room.guiXe > 0 && (
                                <div className="flex gap-x-1 items-center">
                                    <FaCar className="text-lg text-gray-600" />
                                    <strong>Gửi xe: </strong>{room.guiXe.toLocaleString('vi-VN')} đ/tháng
                                </div>
                            )}
                            {room.quanLy > 0 && (
                                <div className="flex gap-x-1 items-center">
                                    <FaUserTie className="text-lg text-gray-600" />
                                    <strong>Quản lý: </strong>{room.quanLy.toLocaleString('vi-VN')} đ/tháng
                                </div>
                            )}
                            {room.chiPhiKhac > 0 && (
                                <div className="flex gap-x-1 items-center">
                                    <FaMoneyBill className="text-lg text-gray-600" />
                                    <strong>Chi phí khác: </strong>{room.chiPhiKhac.toLocaleString('vi-VN')} đ/tháng
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow space-y-4 sticky top-0">
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
                                    {room.User && room.User.name ? room.User.name.charAt(0).toUpperCase() : "U"}
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
                    {/* Ẩn nút Đặt phòng nếu người dùng là chủ phòng */}
                    {!isLandlord && (
                        <div>
                            <div className='flex justify-center'>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowRentModal(true);
                                    }}
                                    className='w-52 bg-red-500 text-white font-medium px-5 py-1 rounded-xl hover:bg-red-400'
                                >
                                    Đặt Phòng
                                </button>
                            </div>
                            <div className="bg-gray-100 py-3 rounded-md text-sm text-justify text-gray-600 leading-6">
                                <span className="inline">
                                    <span className="font-medium">Lưu ý: </span>
                                    Sau khi bạn nhấn vào&nbsp;
                                    <span className="font-medium text-red-500">Đặt phòng</span>, thông tin của bạn sẽ được gửi đến chủ nhà để xem xét.
                                    Chủ nhà có thể chấp nhận hoặc từ chối yêu cầu của bạn.
                                </span>
                            </div>
                            <div className="bg-gray-100 py-3 rounded-md text-justify text-sm text-gray-600 leading-6">
                                Hãy cho chủ nhà biết bạn thấy phòng này hoặc đã đặt phòng trên <strong>DUVAS </strong>
                                bằng cách
                                <button
                                    className="text-red-500 hover:underline font-medium ml-1"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigate('/Message', {
                                            state: {
                                                partnerId: room.User.userId,
                                                partnerName: room.User.name,
                                                partnerAvatar: room.User.profilePicture,
                                                partnerIsActive: room.User.isActive || false,
                                            },
                                        });
                                    }}
                                >
                                    Nhắn Tin
                                </button> để nhận ưu đãi tốt nhất.
                                <br />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {showRentModal && <RentModal />}
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
            {showPhoneAlert && <PhoneAlertPopup />}
            <div>
                <RoomsHome />
            </div>
            <Footer />
        </div>
    );
};

export default RoomDetailsUser;