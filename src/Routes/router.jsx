// src/routes/index.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BuildingsList from '../Components/BuildingsList';
import BuildingsForm from '../Components/BuildingsForm';
import RoomsList from '../Components/RoomsList';
import RoomsForm from '../Components/RoomsForm';
import Login from '../Layout/Auth/Login';
import Registers from '../Layout/Auth/RegisterForm';
import ForgotPasswords from '../Layout/Auth/ForgotPassword';
import { useAuth } from '../Context/AuthProvider'; // Import useAuth
import ProfileUser from '../Components/User/ProfileUser';

import AccountList from '../Components/Admin/Accounts/AccountList'
import ServicePostList from '../Components/Admin/ServicePosts/ServicePostList'
import RoomList from '../Components/Admin/Rooms/RoomList'
import RoomForm from '../Components/Admin/Rooms/RoomForm'
import BuildingList from '../Components/Admin/Buildings/BuildingList'
import BuildingForm from '../Components/Admin/Buildings/BuildingForm'
import BuildingDetails from '../Components/Admin/Buildings/BuildingDetails'
import UpLandlord from '../Components/Admin/Accounts/UpLandlord'
import UpService from '../Components/Admin/Accounts/UpService'

import CategoryServiceList from '../Components/Admin/Categories/CategoryServiceList'
import CategoryRoomList from '../Components/Admin/Categories/CategoryRoomList';
// import CategoryServiceForm from '../Components/Admin/CategoryServiceForm'

const RoutesConfig = () => {
    const { user } = useAuth(); // Lấy thông tin người dùng từ AuthContext

    return (
        <Routes>
            {/* Routes dành cho tất cả người dùng (User hoặc Admin) */}
            <Route path="/" element={<BuildingsList />} />
            <Route path="/Rooms" element={<RoomsList />} />
            <Route path="/Logins" element={<Login />} />
            <Route path="/Registers" element={<Registers />} />
            <Route path="/forgot-password" element={<ForgotPasswords />} />
            <Route path="/ProfileUser" element={<ProfileUser />} />


            {/* Routes dành cho User */}
            <Route
                path="/"
                element={user && user.role === "User" ? <BuildingsList /> : <Navigate to="/" />}
            />
            <Route
                path="/Buildings/Creates"
                element={user && user.role === "User" ? <BuildingsForm /> : <Navigate to="/" />}
            />
            <Route
                path="/Buildings/:buildingId"
                element={user && user.role === "User" ? <BuildingsForm /> : <Navigate to="/" />}
            />
            <Route
                path="/Rooms"
                element={user && user.role === "User" ? <RoomsList /> : <Navigate to="/" />}
            />
            <Route
                path="/Rooms/Creates"
                element={user && user.role === "User" ? <RoomsForm /> : <Navigate to="/" />}
            />
            <Route
                path="/Rooms/:roomId"
                element={user && user.role === "User" ? <RoomsForm /> : <Navigate to="/" />}
            />

            {/* Routes dành cho Admin */}

            <Route
                path="/Admin/Accounts"
                element={user && user.role === "Admin" ? <AccountList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/ServicePosts"
                element={user && user.role === "Admin" ? <ServicePostList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Rooms"
                element={user && user.role === "Admin" ? <RoomList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Rooms/Creates"
                element={user && user.role === "Admin" ? <RoomForm /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Buildings"
                element={user && user.role === "Admin" ? <BuildingList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Buildings/Creates"
                element={user && user.role === "Admin" ? <BuildingForm /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Buildings/:buildingId"
                element={user && user.role === "Admin" ? <BuildingForm /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Buildings/:buildingId"
                element={user && user.role === "Admin" ? <BuildingDetails /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Landlord"
                element={user && user.role === "Admin" ? <UpLandlord /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Service"
                element={user && user.role === "Admin" ? <UpService /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/CategoryServices"
                element={user && user.role === "Admin" ? <CategoryServiceList /> : <Navigate to="/Logins" />}
            />
            {/* <Route
                path="/Admin/CategoryServices/:categoryServiceId"
                element={user && user.role === "Admin" ? <CategoryServiceForm /> : <Navigate to="/Logins" />}
            /> */}

            <Route
                path="/Admin/CategoryRooms"
                element={user && user.role === "Admin" ? <CategoryRoomList /> : <Navigate to="/Logins" />}
            />
        </Routes>
    );
};

export default RoutesConfig;
