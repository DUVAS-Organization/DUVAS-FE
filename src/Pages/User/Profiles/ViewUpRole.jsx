import { useState, useEffect } from 'react';
import UserService from '../../../Services/User/UserService';
import SidebarUser from '../../../Components/Layout/SidebarUser';
import Loading from '../../../Components/Loading';
import { NavLink } from 'react-router-dom';
import { MdClose } from 'react-icons/md';
import { useAuth } from '../../../Context/AuthProvider';

const ViewUpRole = () => {
    const [loading, setLoading] = useState(true);
    const [landlords, setLandlords] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImagePreview, setShowImagePreview] = useState(false);

    const { user } = useAuth();
    const userId = user?.userId;

    useEffect(() => {
        const fetchLicenses = async () => {
            if (!userId) {
                console.error('Không tìm thấy userId');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Lấy giấy phép Landlord
                let landlordLicenses = [];
                try {
                    const landlordData = await UserService.getLandlordLicenseByUserId(
                        userId,
                        localStorage.getItem('authToken')
                    );
                    if (Array.isArray(landlordData)) {
                        landlordLicenses = landlordData.map((license) => ({
                            userId,
                            role: 'Landlord',
                            name: license.name || 'Chưa có thông tin',
                            cccd: license.cccd || 'Chưa có thông tin',
                            sex: license.sex || 'Chưa có thông tin',
                            address: license.address || 'Chưa có thông tin',
                            status: license.status || 0,
                            landlordLicenseId: license.landlordLicenseId || 1,
                        }));
                    } else if (landlordData && typeof landlordData === 'object') {
                        landlordLicenses = [
                            {
                                userId,
                                role: 'Landlord',
                                name: landlordData.name || 'Chưa có thông tin',
                                cccd: landlordData.cccd || 'Chưa có thông tin',
                                sex: landlordData.sex || 'Chưa có thông tin',
                                address: landlordData.address || 'Chưa có thông tin',
                                status: landlordData.status || 0,
                                landlordLicenseId: landlordData.landlordLicenseId || 1,
                            },
                        ];
                    }
                } catch (error) {
                    console.error(`Lỗi khi lấy giấy phép Landlord cho userId ${userId}:`, error);
                }

                // Lấy giấy phép Service
                let serviceLicenses = [];
                try {
                    const serviceData = await UserService.getServiceLicenseByUserId(
                        userId,
                        localStorage.getItem('authToken')
                    );
                    if (Array.isArray(serviceData)) {
                        serviceLicenses = serviceData.map((license) => ({
                            userId,
                            role: 'Service',
                            name: license.name || 'Chưa có thông tin',
                            cccd: license.cccd || 'Chưa có thông tin',
                            sex: license.sex || 'Chưa có thông tin',
                            address: license.address || 'Chưa có thông tin',
                            status: license.status || 0,
                            giayPhepKinhDoanh: license.giayPhepKinhDoanh || 'Chưa có thông tin',
                            giayPhepChuyenMon: license.giayPhepChuyenMon || 'Chưa có thông tin',
                            serviceLicenseId: license.serviceLicenseId || null,
                        }));
                    } else if (serviceData && typeof serviceData === 'object') {
                        serviceLicenses = [
                            {
                                userId,
                                role: 'Service',
                                name: serviceData.name || 'Chưa có thông tin',
                                cccd: serviceData.cccd || 'Chưa có thông tin',
                                sex: serviceData.sex || 'Chưa có thông tin',
                                address: serviceData.address || 'Chưa có thông tin',
                                status: serviceData.status || 0,
                                giayPhepKinhDoanh: serviceData.giayPhepKinhDoanh || 'Chưa có thông tin',
                                giayPhepChuyenMon: serviceData.giayPhepChuyenMon || 'Chưa có thông tin',
                                serviceLicenseId: serviceData.serviceLicenseId || null,
                            },
                        ];
                    }
                } catch (error) {
                    console.error(`Lỗi khi lấy giấy phép Service cho userId ${userId}:`, error);
                }

                setLandlords(landlordLicenses);
                setServices(serviceLicenses);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách giấy phép:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLicenses();
    }, [userId]);

    // Hàm ánh xạ status số thành văn bản và màu sắc
    const getStatusInfo = (status) => {
        switch (parseInt(status)) {
            case 0:
                return { text: 'Đang xử lý', className: 'bg-yellow-100 text-yellow-800 ' };
            case 1:
                return { text: 'Chấp thuận', className: 'bg-green-100 text-green-800' };
            case 2:
                return { text: 'Từ chối', className: 'bg-red-100 text-red-800' };
            default:
                return { text: 'Chưa có thông tin', className: 'bg-gray-100 text-gray-800' };
        }
    };

    const renderTable = (title, data) => (
        <div className="mb-10 text-center">
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            {data.length === 0 ? (
                <p className="text-gray-500 text-center">Không tìm thấy giấy phép nào</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">#</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Tên</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Số CCCD</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Giới tính</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Địa chỉ</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Giấy tờ</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((registration, index) => {
                                const statusInfo = getStatusInfo(registration.status);
                                return (
                                    <tr
                                        key={registration.userId + (registration.landlordLicenseId || registration.serviceLicenseId || index)}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{registration.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{registration.cccd}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{registration.sex}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{registration.address}</td>
                                        <td className="py-2 px-4 text-gray-700 border-b">
                                            {registration.role === 'Landlord' && (
                                                <NavLink
                                                    to={`/Landlord/Giayto/${registration.landlordLicenseId}`}
                                                    className="text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    Xem giấy tờ
                                                </NavLink>
                                            )}
                                            {registration.role === 'Service' && (
                                                <NavLink
                                                    to={`/Service/Giayto/${registration.serviceLicenseId}`}
                                                    className="text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    Xem giấy tờ
                                                </NavLink>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            <span
                                                className={`px-2 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}
                                            >
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white">
            <SidebarUser />
            <div className="select-none p-6 ml-56 max-w-6xl mx-auto">
                <h1 className="text-2xl font-semibold mb-4">Danh sách đơn đăng ký</h1>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loading />
                    </div>
                ) : (
                    <>
                        {renderTable('Danh sách đăng ký thành chủ Phòng', landlords)}
                        {renderTable('Danh sách đăng ký thành chủ Dịch vụ', services)}
                    </>
                )}

                {/* Modal Preview Image */}
                {showImagePreview && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-white relative p-4 rounded-lg max-w-3xl max-h-[80vh] overflow-auto">
                            <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[70vh] object-contain" />
                            <button
                                onClick={() => setShowImagePreview(false)}
                                className="absolute top-2 right-2 text-black font-bold hover:text-gray-800"
                            >
                                <MdClose className="text-2xl" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewUpRole;