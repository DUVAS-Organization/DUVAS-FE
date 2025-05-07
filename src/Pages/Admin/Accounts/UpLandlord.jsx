import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../../../Components/Icon';
import UpRoleService from '../../../Services/User/UpRoleService';
import UserService from '../../../Services/User/UserService';

const UpLandlord = () => {
    const [licenses, setLicenses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

    useEffect(() => {
        fetchData();
    }, [searchTerm]);

    const fetchData = async () => {
        try {
            // Gọi API LandlordLicense
            const licenseData = await UpRoleService.getLandlordLicenses(token);
            // console.log('📌 Landlord Licenses:', licenseData);

            // Lấy thông tin user cho mỗi userId
            const licensesWithUser = await Promise.all(
                licenseData.map(async (license) => {
                    try {
                        const user = await UserService.getUserById(license.userId, token);
                        // console.log(`📌 User for userId ${license.userId}:`, user);
                        const status = Number(license.status) || 0; // Ép kiểu status thành số
                        const landlordLicenseId = Number(license.landlordLicenseId); // Ép kiểu landlordLicenseId thành số
                        return { ...license, user, status, landlordLicenseId };
                    } catch (error) {
                        console.error(`❌ Lỗi khi lấy user ${license.userId}:`, error);
                        const status = Number(license.status) || 0;
                        const landlordLicenseId = Number(license.landlordLicenseId);
                        return {
                            ...license,
                            user: { name: license.name || 'Không xác định' },
                            status,
                            landlordLicenseId,
                        };
                    }
                })
            );

            // Lọc dữ liệu theo searchTerm (không gộp theo userId)
            const filteredData = licensesWithUser.filter((license) => {
                const nameMatch =
                    license.user?.name && typeof license.user.name === 'string'
                        ? license.user.name.toLowerCase().includes(searchTerm.toLowerCase())
                        : license.name && typeof license.name === 'string'
                            ? license.name.toLowerCase().includes(searchTerm.toLowerCase())
                            : false;
                const cccdMatch =
                    license.cccd && typeof license.cccd === 'string'
                        ? license.cccd.includes(searchTerm)
                        : false;
                return nameMatch || cccdMatch;
            });

            setLicenses(filteredData);
            setErrorMessage(null);
        } catch (error) {
            console.error('❌ Lỗi khi lấy danh sách giấy phép từ https://localhost:8000/api/UpdateRole:', error);
            setErrorMessage('Không thể tải danh sách giấy phép. Vui lòng thử lại.');
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 1:
                return 'Chấp nhận';
            case 2:
                return 'Đã từ chối';
            case 0:
            default:
                return 'Đang xử lý';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 1:
                return 'bg-green-500 text-white';
            case 2:
                return 'bg-red-500 text-white';
            case 0:
            default:
                return 'bg-yellow-500 text-white';
        }
    };

    const handleConfirmLandlord = (landlordLicenseId) => {
        setPendingAction({ landlordLicenseId: Number(landlordLicenseId), action: 'confirm' });
        setShowPopup(true);
    };

    const handleRejectLandlord = (landlordLicenseId) => {
        setPendingAction({ landlordLicenseId: Number(landlordLicenseId), action: 'reject' });
        setShowPopup(true);
    };

    const handlePopupConfirm = async () => {
        if (!pendingAction) return;

        try {
            const license = licenses.find((l) => l.landlordLicenseId === pendingAction.landlordLicenseId);
            if (!license) {
                await fetchData();
                const updatedLicenses = licenses;
                const updatedLicense = updatedLicenses.find(
                    (l) => l.landlordLicenseId === pendingAction.landlordLicenseId
                );
                if (!updatedLicense) {
                    throw new Error('Không tìm thấy giấy phép sau khi làm mới dữ liệu');
                }
                // Gọi API với userId
                if (pendingAction.action === 'confirm') {
                    await UserService.acceptUpRoleLandlord(updatedLicense.userId);
                } else {
                    await UserService.cancelUpRoleLandlord(updatedLicense.userId);
                }
            } else {
                // Gọi API với userId
                if (pendingAction.action === 'confirm') {
                    await UserService.acceptUpRoleLandlord(license.userId);
                } else {
                    await UserService.cancelUpRoleLandlord(license.userId);
                }
            }

            // Làm mới dữ liệu từ DB
            await fetchData();
            setErrorMessage(null);
        } catch (error) {
            console.error(
                `❌ Lỗi khi ${pendingAction.action === 'confirm' ? 'xác nhận' : 'từ chối'} vai trò Landlord:`,
                error
            );
            setErrorMessage(
                `Không thể ${pendingAction.action === 'confirm' ? 'xác nhận' : 'từ chối'} yêu cầu. Vui lòng thử lại.`
            );
        } finally {
            setShowPopup(false);
            setPendingAction(null);
        }
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
        setPendingAction(null);
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl rounded-2xl mb-2">
                <div className="font-bold text-4xl ml-3 my-8 text-blue-600 flex justify-between">
                    <h1>Yêu cầu cập nhật Vai trò LandLord</h1>
                </div>
                <div className="border-t-2 border-black w-full mb-5"></div>
            </div>

            {errorMessage && (
                <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">{errorMessage}</div>
            )}

            <div className="flex items-center mb-6">
                <div className="relative w-1/3 mx-2 ml-auto">
                    <input
                        className="border w-full h-11 p-2 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc số CCCD..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Icon
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        name="search"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-center font-semibold text-black w-12">#</th>
                            <th className="py-2 px-4 text-left font-semibold text-black min-w-[200px]">Tên</th>
                            <th className="py-2 px-4 text-left font-semibold text-black w-32">Số CCCD</th>
                            <th className="py-2 px-4 text-left font-semibold text-black w-24">Giới tính</th>
                            <th className="py-2 px-4 text-left font-semibold text-black min-w-[200px]">Địa chỉ</th>
                            <th className="py-2 px-4 text-left font-semibold text-black w-32">Giấy tờ</th>
                            <th className="py-2 px-4 text-left font-semibold text-black w-32">Trạng thái</th>
                            <th className="py-2 px-4 text-center font-semibold text-black w-44">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {licenses.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="py-2 text-center text-gray-500">
                                    Không tìm thấy giấy phép
                                </td>
                            </tr>
                        ) : (
                            licenses.map((license, index) => (
                                <tr
                                    key={license.landlordLicenseId}
                                    className="hover:bg-gray-200 border-collapse border border-gray-300"
                                >
                                    <td className="py-2 px-4 text-center text-gray-700 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b break-words">
                                        {license.user?.name || license.name || 'Không có'}
                                    </td>
                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        {license.cccd || 'Không có'}
                                    </td>
                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        {license.sex || 'Không có'}
                                    </td>
                                    <td className="py-2 px-4 text-gray-700 border-b break-words">
                                        {license.address || 'Không có'}
                                    </td>
                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        <NavLink
                                            to={`/Admin/Landlord/Giayto/${license.landlordLicenseId}`}
                                            className="text-blue-600 hover:text-red-500 underline"
                                        >
                                            Xem giấy tờ
                                        </NavLink>
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                                license.status
                                            )}`}
                                        >
                                            {getStatusLabel(license.status)}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 border-b text-blue-600 text-center">
                                        <div className="flex justify-around">
                                            <button
                                                onClick={() => handleConfirmLandlord(license.landlordLicenseId)}
                                                className={`mr-4 text-blue-600 hover:text-red-500 underline ${license.status !== 0 ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                disabled={license.status !== 0}
                                            >
                                                Xác Nhận
                                            </button>
                                            <button
                                                onClick={() => handleRejectLandlord(license.landlordLicenseId)}
                                                className={`text-blue-600 hover:text-red-500 underline ${license.status !== 0 ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                disabled={license.status !== 0}
                                            >
                                                Từ Chối
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">
                            {pendingAction?.action === 'confirm'
                                ? 'Xác nhận vai trò Landlord'
                                : 'Từ chối vai trò Landlord'}
                        </h2>
                        <p className="mb-6">
                            Bạn có chắc chắn muốn{' '}
                            {pendingAction?.action === 'confirm' ? 'xác nhận' : 'từ chối'} yêu cầu này
                            không?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handlePopupCancel}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handlePopupConfirm}
                                className={`px-4 py-2 rounded text-white ${pendingAction?.action === 'confirm'
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {pendingAction?.action === 'confirm' ? 'Xác Nhận' : 'Từ Chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpLandlord;