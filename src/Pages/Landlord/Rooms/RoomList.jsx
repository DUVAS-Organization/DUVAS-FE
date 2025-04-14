import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import SidebarUser from '../../../Components/Layout/SidebarUser';
import { useNavigate } from 'react-router-dom';
import Loading from '../../../Components/Loading';
import { FaMapMarkerAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaEdit } from 'react-icons/fa';
import { FaChartArea } from 'react-icons/fa6';
import Footer from '../../../Components/Layout/Footer';
import RoomLandlordService from '../../../Services/Landlord/RoomLandlordService';
import BookingManagementService from '../../../Services/Landlord/BookingManagementService';
import { useAuth } from '../../../Context/AuthProvider';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
    color: theme.palette.text.secondary,
    cursor: 'pointer',
    transition: 'transform 0.2s',
    width: '250px',
    height: '350px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    '&:hover': {
        transform: 'scale(1.02)',
    },
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
}));

// Hàm hiển thị overlay (góc trên trái) dựa trên status
const getStatusOverlay = (status) => {
    switch (status) {
        case 1:
            return (
                <div className="absolute top-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded flex items-center">
                    <FaCheckCircle className="text-green-500 mr-1" />
                    <span className="text-green-500 font-bold text-sm">Còn trống</span>
                </div>
            );
        case 2:
            return (
                <div className="absolute top-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded flex items-center">
                    <FaHourglassHalf className="text-yellow-500 mr-1" />
                    <span className="text-yellow-500 font-bold text-sm">Đang chờ giao dịch</span>
                </div>
            );
        case 3:
            return (
                <div className="absolute top-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded flex items-center">
                    <FaTimesCircle className="text-red-500 mr-1" />
                    <span className="text-red-500 font-bold text-sm">Đã được thuê</span>
                </div>
            );
        case 4:
            return (
                <div className="absolute top-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded flex items-center">
                    <FaHourglassHalf className="text-orange-500 mr-1" />
                    <span className="text-orange-500 font-bold text-sm">Chờ Người dùng xác nhận</span>
                </div>
            );
        default:
            return null;
    }
};

// Hàm chuyển status -> tên
const getStatusName = (status) => {
    switch (status) {
        case 1:
            return 'trống';
        case 2:
            return 'chờ giao dịch';
        case 3:
            return 'được thuê';
        case 4:
            return 'chờ xác nhận';
        default:
            return 'không xác định';
    }
};

// Hàm xác định status cho card dựa trên room + booking
const determineDisplayStatus = (room, booking) => {
    if (!booking) {
        return 1; // Không có booking -> Còn trống
    }
    const { rentalStatus, contractStatus } = booking;
    const roomStatus = room.status;

    if (rentalStatus === 1 && roomStatus === 1) {
        return 2; // Đang chờ giao dịch
    }
    if (rentalStatus === 1 && roomStatus === 2 && contractStatus === 4) {
        return 4; // Chờ Người dùng xác nhận
    }
    if (rentalStatus === 1 && roomStatus === 3 && contractStatus === 1) {
        return 3; // Đang cho thuê
    }
    return 1;
};

// Thứ tự sắp xếp: status 2 -> 4 -> 3 -> 1
const sortOrder = { 2: 1, 4: 2, 3: 3, 1: 4 };

