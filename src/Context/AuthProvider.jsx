// src/Context/AuthProvider.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode để giải mã token
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('authToken');

    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Giải mã token
        console.log("Decoded Token:", decodedToken); // Log ra để kiểm tra payload

        const newUser = {
          username: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"], // Trích xuất username từ token
          role: decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"], // Trích xuất role từ token
          ProfilePicture: decodedToken["ProfilePicture"],
          token
        };
        setUser(newUser); // Lưu thông tin người dùng vào trạng thái

      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
        setUser(null); // Nếu có lỗi khi giải mã, setUser null
      }
    } else {
      setUser(null); // Nếu không có token, set user là null
    }

    setLoading(false); // Khi xong, không còn trạng thái loading nữa
  }, [navigate]);

  const login = (token) => {
    localStorage.setItem('authToken', token); // Lưu token vào localStorage
    const decodedToken = jwtDecode(token); // Giải mã token
    console.log("Decoded Token after login:", decodedToken); // Log ra để kiểm tra payload

    const newUser = {
      username: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"], // Trích xuất username từ token
      role: decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"], // Trích xuất role từ token
      ProfilePicture: decodedToken["ProfilePicture"],
      token
    };
    setUser(newUser); // Cập nhật user vào trạng thái

    // Điều hướng dựa trên role của user
    if (newUser.role === 'User') {
      navigate('/'); // Điều hướng đến trang dành cho User
    } else if (newUser.role === 'Admin') {
      navigate('/Admin/Accounts'); // Điều hướng đến trang Admin
    } else {
      navigate('/'); // Điều hướng đến trang chủ cho người dùng không xác định
    }
  };


  const logout = async () => {
    localStorage.removeItem('authToken'); // Xóa token khi đăng xuất
    setUser(null); // Reset user
    navigate('/Logins'); // Chuyển hướng đến trang đăng nhập
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
