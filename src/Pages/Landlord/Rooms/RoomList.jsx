import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import SidebarUser from '../../../Components/Layout/SidebarUser';
import { useNavigate } from 'react-router-dom';
import Loading from '../../../Components/Loading';
import { FaMapMarkerAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';
import { FaChartArea } from 'react-icons/fa6';
import Footer from '../../../Components/Layout/Footer';
import RoomLandlordService from '../../../Services/Landlord/RoomLandlordService';
import BookingManagementService from '../../../Services/Landlord/BookingManagementService';
import { useAuth } from '../../../Context/AuthProvider';

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

const getStatusName = (status) => {
    switch (status) {
        case 1:
            return 'Trống';
        case 2:
            return 'Chờ Landlord xác nhận';
        case 3:
            return 'Được thuê';
        case 4:
            return 'Chờ Người dùng xác nhận';
        default:
            return 'Tất cả';
    }
};

const RoomList = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState(null);
    const { user } = useAuth();

    const determineDisplayStatus = (room, rental) => {
        const rentalStatus = rental?.rentalStatus;
        const roomStatus = room.status;
        const contractStatus = rental?.contractStatus ?? null;

        // Log để kiểm tra dữ liệu
        console.log(`📌 Room ${room.roomId} - Rental:`, rental);
        console.log(`📌 Room ${room.roomId} - RentalStatus:`, rentalStatus);
        console.log(`📌 Room ${room.roomId} - RoomStatus:`, roomStatus);
        console.log(`📌 Room ${room.roomId} - ContractStatus:`, contractStatus);

        // Ưu tiên kiểm tra nếu có RentalStatus (tức là có yêu cầu thuê)
        if (rentalStatus !== undefined) {
            // Đang chờ giao dịch: RentalStatus = 1, status(Room) = 1
            if (rentalStatus === 1 && roomStatus === 1) {
                console.log(`📌 Room ${room.roomId} - Status: Đang chờ giao dịch`);
                return 2;
            }
            // Chờ Người dùng xác nhận: RentalStatus = 1, status(Room) = 2, status(Contract) = 4
            if (rentalStatus === 1 && roomStatus === 2 && contractStatus === 4) {
                console.log(`📌 Room ${room.roomId} - Status: Chờ Người dùng xác nhận`);
                return 4;
            }
            // Đã hủy: RentalStatus = 2, status(Room) = 2, status(Contract) = 2
            if (rentalStatus === 2 && roomStatus === 2 && contractStatus === 2) {
                console.log(`📌 Room ${room.roomId} - Status: Đã hủy (trả về Còn trống)`);
                return 1; // Đã hủy -> "Còn trống"
            }
            // Đang cho thuê: RentalStatus = 1, status(Room) = 3, status(Contract) = 1
            if (rentalStatus === 1 && roomStatus === 3 && contractStatus === 1) {
                console.log(`📌 Room ${room.roomId} - Status: Đang cho thuê`);
                return 3;
            }
            // Nếu RentalStatus = 2 nhưng không thỏa mãn điều kiện "Đã hủy", coi như yêu cầu thuê không còn hiệu lực
            if (rentalStatus === 2) {
                console.log(`📌 Room ${room.roomId} - Status: Yêu cầu thuê đã hủy (trả về Còn trống)`);
                return 1; // Yêu cầu thuê đã hủy -> "Còn trống"
            }
        }

        // Nếu không có RentalStatus, kiểm tra status(Room)
        console.log(`📌 Room ${room.roomId} - No RentalStatus, checking Room Status`);
        if (roomStatus === 1) {
            console.log(`📌 Room ${room.roomId} - Status: Còn trống`);
            return 1; // Còn trống
        }
        if (roomStatus === 2) {
            console.log(`📌 Room ${room.roomId} - Status: Đã được đặt`);
            return 2; // Đã được đặt
        }
        if (roomStatus === 3) {
            console.log(`📌 Room ${room.roomId} - Status: Đang cho thuê`);
            return 3; // Đang cho thuê
        }

        console.log(`📌 Room ${room.roomId} - Status: Không xác định`);
        return 1; // Mặc định trả về "Còn trống" nếu không xác định
    };

    const fetchAllRooms = async () => {
        setLoading(true);
        try {
            if (!user?.token || !user?.userId) {
                throw new Error('Không có token hoặc userId');
            }
            const roomResponse = await RoomLandlordService.getRooms();
            const rentalResponse = await BookingManagementService.getRentalListOfLandlord(user.userId, user.token);

            console.log("📌 API Response (Rooms):", roomResponse);
            console.log("📌 API Response (Rentals):", rentalResponse);

            const allRooms = (roomResponse.rooms || []).map(room => {
                const rental = (rentalResponse || []).find(r => r.roomId === room.roomId);
                const displayStatus = determineDisplayStatus(room, rental);
                return {
                    roomId: room.roomId,
                    status: displayStatus,
                    createdDate: room.createdDate || room.CreatedDate,
                    title: room.title || `Phòng ${room.roomId}`,
                    image: room.image || '[]',
                    locationDetail: room.locationDetail || 'Chưa xác định',
                    acreage: room.acreage || 0,
                    price: room.price || 0,
                };
            }).sort((a, b) => {
                if (a.status === 2 && b.status !== 2) return -1;
                if (a.status !== 2 && b.status === 2) return 1;
                if (a.status === 4 && b.status !== 4) return -1;
                if (a.status !== 4 && b.status === 4) return 1;
                const dateA = new Date(a.createdDate || 0);
                const dateB = new Date(b.createdDate || 0);
                return dateB - dateA;
            });

            setRooms(allRooms);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng:', error);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoomsByStatus = async (status) => {
        setLoading(true);
        try {
            if (!user?.token || !user?.userId) {
                throw new Error('Không có token hoặc userId');
            }
            const roomResponse = await RoomLandlordService.getRooms();
            const rentalResponse = await BookingManagementService.getRentalListOfLandlord(user.userId, user.token);

            console.log("📌 API Response (Rooms by Status):", roomResponse);
            console.log("📌 API Response (Rentals by Status):", rentalResponse);

            const filteredRooms = (roomResponse.rooms || []).map(room => {
                const rental = (rentalResponse || []).find(r => r.roomId === room.roomId);
                const displayStatus = determineDisplayStatus(room, rental);
                return {
                    roomId: room.roomId,
                    status: displayStatus,
                    createdDate: room.createdDate || room.CreatedDate,
                    title: room.title || `Phòng ${room.roomId}`,
                    image: room.image || '[]',
                    locationDetail: room.locationDetail || 'Chưa xác định',
                    acreage: room.acreage || 0,
                    price: room.price || 0,
                };
            })
                .filter(room => room.status === status)
                .sort((a, b) => {
                    const dateA = new Date(a.createdDate || 0);
                    const dateB = new Date(b.createdDate || 0);
                    return dateB - dateA;
                });

            setRooms(filteredRooms);
        } catch (error) {
            console.error('Lỗi khi lấy phòng theo trạng thái:', error);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token && user?.userId) {
            fetchAllRooms();
        } else {
            console.error('Thiếu token hoặc userId từ AuthContext');
            setLoading(false);
        }
    }, [user]);

    const handleFilterByStatus = (status) => {
        setActiveStatus(status);
        if (status === null) {
            fetchAllRooms();
        } else {
            fetchRoomsByStatus(status);
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
                <div className="mt-6 mb-4 flex space-x-4">
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
                        Phòng chờ Người dùng xác nhận
                    </button>
                    <button
                        onClick={() => handleFilterByStatus(3)}
                        className={`px-4 py-2 rounded ${activeStatus === 3 ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    >
                        Phòng đang cho thuê
                    </button>
                </div>
                {rooms.length === 0 ? (
                    <p className="text-black font-semibold text-center">
                        {activeStatus === null
                            ? "Bạn hiện không có phòng nào trong hệ thống."
                            : `Không có phòng nào đang ${getStatusName(activeStatus).toLowerCase()}.`}
                    </p>
                ) : (
                    <Grid className="mt-4" container spacing={2}>
                        {rooms.map((room) => {
                            let images;
                            try {
                                images = JSON.parse(room.image || '[]');
                            } catch (error) {
                                console.error(`Lỗi parse image phòng ${room.roomId}:`, error);
                                images = room.image ? [room.image] : [];
                            }
                            if (!Array.isArray(images)) images = [images];
                            const firstImage = images[0] || 'https://storage.googleapis.com/a1aa/image/DEtIGStEO_sg24yKvGcjViznxp5GVEZmRfoqAcQ5GHI.jpg';

                            return (
                                <Grid key={room.roomId} size={3}>
                                    <Item onClick={() => navigate(`/Rooms/Contract/${room.roomId}`)}>
                                        <div className="flex flex-col h-full">
                                            <div className="relative">
                                                <img
                                                    className="rounded-t-lg shadow-md overflow-hidden w-full h-48 object-cover"
                                                    alt={room.title || 'Image of a room'}
                                                    src={firstImage}
                                                />
                                                {getStatusOverlay(room.status)}
                                            </div>
                                            <div className="flex flex-col flex-grow p-2 justify-between">
                                                <p className="text-black text-base font-semibold truncate max-w-[250px]">
                                                    {room.title || 'Tiêu đề phòng'}
                                                </p>
                                                <p className="text-gray-600 flex items-center mt-1 text-sm truncate max-w-[250px]">
                                                    <FaMapMarkerAlt className="absolute" />
                                                    <span className="ml-5">
                                                        {room.locationDetail || 'Vị trí không xác định'}
                                                    </span>
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1 flex items-center">
                                                    <FaChartArea className="mr-1" />
                                                    Diện tích:
                                                    <span className="text-gray-800">
                                                        {room.acreage || 'N/A'}
                                                    </span>
                                                    m²
                                                </p>
                                                <p className="text-red-500 font-medium text-base mt-1">
                                                    {room.price ? `${room.price.toLocaleString('vi-VN')} đ/tháng` : 'Thỏa thuận'}
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