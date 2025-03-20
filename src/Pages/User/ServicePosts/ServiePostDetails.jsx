import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ServicePostService from '../../../Services/Admin/ServicePost';
import UserService from '../../../Services/User/UserService';
import CategoryService from '../../../Services/User/CategoryServices';
import { showCustomNotification } from '../../../Components/Notification';
import {
    FaMoneyBillWave,
    FaRegHeart,
    FaHeart,
    FaMapMarkerAlt,
    FaAngleLeft,
    FaAngleRight,
    FaRegListAlt,
} from 'react-icons/fa';
import { BsExclamationTriangle } from 'react-icons/bs';
import Footer from '../../../Components/Layout/Footer';
import Loading from '../../../Components/Loading';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import { useAuth } from '../../../Context/AuthProvider';

const ServicePostDetails = () => {
    const { servicePostId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const { user } = useAuth();
    const [savedPosts, setSavedPosts] = useState(() => {
        return JSON.parse(localStorage.getItem("savedPosts")) || [];
    });
    const [servicePost, setServicePost] = useState(null);
    const [categoryServices, setCategoryServices] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previewImage, setPreviewImage] = useState(null);
    const [showFullPhone, setShowFullPhone] = useState(false);

    const getUserName = () => {
        if (user && user.name) return user.name;
        try {
            const token = user.token || localStorage.getItem("token");
            if (token) {
                const payload = token.split('.')[1];
                const decoded = JSON.parse(atob(payload));
                return decoded["http://schemas.xmlsoap.org/ws/2005/identity/claims/name"] || "Anonymous";
            }
        } catch (e) {
            console.error("Error decoding token:", e);
        }
        return "Anonymous";
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            CategoryService.getCategoryServices()
                .then((data) => setCategoryServices(data))
                .catch((error) => console.error('Error fetching category services:', error)),
            servicePostId
                ? ServicePostService.getServicePostById(servicePostId)
                    .then((data) => {
                        const servicePostData = {
                            servicePostId: data.servicePostId || 0,
                            title: data.title || '',
                            description: data.description || '',
                            location: data.location || '',
                            price: data.price || 0,
                            categoryServiceId: data.categoryServiceId || 1,
                            image: data.image || '',
                            userId: data.userId || null,
                        };
                        // Gọi API để lấy thông tin User dựa trên userId
                        return UserService.getUserById(data.userId)
                            .then((userData) => ({
                                ...servicePostData,
                                User: userData || { name: 'Chưa xác định', phone: 'N/A', profilePicture: null }
                            }))
                            .catch((error) => {
                                console.error('Error fetching user:', error);
                                return { ...servicePostData, User: { name: 'Chưa xác định', phone: 'N/A', profilePicture: null } };
                            });
                    })
                    .then((servicePostDataWithUser) => {
                        setServicePost(servicePostDataWithUser);
                    })
                    .catch((error) => {
                        console.error('Error fetching service post details:', error);
                        showCustomNotification("error", "Không thể tải thông tin bài đăng dịch vụ!");
                    })
                : Promise.resolve()
        ]).finally(() => {
            setLoading(false);
        });
    }, [servicePostId]);

    const getCategoryServiceName = (categoryServiceId) => {
        const found = categoryServices.find(c => c.categoryServiceId === categoryServiceId);
        return found ? found.categoryServiceName : 'N/A';
    };

    const toggleSavePost = async () => {
        if (!user || !servicePostId) {
            console.error("Lỗi: userId hoặc servicePostId không hợp lệ!", { user, servicePostId });
            return;
        }
        try {
            const response = await fetch("https://localhost:8000/api/SavedPosts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.userId, servicePostId: parseInt(servicePostId) }),
            });
            if (!response.ok) {
                throw new Error("Lỗi khi lưu/xóa bài đăng");
            }
            setSavedPosts((prev) => {
                if (prev.includes(parseInt(servicePostId))) {
                    return prev.filter((id) => id !== parseInt(servicePostId));
                } else {
                    return [...prev, parseInt(servicePostId)];
                }
            });
        } catch (error) {
            console.error("❌ Lỗi khi lưu / xóa bài:", error);
        }
    };

    const handleRequestService = async () => {
        if (!servicePost || !user) {
            console.log("servicePost hoặc user không hợp lệ:", servicePost, user);
            showCustomNotification("error", "Vui lòng đăng nhập để thực hiện yêu cầu!");
            return;
        }
        setIsRequesting(true);
        try {
            const token = user.token || localStorage.getItem("token");
            const requestPayload = {
                ServicePostId: parseInt(servicePostId),
                RequesterId: user.userId,
            };
            const requestResponse = await fetch("https://localhost:8000/api/ServiceManagement/rent-service", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestPayload),
            });
            if (!requestResponse.ok) {
                const requestErrorData = await requestResponse.json();
                throw new Error(requestErrorData.message || "Lỗi khi yêu cầu dịch vụ");
            }

            const requesterName = getUserName();
            const sendMailPayload = {
                userIdProvider: servicePost.userId,
                servicePostId: parseInt(servicePostId),
                requesterName: requesterName,
            };
            const sendMailResponse = await fetch("https://localhost:8000/api/ServiceManagement/send-mail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(sendMailPayload),
            });
            if (!sendMailResponse.ok) {
                const sendMailErrorData = await sendMailResponse.json();
                throw new Error(sendMailErrorData.message || "Lỗi khi gửi email cho nhà cung cấp");
            }

            showCustomNotification("success", "Yêu cầu dịch vụ và gửi mail thành công!");
            navigate('/Services/RequestSuccess');
        } catch (error) {
            console.log("Error in handleRequestService catch block:", error);
            showCustomNotification("error", "Có lỗi xảy ra");
        } finally {
            setIsRequesting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <Loading />
            </div>
        );
    }

    if (isRequesting) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <Loading />
            </div>
        );
    }

    if (!servicePost) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <p className="text-red-500 font-semibold">Không tìm thấy thông tin bài đăng dịch vụ.</p>
            </div>
        );
    }

    let imagesArray = [];
    try {
        imagesArray = JSON.parse(servicePost.image);
    } catch (error) {
        imagesArray = servicePost.image;
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

    const userPhone = servicePost.User?.phone || 'N/A';
    const maskedPhone =
        userPhone && userPhone.length > 3
            ? userPhone.slice(0, userPhone.length - 3) + '***'
            : 'N/A';

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
                                        <FaAngleLeft className="text-2xl" />
                                    </button>
                                    <button
                                        className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-black bg-opacity-30 text-white px-2 py-1 rounded"
                                        onClick={handleNext}
                                    >
                                        <FaAngleRight className="text-2xl" />
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
                        {servicePost.title || 'Tiêu đề dịch vụ'}
                    </h2>
                    <div className="text-gray-600 flex items-center mb-2">
                        <FaMapMarkerAlt className="mr-1" />
                        {servicePost.location}
                    </div>
                    <div className="mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-5">
                                <div className="flex flex-col text-black text-lg">
                                    <span className="font-semibold">Mức giá</span>
                                    <span className="text-red-500 font-medium">
                                        {servicePost.price.toLocaleString('vi-VN')} đ
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
                                    {savedPosts.includes(parseInt(servicePostId)) ? (
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
                        <p className="text-gray-700">{servicePost.description}</p>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <p className="text-xl font-semibold">Liên hệ:</p>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowFullPhone(true);
                            }}
                            className="text-base bg-white text-gray-800 px-2 mt-1 flex items-center gap-1"
                        >
                            {showFullPhone ? (
                                userPhone
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
                                        partnerId: servicePost.userId,
                                        partnerName: servicePost.User?.name || 'Chưa xác định',
                                        partnerAvatar: servicePost.User?.profilePicture || null,
                                    },
                                });
                            }}
                        >
                            Nhắn Tin
                        </button>
                        &nbsp;giúp mình nhé.
                    </p>
                    <div>
                        <h2 className="text-xl font-semibold mb-5">Chi tiết</h2>
                        <div className="grid grid-cols-2 ml-5 gap-y-2">
                            <div className="flex gap-x-1 items-center">
                                <FaMoneyBillWave className="text-lg text-gray-600" />
                                <strong>Mức giá: </strong>
                                {servicePost.price.toLocaleString('vi-VN')} đ
                            </div>
                            <div className="flex gap-x-1 items-center">
                                <FaRegListAlt className="text-lg text-gray-500" />
                                <strong>Loại Dịch Vụ:</strong> {getCategoryServiceName(servicePost.categoryServiceId)}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Sidebar được khôi phục từ code cũ */}
                <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow space-y-4 sticky top-0">
                    <div className="flex items-center gap-3">
                        {servicePost.User && servicePost.User.profilePicture ? (
                            <img
                                src={servicePost.User.profilePicture}
                                alt={servicePost.User.name}
                                className="w-14 h-14 object-cover rounded-full"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-xl font-semibold text-gray-800">
                                    {servicePost.User && servicePost.User.name ? servicePost.User.name.charAt(0).toUpperCase() : "U"}
                                </span>
                            </div>
                        )}
                        <div>
                            <p className="font-semibold">
                                {servicePost.User && servicePost.User.name ? servicePost.User.name : "Chưa xác định"}
                            </p>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowFullPhone(true);
                                }}
                                className="text-sm text-black pr-2 py-1 rounded-lg flex gap-2"
                            >
                                {showFullPhone ? (userPhone || 'N/A') : maskedPhone}
                            </button>
                        </div>
                    </div>
                    {/* <div className="flex justify-center">
                        <button
                            onClick={handleRequestService}
                            className="w-52 bg-red-500 text-white font-medium px-5 py-1 rounded-xl hover:bg-red-400"
                        >
                            Yêu cầu dịch vụ
                        </button>
                    </div> */}
                    <div className="bg-gray-100 py-3 rounded-md text-sm text-gray-600 leading-6">
                        Hãy cho nhà cung cấp biết bạn thấy dịch vụ này trên <strong>DUVAS </strong>
                        bằng cách
                        <button
                            className="text-red-500 hover:underline font-medium ml-1"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate('/Message', {
                                    state: {
                                        partnerId: servicePost.userId,
                                        partnerName: servicePost.User?.name || 'Chưa xác định',
                                        partnerAvatar: servicePost.User?.profilePicture || null,
                                    },
                                });
                            }}
                        >
                            Nhắn Tin
                        </button> để nhận ưu đãi tốt nhất.
                        <br />
                    </div>
                </div>
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
            <Footer />
        </div>
    );
};

export default ServicePostDetails;