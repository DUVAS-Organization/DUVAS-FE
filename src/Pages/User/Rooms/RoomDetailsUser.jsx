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
    FaPaperPlane,
    FaRocketchat,
    FaFacebookMessenger,
} from 'react-icons/fa';
import { FaPhoneVolume, FaSignalMessenger } from 'react-icons/fa6';
import { BsExclamationTriangle } from 'react-icons/bs';
import Footer from '../../../Components/Layout/Footer';
import Loading from '../../../Components/Loading';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import { useAuth } from '../../../Context/AuthProvider';
import UserRentRoomService from '../../../Services/User/UserRentRoomService';
import OtherService from '../../../Services/User/OtherService';
import RoomService from '../../../Services/User/RoomManagementService';
import FeedbackList from '../../../Components/ComponentPage/FeedbackList';
import PriorityRoomService from '../../../Services/Admin/PriorityRoomService';
import CPPRoomsService from '../../../Services/Admin/CPPRoomsService';

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
    const [priorityPackages, setPriorityPackages] = useState([]);
    const [cppRooms, setCppRooms] = useState([]);

    // Fetch dữ liệu ưu tiên
    const fetchPriorityData = async () => {
        try {
            const priorityData = await PriorityRoomService.getPriorityRooms();
            const cppData = await CPPRoomsService.getCPPRooms();
            setPriorityPackages(priorityData || []);
            setCppRooms(cppData || []);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu ưu tiên:', error.message);
            setPriorityPackages([]);
            setCppRooms([]);
        }
    };

    // Hàm lấy thông tin ưu tiên
    const getPriorityInfo = (roomId, priorityPackages, cppRooms) => {
        const priorityRoom = priorityPackages.find(pr => pr.roomId === roomId);
        if (priorityRoom) {
            const currentDate = new Date();
            const startDate = new Date(priorityRoom.startDate);
            const endDate = new Date(priorityRoom.endDate);
            const isActive = currentDate >= startDate && currentDate <= endDate;

            if (isActive) {
                const cppRoom = cppRooms.find(
                    cpp => cpp.categoryPriorityPackageRoomId === priorityRoom.categoryPriorityPackageRoomId
                );
                if (cppRoom) {
                    return {
                        value: cppRoom.categoryPriorityPackageRoomValue || 0,
                        description: getCategoryDescription(cppRoom.categoryPriorityPackageRoomValue),
                        borderColor: getBorderColor(cppRoom.categoryPriorityPackageRoomValue),
                    };
                }
            }
        }
        return {
            value: 0,
            description: "",
            borderColor: "#D1D5DB",
        };
    };

    // Hàm lấy mô tả ưu tiên
    const getCategoryDescription = (value) => {
        if (Number(value) > 0) {
            return 'Tin ưu tiên';
        }
        return '';
    };

    // Hàm lấy màu viền
    const getBorderColor = (value) => {
        if (Number(value) > 0) {
            return '#EF4444'; // red-500
        }
        return '#D1D5DB'; // gray-200
    };

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
            fetchPriorityData(),
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

    useEffect(() => {
        if (user && user.userId) {
            fetchSavedPosts();
        }
    }, [user]);

    const fetchSavedPosts = async () => {
        try {
            const data = await OtherService.getSavedPosts(user.userId);
            const savedRoomIds = data.filter(item => item.roomId).map(item => item.roomId);
            setSavedPosts(savedRoomIds);
            localStorage.setItem("savedPosts", JSON.stringify(savedRoomIds));
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bài đã lưu:", error);
        }
    };

    const toggleSavePost = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || !roomId) {
            showCustomNotification("error", "Bạn cần đăng nhập để lưu tin!");
            return;
        }

        try {
            const result = await OtherService.toggleSavePost(user.userId, parseInt(roomId));

            setSavedPosts((prevSaved) => {
                const newSaved = new Set(prevSaved);
                let message = "";

                if (result.status === "removed") {
                    newSaved.delete(parseInt(roomId));
                    message = "Đã xóa tin khỏi danh sách lưu!";
                } else if (result.status === "saved") {
                    newSaved.add(parseInt(roomId));
                    message = "Lưu tin thành công!";
                }

                const updatedSavedPosts = Array.from(newSaved);
                localStorage.setItem("savedPosts", JSON.stringify(updatedSavedPosts));

                return updatedSavedPosts;
            });

            if (result.status === "removed") {
                showCustomNotification("success", "Đã xóa tin khỏi danh sách lưu!");
            } else if (result.status === "saved") {
                showCustomNotification("success", "Lưu tin thành công!");
            }
        } catch (error) {
            console.error("Lỗi khi lưu / xóa bài:", error);
            showCustomNotification("error", "Không thể lưu tin này!");
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
            showCustomNotification("error", "Vui lòng đăng nhập để tiếp tục!");
            return;
        }
        setIsRenting(true);
        try {
            const token = user.token || localStorage.getItem("token");

            // Kiểm tra trạng thái phòng
            const roomStatus = await RoomService.trackRoomStatus(roomId, token);
            if (roomStatus.status === 2) {
                showCustomNotification("error", "Phòng này đã được thuê!");
                return;
            }

            // Gửi yêu cầu thuê phòng
            const rentPayload = {
                RoomId: parseInt(roomId),
                RenterID: user.userId,
                RentDate: details.moveInDate ? new Date(details.moveInDate).toISOString() : new Date().toISOString(),
                MonthForRent: details.duration ? parseInt(details.duration) : 1,
            };
            await RoomService.rentRoom(rentPayload);

            // Gửi email thông báo
            const renterName = details.fullName || getUserName();
            const additionalInfo = `Tên người thuê: ${renterName}, Số điện thoại: ${details.phone}, Ngày dọn vào: ${details.moveInDate || 'Không có thông tin'}, Thời gian thuê: ${details.duration ? details.duration + ' tháng' : 'Không có thông tin'}, Ngày kết thúc: ${details.expirationDate || 'Không có thông tin'}`;
            const sendMailPayload = {
                userIdLandlord: room.User.userId,
                roomId: parseInt(roomId),
                renterName: renterName,
                roomTitle: room.title,
                locationDetail: room.locationDetail,
                price: room.price,
                deposit: room.deposit,
                acreage: room.acreage,
                furniture: room.furniture,
                numberOfBathroom: room.numberOfBathroom,
                numberOfBedroom: room.numberOfBedroom,
            };

            await RoomService.sendMail(sendMailPayload, token);

            showCustomNotification("success", "Yêu cầu thuê phòng và gửi mail thành công!");
            navigate('/Rooms/BookingSuccess');
        } catch (error) {
            console.error("Error in handleRentRoom:", error);
            showCustomNotification("error", error.message || "Có lỗi xảy ra");
        } finally {
            setIsRenting(false);
        }
    };

    const PhoneAlertPopup = () => {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-gray-800 dark:text-white">
                <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center dark:bg-gray-800 dark:text-white">
                    <p className="text-gray-800 mb-4 dark:text-white">
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50
             dark:bg-gray-800 dark:text-white border dark:border-white dark:bg-opacity-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md dark:bg-gray-800 dark:text-white">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Thông tin thuê phòng</h3>
                        <button
                            onClick={() => setShowRentModal(false)}
                            className="text-gray-600 hover:text-gray-800 dark:text-white"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmitRentForm}>
                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-white mb-2 font-semibold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                readOnly
                                className="w-full dark:bg-gray-800 dark:text-white p-2 border rounded-md bg-gray-100"
                                defaultValue={getUserName()}
                                style={{ fontFamily: 'Arial, sans-serif' }}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-white mb-2 font-semibold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                readOnly
                                className="w-full dark:bg-gray-800 dark:text-white p-2 border rounded-md bg-gray-100"
                                defaultValue={getUserPhone()}
                                style={{ fontFamily: 'Arial, sans-serif' }}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-white mb-2 font-semibold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Ngày dọn vào
                            </label>
                            <input
                                type="date"
                                name="moveInDate"
                                required
                                min={today}
                                className="w-full dark:bg-gray-800 dark:text-white p-2 border rounded-md"
                                value={moveInDate}
                                onChange={(e) => setMoveInDate(e.target.value)}
                                style={{ fontFamily: 'Arial, sans-serif' }}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-white mb-2 font-semibold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Thời gian thuê (tháng)
                            </label>
                            <input
                                type="number"
                                name="duration"
                                min="1"
                                required
                                className="w-full dark:bg-gray-800 dark:text-white p-2 border rounded-md"
                                placeholder="Số tháng muốn thuê"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                style={{ fontFamily: 'Arial, sans-serif' }}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-white mb-2 font-semibold" style={{ fontFamily: 'Arial, sans-serif' }}>
                                Ngày kết thúc
                            </label>
                            <input
                                type="text"
                                value={expirationDate}
                                readOnly
                                className="w-full dark:bg-gray-800 dark:text-white p-2 border rounded-md bg-gray-100"
                                style={{ fontFamily: 'Arial, sans-serif' }}
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setShowRentModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 dark:bg-gray-800 dark:text-white border dark:border-white"
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
    const priorityInfo = getPriorityInfo(parseInt(roomId), priorityPackages, cppRooms);

    const handleMessageClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            showCustomNotification("error", "Bạn cần đăng nhập để nhắn tin!");
        } else {
            navigate('/Message', {
                state: {
                    partnerId: room.User.userId,
                    partnerName: room.User.name,
                    partnerAvatar: room.User.profilePicture,
                    partnerIsActive: room.User.isActive || false,
                },
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 bg-white dark:bg-gray-800 dark:text-white">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-3/4 bg-white p-4 rounded-lg shadow space-y-4 dark:bg-gray-800 dark:text-white">
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
                    {priorityInfo.description && (
                        <p className="text-sm font-semibold bg-red-500 text-white border w-20 px-1 border-red-500 rounded-lg">
                            {priorityInfo.description}
                        </p>
                    )}
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {room.title || 'Tiêu đề phòng'}
                    </h2>
                    <div className="text-gray-600 flex items-center mb-2 dark:text-white">
                        <FaMapMarkerAlt className="mr-1" />
                        {room.locationDetail}
                    </div>
                    <div className="mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-5">
                                <div className="flex flex-col text-black text-lg dark:text-white">
                                    <span className='font-semibold'>Mức giá</span>
                                    <span className="text-red-500 font-medium">
                                        {room.price.toLocaleString('vi-VN')} đ/tháng
                                    </span>
                                </div>
                                <div className="flex flex-col text-black text-lg dark:text-white">
                                    <span className='font-semibold'>Diện tích</span>
                                    <span className="text-red-500 font-medium">
                                        {room.acreage} m²
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-4 text-2xl text-gray-600">
                                <button
                                    onClick={toggleSavePost}
                                    className="text-2xl"
                                >
                                    {savedPosts.includes(parseInt(roomId)) ? (
                                        <FaHeart className="text-red-500 dark:text-white" />
                                    ) : (
                                        <FaRegHeart className="text-gray-600 dark:text-white" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-1">Mô tả</h3>
                        <p className="text-gray-700 dark:text-white">{room.description}</p>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <p className='text-xl font-semibold'>Liên hệ:</p>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowFullPhone(true);
                            }}
                            className="text-base bg-white text-gray-800 px-2 mt-1 flex items-center gap-1 dark:bg-gray-800 dark:text-white"
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
                            onClick={handleMessageClick}
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
                <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow space-y-4 sticky top-0 dark:bg-gray-800 dark:text-white">
                    <div className="flex items-center justify-between gap-2">
                        {room.User && room.User.profilePicture ? (
                            <img
                                src={room.User.profilePicture}
                                alt={room.User.name}
                                className="w-10 h-10 object-cover rounded-full flex-shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-semibold text-gray-800">
                                    {room.User && room.User.name ? room.User.name.charAt(0).toUpperCase() : "U"}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                                {room.User && room.User.name ? room.User.name : "Chưa xác định"}
                            </p>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowFullPhone(true);
                                }}
                                className="text-xs text-black py-1 rounded-lg flex gap-1 items-center dark:text-white"
                            >
                                {showFullPhone ? userPhone || "N/A" : maskedPhone}
                            </button>
                        </div>
                        {!isLandlord && (
                            <button
                                onClick={handleMessageClick}
                                className="bg-red-500 p-1 border border-red-500 text-white rounded-full flex items-center gap-1 hover:bg-red-600 transition-colors flex-shrink-0"
                            >
                                <FaFacebookMessenger className="text-2xl" />
                            </button>
                        )}
                    </div>
                    {/* Ẩn nút Đặt phòng nếu người dùng là chủ phòng */}
                    {!isLandlord && (
                        <div>
                            <div className="flex justify-center">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (!user) {
                                            showCustomNotification("error", "Bạn cần đăng nhập để đặt phòng!");
                                        } else {
                                            setShowRentModal(true);
                                        }
                                    }}
                                    className="w-48 bg-red-500 text-white font-medium px-4 py-1 rounded-xl hover:bg-red-400 text-sm"
                                >
                                    Đặt Phòng
                                </button>
                            </div>
                            <div className="bg-gray-100 py-2 rounded-md text-sm mt-3 text-justify text-gray-600 leading-5 dark:bg-gray-800 dark:text-white">
                                <span className="inline">
                                    <span className="font-medium">Lưu ý: </span>
                                    Sau khi bạn nhấn vào
                                    <span className="font-medium text-red-500"> Đặt phòng</span>, thông tin của bạn sẽ được gửi đến chủ nhà để xem xét.
                                    Chủ nhà có thể chấp nhận hoặc từ chối yêu cầu của bạn.
                                </span>
                            </div>
                            <div className="bg-gray-100 py-2 rounded-md text-justify text-sm text-gray-600 leading-5 dark:bg-gray-800 dark:text-white">
                                Hãy cho chủ nhà biết bạn thấy phòng này hoặc đã đặt phòng trên <strong>DUVAS </strong>
                                bằng cách
                                <button
                                    className="text-red-500 hover:underline font-medium ml-1"
                                    onClick={handleMessageClick}
                                >
                                    Nhắn Tin
                                </button> để nhận ưu đãi tốt nhất.
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-2">
                <FeedbackList roomId={roomId} />
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