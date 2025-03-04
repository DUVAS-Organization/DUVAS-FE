// src/routes/index.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BuildingHome from '../Components/BuildingHome';
import BuildingsForm from '../Pages/User/BuildingsForm';
// import RoomsHome from '../Components/RoomsHome';
import RoomsForm from '../Pages/User/RoomsForm';
import Login from '../Components/Layout/Auth/Login';
import Registers from '../Components/Layout/Auth/RegisterForm';
import ForgotPasswords from '../Components/Layout/Auth/ForgotPassword';
import { useAuth } from '../Context/AuthProvider'; // Import useAuth
import Profile from '../Pages/User/Profile';

import ServicePost from '../Pages/User/ServicePost';

import AccountList from '../Pages/Admin/Accounts/AccountList'
import ServicePostList from '../Pages/Admin/ServicePosts/ServicePostList'
import RoomList from '../Pages/Admin/Rooms/RoomList'
import RoomForm from '../Pages/Admin/Rooms/RoomForm'
import BuildingList from '../Pages/Admin/Buildings/BuildingList'
import BuildingForm from '../Pages/Admin/Buildings/BuildingForm'
import BuildingDetails from '../Pages/Admin/Buildings/BuildingDetails'
import UpLandlord from '../Pages/Admin/Accounts/UpLandlord'
import UpService from '../Pages/Admin/Accounts/UpService'

import CategoryServiceList from '../Pages/Admin/Categories/CategoryServiceList'
import CategoryServiceForm from '../Pages/Admin/Categories/CategoryServiceForm';
import CategoryRoomList from '../Pages/Admin/Categories/CategoryRoomList';
import CategoryRoomForm from '../Pages/Admin/Categories/CategoryRoomForm';
import RoomDetails from '../Pages/Admin/Rooms/RoomDetails';
import ServicePostForm from '../Pages/Admin/ServicePosts/ServicePostForm';
import ServicePostDetails from '../Pages/Admin/ServicePosts/ServicePostDetails';
import Home from '../Pages/Home';
import Overview from '../Pages/User/Overview';
import RoomsList from '../Pages/User/RoomsList';
import RoomDetailsUser from '../Pages/User/RoomDetailsUser';
// import CategoryServiceForm from '../Components/Admin/CategoryServiceForm'

const RoutesConfig = () => {
    const { user } = useAuth(); // Lấy thông tin người dùng từ AuthContext

    return (
        <Routes>
            {/* Routes dành cho tất cả người dùng (User hoặc Admin) */}
            <Route path="/" element={<Home />} />
            <Route path="/Rooms" element={<RoomsList />} />
            <Route path="/Logins" element={<Login />} />
            <Route path="/Registers" element={<Registers />} />
            <Route path="/forgot-password" element={<ForgotPasswords />} />
            <Route path="/Profile" element={<Profile />} />


            {/* Routes dành cho User */}
            <Route
                path="/"
                element={user && user.role === "User" ? <Home /> : <Navigate to="/" />}
            />
            <Route
                path="/Overview"
                element={user && user.role === "User" ? <Overview /> : <Navigate to="/" />}
            />
            <Route
                path="/Buildings"
                element={user && user.role === "User" ? <BuildingHome /> : <Navigate to="/" />}
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
                path="/Rooms/Details/:roomId"
                element={user && user.role === "User" ? <RoomDetailsUser /> : <Navigate to="/" />}
            />
            <Route
                path="/Rooms/:roomId"
                element={user && user.role === "User" ? <RoomsForm /> : <Navigate to="/" />}
            />

            <Route
                path="/ServicePost/Creates"
                element={user && user.role === "User" ? <ServicePostForm /> : <Navigate to="/Logins" />}
            />


            {/* Routes dành cho Admin */}
            {/* Account */}
            <Route
                path="/Admin/Accounts"
                element={user && user.role === "Admin" ? <AccountList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Landlord"
                element={user && user.role === "Admin" ? <UpLandlord /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Service"
                element={user && user.role === "Admin" ? <UpService /> : <Navigate to="/Logins" />}
            />

            {/* Service Posts */}
            <Route
                path="/Admin/ServicePosts"
                element={user && user.role === "Admin" ? <ServicePostList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/ServicePost/Creates"
                element={user && user.role === "Admin" ? <ServicePostForm /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/ServicePost/Details/:servicePostId"
                element={user && user.role === "Admin" ? <ServicePostDetails /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/ServicePost/Edit/:servicePostId"
                element={user && user.role === "Admin" ? <ServicePostForm /> : <Navigate to="/Logins" />}
            />

            {/* Rooms */}
            <Route
                path="/Admin/Rooms"
                element={user && user.role === "Admin" ? <RoomList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Rooms/Creates"
                element={user && user.role === "Admin" ? <RoomForm /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Rooms/Details/:roomId"
                element={user && user.role === "Admin" ? <RoomDetails /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Rooms/Edit/:roomId"
                element={user && user.role === "Admin" ? <RoomForm /> : <Navigate to="/Logins" />}
            />

            {/* Buildings */}
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
                path="/Admin/Buildings/Details/:buildingId"
                element={user && user.role === "Admin" ? <BuildingDetails /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Buildings/Edit/:buildingId"
                element={user && user.role === "Admin" ? <BuildingForm /> : <Navigate to="/Logins" />}
            />

            {/* Categories */}
            <Route
                path="/Admin/CategoryServices"
                element={user && user.role === "Admin" ? <CategoryServiceList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/CategoryServices/Creates"
                element={user && user.role === "Admin" ? <CategoryServiceForm /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/CategoryServices/:categoryServiceId"
                element={user && user.role === "Admin" ? <CategoryServiceForm /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/CategoryRooms"
                element={user && user.role === "Admin" ? <CategoryRoomList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/CategoryRooms/Creates"
                element={user && user.role === "Admin" ? <CategoryRoomForm /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/CategoryRooms/:categoryRoomId"
                element={user && user.role === "Admin" ? <CategoryRoomForm /> : <Navigate to="/Logins" />}
            />
        </Routes>
    );
};

export default RoutesConfig;
