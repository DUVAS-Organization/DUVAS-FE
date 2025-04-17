import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../Context/AuthProvider';
import SidebarUser from '../../../Components/Layout/SidebarUser';
import Loading from '../../../Components/Loading';
import UserService from '../../../Services/User/UserService';
import ContractService from '../../../Services/Landlord/ContractService';

const AuthorizationPage = () => {
    const { user } = useAuth();
    const userId = user?.userId;
    const [names, setNames] = useState({});
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUserName = async (userId) => {
        if (names[userId]) return names[userId];

        try {
            const user = await UserService.getUserById(userId);
            const name = user?.name || 'Không rõ';
            setNames((prev) => ({ ...prev, [userId]: name }));
            return name;
        } catch (error) {
            console.error(`Lỗi khi lấy tên user ${userId}:`, error);
            setNames((prev) => ({ ...prev, [userId]: 'Không rõ' }));
            return 'Không rõ';
        }
    };

    useEffect(() => {
        const fetchContracts = async () => {
            if (!userId) {
                setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const data = await ContractService.getMyAuthorizationContracts(userId);
                const list = data ? (Array.isArray(data) ? data : [data]) : [];
                setContracts(list);

                // Lấy tên các user liên quan
                const uniqueIds = new Set();
                list.forEach(c => {
                    if (c.partyAId) uniqueIds.add(c.partyAId);
                    if (c.partyBId) uniqueIds.add(c.partyBId);
                    if (c.createdById) uniqueIds.add(c.createdById);
                });

                for (let id of uniqueIds) {
                    await fetchUserName(id);
                }
            } catch (err) {
                setError(err.message || 'Không tìm thấy hợp đồng ủy quyền nào cho người dùng này.');
                setContracts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchContracts();
    }, [userId]);

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleString('vi-VN', {
            dateStyle: 'short',
            timeStyle: 'short',
        });

    const formatStatus = (status) => {
        switch (status) {
            case 0: return 'Bị hủy';
            case 1: return 'Đang hoạt động';
            case 2: return 'Đang chờ duyệt';
            case 3: return 'Đã duyệt';
            case 4: return 'Hết hạn';
            default: return 'Không xác định';
        }
    };

    const getFileNameFromUrl = (url) => {
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        return lastPart.split('?')[0]; // loại bỏ query string nếu có
    };

    const handleDownload = (url, fileName) => {
        try {
            const forceDownloadUrl = url.includes('?')
                ? `${url}&fl_attachment=true`
                : `${url}?fl_attachment=true`;

            const actualFileName = fileName || getFileNameFromUrl(url);

            const a = document.createElement('a');
            a.href = forceDownloadUrl;
            a.download = actualFileName;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Lỗi khi tải PDF:', error);
            alert('Không thể tải file PDF. Vui lòng thử lại.');
        }
    };

    return (
        <div className="flex bg-white min-h-screen">
            <SidebarUser />
            <div className="flex-1 p-6 ml-56 max-w-8xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Danh sách hợp đồng ủy quyền</h1>

                {loading && (
                    <div className="flex justify-center my-6">
                        <Loading />
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {!loading && !error && contracts.length === 0 && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
                        Không tìm thấy hợp đồng ủy quyền nào cho người dùng này.
                    </div>
                )}

                {!loading && !error && contracts.length > 0 && (
                    <div className="overflow-x-auto">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm table-fixed">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-sm font-medium text-center w-20 whitespace-nowrap">ID</th>
                                        <th className="px-4 py-2 text-sm font-medium text-left w-40 whitespace-nowrap">Số hợp đồng</th>
                                        <th className="px-4 py-2 text-sm font-medium text-left w-32 whitespace-nowrap">Ngày lập</th>
                                        <th className="px-4 py-2 text-sm font-medium text-left w-48 whitespace-nowrap">Bên A (ID)</th>
                                        <th className="px-4 py-2 text-sm font-medium text-left w-48 whitespace-nowrap">Bên B (ID)</th>
                                        <th className="px-4 py-2 text-sm font-medium text-left w-48 whitespace-nowrap">Người tạo (ID)</th>
                                        <th className="px-4 py-2 text-sm font-medium text-center w-40 whitespace-nowrap">Thời gian tạo</th>
                                        <th className="px-4 py-2 text-sm font-medium text-center w-40 whitespace-nowrap">Trạng thái</th>
                                        <th className="px-4 py-2 text-sm font-medium text-center w-40 whitespace-nowrap">PDF</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contracts.map((c) => (
                                        <tr key={c.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-center whitespace-nowrap">{c.id}</td>
                                            <td className="px-4 py-2 text-sm whitespace-nowrap">{c.contractNumber}</td>
                                            <td className="px-4 py-2 text-sm whitespace-nowrap">{c.date}</td>
                                            <td className="px-4 py-2 text-sm whitespace-nowrap">{names[c.partyAId] || c.partyAId}</td>
                                            <td className="px-4 py-2 text-sm whitespace-nowrap">Nguyễn Đình Mạnh Hùng</td>
                                            <td className="px-4 py-2 text-sm whitespace-nowrap">{names[c.createdById] || c.createdById}</td>
                                            <td className="px-4 py-2 text-sm text-center whitespace-nowrap">{formatDate(c.createdAt)}</td>
                                            <td className="px-4 py-2 text-sm text-center whitespace-nowrap">{formatStatus(c.status)}</td>
                                            <td className="px-4 py-2 text-sm text-center whitespace-nowrap">
                                                {c.pdfUrl ? (
                                                    <div className="flex flex-col space-y-2 items-center">
                                                        <button
                                                            onClick={() =>
                                                                handleDownload(c.pdfDownloadUrl || c.pdfUrl, `contract_${c.id}.pdf`)
                                                            }
                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                                        >
                                                            Tải PDF
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-red-500 text-sm">Không có PDF</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthorizationPage;
