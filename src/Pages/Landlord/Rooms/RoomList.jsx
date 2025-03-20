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
        default:
            return null;
    }
};

// Hàm chuyển đổi activeStatus thành tên trạng thái
const getStatusName = (status) => {
    switch (status) {
        case 1:
            return 'Trống';
        case 2:
            return 'Chờ giao dịch';
        case 3:
            return 'Được thuê';
        default:
            return 'Tất cả';
    }
};

const RoomList = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState(null);

    const fetchAllRooms = async () => {
        setLoading(true);
        try {
            const response = await RoomLandlordService.getRooms();
            console.log('fetchAllRooms response:', response);
            const sortedRooms = [...(response.rooms || [])].sort((a, b) => {
                // Ưu tiên status 2 (Chờ giao dịch) lên đầu
                if (a.status === 2 && b.status !== 2) return -1;
                if (a.status !== 2 && b.status === 2) return 1;
                // Nếu status giống nhau, sắp xếp theo CreatedDate giảm dần (mới nhất lên đầu)
                const dateA = new Date(a.createdDate || a.CreatedDate || 0);
                const dateB = new Date(b.createdDate || b.CreatedDate || 0);
                return dateB - dateA;
            });
            setRooms(sortedRooms);
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
            const response = await RoomLandlordService.getRoomsByStatus(status);
            console.log('fetchRoomsByStatus response:', response);
            const sortedRooms = [...(response.rooms || [])].sort((a, b) => {
                // Sắp xếp theo CreatedDate giảm dần (mới nhất lên đầu)
                const dateA = new Date(a.createdDate || a.CreatedDate || 0);
                const dateB = new Date(b.createdDate || b.CreatedDate || 0);
                return dateB - dateA;
            });
            setRooms(sortedRooms);
        } catch (error) {
            console.error('Lỗi khi lấy phòng theo trạng thái:', error);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllRooms();
    }, []);

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