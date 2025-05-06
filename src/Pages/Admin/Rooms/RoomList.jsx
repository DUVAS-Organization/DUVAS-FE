import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../Components/Icon';
import RoomServices from "../../../Services/Admin/RoomServices";
import CategoryRoomServices from "../../../Services/Admin/CategoryRooms";
import Counts from '../../../Components/Counts';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { showCustomNotification } from '../../../Components/Notification';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Popup state
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupType, setPopupType] = useState(''); // 'accept', 'reject', 'lock', 'unlock'
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [reason, setReason] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [searchTerm, selectedCategory, , sortOrder]);

    const fetchData = async () => {
        try {
            const roomsData = await RoomServices.getRooms(searchTerm);
            const filteredRooms = selectedCategory
                ? roomsData.filter(room => room.categoryName === selectedCategory)
                : roomsData;
            filteredRooms.sort((a, b) => {
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                if (sortOrder === 'asc') {
                    return titleA.localeCompare(titleB);
                } else {
                    return titleB.localeCompare(titleA);
                }
            });
            setRooms(filteredRooms);

            const categoryData = await CategoryRoomServices.getCategoryRooms();
            setCategoryRooms(categoryData);
        } catch (error) {
            console.error('Error fetching data:', error);
            showCustomNotification('error', 'Lỗi khi lấy dữ liệu!');
        }
    };

    const handleGetLockedRooms = async () => {
        try {
            const lockedRooms = await RoomServices.getLockedRooms();
            if (lockedRooms.length === 0) {
                setRooms([]);
            } else {
                setRooms(lockedRooms);
            }
            setSelectedCategory('');
            setSearchTerm('');
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching locked rooms:', error);
            showCustomNotification('error', `Không thể lấy danh sách phòng bị khóa: ${error.message}`);
        }
    };

    const handleGetActiveRooms = async () => {
        try {
            const activeRooms = await RoomServices.getActiveRooms();
            if (activeRooms.length === 0) {
                setRooms([]);
            } else {
                setRooms(activeRooms);
            }
            setSelectedCategory('');
            setSearchTerm('');
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching active rooms:', error);
            showCustomNotification('error', `Không thể lấy danh sách phòng đang hoạt động: ${error.message}`);
        }
    };

    const handleAcceptReputation = async (roomId) => {
        try {
            await RoomServices.acceptReputation(roomId);
            showCustomNotification('success', 'Xác nhận tích xanh thành công!');
            fetchData();
        } catch (error) {
            console.error('Error accepting reputation:', error);
            showCustomNotification('error', `Không thể xác nhận tích xanh: ${error.message}`);
        }
    };

    const handleCancelReputation = async (roomId, reason) => {
        try {
            await RoomServices.cancelReputation(roomId, reason);
            showCustomNotification('success', 'Hủy tích xanh thành công!');
            fetchData();
        } catch (error) {
            console.error('Error canceling reputation:', error);
            showCustomNotification('error', `Không thể hủy tích xanh: ${error.message}`);
        }
    };

    const handleToggleLock = async (roomId, action) => {
        try {
            if (action === 'unlock') {
                await RoomServices.unlockRoom(roomId);
                showCustomNotification('success', 'Mở khóa phòng thành công!');
            } else {
                await RoomServices.lockRoom(roomId);
                showCustomNotification('success', 'Khóa phòng thành công!');
            }
            fetchData();
        } catch (error) {
            console.error('Error toggling lock:', error);
            showCustomNotification('error', `Không thể ${action === 'unlock' ? 'mở khóa' : 'khóa'} phòng: ${error.message}`);
        }
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
        setCurrentPage(1);
    };

    const handleCreate = () => {
        navigate('/Admin/Rooms/Creates');
    };

    const handleRowClick = (roomId) => {
        navigate(`/Admin/Rooms/Details/${roomId}`);
    };

    const openPopup = (type, roomId, roomStatus) => {
        if (type === 'lock' && roomStatus === 3) {
            showCustomNotification('error', 'Không thể khóa phòng đã thuê!');
            return;
        }
        setPopupType(type);
        setSelectedRoomId(roomId);
        setReason('');
        setIsPopupOpen(true);
    };

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRooms = rooms.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(rooms.length / rowsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="p-6">
            <Counts />
            <div className="font-bold text-4xl ml-3 my-8 text-blue-500 flex justify-between">
                <h1>Phòng</h1>
                <button
                    onClick={handleCreate}
                    className="flex mr-2 items-center text-white bg-blue-500 rounded-3xl h-11 px-2"
                >
                    <FiPlus className="mr-2 text-xl" />
                    <p className="font-semibold text-lg">Tạo Phòng</p>
                </button>
            </div>
            <div className="flex justify-between mb-4">
                <div className='flex items-center space-x-4'>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center border bg-white border-gray-300 rounded-lg px-3 py-2 mb-2 sm:mb-0 hover:bg-gray-100 transition"
                    >
                        <FiFilter className=" text-lg" />
                        <span className="font-medium text-base">
                            Tên ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                        </span>
                    </button>
                    <select
                        className="border border-gray-300 px-3 py-2 rounded-lg bg-white shadow-sm font-medium text-base"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                    >
                        <option className="text-base font-medium" value="" disabled>
                            Loại Phòng
                        </option>
                        {categoryRooms.map(categoryRoom => (
                            <option key={categoryRoom.categoryRoomId} value={categoryRoom.categoryName}>
                                {categoryRoom.categoryName}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleGetLockedRooms}
                        className="border border-gray-300 flex items-center px-3 py-2 rounded-lg bg-white shadow-sm"
                    >
                        <p className="font-medium text-base">Phòng bị khóa</p>
                    </button>
                    <button
                        onClick={handleGetActiveRooms}
                        className="border border-gray-300 flex items-center px-3 py-2 rounded-lg bg-white shadow-sm"
                    >
                        <p className="font-medium text-base">Phòng hoạt động</p>
                    </button>
                </div>
                <div className="relative w-1/4 ml-auto">
                    <input
                        className="border border-gray-300 w-full h-10 rounded-lg px-3 focus:outline-none focus:ring focus:ring-blue-200"
                        type="text"
                        placeholder="Tìm kiếm theo tiêu đề hoặc địa chỉ..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" name="search" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead>
                        <tr className="bg-gray-50 text-gray-800">
                            <th className="py-3 px-4 text-center font-medium">#</th>
                            <th className="py-3 px-4 text-left font-medium">Tiêu Đề</th>
                            <th className="py-3 px-4 text-left font-medium ">Loại Phòng</th>
                            <th className="py-3 px-4 text-left font-medium ">Giá</th>
                            <th className="py-3 px-4 text-left font-medium ">Địa Chỉ</th>
                            <th className="py-3 px-4 text-left font-medium ">Trạng Thái</th>
                            <th className="py-3 px-4 text-center font-medium ">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRooms.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-4 text-center text-gray-500">
                                    Không tìm thấy kết quả
                                </td>
                            </tr>
                        ) : (
                            currentRooms.map((room, index) => (
                                <tr
                                    key={room.roomId}
                                    onClick={() => handleRowClick(room.roomId)}
                                    className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                                >
                                    <td className="py-3 px-4 text-center text-gray-600">{index + 1 + indexOfFirstRow}</td>
                                    <td className="py-3 px-4 text-gray-600 truncate max-w-[250px]">{room.title}</td>
                                    <td className="py-3 px-4 text-gray-600">{room.categoryName}</td>
                                    <td className="py-3 px-4 text-gray-600">{room.price.toLocaleString('vi-VN')} đ</td>
                                    <td className="py-3 px-4 text-gray-600 truncate max-w-[200px]">{room.locationDetail}</td>
                                    <td className="py-3 px-4 text-gray-600">
                                        {room.status === 1 ? "Trống" : room.status === 2 ? "Chờ giao dịch" : room.status === 3 ? "Đã thuê" : "Không xác định"}
                                    </td>
                                    <td className="py-3 px-4 text-center space-x-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openPopup('accept', room.roomId);
                                            }}
                                            className=" text-blue-500 py-1 rounded text-sm hover:underline"
                                        >
                                            Xác Nhận
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openPopup('reject', room.roomId);
                                            }}
                                            className=" text-blue-500 px-2 py-1 rounded text-sm hover:underline"
                                        >
                                            Từ chối
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const action = room.isPermission === 0 || room.isPermission === 2 ? 'unlock' : 'lock';
                                                openPopup(action, room.roomId, room.status);
                                            }}
                                            className={`py-1 rounded text-sm ${room.isPermission === 0 || room.isPermission === 2 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'} hover:underline`}
                                        >
                                            {room.isPermission === 0 || room.isPermission === 2 ? "Mở khóa" : "Khóa"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Popup */}
            {
                isPopupOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h2 className={`text-xl font-bold mb-4 ${popupType === 'reject' || popupType === 'lock' ? 'text-red-500' : 'text-blue-500'}`}>
                                {popupType === 'accept' ? 'Xác Nhận Tích Xanh' :
                                    popupType === 'reject' ? 'Từ Chối Tích Xanh' :
                                        popupType === 'lock' ? 'Khóa Phòng' : 'Mở Khóa Phòng'}
                            </h2>
                            <p className="mb-4 text-gray-700">
                                {popupType === 'accept'
                                    ? 'Bạn có chắc chắn muốn xác nhận tích xanh cho phòng này?'
                                    : popupType === 'reject'
                                        ? 'Vui lòng nhập lý do từ chối tích xanh cho phòng này.'
                                        : popupType === 'lock'
                                            ? 'Bạn có chắc chắn muốn khóa phòng này?'
                                            : 'Bạn có chắc chắn muốn mở khóa phòng này?'}
                            </p>
                            {popupType === 'reject' && (
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded mb-4"
                                    rows="3"
                                    placeholder="Lý do từ chối..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            )}
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setIsPopupOpen(false)}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => {
                                        if (popupType === 'accept') {
                                            handleAcceptReputation(selectedRoomId);
                                        } else if (popupType === 'reject') {
                                            handleCancelReputation(selectedRoomId, reason);
                                        } else if (popupType === 'lock' || popupType === 'unlock') {
                                            handleToggleLock(selectedRoomId, popupType);
                                        }
                                        setIsPopupOpen(false);
                                        setReason('');
                                    }}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <div className="flex justify-center mt-4">
                <nav>
                    <ul className="inline-flex -space-x-px">
                        <li>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
                            >
                                <FaChevronLeft className='text-lg' />
                            </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                            <li key={pageNumber}>
                                <button
                                    onClick={() => paginate(pageNumber)}
                                    className={`px-3 py-2 leading-tight border border-gray-300 ${currentPage === pageNumber
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}
                                >
                                    {pageNumber}
                                </button>
                            </li>
                        ))}
                        <li>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
                            >
                                <FaChevronRight className='text-lg' />
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div >
    );
};

export default RoomList;