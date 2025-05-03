import React, { useEffect, useState } from 'react';
import RoomService from '../../../Services/User/RoomService';
import UserService from '../../../Services/User/UserService';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { FaRegBell, FaMapMarkerAlt, FaRegHeart, FaCamera, FaHeart } from 'react-icons/fa';
import { FaPhoneVolume } from "react-icons/fa6";
import Searchbar from '../../../Components/Searchbar';
import Footer from '../../../Components/Layout/Footer';
import { useAuth } from '../../../Context/AuthProvider';
import FAQList from '../../../Components/FAQ/FAQList';
import Loading from '../../../Components/Loading';
import { showCustomNotification } from '../../../Components/Notification';
import OtherService from '../../../Services/User/OtherService';
import PriorityRoomService from '../../../Services/Admin/PriorityRoomService';
import CPPRoomsService from '../../../Services/Admin/CPPRoomsService';

const RoomsList = () => {
    const { roomId } = useParams();
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [savedPosts, setSavedPosts] = useState(() => {
        const local = localStorage.getItem("savedPosts");
        return local ? JSON.parse(local).map(id => Number(id)) : [];
    });
    const [showFullPhoneById, setShowFullPhoneById] = useState({});
    const [priorityPackages, setPriorityPackages] = useState([]);
    const [cppRooms, setCppRooms] = useState([]);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab") || "";
    const category = queryParams.get("category") || "";
    const minPrice = queryParams.get("minPrice") ? Number(queryParams.get("minPrice")) * 1000000 : 0;
    const maxPrice = queryParams.get("maxPrice") ? Number(queryParams.get("maxPrice")) * 1000000 : Infinity;
    const minArea = queryParams.get("minArea") ? Number(queryParams.get("minArea")) : 0;
    const maxArea = queryParams.get("maxArea") ? Number(queryParams.get("maxArea")) : Infinity;

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

    useEffect(() => {
        fetchRooms();
        fetchPriorityData();
    }, []);

    useEffect(() => {
        if (user && user.userId) {
            fetchSavedPosts();
        }
    }, [user]);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const roomsData = await RoomService.getRooms();
            const roomsWithUser = await Promise.all(
                roomsData.map(async (room) => {
                    if (!room.User && room.userId) {
                        try {
                            const userData = await UserService.getUserById(room.userId);
                            return { ...room, User: userData };
                        } catch (error) {
                            console.error(`Error fetching user for room ${room.roomId}:`, error);
                            return room;
                        }
                    }
                    return room;
                })
            );
            setRooms(roomsWithUser);
        } catch (error) {
            console.error('Error fetching Rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedPosts = async () => {
        try {
            const response = await OtherService.getSavedPosts(user.userId);
            if (!response.ok) throw new Error("Lỗi khi lấy danh sách bài đã lưu!");
            const data = await response.json();
            const savedRoomIds = data.map(item => Number(item.roomId)); // Chuyển thành mảng
            setSavedPosts(savedRoomIds);
            localStorage.setItem("savedPosts", JSON.stringify(savedRoomIds));
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bài đã lưu:", error);
        }
    };

    const toggleSavePost = async (roomId, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user || !roomId) {
            showCustomNotification("error", "Bạn cần đăng nhập để lưu tin!");
            return;
        }
        try {
            const result = await OtherService.toggleSavePost(user.userId, roomId);
            setSavedPosts((prevSaved) => {
                const newSaved = [...prevSaved];
                if (result.status === "removed") {
                    const index = newSaved.indexOf(parseInt(roomId));
                    if (index !== -1) newSaved.splice(index, 1);
                } else if (result.status === "saved") {
                    if (!newSaved.includes(parseInt(roomId))) {
                        newSaved.push(parseInt(roomId));
                    }
                }
                localStorage.setItem("savedPosts", JSON.stringify(newSaved));
                return newSaved;
            });
            if (result.status === "saved") {
                showCustomNotification("success", "Lưu tin thành công!");
            }
        } catch (error) {
            console.error("Lỗi khi lưu / xóa bài:", error);
            showCustomNotification("error", "Đã xảy ra lỗi, vui lòng thử lại!");
        }
    };

    if (loading) {
        return (
            <div className="bg-white min-h-screen p-4">
                <Loading />
            </div>
        );
    }

    if (!rooms.length) {
        return (
            <div className="bg-white min-h-screen p-4 flex justify-center">
                <p className="text-black font-semibold">Không tìm thấy phòng nào.</p>
            </div>
        );
    }

    let filteredRooms = rooms;

    // Lọc phòng theo category hoặc tab
    if (category) {
        if (category === "Phòng trọ") {
            filteredRooms = filteredRooms.filter((r) => r.categoryName === "Phòng trọ" || !r.categoryName);
        } else {
            filteredRooms = filteredRooms.filter((r) => r.categoryName === category);
        }
    } else if (tab) {
        if (tab === "Căn hộ") {
            filteredRooms = filteredRooms.filter((r) => r.categoryName === "Căn hộ");
        } else if (tab === "Nhà nguyên căn") {
            filteredRooms = filteredRooms.filter((r) => r.categoryName === "Nhà nguyên căn");
        } else if (tab === "Phòng trọ") {
            filteredRooms = filteredRooms.filter((r) => r.categoryName === "Phòng trọ" || !r.categoryName);
        }
    }

    // Lọc theo các tiêu chí khác
    filteredRooms = filteredRooms.filter((r) => r.status !== 2 && r.status !== 3);
    filteredRooms = filteredRooms.filter((r) => r.isPermission !== 0);
    filteredRooms = filteredRooms.filter((r) => r.price >= minPrice && r.price <= maxPrice);
    filteredRooms = filteredRooms.filter((r) => r.acreage >= minArea && r.acreage <= maxArea);

    // Sắp xếp phòng theo priority (ưu tiên cao hơn lên đầu)
    filteredRooms.sort((a, b) => {
        const priorityA = getPriorityInfo(a.roomId, priorityPackages, cppRooms).value || 0;
        const priorityB = getPriorityInfo(b.roomId, priorityPackages, cppRooms).value || 0;
        return priorityB - priorityA; // Sắp xếp giảm dần theo giá trị ưu tiên
    });

    // Hàm render phòng
    const renderRoom = (room, index) => {
        let images;
        try {
            images = JSON.parse(room.image);
        } catch (error) {
            images = room.image;
        }
        if (!Array.isArray(images)) images = [images];
        const imageCount = images.length;

        const maxWords = 45;
        const words = (room.description || "").split(" ");
        const shortDescription =
            words.length > maxWords
                ? words.slice(0, maxWords).join(" ") + "..."
                : room.description;

        const roomUserPhone = room?.User?.phone || 'N/A';
        const roomMaskedPhone =
            roomUserPhone && roomUserPhone.length > 3
                ? roomUserPhone.slice(0, roomUserPhone.length - 3) + '***'
                : 'N/A';

        const isSaved = savedPosts.includes(Number(room.roomId));
        const priorityInfo = getPriorityInfo(room.roomId, priorityPackages, cppRooms);

        if (index < 3) {
            return (
                <div key={room.roomId}>
                    <Link to={`/Rooms/Details/${room.roomId}`} className="block">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col dark:bg-gray-800">
                            <div className="relative w-full h-52 overflow-hidden rounded-lg dark:text-white">
                                {imageCount < 3 ? (
                                    <img
                                        src={images[0]}
                                        alt={room.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : imageCount === 3 ? (
                                    <div className="flex h-full">
                                        <div className="w-1/2 h-full">
                                            <img
                                                src={images[0]}
                                                alt={room.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="w-1/2 flex flex-col">
                                            <div className="h-1/2">
                                                <img
                                                    src={images[1]}
                                                    alt={room.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="h-1/2">
                                                <img
                                                    src={images[2]}
                                                    alt={room.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-full gap-0.5">
                                        <div className="w-1/2 h-full">
                                            <img
                                                src={images[0]}
                                                alt={room.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="w-1/2 flex flex-col">
                                            <div className="h-1/3">
                                                <img
                                                    src={images[1]}
                                                    alt={room.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="h-1/3">
                                                <img
                                                    src={images[2]}
                                                    alt={room.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="h-1/3 relative">
                                                <img
                                                    src={images[3]}
                                                    alt={room.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                {imageCount > 4 && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-semibold">
                                                        +{imageCount - 4}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {room.categoryName && (
                                    <span className="absolute top-2 left-0 bg-red-600 text-white text-sm font-semibold px-3 py-1 z-10 rounded-r-lg">
                                        {room.categoryName}
                                    </span>
                                )}
                            </div>
                            <div className="p-4 flex flex-col">
                                {priorityInfo.description && (
                                    <p className="text-sm font-semibold bg-red-500 text-white border w-20 px-1 border-red-500 rounded-lg">
                                        {priorityInfo.description}
                                    </p>
                                )}
                                <h3 className="text-lg font-semibold mb-2 line-clamp-2 dark:text-white">{room.title}</h3>
                                <p className="text-red-500 font-semibold mb-2">
                                    {room.price.toLocaleString("vi-VN")} đ • {room.acreage} m²
                                </p>
                                <p className="text-gray-600 mb-2 flex items-center dark:text-white">
                                    <FaMapMarkerAlt className="mr-1" /> {room.locationDetail}
                                </p>
                                <p className="text-gray-600 mb-2 dark:text-white">{shortDescription}</p>
                                <div className="mt-auto flex justify-between items-center border-t pt-2">
                                    <div className="flex items-center gap-3">
                                        {room.User && room.User.profilePicture ? (
                                            <img
                                                src={room.User.profilePicture}
                                                alt={room.User.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                <span className="text-lg font-semibold text-gray-700">
                                                    {room.User && room.User.name
                                                        ? room.User.name.charAt(0).toUpperCase()
                                                        : room.title.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-black font-semibold dark:text-white">
                                                {room.User && room.User.name ? room.User.name : "Chưa xác định"}
                                            </span>
                                            <span className="text-gray-500 dark:text-white">đã đăng lên</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center gap-3 text-2xl">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowFullPhoneById((prev) => ({ ...prev, [room.roomId]: true }));
                                            }}
                                            className="text-lg bg-green-600 text-white px-2 py-1 rounded-lg flex gap-2"
                                        >
                                            <FaPhoneVolume className="mt-1" />
                                            {showFullPhoneById[room.roomId]
                                                ? roomUserPhone
                                                : `${roomMaskedPhone} • Hiện số`}
                                        </button>
                                        <span>|</span>
                                        <button
                                            onClick={(e) => toggleSavePost(room.roomId, e)}
                                            className="text-2xl"
                                        >
                                            {isSaved ? (
                                                <FaHeart className="text-red-500 dark:text-white" />
                                            ) : (
                                                <FaRegHeart className="text-gray-600 dark:text-white" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            );
        } else {
            return (
                <Link key={room.roomId} to={`/Rooms/Details/${room.roomId}`} className="block">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col dark:bg-gray-800 dark:text-white">
                        <div className="flex flex-row">
                            <div className="w-2/5 flex h-[200px] gap-0.5">
                                <div className="relative w-1/2 h-full overflow-hidden">
                                    {imageCount > 0 && (
                                        <img
                                            src={images[0]}
                                            alt={room.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    {room.categoryName && (
                                        <span className="absolute top-2 left-0 bg-red-600 text-white text-sm font-semibold px-3 py-1 z-10 rounded-r-lg">
                                            {room.categoryName}
                                        </span>
                                    )}
                                </div>
                                <div className="w-1/2 h-full flex flex-col gap-0.5">
                                    {images.slice(1, 4).map((img, i) => (
                                        <div key={i} className="relative flex-1 overflow-hidden">
                                            <img
                                                src={img}
                                                alt={`extra-${i}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {i === 2 && imageCount > 4 && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-semibold">
                                                    +{imageCount - 3}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-3/5 p-4 flex flex-col">
                                {priorityInfo.description && (
                                    <p className="text-sm font-semibold bg-red-500 text-white border w-20 px-1 border-red-500 rounded-lg">
                                        {priorityInfo.description}
                                    </p>
                                )}
                                <h3 className="text-lg font-semibold mb-2 line-clamp-2 dark:text-white">{room.title}</h3>
                                <p className="text-red-500 font-semibold mb-2 dark:text-white">
                                    {room.price.toLocaleString("vi-VN")} đ • {room.acreage} m²
                                </p>
                                <p className="text-gray-600 mb-2 flex items-center dark:text-white">
                                    <FaMapMarkerAlt className="mr-1" /> {room.locationDetail}
                                </p>
                                <p className="text-gray-600 mb-2 dark:text-white">{shortDescription}</p>
                            </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center border-t py-3 px-4">
                            <div className="flex items-center gap-3">
                                {room.User && room.User.profilePicture ? (
                                    <img
                                        src={room.User.profilePicture}
                                        alt={room.User.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-lg font-semibold text-gray-700">
                                            {room.User && room.User.name
                                                ? room.User.name.charAt(0).toUpperCase()
                                                : room.title.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-black font-semibold dark:text-white">
                                        {room.User && room.User.name ? room.User.name : "Chưa xác định"}
                                    </span>
                                    <span className="text-gray-500 dark:text-white">đã đăng lên</span>
                                </div>
                            </div>
                            <div className="flex justify-end items-center gap-3 text-2xl">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowFullPhoneById((prev) => ({ ...prev, [room.roomId]: true }));
                                    }}
                                    className="text-lg bg-green-600 text-white px-2 py-1 rounded-lg flex gap-2"
                                >
                                    <FaPhoneVolume className="mt-1" />
                                    {showFullPhoneById[room.roomId]
                                        ? roomUserPhone
                                        : `${roomMaskedPhone} • Hiện số`}
                                </button>
                                <span>|</span>
                                <button
                                    onClick={(e) => toggleSavePost(room.roomId, e)}
                                    className="text-2xl"
                                >
                                    {isSaved ? (
                                        <FaHeart className="text-red-500 dark:text-white" />
                                    ) : (
                                        <FaRegHeart className="text-gray-600 dark:text-white" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </Link>
            );
        }
    };

    return (
        <div className="bg-white min-h-screen p-4 dark:bg-gray-800">
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-full">
                        <Searchbar />
                    </div>
                </div>
                <div className="flex max-w-6xl mx-auto">
                    <div className="w-3/4 bg-white p-4 rounded shadow space-y-3 dark:bg-gray-800 dark:text-white">
                        <h1 className="text-2xl font-semibold">{category || tab || 'Tất cả phòng'}</h1>
                        {(category || tab) && (
                            <div className="flex justify-between">
                                <p className="mb-2">Hiện có {filteredRooms.length} {(category || tab).toLowerCase()}.</p>
                            </div>
                        )}
                        {filteredRooms.length > 0 ? (
                            filteredRooms.map((room, index) => renderRoom(room, index))
                        ) : (
                            <p className="text-gray-500 dark:text-white">Không có phòng nào để hiển thị.</p>
                        )}
                        <FAQList />
                    </div>

                    <div className="w-1/4 pl-4">
                        <div className="bg-white p-4 rounded shadow mb-4 dark:bg-gray-800 dark:text-white">
                            <h3 className="font-bold mb-2">Lọc theo khoảng giá</h3>
                            <ul>
                                {[
                                    <Link to="/Rooms?tab=Phòng+trọ&maxPrice=1" className='hover:text-gray-500'>Dưới 1 triệu</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minPrice=1&maxPrice=3" className='hover:text-gray-500'>1 - 3 triệu</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minPrice=3&maxPrice=5" className='hover:text-gray-500'>3 - 5 triệu</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minPrice=5&maxPrice=10" className='hover:text-gray-500'>5 - 10 triệu</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minPrice=10&maxPrice=20" className='hover:text-gray-500'>10 - 20 triệu</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minPrice=20&maxPrice=40" className='hover:text-gray-500'>20 - 40 triệu</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minPrice=40&maxPrice=70" className='hover:text-gray-500'>40 - 70 triệu</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minPrice=70" className='hover:text-gray-500'>Trên 70 triệu</Link>,
                                ].map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-4 rounded shadow dark:bg-gray-800 dark:text-white">
                            <h3 className="font-bold mb-2">Lọc theo diện tích</h3>
                            <ul>
                                {[
                                    <Link to="/Rooms?tab=Phòng+trọ&maxArea=30" className='hover:text-gray-500'>Dưới 30 m²</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minArea=30&maxArea=50" className='hover:text-gray-500'>30 - 50 m²</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minArea=50&maxArea=80" className='hover:text-gray-500'>50 - 80 m²</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minArea=80&maxArea=100" className='hover:text-gray-500'>80 - 100 m²</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minArea=100&maxArea=150" className='hover:text-gray-500'>100 - 150 m²</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minArea=150&maxArea=200" className='hover:text-gray-500'>150 - 200 m²</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minArea=200&maxArea=250" className='hover:text-gray-500'>200 - 250 m²</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minArea=250&maxArea=300" className='hover:text-gray-500'>250 - 300 m²</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minArea=300&maxArea=500" className='hover:text-gray-500'>300 - 500 m²</Link>,
                                    <Link to="/Rooms?tab=Phòng+trọ&minArea=500" className='hover:text-gray-500'>Trên 500 m²</Link>,
                                ].map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default RoomsList;