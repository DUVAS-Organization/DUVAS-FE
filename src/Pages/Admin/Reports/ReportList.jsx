import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import OtherService from '../../../Services/User/OtherService';
import { showCustomNotification } from '../../../Components/Notification';
import UserService from '../../../Services/User/UserService';
import RoomService from '../../../Services/User/RoomService';
import Loading from '../../../Components/Loading';
import Counts from '../../../Components/Counts';
import ReportAdminService from '../../../Services/Admin/ReportAdminService';

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
    const [imageErrors, setImageErrors] = useState({});
    const [actionReportId, setActionReportId] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            showCustomNotification('error', 'Bạn không có quyền truy cập trang này.');
            navigate('/');
        }
    }, [user, navigate]);

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

    const formatImageUrl = (url) => {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://your-api.com';
        return url.startsWith('http') ? url : `${baseUrl}${url}`;
    };

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

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const handleImageError = (reportId, index) => {
        setImageErrors((prev) => ({ ...prev, [`${reportId}_${index}`]: true }));
    };

    const totalPages = Math.ceil(pagination.total / pagination.pageSize);
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const paginatedReports = filteredReports.slice(startIndex, startIndex + pagination.pageSize);

    const handleAction = async (reportId, type) => {
        setActionReportId(reportId);
        setActionType(type);
        setShowConfirmPopup(true);
    };

    const confirmAction = async () => {
        if (!actionReportId || !actionType) return;

        try {
            setShowConfirmPopup(false);
            let result;
            switch (actionType) {
                case 'reject':
                    result = await ReportAdminService.rejectReport(actionReportId);
                    showCustomNotification('success', 'Báo cáo đã được từ chối.');
                    break;
                case 'lockRoom':
                    result = await ReportAdminService.lockRoom(actionReportId);
                    showCustomNotification('success', 'Phòng đã bị khóa.');
                    break;
                case 'lockAccount':
                    result = await ReportAdminService.lockAccount(actionReportId);
                    showCustomNotification('success', 'Tài khoản đã bị khóa.');
                    break;
                default:
                    return;
            }

            // Refresh reports after successful action
            const updatedReports = await OtherService.getAllReports(user.token);
            setReports(Array.isArray(updatedReports) ? updatedReports : updatedReports.reports);
            setFilteredReports(Array.isArray(updatedReports) ? updatedReports : updatedReports.reports);
            setPagination((prev) => ({
                ...prev,
                total: Array.isArray(updatedReports) ? updatedReports.length : updatedReports.reports.length,
            }));
        } catch (error) {
            showCustomNotification('error', error.message);
        } finally {
            setActionReportId(null);
            setActionType(null);
        }
    };

    const cancelAction = () => {
        setShowConfirmPopup(false);
        setActionReportId(null);
        setActionType(null);
    };

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
                        <table className="min-w-full bg-white border rounded-lg shadow-md">
                            <thead>
                                <tr className="bg-gray-200 border-b border-gray-300">
                                    <th className="py-2 px-3 text-center text-sm font-semibold text-gray-700">#</th>
                                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700">Người báo cáo</th>
                                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700">Phòng</th>
                                    <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700">Nội dung</th>
                                    <th className="py-2 px-3 text-center text-sm font-semibold text-gray-700">Hình ảnh</th>
                                    <th className="py-2 px-3 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
                                    <th className="py-2 px-3 text-center text-sm font-semibold text-gray-700 max-w-[200px]">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedReports.map((report, index) => {
                                    const images = parseImage(report.image);
                                    return (
                                        <tr key={report.reportId} className="border-b border-gray-300 hover:bg-gray-50">
                                            <td className="py-2 px-3 text-center text-sm text-gray-600">
                                                {index + 1}
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
                                            <td className="py-2 px-3 text-center text-sm text-gray-600 max-w-[350px]">
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
                                            <td className="py-2 px-3 text-center text-sm text-gray-600 max-w-[200px]">
                                                {(report.status === 0 || report.status === null) && (
                                                    <div className="space-x-2">
                                                        <button
                                                            onClick={() => handleAction(report.reportId, 'reject')}
                                                            className="text-red-500 underline underline-offset-2 hover:text-red-700"
                                                            disabled={showConfirmPopup}
                                                        >
                                                            Từ chối
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(report.reportId, 'lockRoom')}
                                                            className="text-blue-500 underline underline-offset-2 hover:text-blue-700"
                                                            disabled={showConfirmPopup}
                                                        >
                                                            Khóa phòng
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(report.reportId, 'lockAccount')}
                                                            className="text-blue-500 underline underline-offset-2 hover:text-blue-700"
                                                            disabled={showConfirmPopup}
                                                        >
                                                            Khóa tài khoản
                                                        </button>
                                                    </div>
                                                )}
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
                                        {(report.status === 0 || report.status === null) && (
                                            <div className="mt-2 space-x-2">
                                                <button
                                                    onClick={() => handleAction(report.reportId, 'reject')}
                                                    className="text-red-500 underline underline-offset-2 hover:text-red-700"
                                                    disabled={showConfirmPopup}
                                                >
                                                    Từ chối
                                                </button>
                                                <button
                                                    onClick={() => handleAction(report.reportId, 'lockRoom')}
                                                    className="text-blue-500 underline underline-offset-2 hover:text-blue-700"
                                                    disabled={showConfirmPopup}
                                                >
                                                    Khóa phòng
                                                </button>
                                                <button
                                                    onClick={() => handleAction(report.reportId, 'lockAccount')}
                                                    className="text-blue-500 underline underline-offset-2 hover:text-blue-700"
                                                    disabled={showConfirmPopup}
                                                >
                                                    Khóa tài khoản
                                                </button>
                                            </div>
                                        )}
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

            {showConfirmPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 dark:bg-gray-800">
                        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
                            Xác nhận hành động
                        </h3>
                        <p className="mb-4 text-gray-700 dark:text-white">
                            Bạn có chắc chắn muốn {actionType === 'reject' ? 'từ chối' : actionType === 'lockRoom' ? 'khóa phòng' : 'khóa tài khoản'} có báo cáo #{actionReportId}?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={cancelAction}
                                className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition dark:text-white"
                            >
                                Không
                            </button>
                            <button
                                onClick={confirmAction}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition dark:text-white"
                            >
                                Có
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportList;