import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BuildingsList from './Components/BuildingsList';
import BuildingsForm from './Components/BuildingsForm';
import RoomsList from './Components/RoomsList';
import RoomsForm from './Components/RoomsForm';
import Layout from './Layout/Layout';
import Login from './Layout/Login'
import Register from './Layout/Register'
import './App.css';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<BuildingsList />} />
          <Route path="/Buildings/Creates" element={<BuildingsForm />} />
          <Route path="/Buildings/:buildingId" element={<BuildingsForm />} />
          <Route path="/Rooms" element={<RoomsList />} />
          <Route path="/Rooms/Creates" element={<RoomsForm />} />
          <Route path="/Rooms/:roomId" element={<RoomsForm />} />
          <Route path="/Logins" element={<Login />} />
          <Route path="/Registers" element={<Register />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
