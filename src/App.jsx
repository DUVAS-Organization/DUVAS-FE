// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout/Layout';
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from './Context/AuthProvider';
import { CometChatIncomingCall } from "@cometchat/chat-uikit-react";
import RoutesConfig from './Routes/router';  // Nhập RoutesConfig từ routes folder
import './App.css'

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CometChatIncomingCall />
        <Notifications className="custom-notification" />
        <Layout>
          <Routes>
            <Route path="/*" element={<RoutesConfig />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default App;
