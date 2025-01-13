import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BuildingsList from './Components/BuildingsList';
import BuildingsForm from './Components/BuildingsForm';
import RoomsList from './Components/RoomsList';
import RoomsForm from './Components/RoomsForm';
import Layout from './Layout/Layout';
import Login from './Layout/Login';
import Registers from './Layout/RegisterForm';
import './App.css';
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from './Context/AuthProvider';
import { CometChatIncomingCall } from "@cometchat/chat-uikit-react";
const App = () => {
  return (
    <AuthProvider>
      <CometChatIncomingCall />
      <Router>
        <Notifications className="custom-notification" />
        <Layout>
          <Routes>
            <Route path="/" element={<BuildingsList />} />
            <Route path="/Buildings/Creates" element={<BuildingsForm />} />
            <Route path="/Buildings/:buildingId" element={<BuildingsForm />} />
            <Route path="/Rooms" element={<RoomsList />} />
            <Route path="/Rooms/Creates" element={<RoomsForm />} />
            <Route path="/Rooms/:roomId" element={<RoomsForm />} />
            <Route path="/Logins" element={<Login />} />
            <Route path="/Registers" element={<Registers />} />
          </Routes>
        </Layout>

      </Router>
    </AuthProvider>
  );
};

export default App;
