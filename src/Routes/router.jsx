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
                element={user && user.role === "Admin" ? <BuildingsForm /> : <Navigate to="/" />}
            />
            <Route
                path="/Buildings/:buildingId"
                element={user && user.role === "Admin" ? <BuildingsForm /> : <Navigate to="/" />}
            />
            <Route
                path="/Rooms"
                element={user && user.role === "User" ? <RoomsList /> : <Navigate to="/" />}
            />
            <Route
                path="/Rooms/Creates"
                element={user && user.role === "Admin" ? <RoomsForm /> : <Navigate to="/" />}
            />
            <Route
                path="/Rooms/:roomId"
                element={user && user.role === "Admin" ? <RoomsForm /> : <Navigate to="/" />}
            />
        </Routes>
    );
};

export default RoutesConfig;
