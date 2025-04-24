import React, { useState, useEffect } from 'react';
import ContractService from '../../../../Services/Landlord/ContractService';
import UserService from '../../../../Services/User/UserService';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../Context/AuthProvider';
import Pagination from '@mui/material/Pagination';
import Loading from '../../../../Components/Loading';

const AuthorizationList = () => {
    const [loading, setLoading] = useState(true);
    const [contracts, setContracts] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [error, setError] = useState(null);
    const [contractPage, setContractPage] = useState(1);
    const [confirmedContracts, setConfirmedContracts] = useState(new Set()); // Lưu trạng thái xác nhận tạm thời
    const rowsPerPage = 5;

    const { user } = useAuth();
    const token = localStorage.getItem('authToken');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const contractsData = await ContractService.getAllAuthorizationContracts(token);
                if (!Array.isArray(contractsData)) {
                    throw new Error('Dữ liệu hợp đồng không phải là mảng');
                }

                const formattedContracts = contractsData.map(contract => ({
                    ...contract,
                    roomIds: contract.roomList && contract.roomList.trim() !== ''
                        ? contract.roomList.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
                        : []
                }));

                setContracts(formattedContracts);

                const ids = Array.from(
                    new Set(
                        contractsData.flatMap(c => [c.partyAId, c.partyBId, c.createdById].filter(id => id))
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
                    if (u && u.userId && u.name) map[u.userId] = u.name;
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

    const handleAction = async (contractId, roomIds, contractStatus, authorizationStatus) => {
        try {
            setLoading(true);

            if (!roomIds || roomIds.length === 0) {
                alert('Hợp đồng không có phòng nào được chọn. Vui lòng kiểm tra lại.');
                return;
            }

            await Promise.all([
                ContractService.updateContractsStatus({ contractIds: [contractId], status: contractStatus }, token),
                ContractService.updateRoomsAuthorization({ roomIds, status: authorizationStatus }, token)
            ]);

            const updatedContracts = contracts.map(c =>
                c.id === contractId ? { ...c, status: contractStatus } : c
            );
            setContracts(updatedContracts);

            if (contractStatus !== 0) {
                setConfirmedContracts(prev => new Set(prev).add(contractId));
            } else {
                setConfirmedContracts(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(contractId);
                    return newSet;
                });
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error.message);
            alert(`Đã xảy ra lỗi: ${error.message || 'Vui lòng thử lại.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = (contractId) => {
        setConfirmedContracts(prev => new Set(prev).add(contractId));
    };

    const handleViewDetails = (contractId) => {
        navigate(`/contract-detail/${contractId}`);
    };

    const contractCount = contracts.length;
    const contractPageCount = Math.ceil(contractCount / rowsPerPage);
    const contractStartIndex = (contractPage - 1) * rowsPerPage;
    const contractEndIndex = contractStartIndex + rowsPerPage;
    const paginatedContracts = contracts.slice(contractStartIndex, contractEndIndex);

    const handleContractPageChange = (event, value) => setContractPage(value);

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
                <>
                    <div className="overflow-x-auto mb-8">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b w-12">#</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b w-32">Số hợp đồng</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b w-28">Ngày tạo</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b w-40">Bên A</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b w-40">Bên B</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b w-40">Người tạo</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b w-32">Trạng thái</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b w-28">File PDF</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b w-48">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedContracts.map((c, idx) => (
                                    <tr key={c.id || idx} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-gray-700">{contractStartIndex + idx + 1}</td>
                                        <td className="px-4 py-2 text-size text-gray-700 truncate">
                                            <button
                                                onClick={() => handleViewDetails(c.id)}
                                                className="text-blue-500 hover:underline"
                                            >
                                                {c.contractNumber || '-'}

                                            </button>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{formatDate(c.createdAt)}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700 truncate">
                                            {userMap[c.partyAId] || 'Không xác định'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700 truncate">
                                            {userMap[c.partyBId] || 'Không xác định'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700 truncate">
                                            {userMap[c.createdById] || 'Không xác định'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{getStatus(c.status)}</td>
                                        <td className="px-4 py-2 text-sm">
                                            {c.pdfUrl ? (
                                                <NavLink
                                                    to={c.pdfUrl}
                                                    target="_blank"
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                                >
                                                    Tải PDF
                                                </NavLink>
                                            ) : (
                                                'Không có'
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-sm space-x-4">
                                            {c.status === 0 || c.status === 1 || c.status === 3 || c.status === 4 ? (
                                                <>
                                                    {/* <button disabled className="text-gray-400 cursor-not-allowed">
                                                        Xác nhận
                                                    </button>
                                                    <button disabled className="text-gray-400 cursor-not-allowed">
                                                        Từ chối
                                                    </button> */}
                                                    <button disabled className="text-gray-400 cursor-not-allowed">
                                                        Hoàn thành
                                                    </button>
                                                </>
                                            ) : c.status === 2 ? (
                                                confirmedContracts.has(c.id) ? (
                                                    <button
                                                        onClick={() => handleAction(c.id, c.roomIds, 3, 3)}
                                                        className="text-green-600 hover:text-green-800 underline font-medium"
                                                    >
                                                        Hoàn thành
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleConfirm(c.id)}
                                                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                                                        >
                                                            Xác nhận
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(c.id, c.roomIds, 0, 0)}
                                                            className="text-red-500 hover:text-red-700 underline font-medium"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )
                                            ) : (
                                                <button disabled className="text-gray-400 cursor-not-allowed">
                                                    Hoàn thành
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        count={contractPageCount}
                        page={contractPage}
                        onChange={handleContractPageChange}
                        color="primary"
                        className="flex justify-center mb-8"
                    />
                </>
            )}
        </div>
    );
};

export default AuthorizationList;