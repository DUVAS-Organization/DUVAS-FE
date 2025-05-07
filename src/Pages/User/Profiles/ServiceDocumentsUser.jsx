import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UpRoleService from '../../../Services/User/UpRoleService';
import UserService from '../../../Services/User/UserService';
import Loading from '../../../Components/Loading';
import SidebarUser from '../../../Components/Layout/SidebarUser';

const ServiceDocumentsUser = () => {
    const [license, setLicense] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState({
        front: false,
        back: false,
        business: false,
        professional: false,
    });
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const { serviceLicenseId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

    // State để lưu URL blob của ảnh
    const [frontImageBlobUrl, setFrontImageBlobUrl] = useState(null);
    const [backImageBlobUrl, setBackImageBlobUrl] = useState(null);
    const [businessLicenseBlobUrl, setBusinessLicenseBlobUrl] = useState(null);
    const [professionalLicenseBlobUrl, setProfessionalLicenseBlobUrl] = useState(null);

    // Ref để theo dõi blob URLs
    const blobUrlsRef = useRef({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const licenseData = await UpRoleService.getServiceLicenseById(serviceLicenseId, token);
                setLicense(licenseData);

                const userData = await UserService.getUserById(licenseData.userId, token);
                setUser(userData);

                // Tải ảnh dưới dạng blob với fallback
                if (licenseData.anhCCCDMatTruoc) {
                    setImageLoading(prev => ({ ...prev, front: true }));
                    const blobUrl = await fetchImageAsBlob(licenseData.anhCCCDMatTruoc, 'CCCD mặt trước');
                    blobUrlsRef.current.front = blobUrl || licenseData.anhCCCDMatTruoc; // Fallback về URL gốc
                    setFrontImageBlobUrl(blobUrlsRef.current.front);
                    setImageLoading(prev => ({ ...prev, front: false }));
                }
                if (licenseData.anhCCCDMatSau) {
                    setImageLoading(prev => ({ ...prev, back: true }));
                    const blobUrl = await fetchImageAsBlob(licenseData.anhCCCDMatSau, 'CCCD mặt sau');
                    blobUrlsRef.current.back = blobUrl || licenseData.anhCCCDMatSau;
                    setBackImageBlobUrl(blobUrlsRef.current.back);
                    setImageLoading(prev => ({ ...prev, back: false }));
                }
                if (licenseData.giayPhepKinhDoanh) {
                    setImageLoading(prev => ({ ...prev, business: true }));
                    const blobUrl = await fetchImageAsBlob(licenseData.giayPhepKinhDoanh, 'Giấy phép kinh doanh');
                    blobUrlsRef.current.business = blobUrl || licenseData.giayPhepKinhDoanh;
                    setBusinessLicenseBlobUrl(blobUrlsRef.current.business);
                    setImageLoading(prev => ({ ...prev, business: false }));
                }
                if (licenseData.giayPhepChuyenMon) {
                    setImageLoading(prev => ({ ...prev, professional: true }));
                    const blobUrl = await fetchImageAsBlob(licenseData.giayPhepChuyenMon, 'Giấy phép chuyên môn');
                    blobUrlsRef.current.professional = blobUrl || licenseData.giayPhepChuyenMon;
                    setProfessionalLicenseBlobUrl(blobUrlsRef.current.professional);
                    setImageLoading(prev => ({ ...prev, professional: false }));
                }

                setLoading(false);
            } catch (err) {
                console.error('❌ Lỗi khi lấy dữ liệu:', err);
                setError('Không thể tải thông tin giấy phép hoặc user');
                setLoading(false);
            }
        };

        if (serviceLicenseId && token) {
            fetchData();
        } else {
            setError('Thiếu thông tin xác thực hoặc ID giấy phép');
            setLoading(false);
        }
    }, [serviceLicenseId, token]);

    // Hàm tải ảnh từ URL dưới dạng blob
    const fetchImageAsBlob = async (url, imageType) => {
        if (!url) {
            return null;
        }
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    navigate('/Logins');
                }
                throw new Error(`Không thể tải ảnh ${imageType}: ${response.statusText}`);
            }
            const blob = await response.blob();
            if (blob.size === 0) {
                throw new Error(`Dữ liệu ảnh ${imageType} rỗng`);
            }
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error(`Lỗi khi tải ảnh ${imageType} dưới dạng blob:`, error);
            return null; // Trả về null để dùng URL gốc làm fallback
        }
    };

    // Giải phóng bộ nhớ blob URL khi component unmount
    useEffect(() => {
        return () => {
            Object.values(blobUrlsRef.current).forEach(url => {
                if (url && url.startsWith('blob:')) { // Chỉ thu hồi blob URL
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    const openPreview = (imageUrl) => {
        if (imageUrl) {
            setPreviewImage(imageUrl);
        }
    };

    const closePreview = () => {
        setPreviewImage(null);
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <Loading />
            </div>
        );
    }

    if (error) {
        return <div className="p-6 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 dark:text-white">
            <SidebarUser />
            <div className="p-6 ml-56 max-w-6xl mx-auto">
                <h1 className="font-bold text-3xl mb-6 text-red-600">Thông tin giấy tờ Service</h1>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 dark:bg-gray-800 dark:text-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex gap-2 items-start">
                            <span className="font-semibold whitespace-nowrap">ID giấy phép:</span>
                            <span>{license?.serviceLicenseId || 'Không có'}</span>
                        </div>
                        <div className="flex gap-2 items-start">
                            <span className="font-semibold whitespace-nowrap">Chủ giấy phép:</span>
                            <span>{user?.name || license?.name || 'Không có'}</span>
                        </div>
                        <div className="flex gap-2 items-start">
                            <span className="font-semibold whitespace-nowrap">Số CCCD:</span>
                            <span>{license?.cccd || 'Không có'}</span>
                        </div>
                        <div className="flex gap-2 items-start">
                            <span className="font-semibold whitespace-nowrap">Giới tính:</span>
                            <span>{license?.sex || 'Không có'}</span>
                        </div>
                        <div className="flex gap-2 items-start">
                            <span className="font-semibold whitespace-nowrap">Địa chỉ:</span>
                            <span className="break-words">{license?.address || 'Không có'}</span>
                        </div>
                        <div className="flex gap-2 items-start">
                            <span className="font-semibold whitespace-nowrap">Ngày sinh:</span>
                            <span>
                                {license?.dateOfBirth
                                    ? new Date(license.dateOfBirth).toLocaleDateString('vi-VN')
                                    : 'Không có'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h2 className="font-semibold text-xl mb-4">Hình ảnh giấy tờ:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                            <div>
                                <p className="font-semibold">CCCD mặt trước:</p>
                                {imageLoading.front ? (
                                    <p className="text-gray-500">Đang tải...</p>
                                ) : frontImageBlobUrl ? (
                                    <img
                                        src={frontImageBlobUrl}
                                        alt="CCCD mặt trước"
                                        className="w-full h-auto rounded-lg shadow-sm cursor-pointer hover:opacity-80"
                                        onClick={() => openPreview(frontImageBlobUrl)}
                                    />
                                ) : (
                                    <p>Không có</p>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">CCCD mặt sau:</p>
                                {imageLoading.back ? (
                                    <p className="text-gray-500">Đang tải...</p>
                                ) : backImageBlobUrl ? (
                                    <img
                                        src={backImageBlobUrl}
                                        alt="CCCD mặt sau"
                                        className="w-full h-auto rounded-lg shadow-sm cursor-pointer hover:opacity-80"
                                        onClick={() => openPreview(backImageBlobUrl)}
                                    />
                                ) : (
                                    <p>Không có</p>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">Giấy phép kinh doanh:</p>
                                {imageLoading.business ? (
                                    <p className="text-gray-500">Đang tải...</p>
                                ) : businessLicenseBlobUrl ? (
                                    <img
                                        src={businessLicenseBlobUrl}
                                        alt="Giấy phép kinh doanh"
                                        className="w-full h-auto rounded-lg shadow-sm cursor-pointer hover:opacity-80"
                                        onClick={() => openPreview(businessLicenseBlobUrl)}
                                    />
                                ) : (
                                    <p>Không có</p>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">Giấy phép chuyên môn:</p>
                                {imageLoading.professional ? (
                                    <p className="text-gray-500">Đang tải...</p>
                                ) : professionalLicenseBlobUrl ? (
                                    <img
                                        src={professionalLicenseBlobUrl}
                                        alt="Giấy phép chuyên môn"
                                        className="w-full h-auto rounded-lg shadow-sm cursor-pointer hover:opacity-80"
                                        onClick={() => openPreview(professionalLicenseBlobUrl)}
                                    />
                                ) : (
                                    <p>Không có</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/ViewUpRole')}
                        className="mt-6 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500"
                    >
                        Quay lại
                    </button>
                </div>

                {previewImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                        onClick={closePreview}
                    >
                        <div className="relative max-w-4xl max-h-[90vh] p-4 bg-white rounded-lg overflow-auto">
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="max-w-full max-h-[80vh] w-auto h-auto rounded-lg mx-auto"
                            />
                            <button
                                onClick={closePreview}
                                className="absolute top-1 right-1 px-2 text-red-500 bg-white font-bold rounded-full"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceDocumentsUser;