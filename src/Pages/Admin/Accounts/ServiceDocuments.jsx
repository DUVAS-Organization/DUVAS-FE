import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UpRoleService from '../../../Services/User/UpRoleService';
import UserService from '../../../Services/User/UserService';
import Loading from '../../../Components/Loading';

const ServiceDocuments = () => {
    const [license, setLicense] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const { serviceLicenseId } = useParams(); // Sử dụng serviceLicenseId thay vì userId
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const licenseData = await UpRoleService.getServiceLicenseById(serviceLicenseId, token);
                console.log('📌 Service License Details:', licenseData);
                setLicense(licenseData);

                const userData = await UserService.getUserById(licenseData.userId, token);
                console.log('📌 User Details:', userData);
                setUser(userData);

                setLoading(false);
            } catch (err) {
                console.error('❌ Lỗi khi lấy dữ liệu:', err);
                setError('Không thể tải thông tin giấy phép hoặc user');
                setLoading(false);
            }
        };

        fetchData();
    }, [serviceLicenseId, token]);

    const openPreview = (imageUrl) => {
        setPreviewImage(imageUrl);
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
        <div className="bg-white">
            <div className="p-6 max-w-6xl mx-auto ">
                <h1 className="font-bold text-3xl mb-6 text-blue-600">Thông tin giấy tờ Service</h1>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
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

                        {/* Nếu muốn thêm ngày sinh */}
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
                        <h2 className="font-semibold text-xl mb-4">Hình ảnh giấy tờ: </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                            <div>
                                <p className="font-semibold">CCCD mặt trước:</p>
                                {license?.anhCCCDMatTruoc ? (
                                    <img
                                        src={license.anhCCCDMatTruoc}
                                        alt="CCCD mặt trước"
                                        className="w-full h-auto rounded-lg shadow-sm cursor-pointer hover:opacity-80"
                                        onClick={() => openPreview(license.anhCCCDMatTruoc)}
                                    />
                                ) : (
                                    <p>Không có</p>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">CCCD mặt sau:</p>
                                {license?.anhCCCDMatSau ? (
                                    <img
                                        src={license.anhCCCDMatSau}
                                        alt="CCCD mặt sau"
                                        className="w-full h-auto rounded-lg shadow-sm cursor-pointer hover:opacity-80"
                                        onClick={() => openPreview(license.anhCCCDMatSau)}
                                    />
                                ) : (
                                    <p>Không có</p>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">Giấy phép kinh doanh:</p>
                                {license?.giayPhepKinhDoanh ? (
                                    <img
                                        src={license.giayPhepKinhDoanh}
                                        alt="Giấy phép kinh doanh"
                                        className="w-full h-auto rounded-lg shadow-sm cursor-pointer hover:opacity-80"
                                        onClick={() => openPreview(license.giayPhepKinhDoanh)}
                                    />
                                ) : (
                                    <p>Không có</p>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">Giấy phép chuyên môn:</p>
                                {license?.giayPhepChuyenMon ? (
                                    <img
                                        src={license.giayPhepChuyenMon}
                                        alt="Giấy phép chuyên môn"
                                        className="w-full h-auto rounded-lg shadow-sm cursor-pointer hover:opacity-80"
                                        onClick={() => openPreview(license.giayPhepChuyenMon)}
                                    />
                                ) : (
                                    <p>Không có</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/Admin/Service')}
                        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
                    >
                        Quay lại
                    </button>
                </div>

                {previewImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                        onClick={closePreview}
                    >
                        <div className="relative max-w-4xl max-h-[90vh] p-4 bg-white rounded-lg">
                            <img src={previewImage} alt="Preview" className="w-full h-auto rounded-lg" />
                            <button
                                onClick={closePreview}
                                className="absolute top-0 right-0 font-bold text-black px-2 rounded-full "
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

export default ServiceDocuments;