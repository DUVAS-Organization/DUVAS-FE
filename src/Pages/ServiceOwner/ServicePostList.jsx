import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import SidebarUser from '../../Components/Layout/SidebarUser';
import { useNavigate } from 'react-router-dom';
import Loading from '../../Components/Loading';
import { FaMapMarkerAlt, FaEdit, FaTrash } from 'react-icons/fa';
import Footer from '../../Components/Layout/Footer';
import ServiceManageService from '../../Services/ServiceOwner/ServiceManageService';
import { useAuth } from '../../Context/AuthProvider';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { showCustomNotification } from '../../Components/Notification';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
    color: theme.palette.text.secondary,
    cursor: 'pointer',
    transition: 'transform 0.2s',
    width: '250px',
    height: '350px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    '&:hover': {
        transform: 'scale(1.02)',
    },
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
}));

const ServicePostOwner = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState(null);
    const { user } = useAuth();

    const fetchAllPosts = async () => {
        setLoading(true);
        try {
            const response = await ServiceManageService.getMyServices();
            console.log('API response:', response); // Log để debug
            const postsData = response.services || [];

            const formattedPosts = postsData.map((post) => {
                let images = [];
                try {
                    images = JSON.parse(post.image || '[]');
                    if (!Array.isArray(images)) images = [images];
                } catch (error) {
                    console.error(`Error parsing image for post ${post.servicePostId}:`, error);
                    images = [post.image || 'https://via.placeholder.com/250x350'];
                }

                return {
                    servicePostId: post.servicePostId,
                    title: post.title || `Dịch vụ ${post.servicePostId}`,
                    image: images[0] || 'https://via.placeholder.com/250x350',
                    location: post.location || 'Chưa xác định',
                    price: post.price || 0,
                    description: post.description || 'Không có mô tả',
                    categoryServiceName: post.categoryServiceName || 'Không xác định',
                    createdDate: post.createdDate || new Date(),
                    isPermission: post.isPermission !== undefined ? post.isPermission : 1,
                };
            });

            formattedPosts.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            setPosts(formattedPosts);
        } catch (error) {
            console.error('Error fetching service posts:', error);
            setPosts([]);
            const errorMessage = error.message || 'Không thể tải danh sách bài đăng dịch vụ.';
            showCustomNotification('error', errorMessage);
            if (errorMessage.includes('No authentication token found') || errorMessage.includes('Phiên đăng nhập hết hạn')) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchPostsByStatus = async (status) => {
        setLoading(true);
        try {
            const response = await ServiceManageService.getMyServices();
            console.log('API response (filtered):', response);
            const postsData = response.services || [];

            const filteredPosts = postsData
                .filter((post) => post.isPermission === status)
                .map((post) => {
                    let images = [];
                    try {
                        images = JSON.parse(post.image || '[]');
                        if (!Array.isArray(images)) images = [images];
                    } catch (error) {
                        console.error(`Error parsing image for post ${post.servicePostId}:`, error);
                        images = [post.image || 'https://via.placeholder.com/250x350'];
                    }

                    return {
                        servicePostId: post.servicePostId,
                        title: post.title || `Dịch vụ ${post.servicePostId}`,
                        image: images[0] || 'https://via.placeholder.com/250x350',
                        location: post.location || 'Chưa xác định',
                        price: post.price || 0,
                        description: post.description || 'Không có mô tả',
                        categoryServiceName: post.categoryServiceName || 'Không xác định',
                        createdDate: post.createdDate || new Date(),
                        isPermission: post.isPermission !== undefined ? post.isPermission : 1,
                    };
                });

            filteredPosts.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            setPosts(filteredPosts);
        } catch (error) {
            console.error(`Error fetching posts with status ${status}:`, error);
            setPosts([]);
            const errorMessage = error.message || `Không thể tải danh sách bài đăng với trạng thái ${status === 1 ? 'đang hoạt động' : 'không hoạt động'}.`;
            showCustomNotification('error', errorMessage);
            if (errorMessage.includes('No authentication token found') || errorMessage.includes('Phiên đăng nhập hết hạn')) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (servicePostId, e) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc muốn xóa bài đăng này?')) {
            try {
                await ServiceManageService.deleteService(servicePostId);
                showCustomNotification('success', 'Xóa bài đăng thành công.');
                fetchAllPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
                const errorMessage = error.message || 'Không thể xóa bài đăng.';
                showCustomNotification('error', errorMessage);
                if (errorMessage.includes('No authentication token found') || errorMessage.includes('Phiên đăng nhập hết hạn')) {
                    navigate('/login');
                }
            }
        }
    };

    const handleFilterByStatus = (status) => {
        setActiveStatus(status);
        if (status === null) {
            fetchAllPosts();
        } else {
            fetchPostsByStatus(status);
        }
    };

    useEffect(() => {
        if (!user) {
            showCustomNotification('error', 'Vui lòng đăng nhập để xem danh sách bài đăng.');
            setLoading(false);
            navigate('/login');
            return;
        }
        fetchAllPosts();
    }, [user, navigate]);

    if (loading) {
        return (
            <div className="bg-white p-4 dark:bg-gray-800 dark:text-white">
                <Loading />
            </div>
        );
    }

    return (
        <div>
            <SidebarUser />
            <Box className="max-w-7xl mx-auto ml-60 dark:bg-gray-800 dark:text-white" sx={{ flexGrow: 1 }}>
                <div className="pt-6 mb-4 flex flex-wrap space-x-4 items-center">
                    <button
                        onClick={() => handleFilterByStatus(null)}
                        className={`px-4 py-2 rounded ${activeStatus === null ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-800 dark:text-white'}`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => handleFilterByStatus(1)}
                        className={`px-4 py-2 rounded ${activeStatus === 1 ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-800 dark:text-white'}`}
                    >
                        Đang hoạt động
                    </button>
                    <button
                        onClick={() => handleFilterByStatus(0)}
                        className={`px-4 py-2 rounded ${activeStatus === 0 ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-800 dark:text-white'}`}
                    >
                        Không hoạt động
                    </button>
                </div>
                {posts.length === 0 ? (
                    <p className="text-black font-semibold text-center dark:text-white">
                        {activeStatus === null
                            ? 'Bạn hiện không có bài đăng dịch vụ nào trong hệ thống.'
                            : `Không có bài đăng nào ${activeStatus === 1 ? 'đang hoạt động' : 'không hoạt động'}.`}
                    </p>
                ) : (
                    <Grid container spacing={8} className="mt-4">
                        {posts.map((post) => (
                            <Grid key={post.servicePostId} item xs={12} sm={6} md={4}>
                                <Item onClick={() => navigate(`/ServiceOwner/ServicePosts/Edit/${post.servicePostId}`)}>
                                    <div className="flex flex-col h-full dark:bg-gray-800 dark:text-white">
                                        <div className="relative">
                                            <img
                                                className={`rounded-t-lg shadow-md overflow-hidden w-full h-48 object-cover ${post.isPermission === 0 ? 'opacity-30' : ''}`}
                                                alt={post.title || 'Image of a service'}
                                                src={post.image}
                                            />
                                            {post.isPermission === 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="relative w-full h-full">
                                                        <div className="absolute top-0 left-0 w-full h-full bg-transparent flex items-center justify-center">
                                                            <span className="text-red-700 text-2xl font-bold transform -rotate-45">
                                                                Đã bị khóa
                                                            </span>
                                                        </div>
                                                        <div className="absolute top-1/2 left-1/2 w-36 h-36 rounded-full border-8 border-red-700 transform -rotate-45 -translate-x-1/2 -translate-y-1/2"></div>
                                                    </div>
                                                </div>
                                            )}
                                            <div
                                                className="absolute top-2 right-0 bg-white bg-opacity-70 px-2 py-1 rounded cursor-pointer hover:bg-opacity-100"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/ServiceOwner/ServicePosts/Edit/${post.servicePostId}`);
                                                }}
                                                title="Chỉnh sửa bài đăng"
                                            >
                                                <FaEdit className="text-red-500 text-2xl" />
                                            </div>
                                            {/* <div
                                                className="absolute top-10 right-0 bg-white bg-opacity-70 px-2 py-1 rounded cursor-pointer hover:bg-opacity-100"
                                                onClick={(e) => handleDeletePost(post.servicePostId, e)}
                                                title="Xóa bài đăng"
                                            >
                                                <FaTrash className="text-red-500 text-2xl" />
                                            </div> */}
                                        </div>
                                        <div className="flex flex-col flex-grow p-2 justify-between max-h-[355px]">
                                            <p className="text-black text-base font-semibold truncate max-w-[250px] dark:text-white">
                                                {post.title}
                                            </p>
                                            <p className="text-gray-600 flex items-center mt-1 text-sm truncate max-w-[250px] dark:text-white">
                                                <FaMapMarkerAlt className="absolute" />
                                                <span className="ml-5">{post.location || 'Vị trí không xác định'}</span>
                                            </p>
                                            <p className="text-gray-600 text-sm mt-1 dark:text-white">
                                                Danh mục: {post.categoryServiceName}
                                            </p>
                                            <p className="text-red-500 font-medium text-base mt-1">
                                                {post.price ? `${post.price.toLocaleString('vi-VN')} đ` : 'Thỏa thuận'}
                                            </p>
                                            <p className="text-gray-600 text-sm mt-1 dark:text-white">
                                                Ngày đăng: {format(new Date(post.createdDate), 'dd-MM-yyyy HH:mm:ss', { locale: vi })}
                                            </p>
                                        </div>
                                    </div>
                                </Item>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
            <Footer />
        </div>
    );
};

export default ServicePostOwner;