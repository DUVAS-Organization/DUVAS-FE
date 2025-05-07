import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout/Layout';
import { Notifications } from "@mantine/notifications";
import { AuthProvider, useAuth } from './Context/AuthProvider';
import { RealtimeProvider } from './Context/RealtimeProvider';
import { CometChatIncomingCall } from "@cometchat/chat-uikit-react";
import RoutesConfig from './Routes/router';
import AdminChatWidget from './Components/AdminChatWidget';
import './App.css';

const AppContent = () => {
  const { user } = useAuth();
  return (
    <>
      <CometChatIncomingCall />
      <Notifications className="custom-notification" />
      <Layout>
        <Routes>
          <Route path="/*" element={<RoutesConfig />} />
        </Routes>
      </Layout>
      {/* Chỉ hiển thị AdminChatWidget nếu user không có role Admin */}
      {user && user?.role !== "Admin" && <AdminChatWidget />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <RealtimeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </RealtimeProvider>
    </Router>
  );
};

export default App;
