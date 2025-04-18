import React, { useState, useEffect } from 'react';
import ContractService from '../../../Services/Landlord/ContractService';
import UserService from '../../../Services/User/UserService';
import Loading from '../../../Components/Loading';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthProvider';

const AuthorizationList = () => {
    const [loading, setLoading] = useState(true);
    const [contracts, setContracts] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [error, setError] = useState(null);

    const { user } = useAuth();
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const contractsData = await ContractService.getAllAuthorizationContracts(token);
                if (!Array.isArray(contractsData)) {
                    throw new Error('Dữ liệu hợp đồng không phải là mảng');
                }

                setContracts(contractsData);

                const ids = Array.from(
                    new Set(
                        contractsData.flatMap(c => {
                            const partyAId = c.partyAId ? c.partyAId : null;
                            const partyBId = c.partyBId ? c.partyBId : null;
                            const createdById = c.createdById ? c.createdById : null;
                            return [partyAId, partyBId, createdById].filter(id => id !== null);
                        })
                    )
                );

                const users = await Promise.all(
                    ids.map(async id => {
                        try {
                            const userData = await UserService.getUserById(id, token);
                            return userData;
                        } catch (err) {
                            console.error(`Lỗi khi fetch user với id ${id}:`, err.message);
                            return null;
                        }
                    })
                );

                const map = {};
                users.forEach(u => {
                    if (u && u.userId !== undefined && u.name) {
                        map[u.userId] = u.name;
                    }
                });
                setUserMap(map);

            } catch (err) {
                console.error('Lỗi trong quá trình fetch dữ liệu:', err);
                setError('Không thể tải danh sách hợp đồng hoặc thông tin user. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const getStatus = status => {
        switch (parseInt(status, 10)) {
            case 0: return 'Bị hủy';
            case 1: return 'Đang hoạt động';
            case 2: return 'Đang chờ admin duyệt';
            case 3: return 'Admin đã duyệt';
            case 4: return 'Hết hạn';
            default: return 'Chưa rõ';
        }
    };

    const formatDate = iso => {
        if (!iso) return '-';
        const d = new Date(iso);
        return d.toLocaleDateString('vi-VN');
    };

    const handleAction = async (contractId, roomIds, status) => {
        try {
            setLoading(true);
            await Promise.all([
                ContractService.updateContractsStatus({ contractIds: [contractId], status }, token),
                ContractService.updateRoomsAuthorization({ roomIds, status }, token)
            ]);
            const updatedContracts = contracts.map(c =>
                c.id === contractId ? { ...c, status } : c
            );
            setContracts(updatedContracts);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            alert("Đã xảy ra lỗi khi cập nhật trạng thái. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 sm:p-6 bg-white">
                <p className="text-center text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 bg-white">
            <h1 className="text-2xl font-bold mb-6 text-blue-600">Danh sách hợp đồng ủy quyền</h1>
            {contracts.length === 0 ? (
                <p className="text-center text-gray-500">Không có hợp đồng nào</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">#</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Số hợp đồng</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Ngày tạo</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Bên A</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Bên B</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Người tạo</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Trạng thái</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">File PDF</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map((c, idx) => (
                                <tr key={c.id || idx} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-700">{idx + 1}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700">{c.contractNumber || '-'}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700">{formatDate(c.createdAt)}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                        {c.partyAId && userMap[c.partyAId] ? userMap[c.partyAId] : 'Không xác định'}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                        Nguyễn Đình Mạnh Hùng
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                        {c.createdById && userMap[c.createdById] ? userMap[c.createdById] : 'Không xác định'}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700">{getStatus(c.status)}</td>
                                    <td className="px-4 py-2 text-sm">
                                        {c.pdfUrl ? (
                                            <NavLink
                                                to={c.pdfUrl}
                                                target="_blank"
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                                Tải PDF
                                            </NavLink>
                                        ) : (
                                            'Không có'
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-blue-600 underline space-x-3">
                                        <button
                                            onClick={() => handleAction(c.id, c.roomIds || [], 3)}
                                            className="hover:text-blue-800 underline underline-offset-2 font-medium"
                                        >
                                            Xác nhận
                                        </button>
                                        <button
                                            onClick={() => handleAction(c.id, c.roomIds || [], 0)}
                                            className="text-red-500 hover:text-red-700 underline underline-offset-2 font-medium"
                                        >
                                            Từ chối
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AuthorizationList;
