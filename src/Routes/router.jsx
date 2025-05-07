// src/routes/index.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BuildingHome from '../Components/ComponentPage/BuildingHome';
import BuildingsForm from '../Pages/User/Buildings/BuildingsForm';
// import RoomsHome from '../Components/RoomsHome';
import Login from '../Components/Layout/Auth/Login';
import Registers from '../Components/Layout/Auth/RegisterForm';
import ForgotPasswords from '../Components/Layout/Auth/ForgotPassword';
import { useAuth } from '../Context/AuthProvider'; // Import useAuth
import Profile from '../Pages/User/Profiles/Profile';

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
import Overview from '../Pages/User/Profiles/Overview';
import RoomsList from '../Pages/User/Rooms/RoomsList';
import RoomDetailsUser from '../Pages/User/Rooms/RoomDetailsUser';
import RoomBookingSuccess from '../Pages/User/Rooms/RoomBookingSuccess';
// import CategoryServiceForm from '../Components/Admin/CategoryServiceForm'

import Message from '../Pages/User/Profiles/Message';
import MessageAdmin from '../Pages/Admin/MessageAdmin';
import SavedPostList from '../Pages/User/Profiles/SavedPostList';


import RoomListLandlord from '../Pages/Landlord/Rooms/RoomList'
import ViewProfile from '../Pages/Landlord/ViewProfile'
import RoomsFormLandlord from '../Pages/Landlord/Rooms/RoomsForm';
import RoomRentalConfirmation from '../Pages/Landlord/Rooms/RoomRentalConfirmation';

import Wiki from '../Pages/Wiki'
import Money from '../Pages/User/Transactions/Money';
import BankAccount from '../Pages/User/Transactions/BankAccount'
import Transaction from '../Pages/User/Transactions/Transaction'
import CreateWithdraw from '../Pages/User/Transactions/CreateWithdraw';
import AdminTransaction from '../Pages/Admin/Transactions/WithdrawList';


import RentalList from '../Pages/User/Profiles/RentalList'
import ReportList from '../Pages/Admin/Reports/ReportList';

import LandlordDocuments from '../Pages/Admin/Accounts/LandlordDocuments';
import ServiceDocuments from '../Pages/Admin/Accounts/ServiceDocuments';
import TransactionAdmin from '../Pages/Admin/Transactions/TransactionAdmin';
import RoomEdit from '../Pages/Landlord/Rooms/RoomEdit';
import ViewUpRole from '../Pages/User/Profiles/ViewUpRole';
import LandlordDocumentsUser from '../Pages/User/Profiles/LandlordDocumentsUser'
import ServiceDocumentsUser from '../Pages/User/Profiles/ServiceDocumentsUser'
import AuthorizationList from '../Pages/Admin/Accounts/Authorization/AuthorizationList';
import AuthorizationPage from '../Pages/User/Profiles/AuthorizationPage';
import ContractDetail from '../Pages/Admin/Accounts/Authorization/ContractDetail';
import RoomAdminEdit from '../Pages/Admin/Accounts/Authorization/RoomAdminEdit';
import AdminRoomRentalConfirmation from '../Pages/Admin/Accounts/Authorization/AdminRoomRentalConfirmation';
import AdminRoomList from '../Pages/Admin/Accounts/Authorization/AdminRoomList'
import ServicePostOwner from '../Pages/ServiceOwner/ServicePostList';
import ServicePostEdit from '../Pages/ServiceOwner/ServicePostEdit';
import ServicePostCreate from '../Pages/ServiceOwner/ServicePostCreate';
import ServicePost from '../Pages/User/ServicePosts/ServicePost'
import ServicePostDetailsUser from '../Pages/User/ServicePosts/ServiePostDetails'
import Dashboard from '../Components/Layout/Dashboard';
import CPPRoomForm from '../Pages/Admin/PriorityPackage/CPPRoomForm';
import CPPRoomList from '../Pages/Admin/PriorityPackage/CPPRoomList';
import CPPServicePostList from '../Pages/Admin/PriorityPackage/CPPServicePostList';
import CPPServicePostForm from '../Pages/Admin/PriorityPackage/CPPServicePostForm';
import ServicePackagesList from '../Pages/Admin/PriorityPackage/ServicePackagesList';
import RoomPackagesList from '../Pages/Admin/PriorityPackage/RoomPackagesList';
import MyReports from '../Pages/User/Profiles/MyReports';
import LandlordReports from '../Pages/Landlord/Reports/LandlordReports';

