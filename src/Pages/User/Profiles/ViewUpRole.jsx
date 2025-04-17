import { useState, useEffect } from 'react';
import UpRoleService from '../../../Services/User/UpRoleService';
import { MdClose } from 'react-icons/md';
import SidebarUser from '../../../Components/Layout/SidebarUser';
import Loading from '../../../Components/Loading';
import { NavLink } from 'react-router-dom';

const ViewUpRole = () => {
    const [loading, setLoading] = useState(true);
    const [landlords, setLandlords] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImagePreview, setShowImagePreview] = useState(false);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                setLoading(true);
                const response = await UpRoleService.getAllRegistrations();
                const all = response.data || [];

                const landlordList = all.filter(r => r.role === 'Landlord');
                const serviceList = all.filter(r => r.role === 'Service');

                setLandlords(landlordList);
                setServices(serviceList);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đăng ký:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRegistrations();
    }, []);

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
                            {data.map((registration, index) => (
                                <tr key={registration.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700">{registration.name || 'Chưa có thông tin'}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700">{registration.cccd || 'Chưa có thông tin'}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700">{registration.sex || 'Chưa có thông tin'}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700">{registration.address || 'Chưa có thông tin'}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        {registration.role === 'Landlord' && registration.landlordLicenseId && (
                                            <NavLink
                                                to={`/Giayto/${registration.landlordLicenseId}`}
                                                className="text-blue-600 hover:text-red-500 underline"
                                            >
                                                Xem giấy tờ
                                            </NavLink>
                                        )}
                                        {registration.role === 'Service' && registration.serviceLicenseId && (
                                            <NavLink
                                                to={`/Giayto/${registration.serviceLicenseId}`}
                                                className="text-blue-600 hover:text-red-500 underline"
                                            >
                                                Xem giấy tờ
                                            </NavLink>
                                        )}
                                    </td>


                                    <td className="px-4 py-2 text-sm text-gray-700">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${registration.status === 'Đã duyệt' ? 'bg-green-100 text-green-800' :
                                            registration.status === 'Đang chờ' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {registration.status || 'Chưa có thông tin'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div className='  bg-white'>
            <SidebarUser />
            <div className="select-none p-6 ml-56 max-w-6xl mx-auto">
                <h1 className="text-2xl font-semibold mb-4 ">Danh sách đơn đăng ký</h1>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loading />
                    </div>
                ) : (
                    <>
                        {renderTable("Danh sách đăng ký thành chủ Phòng", landlords)}
                        {renderTable("Danh sách đăng ký thành chủ Dịch vụ", services)}
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