const RoomList = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState(null);
    const { user } = useAuth();

    // Fetch toàn bộ dữ liệu
    const fetchAllCards = async () => {
        setLoading(true);
        try {
            if (!user?.token || !user?.userId) {
                throw new Error('Không có token hoặc userId');
            }
            const roomResponse = await RoomLandlordService.getRooms();
            const rentalResponse = await BookingManagementService.getRentalListOfLandlord(user.userId, user.token);
            const roomsData = roomResponse.rooms || [];
            const bookingsData = rentalResponse || [];
            const newCards = [];

            roomsData.forEach((room) => {
                const roomBookings = bookingsData.filter((bk) => bk.roomId === room.roomId);
                const validBookings = roomBookings.filter((bk) => bk.rentalStatus === 1);

                if (validBookings.length === 0) {
                    newCards.push({
                        roomId: room.roomId,
                        title: room.title || `Phòng ${room.roomId}`,
                        image: room.image || '[]',
                        locationDetail: room.locationDetail || 'Chưa xác định',
                        acreage: room.acreage || 0,
                        price: room.price || 0,
                        createdDate: room.createdDate || room.CreatedDate,
                        status: 1,
                        booking: null,
                        isPermission: room.isPermission !== undefined ? room.isPermission : 1, // Xử lý trường hợp undefined
                    });
                } else {
                    validBookings.forEach((bk) => {
                        const displayStatus = determineDisplayStatus(room, bk);
                        newCards.push({
                            roomId: room.roomId,
                            title: room.title || `Phòng ${room.roomId}`,
                            image: room.image || '[]',
                            locationDetail: room.locationDetail || 'Chưa xác định',
                            acreage: room.acreage || 0,
                            price: room.price || 0,
                            createdDate: room.createdDate || room.CreatedDate,
                            status: displayStatus,
                            booking: bk,
                            isPermission: room.isPermission !== undefined ? room.isPermission : 1, // Xử lý trường hợp undefined
                        });
                    });
                }
            });

            newCards.sort((a, b) => {
                const orderA = sortOrder[a.status] || 5;
                const orderB = sortOrder[b.status] || 5;
                if (orderA !== orderB) {
                    return orderA - orderB;
                } else {
                    const dateA = new Date(a.createdDate || 0);
                    const dateB = new Date(b.createdDate || 0);
                    return dateB - dateA;
                }
            });

            setCards(newCards);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng:', error);
            setCards([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCardsByStatus = async (status) => {
        setLoading(true);
        try {
            if (!user?.token || !user?.userId) {
                throw new Error('Không có token hoặc userId');
            }
            const roomResponse = await RoomLandlordService.getRooms();
            const rentalResponse = await BookingManagementService.getRentalListOfLandlord(user.userId, user.token);
            const roomsData = roomResponse.rooms || [];
            const bookingsData = rentalResponse || [];
            const filteredCards = [];

            roomsData.forEach((room) => {
                const roomBookings = bookingsData.filter((bk) => bk.roomId === room.roomId);
                const validBookings = roomBookings.filter((bk) => bk.rentalStatus === 1);

                if (validBookings.length === 0) {
                    if (status === 1) {
                        filteredCards.push({
                            roomId: room.roomId,
                            title: room.title || `Phòng ${room.roomId}`,
                            image: room.image || '[]',
                            locationDetail: room.locationDetail || 'Chưa xác định',
                            acreage: room.acreage || 0,
                            price: room.price || 0,
                            createdDate: room.createdDate || room.CreatedDate,
                            status: 1,
                            booking: null,
                            isPermission: room.isPermission !== undefined ? room.isPermission : 1, // Xử lý trường hợp undefined
                        });
                    }
                } else {
                    validBookings.forEach((bk) => {
                        const displayStatus = determineDisplayStatus(room, bk);
                        if (displayStatus === status) {
                            filteredCards.push({
                                roomId: room.roomId,
                                title: room.title || `Phòng ${room.roomId}`,
                                image: room.image || '[]',
                                locationDetail: room.locationDetail || 'Chưa xác định',
                                acreage: room.acreage || 0,
                                price: room.price || 0,
                                createdDate: room.createdDate || room.CreatedDate,
                                status: displayStatus,
                                booking: bk,
                                isPermission: room.isPermission !== undefined ? room.isPermission : 1, // Xử lý trường hợp undefined
                            });
                        }
                    });
                }
            });
            filteredCards.sort((a, b) => {
                const dateA = new Date(a.createdDate || 0);
                const dateB = new Date(b.createdDate || 0);
                return dateB - dateA;
            });

            setCards(filteredCards);
        } catch (error) {
            console.error('Lỗi khi lấy phòng theo trạng thái:', error);
            setCards([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token && user?.userId) {
            fetchAllCards();
        } else {
            console.error('Thiếu token hoặc userId từ AuthContext');
            setLoading(false);
        }
    }, [user]);

    const handleFilterByStatus = (status) => {
        setActiveStatus(status);
        if (status === null) {
            fetchAllCards();
        } else {
            fetchCardsByStatus(status);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-4">
                <Loading />
            </div>
        );
    }

    return (
        <div>
            <SidebarUser />
            <Box className="max-w-7xl mx-auto ml-56" sx={{ flexGrow: 1 }}>
                <div className="pt-6 mb-4 flex flex-wrap space-x-4">
                    <button
                        onClick={() => handleFilterByStatus(null)}
                        className={`px-4 py-2 rounded ${activeStatus === null ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => handleFilterByStatus(1)}
                        className={`px-4 py-2 rounded ${activeStatus === 1 ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    >
                        Phòng đang trống
                    </button>
                    <button
                        onClick={() => handleFilterByStatus(2)}
                        className={`px-4 py-2 rounded ${activeStatus === 2 ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    >
                        Phòng chờ giao dịch
                    </button>
                    <button
                        onClick={() => handleFilterByStatus(4)}
                        className={`px-4 py-2 rounded ${activeStatus === 4 ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    >
                        Phòng chờ xác nhận
                    </button>
                    <button
                        onClick={() => handleFilterByStatus(3)}
                        className={`px-4 py-2 rounded ${activeStatus === 3 ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    >
                        Phòng đang cho thuê
                    </button>
                </div>
                {cards.length === 0 ? (
                    <p className="text-black font-semibold text-center">
                        {activeStatus === null
                            ? "Bạn hiện không có phòng nào trong hệ thống."
                            : `Không có phòng nào đang ${getStatusName(activeStatus)}.`}
                    </p>
                ) : (
                    <Grid container spacing={2} className="mt-4">
                        {cards.map((card) => {
                            let images;
                            try {
                                images = JSON.parse(card.image || '[]');
                            } catch (error) {
                                console.error(`Lỗi parse image phòng ${card.roomId}:`, error);
                                images = card.image ? [card.image] : [];
                            }
                            if (!Array.isArray(images)) images = [images];
                            const firstImage = images[0] || 'https://via.placeholder.com/250x350';
                            console.log(`Rendering Room ID: ${card.roomId}, isPermission: ${card.isPermission}`); // Log khi render mỗi card

                            return (
                                <Grid key={`${card.roomId}-${card.booking ? card.booking.rentalId : 'null'}`} item xs={12} sm={6} md={4}>
                                    <Item onClick={() => navigate(`/Rooms/Contract/${card.roomId}/${card.booking ? card.booking.rentalId : 'null'}`)}>
                                        <div className="flex flex-col h-full">
                                            <div className="relative">
                                                <img
                                                    className={`rounded-t-lg shadow-md overflow-hidden w-full h-48 object-cover ${card.isPermission === 0 ? 'opacity-30' : ''}`}
                                                    alt={card.title || 'Image of a room'}
                                                    src={firstImage}
                                                />
                                                {card.isPermission === 0 ? (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="relative w-full h-full">
                                                            <div className="absolute top-0 left-0 w-full h-full bg-transparent flex items-center justify-center">
                                                                <span className="text-red-700 text-2xl font-bold transform -rotate-45">
                                                                    Đã bị khóa
                                                                </span>
                                                            </div>
                                                            <div className="absolute top-1/2 left-1/2 w-36 h-36 rounded-full border-8 border-red-700 transform -rotate-45 -translate-x-1/2 -translate-y-1/2"></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    getStatusOverlay(card.status)
                                                )}
                                                {card.status === 1 && (
                                                    <div
                                                        className="absolute top-2 right-0 bg-white bg-opacity-70 px-2 py-1 rounded cursor-pointer hover:bg-opacity-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/Rooms/Edit/${card.roomId}`);
                                                        }}
                                                        title="Chỉnh sửa phòng"
                                                    >
                                                        <FaEdit className="text-red-500 text-2xl" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col flex-grow p-2 justify-between max-h-[355px]">
                                                <p className="text-black text-base font-semibold truncate max-w-[250px]">
                                                    {card.title}
                                                </p>
                                                <p className="text-gray-600 flex items-center mt-1 text-sm truncate max-w-[250px]">
                                                    <FaMapMarkerAlt className="absolute" />
                                                    <span className="ml-5">
                                                        {card.locationDetail || 'Vị trí không xác định'}
                                                    </span>
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1 flex items-center">
                                                    <FaChartArea className="mr-1" />
                                                    Diện tích: <span className="text-gray-800">{card.acreage || 'N/A'}</span> m²
                                                </p>
                                                <p className="text-red-500 font-medium text-base mt-1">
                                                    {card.price ? `${card.price.toLocaleString('vi-VN')} đ/tháng` : 'Thỏa thuận'}
                                                </p>
                                                <p>
                                                    {card.booking && (
                                                        <div>
                                                            <p className="font-semibold">Người đặt: {card.booking.renterName || 'N/A'}</p>
                                                            <p>
                                                                Ngày đặt: {format(new Date(card.booking.createdDate), 'dd-MM-yyyy HH:mm', { locale: vi })}
                                                            </p>
                                                        </div>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </Item>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Box>
            <Footer />
        </div>
    );
};

export default RoomList;