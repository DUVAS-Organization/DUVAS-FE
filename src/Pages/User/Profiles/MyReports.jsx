import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import OtherService from '../../../Services/User/OtherService';
import { showCustomNotification } from '../../../Components/Notification';
import Loading from '../../../Components/Loading';
import Layout from '../../../Components/Layout/Layout';
import Footer from '../../../Components/Layout/Footer';

const MyReports = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImages, setCurrentImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [localIdCounter, setLocalIdCounter] = useState(1);

    useEffect(() => {
        const fetchMyReports = async () => {
            if (!user?.token) {
                setError('Vui lòng đăng nhập để xem báo cáo.');
                navigate('/Logins');
                return;
            }
            try {
                const data = await OtherService.getMyReports(user.token);
                // Add local ID and sort by date (newest first)
                const processedData = data.map((report, index) => ({
                    ...report,
                    localId: data.length - index, // Generate sequential IDs starting from length down to 1
                    createdTime: new Date(report.createdTime)
                })).sort((a, b) => b.createdTime - a.createdTime);

                setReports(processedData);
                setLocalIdCounter(data.length + 1);
            } catch (err) {
                if (err.response?.status === 401) {
                    setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    navigate('/Logins');
                } else {
                    setError('Không thể lấy danh sách báo cáo. Vui lòng thử lại sau.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMyReports();
    }, [user?.token, navigate]);

    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleString('vi-VN', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    };

    const parseImage = (image) => {
        let images;
        try {
            images = JSON.parse(image);
        } catch (error) {
            images = image;
        }
        if (!Array.isArray(images)) images = [images];
        return images.filter(img => img);
    };

    const openImageModal = (images) => {
        setCurrentImages(images);
        setCurrentImageIndex(0);
        setShowImageModal(true);
    };

    const closeImageModal = () => {
        setShowImageModal(false);
    };

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === currentImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? currentImages.length - 1 : prevIndex - 1
        );
    };

    if (loading) {
        return (
            <Layout showNavbar={false} showSidebar={true}>
                <div className="flex justify-center items-center h-screen">
                    <Loading />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout showNavbar={false} showSidebar={true}>
                <div className="flex justify-center items-center h-screen">
                    <div className="text-lg font-semibold text-red-500">{error}</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout showNavbar={false} showSidebar={true}>
            <div className="max-w-6xl mx-auto p-4">
                <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700">Báo cáo của tôi</h1>

                    {reports.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Bạn chưa gửi báo cáo nào.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            STT
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Nội dung
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Ngày tạo
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Hình ảnh
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {reports.map((report) => {
                                        const images = report.image ? parseImage(report.image) : [];
                                        return (
                                            <tr key={report.localId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {report.localId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300 max-w-xs">
                                                    <div className="font-medium">{report.reportContent}</div>
                                                    {report.feedback && (
                                                        <div className="mt-1 text-xs text-gray-400">
                                                            <span className="font-semibold">Phản hồi:</span> {report.feedback}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {formatDateTime(report.createdTime)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status === 0
                                                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        }`}>
                                                        {report.status === 0 ? 'Chưa xử lý' : 'Đã xử lý'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {images.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {images.map((img, index) => (
                                                                <img
                                                                    key={index}
                                                                    src={
                                                                        img.startsWith('http')
                                                                            ? img
                                                                            : `${process.env.REACT_APP_API_BASE_URL}${img}`
                                                                    }
                                                                    alt={`Báo cáo ${report.localId}`}
                                                                    className="w-10 h-10 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80"
                                                                    onClick={() => openImageModal(images)}
                                                                    onError={(e) => {
                                                                        e.target.src = '/placeholder-image.jpg';
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="relative max-w-4xl w-full">
                        <button
                            onClick={closeImageModal}
                            className="absolute top-4 right-4 text-white text-2xl z-50 hover:text-gray-300"
                        >
                            &times;
                        </button>

                        <div className="relative">
                            <img
                                src={
                                    currentImages[currentImageIndex].startsWith('http')
                                        ? currentImages[currentImageIndex]
                                        : `${process.env.REACT_APP_API_BASE_URL}${currentImages[currentImageIndex]}`
                                }
                                alt={`Ảnh ${currentImageIndex + 1}`}
                                className="max-h-[80vh] mx-auto rounded-lg"
                                onError={(e) => {
                                    e.target.src = '/placeholder-image.jpg';
                                }}
                            />

                            {currentImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                                    >
                                        &larr;
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                                    >
                                        &rarr;
                                    </button>
                                    <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                                        {currentImageIndex + 1} / {currentImages.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </Layout>
    );
};

export default MyReports;