const RoutesConfig = () => {
    const { user } = useAuth();

    return (
        <Routes>

            {/* Routes dành cho tất cả người dùng (User hoặc Admin) */}
            <Route path="/" element={<Home />} />
            <Route path="/Rooms" element={<RoomsList />} />
            <Route path="/Logins" element={<Login />} />
            <Route path="/Message" element={<Message />} />
            <Route path="/Registers" element={<Registers />} />
            <Route path="/forgot-password" element={<ForgotPasswords />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/Wiki" element={<Wiki />} />
            <Route path="/ServicePosts" element={<ServicePost />} />
            <Route
                path="/ServicePosts/Details/:servicePostId"
                element={<ServicePostDetailsUser />}
            />
            <Route
                path="/Rooms/Details/:roomId"
                element={<RoomDetailsUser />}
            />

            {/* Routes dành cho User */}
            <Route
                path="/Moneys"
                element={user ? <Money /> : <Navigate to="/" />}
            />
            <Route
                path="/BankAccounts"
                element={user ? <BankAccount /> : <Navigate to="/" />}
            />
            <Route
                path="/Transaction"
                element={user ? <Transaction /> : <Navigate to="/" />}
            />
            <Route
                path="/Withdraw/Create"
                element={user ? <CreateWithdraw /> : <Navigate to="/" />}
            />
            <Route
                path="/RentalList"
                element={user ? <RentalList /> : <Navigate to="/" />}
            />
            <Route
                path="/my-reports"
                element={user ? <MyReports /> : <Navigate to="/" />}
            />
            <Route
                path="/"
                element={user && user.role === "User" ? <Home /> : <Navigate to="/" />}
            />
            <Route
                path="/Overview"
                element={user ? <Overview /> : <Navigate to="/" />}
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
                path="/Rooms/Details/:roomId"
                element={user && user.role === "User" ? <RoomDetailsUser /> : <Navigate to="/" />}
            />
            <Route
                path="/Rooms/BookingSuccess"
                element={user && user.role === "User" ? <RoomBookingSuccess /> : <Navigate to="/" />}
            />
            {/* <Route
                path="/Rooms/:roomId"
                element={user && user.role === "User" ? <RoomsForm /> : <Navigate to="/" />}
            /> */}
            <Route
                path="/SavedPosts"
                element={user ? <SavedPostList /> : <Navigate to="/" />}
            />
            <Route
                path="/ServicePost/Creates"
                element={user ? <ServicePostForm /> : <Navigate to="/Logins" />}
            />


            {/* Routes dành cho Admin */}
            {/* Account */}
            <Route
                path="/Admin/Dashboard"
                element={user && user.role === "Admin" ? <Dashboard /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Accounts"
                element={user && user.role === "Admin" ? <AccountList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Message"
                element={user && user.role === "Admin" ? <MessageAdmin /> : <Navigate to="/Logins" />}
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
                path="/Admin/Authorization"
                element={user && user.role === "Admin" ? <AuthorizationList /> : <Navigate to="/Logins" />}
            />
            <Route path="/Admin/Landlord/Giayto/:landlordLicenseId" element={<LandlordDocuments />} />
            <Route path="/Admin/Service/Giayto/:serviceLicenseId" element={<ServiceDocuments />} />
            <Route path="/Landlord/Giayto/:landlordLicenseId" element={<LandlordDocumentsUser />} />
            <Route path="/Service/Giayto/:serviceLicenseId" element={<ServiceDocumentsUser />} />
            <Route
                path="/contract-detail/:contractId"
                element={user && user.role === "Admin" ? <ContractDetail /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/edit/:roomId"
                element={user && user.role === "Admin" ? <RoomAdminEdit /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/rooms/list"
                element={user && user.role === "Admin" ? <AdminRoomList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/rooms/contract/:roomId/:rentalId"
                element={user && user.role === "Admin" ? <AdminRoomRentalConfirmation /> : <Navigate to="/Logins" />}
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

            {/* Gói ưu tiên */}
            <Route
                path="/Admin/CategoryPriorityRooms"
                element={user && user.role === "Admin" ? <CPPRoomList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/CategoryPriorityRooms/Creates"
                element={user && user.role === "Admin" ? <CPPRoomForm /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/CategoryPriorityRooms/:categoryPriorityPackageRoomId"
                element={user && user.role === "Admin" ? <CPPRoomForm /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/CategoryPriorityServices"
                element={user && user.role === "Admin" ? <CPPServicePostList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/CategoryPriorityServices/Creates"
                element={user && user.role === "Admin" ? <CPPServicePostForm /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/CategoryPriorityServices/:categoryPriorityPackageServicePostId"
                element={user && user.role === "Admin" ? <CPPServicePostForm /> : <Navigate to="/Logins" />}
            />

            <Route
                path="/Admin/RoomPackages"
                element={user && user.role === "Admin" ? <RoomPackagesList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/ServicePackages"
                element={user && user.role === "Admin" ? <ServicePackagesList /> : <Navigate to="/Logins" />}
            />

            {/* Transaction */}
            <Route
                path="/Admin/Withdraws"
                element={user && user.role === "Admin" ? <AdminTransaction /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Reports"
                element={user && user.role === "Admin" ? <ReportList /> : <Navigate to="/Logins" />}
            />
            <Route
                path="/Admin/Transactions"
                element={user && user.role === "Admin" ? <TransactionAdmin /> : <Navigate to="/Logins" />}
            />

            {/* Routes dành cho Landlord */}
            {/* Rooms */}
            <Route
                path="/Landlord/Reports"
                element={user && user.role === "Landlord" ? <LandlordReports /> : <Navigate to="/" />}
            />
            <Route
                path="/Room/Create"
                element={user && user.role === "Landlord" ? <RoomsFormLandlord /> : <Navigate to="/" />}
            />
            <Route
                path="/Room"
                element={user && user.role === "Landlord" ? <RoomListLandlord /> : <Navigate to="/" />}
            />
            <Route
                path="/Landlord/Authorization"
                element={user && user.role === "Landlord" ? <AuthorizationPage /> : <Navigate to="/" />}
            />
            <Route
                path="/Rooms/Edit/:roomId"
                element={user && user.role === "Landlord" ? <RoomEdit /> : <Navigate to="/" />}
            />
            {/* Profile */}
            {/* <Route
                path="/ViewProfiles"
                element={user && user.role === "Landlord" ? <ViewProfile /> : <Navigate to="/" />}
            /> */}
            <Route
                path="/Rooms/Contract/:roomId/:rentalId"
                element={user ? <RoomRentalConfirmation /> : <Navigate to="/" />}
            />

            <Route
                path="/ViewUpRole"
                element={user ? <ViewUpRole /> : <Navigate to="/" />}
            />

            {/* Routes dành cho ServiceOwner */}
            {/* Service Post */}
            <Route
                path="/ServiceOwner/ManageServices"
                element={user && user.role === "Service" ? <ServicePostOwner /> : <Navigate to="/" />}
            />
            <Route
                path="/ServiceOwner/ServicePosts/Edit/:servicePostId"
                element={user && user.role === "Service" ? <ServicePostEdit /> : <Navigate to="/" />}
            />
            <Route
                path="/ServiceOwner/ServicePosts/Create"
                element={user && user.role === "Service" ? <ServicePostCreate /> : <Navigate to="/" />}
            />

        </Routes>



    );
};

export default RoutesConfig;