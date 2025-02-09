import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Icon from '../../Icon';
import BuildingServices from "../../../Services/Admin/BuildingServices";
import Counts from '../Counts';
import { FiFilter, FiPlus } from 'react-icons/fi';
import Modal from 'react-modal';

const BuildingList = () => {
    const [buildings, setBuildings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [searchTerm]);

    const fetchData = () => {
        BuildingServices.getBuildings(searchTerm)
            .then(data => {
                setBuildings(data);
            })
            .catch(error => console.error('Error fetching Account:', error));
    };

    const handleStatusChange = (userId, currentStatus, e) => {
        // Ngăn chặn sự kiện nổi bọt lên row
        e.stopPropagation();

        const newStatus = !currentStatus; // Lật ngược trạng thái
        BuildingServices.updateStatus(userId, newStatus)
            .then(() => {
                fetchData(); // Cập nhật lại dữ liệu sau khi thay đổi
            })
            .catch(error => console.error('Error updating status:', error));
    };

    const handleCreate = () => {
        navigate('/Admin/Buildings/Creates');
    };

    const handleRowClick = (buildingId) => {
        navigate(`/Admin/Buildings/Details/${buildingId}`);
    };
    const openAcceptModal = (building, e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện nổi bọt
        setSelectedBuilding(building);
        setShowAcceptModal(true);
    };

    const closeAcceptModal = () => {
        setShowAcceptModal(false);
        setSelectedBuilding(null);
    };
    const handleAcceptConfirm = () => {
        // Thực hiện logic xác nhận tòa nhà ở đây
        // Ví dụ: BuildingServices.acceptBuilding(selectedBuilding.buildingId)
        // Sau đó đóng modal và cập nhật dữ liệu nếu cần
        closeAcceptModal();
    };
    // Mở modal từ chối
    const openRejectModal = (building, e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện nổi bọt
        setSelectedBuilding(building);
        setShowRejectModal(true);
    };

    const closeRejectModal = () => {
        setShowRejectModal(false);
        setSelectedBuilding(null);
        setRejectReason('');
    };

    const handleRejectConfirm = () => {
        // Thực hiện logic từ chối tòa nhà, truyền kèm rejectReason
        // Ví dụ: BuildingServices.rejectBuilding(selectedBuilding.buildingId, rejectReason)
        closeRejectModal();
    };
    return (
        <div className="p-6">
            <Counts />
            <div className='font-bold text-6xl ml-3 my-8 text-blue-500 flex justify-between'>
                <h1>Tòa Nhà</h1>
                <button
                    onClick={handleCreate}
                    className='flex mr-2 items-center text-white bg-blue-500 rounded-3xl h-11 px-2'
                >
                    <FiPlus className="mr-2 text-xl" />
                    <p className="font-semibold text-lg">Tạo Tòa Nhà</p>
                </button>
            </div>
            <div className="flex items-center mb-6">
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl">
                    <FiFilter className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Tên (A-Z)</p>
                </button>
                <div className="relative w-1/3 mx-2 ml-auto">
                    <input
                        className="border w-full h-11 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        type="text"
                        placeholder="  Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Icon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" name="search" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-left font-semibold text-black">#</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Tên Tòa Nhà</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Tên Chủ Sở Hữu</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Địa Chỉ</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Trạng Thái</th>
                            <th className="py-2 px-4 font-semibold text-black text-center">Xác Thực</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buildings.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-2 text-center text-gray-500">
                                    Không tìm thấy kết quả
                                </td>
                            </tr>
                        ) : (
                            buildings.map((building, index) => (
                                <tr
                                    key={building.userId}
                                    onClick={() => handleRowClick(building.buildingId)}
                                    className="hover:bg-gray-200 border-collapse border border-gray-300"
                                >
                                    <td className="py-2 px-4 text-gray-700 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{building.buildingName}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{building.name}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{building.location}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">
                                        <button
                                            onClick={(e) => handleStatusChange(building.userId, building.status, e)}
                                            className={`px-4 py-2 rounded-3xl font-semibold text-white ${building.status
                                                ? 'bg-green-500 hover:bg-green-400'
                                                : 'bg-red-500 hover:bg-red-400'
                                                }`}
                                        >
                                            {building.status ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="py-2 px-4 border-b text-blue-600 text-center underline underline-offset-2">
                                        <div className="flex justify-around">
                                            <button
                                                onClick={(e) => openAcceptModal(building, e)}
                                                className="mr-4 hover:text-red-500 underline"
                                            >
                                                Xác Nhận
                                            </button>
                                            <button
                                                onClick={(e) => openRejectModal(building, e)}
                                                className='hover:text-red-500 underline'
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
            {/* Modal Xác Nhận */}
            <Modal
                isOpen={showAcceptModal}
                onRequestClose={closeAcceptModal}
                contentLabel="Xác Nhận Tòa Nhà"
                className="w-1/3 h-40 bg-white mx-auto my-5 p-5 border border-gray-400 rounded-lg"
            >
                <h1 className='font-bold text-xl text-blue-500'>Xác Nhận Tòa Nhà</h1>
                <p>Bạn có chắc chắn muốn Xác nhận Tòa nhà <strong>{selectedBuilding?.buildingName}</strong> không?</p>
                <div className="flex justify-end mt-5">
                    <button onClick={handleAcceptConfirm} className="mr-4 bg-blue-500 text-white px-4 py-2 rounded">
                        Đồng ý
                    </button>
                    <button onClick={closeAcceptModal} className="bg-gray-300 px-4 py-2 rounded">
                        Hủy
                    </button>
                </div>
            </Modal>

            {/* Modal Từ Chối */}
            <Modal
                isOpen={showRejectModal}
                onRequestClose={closeRejectModal}
                contentLabel="Từ Chối Tòa Nhà"
                className="w-1/3 h-52 bg-white mx-auto my-5 p-5 border border-gray-400 rounded-lg"
            >
                <h1 className='font-bold text-xl text-red-500'>Từ Chối Tòa Nhà</h1>
                <p>Vui lòng nhập lý do từ chối cho tòa nhà <strong>{selectedBuilding?.buildingName}</strong>:</p>
                <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="border p-2 w-full my-4"
                    placeholder="Lý do từ chối..."
                />
                <div>
                    <button onClick={handleRejectConfirm} className="mr-4 bg-blue-500 text-white px-4 py-2 rounded">
                        Xác nhận
                    </button>
                    <button onClick={closeRejectModal} className="bg-gray-300 px-4 py-2 rounded">
                        Hủy
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default BuildingList;
