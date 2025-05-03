import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Loading from '../Components/Loading';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        const newUser = {
          username: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
          role: decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
          ProfilePicture: decodedToken["ProfilePicture"],
          userId: decodedToken["UserId"],
          token,
          // Add money fields if they exist in the token
          money: decodedToken["Money"] || 0,
          encryptedMoney: decodedToken["EncryptedMoney"],
          moneyIV: decodedToken["MoneyIV"]
        };

        setUser(newUser);
      } catch (error) {
        console.error("Error decoding token:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setLoading(false);
  }, [navigate]);

  const login = (token) => {
    localStorage.setItem('authToken', token);
    const decodedToken = jwtDecode(token);

    const newUser = {
      username: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      role: decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      ProfilePicture: decodedToken["ProfilePicture"],
      userId: decodedToken["UserId"],
      token,
      // Add money fields if they exist in the token
      money: decodedToken["Money"] || 0,
      encryptedMoney: decodedToken["EncryptedMoney"],
      moneyIV: decodedToken["MoneyIV"]
    };

    setUser(newUser);

    // Navigation logic remains the same
    if (newUser.role === 'User') {
      navigate('/');
    } else if (newUser.role === 'Admin') {
      navigate('/Admin/Accounts');
    }
    else if (newUser.role === 'Landlord') {
      navigate('/');
    }
    else if (newUser.role === 'Service') {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  const logout = async () => {
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/Logins');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);