import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import ServicePostService from '../../../Services/Admin/ServicePost';
import UserService from '../../../Services/User/UserService';
import { FaRegBell, FaMapMarkerAlt, FaRegHeart, FaHeart } from 'react-icons/fa';
import Searchbar from '../../../Components/Searchbar';
import Footer from '../../../Components/Layout/Footer';
import { useAuth } from '../../../Context/AuthProvider';
import FAQList from '../../../Components/FAQ/FAQList';
import Loading from '../../../Components/Loading';
import { showCustomNotification } from '../../../Components/Notification';
import { FaPhoneVolume } from 'react-icons/fa6';
import OtherService from '../../../Services/User/OtherService';

const ServicePostList = () => {
    const [servicePosts, setServicePosts] = useState([]);
    const [visiblePosts, setVisiblePosts] = useState(6);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [savedPosts, setSavedPosts] = useState(() => {
        const local = localStorage.getItem('savedPosts');
        return local ? JSON.parse(local).map(id => Number(id)) : [];
    });
    const [showFullPhoneById, setShowFullPhoneById] = useState({});

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab');
    const categoryServiceId = queryParams.get('categoryServiceId') || '';
    const minPrice = queryParams.get('minPrice') ? Number(queryParams.get('minPrice')) * 1000000 : 0;
    const maxPrice = queryParams.get('maxPrice') ? Number(queryParams.get('maxPrice')) * 1000000 : Infinity;

    useEffect(() => {
        fetchServicePosts();
    }, [location.search]);

    useEffect(() => {
        if (user && user.userId) {
            fetchSavedPosts();
        }
    }, [user]);

    const fetchServicePosts = async () => {
        setLoading(true);
        try {
            const postsData = await ServicePostService.getServicePosts();
            const postsWithUser = await Promise.all(postsData.map(async (post) => {
                try {
                    const userData = await UserService.getUserById(post.userId);
                    return {
                        ...post,
                        User: userData || { name: 'Chưa xác định', phone: 'N/A', profilePicture: null }
                    };
                } catch (error) {
                    console.error(`Error fetching user for post ${post.servicePostId}:`, error);
                    return {
                        ...post,
                        User: { name: 'Chưa xác định', phone: 'N/A', profilePicture: null }
                    };
                }
            }));
            setServicePosts(postsWithUser || []);
        } catch (error) {
            console.error('Error fetching Service Posts:', error);
            setServicePosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (categoryName) => {
        navigate(`/ServicePosts?tab=${encodeURIComponent(categoryName)}`);
    };

    const handleLoadMore = () => {
        setVisiblePosts((prev) => prev + 3);
    };

    const handleViewMore = () => {
        navigate('/ServicePosts');
    };

    const fetchSavedPosts = async () => {
        try {
            const response = await OtherService.getSavedPosts(user.userId);
            if (!response.ok) throw new Error("Lỗi khi lấy danh sách bài đã lưu!");
            const data = await response.json();
            const savedRoomIds = new Set(data.map(item => item.roomId));
            setSavedPosts(savedRoomIds);
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
                const newSaved = new Set(prevSaved);
                if (result.status === "removed") {
                    newSaved.delete(parseInt(roomId));
                } else if (result.status === "saved") {
                    newSaved.add(parseInt(roomId));
                }
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
        return <div className="bg-white min-h-screen p-4"><Loading /></div>;
    }

    if (!servicePosts.length) {
        return (
            <div className="bg-white min-h-screen p-4 flex justify-center">
                <p className="text-black font-semibold">Không tìm thấy dịch vụ nào.</p>
            </div>
        );
    }

    // Lọc bài đăng
    let filteredPosts = servicePosts;
    if (categoryServiceId) {
        filteredPosts = filteredPosts.filter(post => post.categoryServiceId === Number(categoryServiceId));
    }
    if (tab) {
        filteredPosts = filteredPosts.filter(post => post.categoryServiceName === tab);
    }
    const priceFilteredPosts = filteredPosts.filter(post => post.price >= minPrice && post.price <= maxPrice);

    if (servicePosts.length > 0 && !priceFilteredPosts.length) {
        return (
            <div className="bg-white min-h-screen p-4 flex justify-center">
                <p className="text-black font-semibold">
                    Không tìm thấy <span className="text-red-500">"{tab || 'dịch vụ'}"</span> nào.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen p-4 dark:bg-gray-800 ">
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-full">
                        <Searchbar />
                    </div>
                </div>
                <div className="flex max-w-6xl mx-auto">
                    <div className="w-3/4 bg-white p-4 rounded shadow space-y-3 dark:bg-gray-800 dark:text-white">
                        <h1 className="text-2xl font-semibold">{tab ? tab : 'Tất cả dịch vụ'}</h1>
                        <div className="flex justify-between">
                            <p className="mb-2 flex">Hiện có {priceFilteredPosts.length} dịch vụ {tab ? tab.toLowerCase() : 'tất cả'}.</p>
                            {/* <div className="flex items-center">
                                <FaRegBell className="bg-yellow-500 text-white px-2 text-4xl rounded-full" />
                                <p className="mx-1">Nhận email tin mới</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-red-600 peer-focus:ring-4 peer-focus:ring-white dark:peer-focus:ring-red-800 dark:bg-gray-700 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:border-white"></div>
                                </label>
                            </div> */}
                        </div>

                        {priceFilteredPosts.slice(0, visiblePosts).map((post, index) => {
                            let images;
                            try {
                                images = JSON.parse(post.image);
                            } catch (error) {
                                images = post.image;
                            }
                            if (!Array.isArray(images)) images = [images];
                            const imageCount = images.length;

                            const maxWords = 45;
                            const words = (post.description || '').split(' ');
                            const shortDescription =
                                words.length > maxWords
                                    ? words.slice(0, maxWords).join(' ') + '...'
                                    : post.description;

                            const postUserPhone = post.User?.phone || 'N/A';
                            const postMaskedPhone =
                                postUserPhone && postUserPhone.length > 3
                                    ? postUserPhone.slice(0, postUserPhone.length - 3) + '***'
                                    : 'N/A';

                            const isSaved = savedPosts.includes(Number(post.servicePostId));

                            if (index < 3) {
                                return (
                                    <div key={post.servicePostId}>
                                        <Link to={`/ServicePosts/Details/${post.servicePostId}`} className="block">
                                            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col dark:bg-gray-800 dark:text-white">
                                                <div className="relative w-full h-52 overflow-hidden rounded-lg">
                                                    {imageCount < 3 ? (
                                                        <img src={images[0]} alt={post.title} className="w-full h-full object-cover" />
                                                    ) : imageCount === 3 ? (
                                                        <div className="flex h-full">
                                                            <div className="w-1/2 h-full">
                                                                <img src={images[0]} alt={post.title} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="w-1/2 flex flex-col">
                                                                <div className="h-1/2">
                                                                    <img src={images[1]} alt={post.title} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="h-1/2">
                                                                    <img src={images[2]} alt={post.title} className="w-full h-full object-cover" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-full gap-0.5">
                                                            <div className="w-1/2 h-full">
                                                                <img src={images[0]} alt={post.title} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="w-1/2 flex flex-col">
                                                                <div className="h-1/3">
                                                                    <img src={images[1]} alt={post.title} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="h-1/3">
                                                                    <img src={images[2]} alt={post.title} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="h-1/3 relative">
                                                                    <img src={images[3]} alt={post.title} className="w-full h-full object-cover" />
                                                                    {imageCount > 4 && (
                                                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-semibold">
                                                                            +{imageCount - 4}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {post.categoryServiceName && (
                                                        <span className="absolute top-2 left-0 bg-red-600 text-white text-sm font-semibold px-3 py-1 z-10 rounded-r-lg">
                                                            {post.categoryServiceName}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="p-4 flex flex-col">
                                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 dark:text-white">{post.title}</h3>
                                                    <p className="text-red-500 font-semibold mb-2">{post.price.toLocaleString('vi-VN')} đ</p>
                                                    <p className="text-gray-600 mb-2 flex items-center dark:text-white">
                                                        <FaMapMarkerAlt className="mr-1" /> {post.location}
                                                    </p>
                                                    <p className="text-gray-600 mb-2 dark:text-white">{shortDescription}</p>
                                                    <div className="mt-auto flex justify-between items-center border-t pt-2">
                                                        <div className="flex items-center gap-3">
                                                            {post.User?.profilePicture ? (
                                                                <img src={post.User.profilePicture} alt={post.User.name} className="w-10 h-10 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                    <span className="text-lg font-semibold text-gray-700">
                                                                        {post.User?.name ? post.User.name.charAt(0).toUpperCase() : post.title.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span className="text-black font-semibold dark:text-white">
                                                                    {post.User?.name || 'Chưa xác định'}
                                                                </span>
                                                                <span className="text-gray-500 dark:text-white">đã đăng lên</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end items-center gap-3 text-2xl">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setShowFullPhoneById((prev) => ({ ...prev, [post.servicePostId]: true }));
                                                                }}
                                                                className="text-lg bg-green-600 text-white px-2 py-1 rounded-lg flex gap-2"
                                                            >
                                                                <FaPhoneVolume className="mt-1" />
                                                                {showFullPhoneById[post.servicePostId]
                                                                    ? postUserPhone
                                                                    : `${postMaskedPhone} • Hiện số`}
                                                            </button>
                                                            <span>|</span>
                                                            <button
                                                                onClick={(e) => toggleSavePost(post.servicePostId, e)}
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
                                    <Link key={post.servicePostId} to={`/ServicePosts/Details/${post.servicePostId}`} className="block ">
                                        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col dark:bg-gray-800 dark:text-white">
                                            <div className="flex flex-row">
                                                <div className="w-2/5 flex h-[200px] gap-0.5">
                                                    <div className="relative w-1/2 h-full overflow-hidden">
                                                        {imageCount > 0 && (
                                                            <img src={images[0]} alt={post.title} className="w-full h-full object-cover" />
                                                        )}
                                                        {post.categoryServiceName && (
                                                            <span className="absolute top-2 left-0 bg-red-600 text-white text-sm font-semibold px-3 py-1 z-10 rounded-r-lg">
                                                                {post.categoryServiceName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="w-1/2 h-full flex flex-col gap-0.5">
                                                        {images.slice(1, 4).map((img, i) => (
                                                            <div key={i} className="relative flex-1 overflow-hidden">
                                                                <img src={img} alt={`extra-${i}`} className="w-full h-full object-cover" />
                                                                {i === 2 && imageCount > 4 && (
                                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-semibold">
                                                                        +{imageCount - 3}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="w-3/5 p-4 flex flex-col ">
                                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 dark:text-white">{post.title}</h3>
                                                    <p className="text-red-500 font-semibold mb-2">{post.price.toLocaleString('vi-VN')} đ</p>
                                                    <p className="text-gray-600 mb-2 flex items-center dark:text-white">
                                                        <FaMapMarkerAlt className="mr-1" /> {post.location}
                                                    </p>
                                                    <p className="text-gray-600 mb-2 dark:text-white">{shortDescription}</p>
                                                </div>
                                            </div>
                                            <div className="mt-auto flex justify-between items-center border-t py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    {post.User?.profilePicture ? (
                                                        <img src={post.User.profilePicture} alt={post.User.name} className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center ">
                                                            <span className="text-lg font-semibold text-gray-700 ">
                                                                {post.User?.name ? post.User.name.charAt(0).toUpperCase() : post.title.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-black font-semibold dark:text-white">
                                                            {post.User?.name || 'Chưa xác định'}
                                                        </span>
                                                        <span className="text-gray-500 dark:text-white">đã đăng lên</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end items-center gap-3 text-2xl">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setShowFullPhoneById((prev) => ({ ...prev, [post.servicePostId]: true }));
                                                        }}
                                                        className="text-lg bg-green-600 text-white px-2 py-1 rounded-lg flex gap-2"
                                                    >
                                                        <FaPhoneVolume className="mt-1" />
                                                        {showFullPhoneById[post.servicePostId]
                                                            ? postUserPhone
                                                            : `${postMaskedPhone} • Hiện số`}
                                                    </button>
                                                    <span>|</span>
                                                    <button
                                                        onClick={(e) => toggleSavePost(post.servicePostId, e)}
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
                        })}

                        {visiblePosts < priceFilteredPosts.length && (
                            <div className="flex justify-center mt-6">
                                {visiblePosts < 99 ? (
                                    <button
                                        onClick={handleLoadMore}
                                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                                    >
                                        Xem thêm
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleViewMore}
                                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                                    >
                                        Xem tiếp
                                    </button>
                                )}
                            </div>
                        )}
                        <FAQList />
                    </div>

                    <div className="w-1/4 pl-4">
                        <div className="bg-white p-4 rounded shadow mb-4 dark:bg-gray-800 dark:text-white">
                            <h3 className="font-bold mb-2">Lọc theo khoảng giá</h3>
                            <ul>
                                {[
                                    'Thỏa thuận',
                                    'Dưới 1 triệu',
                                    '1 - 3 triệu',
                                    '3 - 5 triệu',
                                    '5 - 10 triệu',
                                    '10 - 20 triệu',
                                    '20 - 40 triệu',
                                    '40 - 70 triệu',
                                    'Trên 70 triệu',
                                ].map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-4 rounded shadow dark:bg-gray-800 dark:text-white">
                            <h3 className="font-bold mb-2">Lọc theo thời gian</h3>
                            <ul>
                                {['Mới nhất', 'Cũ nhất', 'Gần đây'].map((item, index) => (
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

export default ServicePostList;