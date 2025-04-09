import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import OtherService from '../../../Services/User/OtherService';
import { showCustomNotification } from '../../../Components/Notification';
import UserService from '../../../Services/User/UserService';
import RoomService from '../../../Services/User/RoomService';
import Loading from '../../../Components/Loading';
import Counts from '../../../Components/Counts'

const ReportList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pageSize: 5,
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [userNames, setUserNames] = useState({});
    const [roomTitles, setRoomTitles] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    // Lưu lỗi ảnh dưới dạng đối tượng với key là `${reportId}_${index}`
    const [imageErrors, setImageErrors] = useState({});

    // Kiểm tra quyền Admin
    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            showCustomNotification('error', 'Bạn không có quyền truy cập trang này.');
            navigate('/');
        }
    }, [user, navigate]);

    // Hàm parseImage: nếu dữ liệu image là chuỗi JSON chứa mảng thì parse, nếu không thì wrap thành mảng
    const parseImage = (image) => {
        let images;
        try {
            images = JSON.parse(image);
        } catch (error) {
            images = image;
        }
        if (!Array.isArray(images)) images = [images];
        return images;
    };

    // Hàm chuyển đổi URL: thêm baseUrl nếu cần
    const formatImageUrl = (url) => {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://your-api.com';
        return url.startsWith('http') ? url : `${baseUrl}${url}`;
    };

    // Lấy dữ liệu báo cáo, user và room
    useEffect(() => {
        const fetchReports = async () => {
            if (!user?.token) return;
            setLoading(true);
            try {
                const data = await OtherService.getAllReports(user.token);
                let reportData = Array.isArray(data) ? data : data.reports;
                setReports(reportData);
                setFilteredReports(reportData);
                setPagination((prev) => ({
                    ...prev,
                    total: reportData.length,
                }));

                const userIds = [...new Set(reportData.map((report) => report.userId))];
                const roomIds = [...new Set(reportData.map((report) => report.roomId).filter((id) => id))];

                const userPromises = userIds.map(async (userId) => {
                    try {
                        const userData = await UserService.getUserById(userId, user.token);
                        return { userId, name: userData.name || 'Không xác định' };
                    } catch {
                        return { userId, name: 'Không xác định' };
                    }
                });
                const userResults = await Promise.all(userPromises);
                const userNameMap = userResults.reduce((acc, { userId, name }) => {
                    acc[userId] = name;
                    return acc;
                }, {});
                setUserNames(userNameMap);

                const roomPromises = roomIds.map(async (roomId) => {
                    try {
                        const roomData = await RoomService.getRoomById(roomId, user.token);
                        return { roomId, title: roomData.title || 'Không xác định' };
                    } catch {
                        return { roomId, title: 'Không xác định' };
                    }
                });
                const roomResults = await Promise.all(roomPromises);
                const roomTitleMap = roomResults.reduce((acc, { roomId, title }) => {
                    acc[roomId] = title;
                    return acc;
                }, {});
                setRoomTitles(roomTitleMap);
            } catch (err) {
                if (err.response?.status === 401) {
                    setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    navigate('/login');
                } else {
                    setError('Không thể lấy danh sách báo cáo. Vui lòng thử lại.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user?.token && user?.role === 'Admin') {
            fetchReports();
        }
    }, [user?.token, user?.role, navigate]);

    // Xử lý tìm kiếm
    useEffect(() => {
        const filtered = reports.filter((report) => {
            const userName = userNames[report.userId]?.toLowerCase() || '';
            const roomTitle = report.roomId ? roomTitles[report.roomId]?.toLowerCase() || '' : '';
            const content = report.reportContent?.toLowerCase() || '';
            const term = searchTerm.toLowerCase();
            return userName.includes(term) || roomTitle.includes(term) || content.includes(term);
        });
        setFilteredReports(filtered);
        setPagination((prev) => ({
            ...prev,
            total: filtered.length,
            page: 1,
        }));
    }, [searchTerm, reports, userNames, roomTitles]);

    // Xử lý thay đổi trang
    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    // Xử lý lỗi ảnh, sử dụng key riêng cho mỗi ảnh theo reportId và index
    const handleImageError = (reportId, index) => {
        setImageErrors((prev) => ({ ...prev, [`${reportId}_${index}`]: true }));
    };

    const totalPages = Math.ceil(pagination.total / pagination.pageSize);
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const paginatedReports = filteredReports.slice(startIndex, startIndex + pagination.pageSize);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg font-semibold text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <Counts />
            <div className="mt-8 mb-4 flex justify-between">
                <h1 className="text-xl sm:text-3xl font-bold mb-4 text-left text-blue-600">
                    Danh sách báo cáo
                </h1>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo người báo cáo, phòng hoặc nội dung..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md px-4 py-1 border border-gray-300 
                    rounded-lg focus:outline-none focus:ring-2
                     focus:ring-blue-500 text-sm"
                />
            </div>

            {paginatedReports.length === 0 ? (
                <p className="text-center text-gray-500 text-base">
                    {searchTerm ? 'Không tìm thấy báo cáo nào phù hợp.' : 'Không có báo cáo nào.'}
                </p>
            ) : (
                <div className="overflow-x-auto">
                    {/* Hiển thị cho desktop */}
                    <div className="hidden md:block">
                        <table className="min-w-full bg-white border  rounded-lg shadow-md">
                            <thead>
                                <tr className="bg-gray-200 border-b border-gray-300">
                                    <th className="py-2 px-3 text-center text-sm font-semibold text-gray-700">ID</th>
                                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700">Người báo cáo</th>
                                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700">Phòng</th>
                                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700">Nội dung</th>
                                    <th className="py-2 px-3 text-center text-sm font-semibold text-gray-700">Hình ảnh</th>
                                    <th className="py-2 px-3 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedReports.map((report) => {
                                    // Lấy mảng ảnh
                                    const images = parseImage(report.image);
                                    return (
                                        <tr key={report.reportId} className="border-b border-gray-300 hover:bg-gray-50">
                                            <td className="py-2 px-3 text-center text-sm text-gray-600">
                                                {report.reportId}
                                            </td>
                                            <td className="py-2 px-3 text-left text-sm text-gray-600">
                                                {userNames[report.userId] || 'Đang tải...'}
                                            </td>
                                            <td className="py-2 px-3 text-left text-sm text-gray-600 break-words max-w-[150px]">
                                                {report.roomId ? roomTitles[report.roomId] || 'Đang tải...' : 'N/A'}
                                            </td>
                                            <td className="py-2 px-3 text-left text-sm text-gray-600 break-words max-w-[200px]">
                                                {report.reportContent}
                                            </td>
                                            <td className="py-2 px-3 text-center text-sm text-gray-600  max-w-[350px]">
                                                <div className="flex flex-wrap justify-start gap-2">
                                                    {images.map((img, index) => {
                                                        const fullUrl = formatImageUrl(img);
                                                        return imageErrors[`${report.reportId}_${index}`] ? (
                                                            <span key={index} className="text-red-500 text-sm">No Image</span>
                                                        ) : (
                                                            <img
                                                                key={index}
                                                                src={fullUrl}
                                                                alt={`Report ${report.reportId} - ${index}`}
                                                                className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                                                                onError={() => {
                                                                    console.log('Error loading image:', fullUrl);
                                                                    handleImageError(report.reportId, index);
                                                                }}
                                                                onClick={() => setPreviewImage(fullUrl)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="py-2 px-3 text-center text-sm text-gray-600 max-w-[200px]">
                                                {report.status === 0 || report.status === null ? 'Chưa xử lý' : 'Đã xử lý'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Hiển thị cho mobile */}
                    <div className="md:hidden space-y-4">
                        {paginatedReports.map((report) => {
                            const images = parseImage(report.image);
                            return (
                                <div key={report.reportId} className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                        <div>
                                            <span className="font-semibold text-gray-700">ID Báo cáo:</span> {report.reportId}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700">Người báo cáo:</span> {userNames[report.userId] || 'Đang tải...'}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700">Phòng:</span> {report.roomId ? roomTitles[report.roomId] || 'Đang tải...' : 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700">Nội dung:</span> {report.reportContent}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700">Hình ảnh:</span>
                                            <div className="flex flex-wrap justify-start gap-2 mt-1">
                                                {images.map((img, index) => {
                                                    const fullUrl = formatImageUrl(img);
                                                    return imageErrors[`${report.reportId}_${index}`] ? (
                                                        <span key={index} className="text-red-500 text-sm">Không có</span>
                                                    ) : (
                                                        <img
                                                            key={index}
                                                            src={fullUrl}
                                                            alt={`Report ${report.reportId} - ${index}`}
                                                            className="w-12 h-12 object-cover rounded-lg cursor-pointer"
                                                            onError={() => {
                                                                console.log('Error loading image:', fullUrl);
                                                                handleImageError(report.reportId, index);
                                                            }}
                                                            onClick={() => setPreviewImage(fullUrl)}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700">Trạng thái:</span> {report.status === 0 || report.status === null ? 'Chưa xử lý' : 'Đã xử lý'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {filteredReports.length > 0 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${pagination.page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        Trang trước
                    </button>
                    <span className="text-sm text-gray-700">
                        Trang {pagination.page} / {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === totalPages}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${pagination.page === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        Trang sau
                    </button>
                </div>
            )}

            {previewImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full">
                        <button
                            className="absolute top-2 right-2 text-black font-bold hover:text-gray-800"
                            onClick={() => setPreviewImage(null)}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                const errorText = document.createElement('div');
                                errorText.className = 'text-red-500 text-center';
                                errorText.textContent = 'No Image';
                                e.target.parentNode.appendChild(errorText);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportList;
