import axios from 'axios';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import Searchbar from "../../../Components/Searchbar";
import './Room.css';
import { useNavigate } from 'react-router-dom';

const RoomList = () => {
    const navigate = useNavigate();

    //   const [rooms, setRooms] = useState([]);

    //   useEffect(() => {
    //     axios.get('/api/landlord/RoomManagement/rooms')
    //       .then(response => {
    //         setRooms(response.data);
    //       })
    //       .catch(error => {
    //         console.error('Lỗi khi lấy danh sách phòng', error);
    //       });
    //   }, []);

    //   const groupRoomsByStatus = () => {
    //     return {
    //       1: rooms.filter(room => room.status === 1),  // Phòng trống
    //       2: rooms.filter(room => room.status === 2),  // Phòng chờ giao dịch
    //       3: rooms.filter(room => room.status === 3),  // Phòng cho thuê
    //     };
    //   };

    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        ...theme.applyStyles('dark', {
            backgroundColor: '#1A2027',
        }),
    }));

    return (
        <Box className="page-room" sx={{ flexGrow: 1 }}>
            <Searchbar isManagementRoom={true}/>
            <Grid className="grid-room" container spacing={2}>
                <Grid size={2}>
                    <Item onClick={() => navigate('/Rooms/Contract/1')}><div>
                    <img
                        className="rounded-lg shadow-md overflow-hidden"
                        alt="Image of a cityscape with buildings"
                        height="200"
                        src="https://storage.googleapis.com/a1aa/image/DEtIGStEO_sg24yKvGcjViznxp5GVEZmRfoqAcQ5GHI.jpg"
                        width="w-full"
                    />
                        <p className="content-room"><b>Nguồn Vốn Tiếp Tục Là Thách Thức Của Thị Trường Bất Động Sản Năm 2025</b></p>
                        </div></Item>
                </Grid>
                <Grid size={2}>
                <Item><div>
                    <img
                        className="rounded-lg shadow-md overflow-hidden"
                        alt="Image of a cityscape with buildings"
                        height="200"
                        src="https://storage.googleapis.com/a1aa/image/DEtIGStEO_sg24yKvGcjViznxp5GVEZmRfoqAcQ5GHI.jpg"
                        width="w-full"
                    />
                        <p>Nguồn Vốn Tiếp Tục Là Thách Thức Của Thị Trường Bất Động Sản Năm 2025</p>
                        </div></Item>
                </Grid>
                <Grid size={2}>
                <Item><div>
                    <img
                        className="rounded-lg shadow-md overflow-hidden"
                        alt="Image of a cityscape with buildings"
                        height="200"
                        src="https://storage.googleapis.com/a1aa/image/DEtIGStEO_sg24yKvGcjViznxp5GVEZmRfoqAcQ5GHI.jpg"
                        width="w-full"
                    />
                        <p>Nguồn Vốn Tiếp Tục Là Thách Thức Của Thị Trường Bất Động Sản Năm 2025</p>
                        </div></Item>
                </Grid>
                <Grid size={2}>
                <Item><div>
                    <img
                        className="rounded-lg shadow-md overflow-hidden"
                        alt="Image of a cityscape with buildings"
                        height="200"
                        src="https://storage.googleapis.com/a1aa/image/DEtIGStEO_sg24yKvGcjViznxp5GVEZmRfoqAcQ5GHI.jpg"
                        width="w-full"
                    />
                        <p>Nguồn Vốn Tiếp Tục Là Thách Thức Của Thị Trường Bất Động Sản Năm 2025</p>
                        </div></Item>
                </Grid>
                <Grid size={2}>
                <Item><div>
                    <img
                        className="rounded-lg shadow-md overflow-hidden"
                        alt="Image of a cityscape with buildings"
                        height="200"
                        src="https://storage.googleapis.com/a1aa/image/DEtIGStEO_sg24yKvGcjViznxp5GVEZmRfoqAcQ5GHI.jpg"
                        width="w-full"
                    />
                        <p>Nguồn Vốn Tiếp Tục Là Thách Thức Của Thị Trường Bất Động Sản Năm 2025</p>
                        </div></Item>
                </Grid>
                <Grid size={2}>
                <Item><div>
                    <img
                        className="rounded-lg shadow-md overflow-hidden"
                        alt="Image of a cityscape with buildings"
                        height="200"
                        src="https://storage.googleapis.com/a1aa/image/DEtIGStEO_sg24yKvGcjViznxp5GVEZmRfoqAcQ5GHI.jpg"
                        width="w-full"
                    />
                        <p>Nguồn Vốn Tiếp Tục Là Thách Thức Của Thị Trường Bất Động Sản Năm 2025</p>
                        </div></Item>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RoomList;
