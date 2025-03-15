import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { FaCamera, FaMapMarkerAlt, FaRegHeart, FaHeart } from 'react-icons/fa';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthProvider';
import ServicePost from '../../Services/Admin/ServicePost';
import { showCustomNotification } from '../Notification';
import Loading from '../Loading';

const Item = styled('div')(({ theme, $vertical }) => ({
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: $vertical ? 'column' : 'row', // nếu $vertical true => layout dọc, ngược lại row
    boxShadow: theme.shadows[3],
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: theme.shadows[6],
    },
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
}));

const ServicePostsHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [servicePosts, setServicePosts] = useState([]);
    const [filteredServicePosts, setFilteredServicePosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState(new Set());
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hoveredPostId, setHoveredPostId] = useState(null);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const minPriceQuery = queryParams.get("minPrice") ? Number(queryParams.get("minPrice")) : 0;
    const maxPriceQuery = queryParams.get("maxPrice") ? Number(queryParams.get("maxPrice")) : Infinity;

    useEffect(() => {
        fetchServicePosts();
    }, []);

    useEffect(() => {
        if (user && user.userId) {
            fetchSavedPosts();
        }
    }, [user]);

    useEffect(() => {
        const filtered = servicePosts.filter(post => {
            const priceMatch = post.price >= minPriceQuery && post.price <= maxPriceQuery;
            return priceMatch;
        });
        setFilteredServicePosts(filtered);
    }, [servicePosts, minPriceQuery, maxPriceQuery]);

    useEffect(() => {
        if (filteredServicePosts.length <= 1) return;
        const interval = setInterval(() => {
            if (hoveredPostId === null && filteredServicePosts.length > 0) {
                setCurrentIndex(prevIndex =>
                    prevIndex === filteredServicePosts.length - 1 ? 0 : prevIndex + 1
                );
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [filteredServicePosts, hoveredPostId]);

    const fetchServicePosts = async () => {
        try {
            const data = await ServicePost.getServicePosts();
            console.log('Service Posts:', data);
            setServicePosts(data || []);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách bài đăng dịch vụ:', error);
        }
    };

    const fetchSavedPosts = async () => {
        try {
            const response = await fetch(`https://localhost:8000/api/SavedPosts/${user.userId}`);
            if (!response.ok) throw new Error("Lỗi khi lấy danh sách bài đã lưu!");
            const data = await response.json();
            const savedServicePostIds = new Set(data.map(item => item.servicePostId));
            setSavedPosts(savedServicePostIds);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bài đã lưu:", error);
        }
    };

    const toggleSavePost = async (servicePostId, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user || !servicePostId) {
            showCustomNotification("error", "Bạn cần đăng nhập để lưu tin!");
            return;
        }
        try {
            const response = await fetch("https://localhost:8000/api/SavedPosts/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.userId, servicePostId: parseInt(servicePostId) }),
            });
            if (!response.ok) {
                throw new Error("Lỗi khi lưu/xóa bài đăng");
            }
            const result = await response.json();
            setSavedPosts(prevSaved => {
                const newSaved = new Set(prevSaved);
                if (result.status === "removed") {
                    newSaved.delete(parseInt(servicePostId));
                } else if (result.status === "saved") {
                    newSaved.add(parseInt(servicePostId));
                }
                return newSaved;
            });
        } catch (error) {
            console.error("Lỗi khi lưu / xóa bài:", error);
            showCustomNotification("error", "Không thể lưu tin này!");
        }
    };

    // Hàm render card
    // isDoubleHeight = true: card hiển thị theo layout dọc, dành cho cột chính khi có 3 hoặc nhiều bài.
    const renderFullCard = (post, isDoubleHeight = false) => {
        let images;
        try {
            images = JSON.parse(post.image || '[]');
        } catch (error) {
            console.error(`Lỗi parse image bài đăng ${post.servicePostId}:`, error);
            images = post.image ? [post.image] : [];
        }
        if (!Array.isArray(images)) images = [images];
        const imageCount = images.length;
        const firstImage =
            images[0] ||
            'https://storage.googleapis.com/a1aa/image/DEtIGStEO_sg24yKvGcjViznxp5GVEZmRfoqAcQ5GHI.jpg';
        const isSaved = savedPosts.has(post.servicePostId);

        return (
            <Link to={`/ServicePosts/Details/${post.servicePostId}`} className="block">
                <Item className={`mb-4 ${isDoubleHeight ? 'h-[417px]' : 'h-48'}`} $vertical={isDoubleHeight}>
                    {isDoubleHeight ? (
                        <>
                            {/* Layout dọc: ảnh ở trên */}
                            <div className="relative w-full h-1/2">
                                <img
                                    src={firstImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                                {post.categoryServiceName && (
                                    <span className="absolute top-2 left-0 bg-red-600 text-white text-sm font-semibold px-3 py-1 z-10 rounded-r-lg">
                                        {post.categoryServiceName}
                                    </span>
                                )}
                            </div>
                            {/* Nội dung bên dưới, xếp theo chiều dọc */}
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-lg font-semibold mb-1 truncate">{post.title}</h3>
                                <p className="text-gray-600 mb-1 flex items-center">
                                    <FaMapMarkerAlt className="mr-1" />
                                    {post.location}
                                </p>
                                <p className="text-red-500 font-semibold mb-1">
                                    {post.price.toLocaleString('vi-VN')} đ
                                </p>
                                <p className="text-gray-600 mb-2 line-clamp-2">{post.description}</p>
                                <div className="mt-auto flex justify-between items-center">
                                    <button
                                        onClick={(e) => toggleSavePost(post.servicePostId, e)}
                                        className="text-xl"
                                    >
                                        {isSaved ? (
                                            <FaHeart className="text-red-500" />
                                        ) : (
                                            <FaRegHeart className="text-gray-600" />
                                        )}
                                    </button>
                                    <span className="text-gray-600 flex items-center">
                                        <FaCamera className="mr-1" /> {imageCount}
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Layout ngang: ảnh bên trái, nội dung bên phải */}
                            <div className="relative w-48 h-full flex-shrink-0">
                                <img
                                    src={firstImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                                {post.categoryServiceName && (
                                    <span className="absolute top-2 left-0 bg-red-600 text-white text-sm font-semibold px-3 py-1 z-10 rounded-r-lg">
                                        {post.categoryServiceName}
                                    </span>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-lg font-semibold mb-1 truncate">{post.title}</h3>
                                <p className="text-gray-600 mb-1 flex items-center">
                                    <FaMapMarkerAlt className="mr-1" />
                                    {post.location}
                                </p>
                                <p className="text-red-500 font-semibold mb-1">
                                    {post.price.toLocaleString('vi-VN')} đ
                                </p>
                                <p className="text-gray-600 mb-2 line-clamp-1">{post.description}</p>
                                <div className="mt-auto flex justify-between items-center">
                                    <button
                                        onClick={(e) => toggleSavePost(post.servicePostId, e)}
                                        className="text-xl"
                                    >
                                        {isSaved ? (
                                            <FaHeart className="text-red-500" />
                                        ) : (
                                            <FaRegHeart className="text-gray-600" />
                                        )}
                                    </button>
                                    <span className="text-gray-600 flex items-center">
                                        <FaCamera className="mr-1" /> {imageCount}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </Item>
            </Link>
        );
    };

    // Khi có 4 bài trở lên: chia lưới theo tỉ lệ 2/3 cho cột trái và 1/3 cho cột phải,
    // cột trái hiển thị card chính với layout dọc, cột phải hiển thị danh sách link tiêu đề với text size lớn.
    const renderForFourOrMore = () => (
        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
                {displayedPost && renderFullCard(displayedPost, true)}
            </div>
            <div className="col-span-1 flex flex-col gap-2">
                {filteredServicePosts.map((post) => (
                    <Link
                        key={post.servicePostId}
                        to={`/ServicePosts/Details/${post.servicePostId}`}
                        className="block text-xl font-bold px-2 py-1 text-gray-600 hover:text-white hover:bg-red-500 rounded truncate"
                        onMouseEnter={() => setHoveredPostId(post.servicePostId)}
                        onMouseLeave={() => setHoveredPostId(null)}
                    >
                        {post.title}
                    </Link>
                ))}
            </div>
        </div>
    );

    const displayedPost = hoveredPostId !== null
        ? filteredServicePosts.find(post => post.servicePostId === hoveredPostId)
        : filteredServicePosts[currentIndex] || filteredServicePosts[0];

    if (!servicePosts.length) {
        return (
            <div className="bg-white p-4 flex justify-center">
                <p className="text-black font-semibold">Không tìm thấy bài đăng dịch vụ nào.</p>
            </div>
        );
    }

    return (
        <div className="">
            <div className="container mx-auto">
                <div className="p-4">
                    {filteredServicePosts.length === 0 ? (
                        <p className="text-black font-semibold">Không tìm thấy bài đăng dịch vụ nào.</p>
                    ) : filteredServicePosts.length === 1 ? (
                        <div className="w-full">
                            {renderFullCard(filteredServicePosts[0])}
                        </div>
                    ) : filteredServicePosts.length === 2 ? (
                        <div className="w-full">
                            {filteredServicePosts.map((post) => renderFullCard(post))}
                        </div>
                    ) : filteredServicePosts.length === 3 ? (
                        <div className="grid grid-cols-2 gap-6" style={{ height: '384px' }}>
                            <div className="col-span-1 h-full">
                                {renderFullCard(filteredServicePosts[0], true)}
                            </div>
                            <div className="col-span-1 flex flex-col gap-4">
                                {filteredServicePosts.slice(1).map((post) => (
                                    <div key={post.servicePostId} className="h-full">
                                        {renderFullCard(post, false)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // 4 bài trở lên: chia lưới theo tỉ lệ 2/3 - 1/3, cột trái cũng layout dọc
                        renderForFourOrMore()
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServicePostsHome;
