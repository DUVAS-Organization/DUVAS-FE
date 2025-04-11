import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Icon from '../../../Components/Icon';
import { FiFilter } from 'react-icons/fi';
import UpRoleService from '../../../Services/User/UpRoleService';
import UserService from '../../../Services/User/UserService';

const UpLandlord = () => {
    const [licenses, setLicenses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || localStorage.getItem('authToken'); // Thử cả hai key

    useEffect(() => {
        fetchData();
    }, [searchTerm]);

    const fetchData = async () => {
        try {
            // Gọi API LandlordLicense
            const licenseData = await UpRoleService.getLandlordLicenses(token);
            console.log('📌 Landlord Licenses:', licenseData);

            // Lấy thông tin user cho mỗi userId
            const licensesWithUser = await Promise.all(
                licenseData.map(async (license) => {
                    try {
                        const user = await UserService.getUserById(license.userId, token);
                        console.log(`📌 User for userId ${license.userId}:`, user); // Log để kiểm tra
                        return { ...license, user };
                    } catch (error) {
                        console.error(`❌ Lỗi khi lấy user ${license.userId}:`, error);
                        return { ...license, user: { name: license.name || 'Không xác định' } }; // Fallback về license.name
                    }
                })
            );

            // Lọc dữ liệu theo searchTerm
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
        } catch (error) {
            console.error('❌ Lỗi khi lấy danh sách giấy phép từ https://localhost:8000/api/UpdateRole:', error);
        }
    };

    const handleConfirmLandlord = async (userId) => {
        try {
            await UpRoleService.updateRoleToLandlord(userId, token);
            console.log('🎉 Xác nhận vai trò chủ nhà thành công');
            fetchData();
        } catch (error) {
            console.error('❌ Lỗi khi xác nhận vai trò:', error);
        }
    };

    const handleRejectLandlord = (userId) => {
        console.log(`🚫 Từ chối yêu cầu cho user ${userId}`);
        navigate('/Admin/Rooms/RejectRooms');
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl rounded-2xl mb-2">
                <div className="font-bold text-4xl ml-3 my-8 text-blue-600 flex justify-between">
                    <h1>Yêu cầu cập nhật Vai trò LandLord</h1>
                </div>
                <div className="border-t-2 border-black w-full mb-5"></div>
            </div>

            <div className="flex items-center mb-6">
                {/* <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl">
                    <FiFilter className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Tên (A-Z)</p>
                </button> */}
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
                <table className="min-w-full bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-left font-semibold text-black">#</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Tên</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">CCCD</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Giới tính</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Địa chỉ</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Giấy tờ</th>
                            <th className="py-2 px-4 text-center font-semibold text-black">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {licenses.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-2 text-center text-gray-500">
                                    Không tìm thấy giấy phép
                                </td>
                            </tr>
                        ) : (
                            licenses.map((license, index) => (
                                <tr
                                    key={license.landlordLicenseId}
                                    className="hover:bg-gray-200 border-collapse border border-gray-300"
                                >
                                    <td className="py-2 px-4 text-gray-700 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        {license.user?.name || license.name || 'Không có'}
                                    </td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{license.cccd || 'Không có'}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{license.sex || 'Không có'}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{license.address || 'Không có'}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        <NavLink
                                            to={`/Admin/Landlord/Giayto/${license.landlordLicenseId}`}
                                            className="text-blue-600 hover:text-red-500 underline"
                                        >
                                            Xem giấy tờ
                                        </NavLink>
                                    </td>
                                    <td className="py-2 px-4 border-b text-blue-600 text-center">
                                        <div className="flex justify-around">
                                            <button
                                                onClick={() => handleConfirmLandlord(license.userId)}
                                                className="mr-4 text-blue-600 hover:text-red-500 underline"
                                            >
                                                Xác Nhận
                                            </button>
                                            <button
                                                onClick={() => handleRejectLandlord(license.userId)}
                                                className="text-blue-600 hover:text-red-500 underline"
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
        </div>
    );
};

export default UpLandlord;