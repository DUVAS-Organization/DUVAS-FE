import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../Components/Icon';
import BuildingServices from "../../../Services/Admin/BuildingServices";
import Counts from '../../../Components/Counts';
import { FiFilter, FiPlus } from 'react-icons/fi';
import Modal from 'react-modal';

const BuildingList = () => {
    const [buildings, setBuildings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const navigate = useNavigate();

    // Gọi fetchData khi searchTerm hoặc sortOrder thay đổi
    useEffect(() => {
        fetchData();
    }, [searchTerm, sortOrder]);

    const fetchData = () => {
        BuildingServices.getBuildings(searchTerm)
            .then(data => {
                console.log("Fetched Buildings:", data);
                let sortedBuildings = [...data]; // Tạo bản sao của mảng dữ liệu

                // Sắp xếp danh sách tòa nhà theo buildingName
                sortedBuildings.sort((a, b) => {
                    const nameA = a.buildingName.toLowerCase();
                    const nameB = b.buildingName.toLowerCase();
                    if (sortOrder === 'asc') {
                        return nameA.localeCompare(nameB); // Sắp xếp A-Z
                    } else {
                        return nameB.localeCompare(nameA); // Sắp xếp Z-A
                    }
                });

                setBuildings(sortedBuildings); // Cập nhật state với danh sách đã sắp xếp
            })
            .catch(error => console.error('Error fetching Building:', error));
    };

    // Hàm kiểm tra trạng thái hoạt động (active) của tòa nhà
    const isActiveStatus = (status) => {
        return status === 1 || status === true || status === "1" || status === "true";
    };

    const handleStatusChange = (buildingId, currentStatus, e) => {
        e.stopPropagation();
        const isActive = isActiveStatus(currentStatus);
        if (isActive) {
            if (window.confirm("Bạn có chắc chắn muốn khóa tòa nhà này?")) {
                BuildingServices.lockBuilding(buildingId)
                    .then(() => fetchData())
                    .catch(error => console.error('Error locking building:', error));
            }
        } else {
            if (window.confirm("Bạn có chắc chắn muốn mở khóa phòng này?")) {
                BuildingServices.unlockBuilding(buildingId)
                    .then(() => fetchData())
                    .catch(error => console.error('Error unlocking building:', error));
            }
        }
    };

    const handleCreate = () => {
        navigate('/Admin/Buildings/Creates');
    };

    const handleRowClick = (buildingId) => {
        navigate(`/Admin/Buildings/Details/${buildingId}`);
    };

    const openAcceptModal = (building, e) => {
        e.stopPropagation();
        setSelectedBuilding(building);
        setShowAcceptModal(true);
    };

    const closeAcceptModal = () => {
        setShowAcceptModal(false);
        setSelectedBuilding(null);
    };

    const handleAcceptConfirm = () => {
        // Xử lý xác nhận (nếu có)
        closeAcceptModal();
    };

    const openRejectModal = (building, e) => {
        e.stopPropagation();
        setSelectedBuilding(building);
        setShowRejectModal(true);
    };

    const closeRejectModal = () => {
        setShowRejectModal(false);
        setSelectedBuilding(null);
        setRejectReason('');
    };

    const handleRejectConfirm = () => {
        // Xử lý từ chối (nếu có)
        closeRejectModal();
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <Counts />
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-500 mb-4 sm:mb-0">
                    Tòa Nhà
                </h1>
                <button
                    onClick={handleCreate}
                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-full shadow hover:bg-blue-600 transition"
                >
                    <FiPlus className="mr-2 text-xl" />
                    <span className="font-semibold">Tạo Tòa Nhà</span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                {/* Nút sắp xếp */}
                <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} // Chuyển đổi giữa A-Z và Z-A
                    className="flex items-center border bg-white border-gray-400 rounded-md px-3 py-2 mb-2 sm:mb-0 sm:mr-4 hover:bg-gray-100 transition"
                >
                    <FiFilter className="mr-2 text-lg" />
                    <span className="font-medium text-sm">
                        Tên ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'}) {/* Hiển thị trạng thái sắp xếp */}
                    </span>
                </button>
                <div className="relative w-full sm:w-1/3">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-md pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <Icon name="search" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
            </div>

            <div className="shadow rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full table-fixed bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-[5%] px-2 py-2 text-center text-sm font-medium text-gray-600">#</th>
                            <th className="w-[20%] px-2 py-2 text-left text-sm font-medium text-gray-600">Tên Tòa Nhà</th>
                            <th className="w-[50%] px-2 py-2 text-left text-sm font-medium text-gray-600">Địa Chỉ</th>
                            <th className="w-[10%] px-2 py-2 text-center text-sm font-medium text-gray-600">Trạng Thái</th>
                            <th className="w-[15%] px-2 py-2 text-center text-sm font-medium text-gray-600">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buildings.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-4 text-center text-gray-500 text-sm">
                                    Không tìm thấy kết quả
                                </td>
                            </tr>
                        ) : (
                            buildings.map((building, index) => {
                                const isActive = isActiveStatus(building.status);
                                return (
                                    <tr
                                        key={building.buildingId}
                                        className="border-t border-gray-200 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleRowClick(building.buildingId)}
                                    >
                                        <td className="px-2 py-2 text-center text-sm text-gray-700">{index + 1}</td>
                                        <td className="px-2 py-2 text-sm text-gray-700 break-words">{building.buildingName}</td>
                                        <td className="px-2 py-2 text-sm text-gray-700 break-words">{building.location}</td>
                                        <td className="px-2 py-2 text-sm text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${building.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}>
                                                {building.status === 1 ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <div className="flex justify-center gap-4 text-sm min-w-[250px]">
                                                <button
                                                    onClick={(e) => openAcceptModal(building, e)}
                                                    className="text-blue-600 hover:underline w-[70px] text-center"
                                                >
                                                    Xác nhận
                                                </button>
                                                <button
                                                    onClick={(e) => openRejectModal(building, e)}
                                                    className="text-blue-600 hover:underline w-[60px] text-center"
                                                >
                                                    Từ chối
                                                </button>
                                                <button
                                                    onClick={(e) => handleStatusChange(building.buildingId, building.status, e)}
                                                    className={`hover:underline text-center font-semibold w-[70px] ${isActive ? 'text-red-600' : 'text-green-600'}`}
                                                >
                                                    {isActive ? 'Khóa' : 'Mở Khóa'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Xác Nhận */}
            <Modal
                isOpen={showAcceptModal}
                onRequestClose={closeAcceptModal}
                contentLabel="Xác Nhận Tòa Nhà"
                className="w-11/12 sm:w-1/3 mx-auto my-6 p-6 bg-white rounded-lg shadow-lg outline-none"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <h1 className="text-xl font-bold text-blue-600 mb-4">Xác Nhận Tòa Nhà</h1>
                <p className="text-gray-700 mb-6">
                    Bạn có chắc chắn muốn xác nhận tòa nhà <strong>{selectedBuilding?.buildingName}</strong> không?
                </p>
                <div className="flex justify-end">
                    <button
                        onClick={handleAcceptConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition mr-3"
                    >
                        Đồng ý
                    </button>
                    <button
                        onClick={closeAcceptModal}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                    >
                        Hủy
                    </button>
                </div>
            </Modal>

            {/* Modal Từ Chối */}
            <Modal
                isOpen={showRejectModal}
                onRequestClose={closeRejectModal}
                contentLabel="Từ Chối Tòa Nhà"
                className="w-11/12 sm:w-1/3 mx-auto my-6 p-6 bg-white rounded-lg shadow-lg outline-none"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <h1 className="text-xl font-bold text-red-600 mb-4">Từ Chối Tòa Nhà</h1>
                <p className="text-gray-700 mb-4">
                    Vui lòng nhập lý do từ chối cho tòa nhà <strong>{selectedBuilding?.buildingName}</strong>:
                </p>
                <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Lý do từ chối..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <div className="flex justify-end">
                    <button
                        onClick={handleRejectConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition mr-3"
                    >
                        Xác nhận
                    </button>
                    <button
                        onClick={closeRejectModal}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                    >
                        Hủy
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default BuildingList;