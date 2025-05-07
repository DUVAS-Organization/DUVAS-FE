import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContractService from '../../../../Services/Landlord/ContractService';
import RoomService from '../../../../Services/User/RoomService';
import UserService from '../../../../Services/User/UserService';
import Loading from '../../../../Components/Loading';

const ContractDetail = () => {
    const { contractId } = useParams();
    const [contract, setContract] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('authToken');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContractDetails = async () => {
            try {
                setLoading(true);
                const contractData = await ContractService.getAuthorizationContractById(contractId, token);
                setContract(contractData);

                if (contractData.roomList) {
                    const roomIds = contractData.roomList.split(',').map(id => parseInt(id));
                    const roomDetails = await Promise.all(
                        roomIds.map(async roomId => {
                            try {
                                const room = await RoomService.getRoomById(roomId, token);
                                return room;
                            } catch (err) {
                                console.error(`Lỗi khi lấy phòng ${roomId}:`, err.message);
                                return null;
                            }
                        })
                    );
                    setRooms(roomDetails.filter(room => room !== null));
                }

                const ids = [contractData.partyAId, contractData.partyBId, contractData.createdById].filter(id => id);
                const users = await Promise.all(
                    ids.map(async id => {
                        try {
                            const userData = await UserService.getUserById(id, token);
                            return userData;
                        } catch (err) {
                            console.error(`Lỗi khi lấy user ${id}:`, err.message);
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
                console.error('Lỗi khi lấy chi tiết hợp đồng:', err);
                setError('Không thể tải chi tiết hợp đồng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchContractDetails();
    }, [contractId, token]);

    const handleEditRoom = (roomId) => {
        navigate(`/room-edit/${roomId}`);
    };

    if (loading) return <Loading />;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4 sm:p-6 bg-white">
            <h1 className="text-2xl font-bold mb-6 text-blue-600">Chi tiết hợp đồng ủy quyền</h1>
            {contract && (
                <div className="mb-8">
                    <p><strong>Số hợp đồng:</strong> {contract.contractNumber}</p>
                    <p><strong>Ngày tạo:</strong> {new Date(contract.createdAt).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Bên A:</strong> {userMap[contract.partyAId] || contract.partyAId}</p>
                    <p><strong>Bên B:</strong> {userMap[contract.partyBId] || contract.partyBId}</p>
                    <p><strong>Người tạo:</strong> {userMap[contract.createdById] || contract.createdById}</p>
                    <p>
                        <strong>Trạng thái:</strong>{' '}
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${contract.status === 0
                                ? 'bg-red-500'
                                : contract.status === 3
                                    ? 'bg-green-500'
                                    : 'bg-gray-500'
                                }`}
                        >
                            {contract.status === 0 ? 'Bị hủy' : contract.status === 3 ? 'Admin đã duyệt' : 'Chưa rõ'}
                        </span>
                    </p>
                    <p><strong>File PDF:</strong> <a href={contract.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Tải PDF</a></p>
                </div>
            )}
            {rooms.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-4 text-blue-600">Danh sách phòng</h2>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">ID</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Tên phòng</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Địa chỉ</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b whitespace-nowrap">Giá (VND)</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b whitespace-nowrap">Trạng thái</th>
                                {/* <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b whitespace-nowrap">Chỉnh sửa</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room, idx) => (
                                <tr key={room.id || idx} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-700">{room.roomId}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700">{room.title || '-'}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700">{room.locationDetail || '-'}</td>
                                    <td className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">{room.price ? room.price.toLocaleString('vi-VN') : '-'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${room.status === 1
                                                ? 'bg-green-500'
                                                : room.status === 2
                                                    ? 'bg-yellow-500'
                                                    : room.status === 3
                                                        ? 'bg-red-500'
                                                        : 'bg-gray-500'
                                                }`}
                                        >
                                            {room.status === 1 ? 'Đang trống' :
                                                room.status === 2 ? 'Pending' :
                                                    room.status === 3 ? 'Đang được thuê' : 'Chưa rõ'}
                                        </span>
                                    </td>
                                    {/* <td className="px-4 py-2 text-sm text-gray-700">
                                        <button
                                            onClick={() => handleEditRoom(room.roomId)}
                                            className="text-blue-500 hover:underline"
                                        >
                                            Chỉnh sửa
                                        </button>
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ContractDetail;