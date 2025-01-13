import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode để giải mã token

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    }

    setLoading(false); // Khi xong, không còn trạng thái loading nữa
  }, []);

  const login = (token) => {
    localStorage.setItem('authToken', token); // Lưu token vào localStorage
    const decodedToken = jwtDecode(token); // Giải mã token
    console.log("Decoded Token after login:", decodedToken); // Log ra để kiểm tra payload
    console.log("Profile Picture URL:", user.ProfilePicture);

    const newUser = {
      username: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"], // Trích xuất username từ token
      role: decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"], // Trích xuất role từ token
      ProfilePicture: decodedToken["ProfilePicture"],
      token
    };
    setUser(newUser); // Cập nhật user vào trạng thái
  };

  const logout = async () => {
    localStorage.removeItem('authToken'); // Xóa token khi đăng xuất
    setUser(null); // Reset user
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
